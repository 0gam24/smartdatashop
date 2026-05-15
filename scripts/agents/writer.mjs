/**
 * scripts/agents/writer.mjs — 에이전트 #3 Pulse Writer (M1 LIVE)
 *
 * 역할: daily-queue/drafts/*.mdx 의 `[검수 후 본문 작성]` placeholder 를
 *       Claude API 로 생성한 explanatory framing 본문으로 교체.
 *
 * I/O 계약:
 *   입력:
 *     - daily-queue/drafts/*.mdx (draft-pulse-from-rss.mjs 출력물)
 *     - 환경변수 ANTHROPIC_API_KEY (M1 필수, 미설정 시 stub mode)
 *     - 환경변수 WRITER_MODEL (기본 claude-haiku-4-5-20251001)
 *     - 환경변수 WRITER_MAX_DRAFTS (기본 4 — 1회 실행 비용 상한)
 *   출력:
 *     - daily-queue/drafts/*.mdx (in-place 본문 보강, tldr/frontmatter 변경 X)
 *     - tmp/writer-heartbeat.json
 *   종료 코드: 0 (graceful — fail 도 heartbeat 에 기록)
 *
 * ADR 0006 4기준 안전망:
 *   - tldr 의 `[검수 후]` placeholder 는 그대로 — 자동 noindex 유지
 *   - frontmatter sources[].url / publishedAt 은 변경 X
 *   - 운영자가 src/content/pulse/ 로 이동 + tldr 검수 시점에 최종 발행
 *
 * 환각 방지 가드:
 *   - prompt 에 "1차 출처에 없는 새 수치/일자/인용 절대 금지" 명시
 *   - 본문 max_tokens 1500 (긴 환각 단락 차단)
 *   - 운영자 검수 + tldr 검수 게이트가 최후 방어선
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const REPO_ROOT = process.cwd();
const DRAFTS_DIR = resolve(REPO_ROOT, 'daily-queue/drafts');
const PUBLISH_DIR = resolve(REPO_ROOT, 'src/content/pulse');
const HEARTBEAT_PATH = resolve(REPO_ROOT, 'tmp/writer-heartbeat.json');

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.WRITER_MODEL || 'claude-haiku-4-5-20251001';
const FACT_CHECK_MODEL = process.env.WRITER_FACT_CHECK_MODEL || 'claude-sonnet-4-6';
const MAX_DRAFTS = Math.max(1, Math.min(10, parseInt(process.env.WRITER_MAX_DRAFTS || '4', 10)));

// 자동 발행 모드 (기본 ON) — fact-check 통과 시 drafts → src/content/pulse 이동
const AUTO_PUBLISH = (process.env.WRITER_AUTO_PUBLISH ?? 'true').toLowerCase() === 'true';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const ranAt = new Date().toISOString();

function writeHeartbeat(payload) {
  mkdirSync(dirname(HEARTBEAT_PATH), { recursive: true });
  writeFileSync(HEARTBEAT_PATH, JSON.stringify({ agent: 'pulse-writer', ranAt, ...payload }, null, 2) + '\n', 'utf8');
}

if (!API_KEY) {
  console.log(`[writer] ${ranAt} ANTHROPIC_API_KEY 미설정 → stub mode (실제 본문 생성 X)`);
  writeHeartbeat({ status: 'stub-no-key', drafts: [] });
  process.exit(0);
}

const PLACEHOLDER = '[검수 후 본문 작성]';

function hasPlaceholder(content) {
  return content.includes(PLACEHOLDER);
}

/** frontmatter + 본문에서 prompt 에 필요한 메타 추출. 정규식 단순 매칭으로 충분. */
function extractMeta(content) {
  const titleMatch = content.match(/^title:\s*"([^"]+)"/m);
  const urlMatch = content.match(/^\s*url:\s*"([^"]+)"/m);
  const sourceNameMatch = content.match(/^\s*-\s+name:\s*"([^"]+)"/m);
  const publishedMatch = content.match(/^publishedAt:\s*"([^"]+)"/m);
  // 본문 안의 1차 출처 인용 (`> ...`) 첫 줄
  const quoteMatch = content.match(/^>\s+(.+)$/m);
  return {
    title: titleMatch?.[1] ?? '',
    sourceUrl: urlMatch?.[1] ?? '',
    sourceName: sourceNameMatch?.[1] ?? '',
    publishedAt: publishedMatch?.[1] ?? '',
    sourceQuote: (quoteMatch?.[1] ?? '').trim(),
  };
}

