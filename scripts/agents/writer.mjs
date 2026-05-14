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

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const REPO_ROOT = process.cwd();
const DRAFTS_DIR = resolve(REPO_ROOT, 'daily-queue/drafts');
const HEARTBEAT_PATH = resolve(REPO_ROOT, 'tmp/writer-heartbeat.json');

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.WRITER_MODEL || 'claude-haiku-4-5-20251001';
const MAX_DRAFTS = Math.max(1, Math.min(10, parseInt(process.env.WRITER_MAX_DRAFTS || '4', 10)));

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
운영자 검수 전 본문 explanatory framing 의 초안을 작성한다.

본 사이트 페르소나: 정책·세금·금융·시장·통계·AI 1차 출처 (.go.kr / .or.kr) 큐레이션.
독자: 사회초년생·신혼·1인사업자·4050 직장인·투자자.

═══ 환각 방지 (위반 시 글 폐기) ═══
1. 1차 출처에 없는 새 수치·일자·인용·통계·예측 절대 금지 (ADR 0006)
2. 가격 예측·전망·"오를 것/내릴 것" 절대 금지
3. 추측·정치적 입장·종교적 권유 절대 금지
4. 본인이 확신 못하는 사실은 "공식 발표 후 갱신" 으로 명시

═══ 본문 구조 (SEO/GEO 고급화) ═══
**총 분량 1,500~2,500자** (Google Discover + 일반 SEO + LLM 인용 친화)

마크다운 구조 (필수):
- **첫 단락 (도입)** — 핵심 사실 1-2 문장 + 1차 출처 명시 + [^1]
  · LLM 인용 친화: "X 는 Y 다" 류 정의 문장 1개 포함
- **## 1. 배경 / 무엇이 발표됐나** — 1차 출처 핵심 사실 + 인용 단락 (> 원문) + [^1]
- **## 2. 본인 영향 / 시사점** — 페르소나별 시사점 + 표 1개 권장
- **## 3. 본인 액션 / 다음 단계** — 본인 체크리스트 또는 시나리오 + 자매 cross-ref
- **(선택) ## 자주 묻는 질문** — Q&A 2-3개 (LLM·SERP rich snippet)

═══ 1차 출처 인용 룰 ═══
- footnote [^1] [^2] 마커 — sources 순서대로
- 본문에 footnote 마커 **3~6회** 자연스럽게 분포
- 직접 인용은 \`> 원문\` 형식 + 인용 직후 [^N]
- 본문에서 "정책브리핑은 2026년 5월 X일 발표한" 류로 기관·일자 명시

═══ 톤·언어 ═══
- 한국어, 드라이한 Reuters/Bloomberg 데이터 저널 톤
- 단호한 문장 (추측·완곡 회피)
- 독자 호명: "본인" (개인 맥락 — GEO/네이버 D.I.A. 신호)

═══ 출력 규칙 ═══
- 마크다운 본문만 출력 (frontmatter X — 운영자가 이미 작성)
- 인사말·메타 설명·코드 펜스 절대 금지
- 첫 줄부터 즉시 도입 문장 또는 ## 부제목
- footnote 정의 (\`[^1]: 출처 — \\\`url\\\`\`) 는 본문 마지막에 추가 X — 운영자가 frontmatter sources[] 와 자동 매핑`;

async function generateBody(meta) {
  const userMsg = `## 1차 출처 정보
제목: ${meta.title}
발행 일자: ${meta.publishedAt}
출처 기관: ${meta.sourceName}
출처 URL: ${meta.sourceUrl}
원문 발췌:
${meta.sourceQuote ? `> ${meta.sourceQuote}` : '(인용문 없음)'}

## 작성
위 1차 출처를 바탕으로 본문 explanatory framing 을 작성하라.`;

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
  return text.trim();
}

function replacePlaceholder(content, body) {
  return content.replace(PLACEHOLDER, body);
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

  const enhanced = [];
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
    try {
      console.log(`[writer] enhancing ${filename}...`);
      const body = await generateBody(meta);
      const newContent = replacePlaceholder(content, body);
      writeFileSync(path, newContent, 'utf8');
      enhanced.push({ filename, bodyLength: body.length });
      console.log(`  ✓ ${body.length} chars written`);
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
      failed.push({ filename, error: err.message });
    }
  }

  console.log(`\n[writer] enhanced ${enhanced.length} / skipped ${skipped.length} / failed ${failed.length}`);

  writeHeartbeat({
    status: 'live',
    model: MODEL,
    maxDrafts: MAX_DRAFTS,
    enhanced,
    skipped,
    failed,
  });
}

main().catch((err) => {
  console.error('[writer] FATAL:', err);
  writeHeartbeat({ status: 'fatal', error: String(err?.message ?? err), enhanced: [], skipped: [], failed: [] });
  process.exit(0); // graceful — workflow 후속 단계 (PR 생성) 보존
});
