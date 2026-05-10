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
운영자가 검수하기 전 본문 explanatory framing 의 초안을 작성한다.

엄격한 규칙 (위반 시 글 폐기):
1. 1차 출처에 없는 새 수치·일자·인용·통계·예측 절대 금지
2. 사실 + 맥락 설명만, 추측·오피니언·정치적 입장 금지
3. [^1] 푸트노트 마커를 본문에 1~2회 사용 (sources[0] 을 가리킴)
4. 한국어, 드라이한 Reuters/Bloomberg 톤, 단호한 문장
5. 마크다운 ## 부제목 1~2개 활용 (3~4 단락 분량)
6. 인용 단락은 \`> 원문\` 형식으로 그대로 옮긴다 (왜곡 0)

출력 규칙:
- 마크다운 본문만 출력 (인사말·메타 설명·코드 펜스 절대 금지)
- 첫 줄부터 즉시 본문 시작 (## 부제목 또는 도입 문장)`;

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
      max_tokens: 1500,
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