const SYSTEM_PROMPT = `당신은 한국 데이터 저널 "스마트데이터샵" 의 펄스(일일 뉴스) 에디터다.
1차 출처 기반 본문 explanatory framing 을 작성한다.

본 사이트 페르소나: 정책·세금·금융·시장·통계·AI 1차 출처 (.go.kr / .or.kr) 큐레이션.
독자: 사회초년생·신혼·1인사업자·4050 직장인·투자자.

═══ 환각 방지 (위반 시 글 폐기) ═══
1. 1차 출처에 없는 새 수치·일자·인용·통계·예측 절대 금지 (ADR 0006)
2. 가격 예측·전망·"오를 것/내릴 것" 절대 금지
3. 추측·정치적 입장·종교적 권유 절대 금지

═══ 출력 형식 — 반드시 JSON only (코드 펜스·다른 텍스트 절대 금지) ═══
{
  "tldr": "200자 이내 한 문장 요약 — '[검수 후]' 같은 placeholder 절대 금지. 'X 는 Y 다' 정의 문장 권장",
  "body": "마크다운 본문 1,500~2,500자"
}

═══ tldr 룰 ═══
- 200자 이내 (정확히)
- 핵심 사실 + 정의 문장 1개
- placeholder 토큰 (\`[검수 후]\`, \`[검수 후 보강]\` 등) 절대 사용 X
- 첫 발표 기관·일자 명시 (예: "정책브리핑이 2026년 5월 12일 발표한")

═══ body 마크다운 구조 ═══
- **첫 단락 (도입)** — 핵심 사실 1-2 문장 + 1차 출처 명시 + [^1]
- **## 1. 배경 / 무엇이 발표됐나** — 1차 출처 핵심 사실 + 인용 단락 (> 원문) + [^1]
- **## 2. 본인 영향 / 시사점** — 페르소나별 시사점 + 표 1개 권장
- **## 3. 본인 액션 / 다음 단계** — 본인 체크리스트 또는 시나리오 + 자매 cross-ref
- **## 자주 묻는 질문** — Q&A 2-3개

═══ 1차 출처 인용 룰 ═══
- footnote [^1] 마커 본문에 **3~6회** 자연 분포 (sources 순서)
- 직접 인용은 \`> 원문\` + 직후 [^N]
- 본문에서 "정책브리핑이 2026년 5월 X일 발표한" 류로 기관·일자 명시
- footnote 정의 (\`[^1]: 출처 — \\\`url\\\`\`) 본문 끝에 1줄 추가 (frontmatter sources 와 별개)

═══ 톤·언어 ═══
- 한국어, 드라이한 Reuters/Bloomberg 톤
- 단호한 문장
- 독자 호명: "본인"`;

async function generateBody(meta) {
  const userMsg = `## 1차 출처 정보
제목: ${meta.title}
발행 일자: ${meta.publishedAt}
출처 기관: ${meta.sourceName}
출처 URL: ${meta.sourceUrl}
원문 발췌:
${meta.sourceQuote ? `> ${meta.sourceQuote}` : '(인용문 없음)'}

## 작성
위 1차 출처를 바탕으로 tldr (200자 이내) + body (1500-2500자) JSON 으로 작성.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (typeof text !== 'string' || text.length < 50) {
    throw new Error(`Empty/short response: ${text?.slice(0, 100) ?? '(no text)'}`);
  }

  // JSON 파싱 (코드 펜스 fallback)
  const cleaned = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`JSON parse 실패: ${err.message} — raw: ${cleaned.slice(0, 200)}`);
  }
  if (typeof parsed.tldr !== 'string' || typeof parsed.body !== 'string') {
    throw new Error(`응답 형식 위반 — tldr/body 누락`);
  }
  // placeholder 토큰 검출 — Claude 가 실수로 남기면 폐기
  if (/\[\s*검수\s*후[^\]]*\]/.test(parsed.tldr) || /\[\s*검수\s*후[^\]]*\]/.test(parsed.body)) {
    throw new Error(`tldr/body 에 placeholder 토큰 남음 — 폐기`);
  }
  if (parsed.tldr.length > 200) parsed.tldr = parsed.tldr.slice(0, 197).trim() + '…';
  return parsed;
}

// frontmatter 의 tldr 줄과 본문 placeholder 동시 교체
function applyContent(content, { tldr, body }) {
  // 1. body 의 [검수 후 본문 작성] 교체 + 자동 생성 안내 단락 제거
  let result = content;
  result = result.replace(
    /## 자동 생성 초안[\s\S]*?(?=## 1차 출처 인용|## 다음 챕터|## 운영자 검수)/,
    '',
  );
  result = result.replace(PLACEHOLDER, body);

  // 2. frontmatter tldr 줄 — 첫 줄 통째 교체 (placeholder 토큰 모두 제거)
  // tldr 안에 큰따옴표가 있을 수 있으므로 escape
  const escapedTldr = tldr.replace(/"/g, '\\"');
  result = result.replace(/^tldr:\s*"[\s\S]*?"\s*$/m, `tldr: "${escapedTldr}"`);

  // 3. aiAssisted: draft → edit (writer 가 본문·tldr 모두 채움)
  result = result.replace(/^aiAssisted:\s*draft\s*$/m, 'aiAssisted: edit');

  return result;
}

// ─────────────────────────────────────────────────────────
// 환각 검토 (Sonnet 4.6 + 1차 출처 fetch) — 발행 직전 게이트
// ─────────────────────────────────────────────────────────

const FACT_CHECK_SYSTEM = `당신은 발행 직전 fact-checker. 본문의 수치·일자·인용이 1차 출처에 명시되었는지 엄격 점검.

룰:
1. 본문의 수치 / 일자 / 직접 인용만 검증 대상
2. 1차 출처 본문에 없는 항목 = 환각 (fabricated)
3. 수치 ±1% 오차 허용 (반올림)
4. 추측·해석·일반 설명은 검증 대상 X
5. 본문에 1차 출처 인용 단락 (\`> 원문\`) 이 그대로 옮겨졌으면 통과

JSON 응답만 (코드 펜스 X):
{ "verdict": "ok" | "fabricated" | "mismatch", "summary": "1 문장", "issues": [{"claim": "원문", "issue": "설명"}] }`;

async function fetchSourceText(url, timeoutMs = 10_000) {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'smartdatashop-writer/1.0 (+https://smartdatashop.kr)' },
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000);
  } catch {
    return null;
  }
}

async function factCheckBeforePublish(title, body, sourceUrl) {
  if (!sourceUrl) return { verdict: 'no-sources', summary: '1차 출처 없음 — 자동 발행 보류' };

  const sourceText = await fetchSourceText(sourceUrl);
  if (!sourceText) {
    return { verdict: 'fetch-failed', summary: '1차 출처 fetch 실패 — 자동 발행 보류' };
  }

  const userMsg = `## 글 제목
${title}

## 본문
${body.slice(0, 4000)}

## 1차 출처 (${sourceUrl})
${sourceText}

## 작업
환각 여부 JSON 응답.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: FACT_CHECK_MODEL,
      max_tokens: 1200,
      system: FACT_CHECK_SYSTEM,
      messages: [{ role: 'user', content: userMsg }],
    }),
  });

  if (!res.ok) return { verdict: 'check-error', summary: `Claude API ${res.status}` };
  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (typeof text !== 'string') return { verdict: 'check-error', summary: 'empty response' };

  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return { verdict: 'check-error', summary: 'parse-error', raw: cleaned.slice(0, 300) };
  }
}

async function notifyTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });
  } catch {
    /* silent — 알림 실패가 빌드 실패로 이어지지 않도록 */
  }
}

/** draft 파일명 → 발행용 슬러그 (`draft-pulse-` prefix 제거 + 길이 단축). */
function publishedFilename(draftFilename) {
  return draftFilename.replace(/^draft-pulse-/, '');
}

async function main() {
  const files = existsSync(DRAFTS_DIR)
    ? readdirSync(DRAFTS_DIR).filter((f) => f.endsWith('.mdx'))
    : [];

  if (files.length === 0) {
    console.log('[writer] daily-queue/drafts/ 비어있음 — skip');
    writeHeartbeat({ status: 'no-drafts', enhanced: [], skipped: [], failed: [] });
    return;
  }

  const enhanced = [];   // 본문 생성 OK
  const published = [];  // 자동 발행 OK (drafts → pulse 이동)
  const heldForReview = []; // 환각 의심 — drafts 유지
  const skipped = [];
  const failed = [];

  for (const filename of files) {
    if (enhanced.length >= MAX_DRAFTS) {
      skipped.push({ filename, reason: 'cost-cap' });
      continue;
    }
    const path = resolve(DRAFTS_DIR, filename);
    const content = readFileSync(path, 'utf8');
    if (!hasPlaceholder(content)) {
      skipped.push({ filename, reason: 'already-enhanced' });
      continue;
    }
    const meta = extractMeta(content);
    if (!meta.sourceUrl || !meta.title) {
      skipped.push({ filename, reason: 'meta-missing' });
      continue;
    }
    // 원본 콘텐츠 보관 (fact-check 실패 시 revert 용)
    const originalContent = content;

    try {
      console.log(`[writer] enhancing ${filename}...`);
      const generated = await generateBody(meta); // { tldr, body }
      const newContent = applyContent(content, generated);
      writeFileSync(path, newContent, 'utf8');
      enhanced.push({ filename, bodyLength: generated.body.length });
      console.log(`  ✓ body ${generated.body.length}자 + tldr ${generated.tldr.length}자`);

      // 자동 발행 모드 — fact-check 통과 시 drafts → src/content/pulse 이동
      if (AUTO_PUBLISH) {
        console.log(`  [fact-check] ${filename}...`);
        const fcResult = await factCheckBeforePublish(meta.title, generated.body, meta.sourceUrl);
        const verdict = fcResult.verdict;

        if (verdict === 'ok') {
          // 발행: drafts → src/content/pulse
          mkdirSync(PUBLISH_DIR, { recursive: true });
          const targetFilename = publishedFilename(filename);
          const targetPath = resolve(PUBLISH_DIR, targetFilename);
          if (existsSync(targetPath)) {
            console.log(`  ⚠ 대상 파일 이미 존재 — drafts revert: ${targetFilename}`);
            writeFileSync(path, originalContent, 'utf8'); // revert
            heldForReview.push({ filename, reason: 'target-exists', factCheck: fcResult });
          } else {
            renameSync(path, targetPath);
            published.push({ from: filename, to: targetFilename, bodyLength: generated.body.length });
            console.log(`  ✓ 자동 발행 → src/content/pulse/${targetFilename}`);
          }
        } else {
          // 환각 의심 / fetch 실패 / API 오류 — drafts/ 원본 revert (본문 채워진 상태 X)
          writeFileSync(path, originalContent, 'utf8');
          heldForReview.push({
            filename,
            verdict,
            summary: fcResult.summary,
            issues: fcResult.issues,
          });
          console.log(`  ⚠ 발행 보류 (${verdict}) — drafts/ 원본 복원: ${fcResult.summary}`);
        }
      }
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
      // 에러 발생 시 drafts/ 원본 복원
      try { writeFileSync(path, originalContent, 'utf8'); } catch { /* silent */ }
      failed.push({ filename, error: err.message });
    }
  }

  console.log(
    `\n[writer] 본문 ${enhanced.length} / 발행 ${published.length} / 보류 ${heldForReview.length} / 스킵 ${skipped.length} / 실패 ${failed.length}`,
  );

  // 환각 의심 / 발행 보류 N건 → 텔레그램 즉시 알림
  if (heldForReview.length > 0) {
    const lines = [`*환각 의심 ${heldForReview.length}건 — 발행 보류*`, ''];
    for (const h of heldForReview.slice(0, 5)) {
      lines.push(`- ${h.filename.slice(0, 60)}`);
      lines.push(`  ${h.summary || h.verdict}`);
    }
    lines.push('');
    lines.push('drafts/ 에 유지 — 운영자 확인 필요');
    await notifyTelegram(lines.join('\n'));
  }

  // 자동 발행 N건 → 텔레그램 알림 (성공 신호)
  if (published.length > 0) {
    const lines = [`*자동 발행 ${published.length}건 완료*`, ''];
    for (const p of published.slice(0, 8)) {
      lines.push(`- ${p.to.slice(0, 60)}`);
    }
    lines.push('');
    lines.push('[smartdatashop.kr](https://smartdatashop.kr)');
    await notifyTelegram(lines.join('\n'));
  }

  writeHeartbeat({
    status: 'live',
    model: MODEL,
    factCheckModel: FACT_CHECK_MODEL,
    autoPublish: AUTO_PUBLISH,
    maxDrafts: MAX_DRAFTS,
    enhanced,
    published,
    heldForReview,
    skipped,
    failed,
  });
}

main().catch((err) => {
  console.error('[writer] FATAL:', err);
  writeHeartbeat({ status: 'fatal', error: String(err?.message ?? err), enhanced: [], skipped: [], failed: [] });
  process.exit(0); // graceful — workflow 후속 단계 (PR 생성) 보존
});
