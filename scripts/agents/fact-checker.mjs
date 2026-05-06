/**
 * scripts/agents/fact-checker.mjs — 에이전트 #6 Fact-Checker (Layer 4 stub, ADR 0005)
 *
 * 역할: 발행 후 14일 이내 글의 본문 수치 주장과 1차 출처 URL 본문을 fuzzy match 해
 *       불일치 항목을 정정 PR 또는 fact-check-queue/ 에 기록한다.
 *       Layer 3 (`extract-numerical-claims.mjs`) 은 빌드 시점 _구조적_ 페어링 (수치 옆
 *       footnote 마커) 만 검증하고, Layer 4 는 _내용 일치_ 까지 검증 — 게이트 폐기 후의
 *       마지막 안전망.
 *
 * I/O 계약 (M1+ 본격 구현 시):
 *   입력:
 *     - 환경변수 ANTHROPIC_API_KEY (필수, 미설정 시 stub 모드만)
 *     - src/content/pulse/*.mdx + src/content/insight/*.mdx (publishedAt 필터)
 *   출력:
 *     - fact-check-queue/YYYY-MM-DD.json { agent, ranAt, audited[], discrepancies[] }
 *     - 불일치 발견 시 GitHub PR 자동 오픈 (라벨: `fact-check-correction`, 본문: 진단)
 *     - 운영자 이메일 다이제스트 (선택, RESEND_API_KEY)
 *   종료 코드:
 *     - 0 정상 (불일치 없음 또는 stub 모드)
 *     - 1 운영자 알림 필요 (불일치 N건 발견)
 *     - 2 스크립트 자체 오류
 *
 * 본 스텁:
 *   - 어떤 네트워크 호출도 하지 않음
 *   - 14일 윈도우 글 카운트만 산출 후 heartbeat 기록
 *   - shared/claude-client.mjs 의 `callClaude()` 가 의도적으로 throw 하므로 활성 시 즉시 검출
 *
 * 활성화 절차 (M1+):
 *   1. `npm install @anthropic-ai/sdk` (운영자 명시 승인 필요 — CLAUDE.md 룰)
 *   2. `scripts/agents/shared/claude-client.mjs` 의 throw 가드 제거 후 SDK 통합
 *   3. 본 파일의 `STUB_MODE = true` 를 `false` 로 변경
 *   4. fuzzy match 로직 본격 구현 (TODO 마커 참조)
 *   5. Cloudflare Pages env 에 ANTHROPIC_API_KEY 등록
 */

import { mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

/**
 * Layer 4 활성 단계:
 *   STUB_MODE = true  : 글 카운트만 (네트워크 X, 분석 X) — 초기 stub
 *   LITE_MODE         : 로컬 정적 audit — 수치 주장·footnote·sources[] 페어링
 *                       비율 산출 (네트워크·SDK·API 키 X). 운영자 dashboard 용.
 *   FULL_MODE (M3+)   : Claude SDK + WebFetch 로 1차 출처 본문 fuzzy match.
 *                       npm install @anthropic-ai/sdk + ANTHROPIC_API_KEY 필요.
 *
 * 현재 LITE_MODE 가동 — Tier 2 회차 22 진군 결과.
 */
const STUB_MODE = false;
const LITE_MODE = true;
const WINDOW_DAYS = 14;

const repoRoot = resolve(process.cwd());
const contentRoot = resolve(repoRoot, 'src/content');
const outDir = resolve(repoRoot, 'fact-check-queue');
const ranAt = new Date().toISOString();
const ranAtKstDate = new Date(Date.now() + 9 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

const modeLabel = STUB_MODE ? 'STUB' : LITE_MODE ? 'LITE — 로컬 정적 audit' : 'FULL';
console.log(`[fact-checker] ${ranAt} Layer 4 사후 감사 (${modeLabel})`);

/** frontmatter 의 publishedAt 추출 (단순 텍스트 매칭). */
function extractPublishedAt(text) {
  const m = text.match(/^publishedAt:\s*["']?([^"'\n]+)["']?\s*$/m);
  return m ? m[1].trim() : null;
}

// ── Layer 4 Lite: 정적 audit 헬퍼 ─────────────────────────────────
//
// extract-numerical-claims.mjs 와 동일 정규식 — 한국 데이터 저널 수치 토큰.
// 단어 경계가 한글에 적용되지 않으므로 단위 명시 매칭.
const NUMBER_UNIT_RE =
  /(\d+(?:[.,]\d+)?)\s*(%|명|조|억|만\s*원|만\s*명|만\s*좌|배|초|포인트|종|좌|:1|편|개|건)/g;
const FOOTNOTE_REF_RE = /\[\^[A-Za-z0-9_-]+\]/g;
const SOURCES_BLOCK_RE = /^sources:\s*\n((?:\s+- [\s\S]*?)+?)(?=^[a-zA-Z]|\n---)/m;

/** body (frontmatter 제외) 만 리턴 */
function bodyOnly(text) {
  const fm = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return fm ? text.slice(fm[0].length) : text;
}

/** sources url 갯수 산출 — frontmatter sources 블록의 `url:` 라인 수 */
function countSourceUrls(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fmText = fm ? fm[1] : '';
  return (fmText.match(/^\s+url:\s*/gm) || []).length;
}

/** 단일 글의 정적 audit 메트릭 산출 */
function liteAudit(filepath, text) {
  const body = bodyOnly(text);
  const claims = [...body.matchAll(NUMBER_UNIT_RE)];
  const footnoteMarkers = [...body.matchAll(FOOTNOTE_REF_RE)];
  const sourceUrlCount = countSourceUrls(text);

  // 각 footnote 마커가 본문 단락 안에 있는지 (Layer 3 페어링과 동일 산식 단순화)
  // 단순 카운트만 — 정밀 페어링은 extract-numerical-claims.mjs 가 담당
  const claimsCount = claims.length;
  const footnoteCount = footnoteMarkers.length;

  // claims-per-source ratio: 출처 1건당 평균 수치 인용 — 너무 높으면 검증 불가능
  const claimsPerSource = sourceUrlCount > 0 ? claimsCount / sourceUrlCount : Infinity;

  // 신호: claims > 0 인데 footnote 0 → 위험. footnote ≥ claims/3 → 안전.
  let riskLevel;
  if (claimsCount === 0) riskLevel = 'low'; // 수치 주장 없음
  else if (footnoteCount === 0) riskLevel = 'high'; // 수치 있는데 마커 0
  else if (footnoteCount * 3 >= claimsCount) riskLevel = 'low';
  else riskLevel = 'medium';

  return {
    claimsCount,
    footnoteCount,
    sourceUrlCount,
    claimsPerSource: claimsPerSource === Infinity ? null : Number(claimsPerSource.toFixed(2)),
    riskLevel,
  };
}

/** N일 윈도우 내 글 목록 산출. LITE_MODE 면 가이드북 챕터까지 포함. */
function recentArticles() {
  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const collections = LITE_MODE
    ? ['pulse', 'insight', 'guidebookChapter']
    : ['pulse', 'insight'];
  const audited = [];

  for (const collection of collections) {
    let entries;
    try {
      entries = readdirSync(join(contentRoot, collection)).filter((f) =>
        f.endsWith('.mdx'),
      );
    } catch {
      continue;
    }
    for (const filename of entries) {
      const filepath = join(contentRoot, collection, filename);
      const text = readFileSync(filepath, 'utf8');
      const publishedAt = extractPublishedAt(text);
      if (!publishedAt) continue;
      if (new Date(publishedAt).getTime() < cutoff) continue;
      const entry = {
        collection,
        filename,
        publishedAt,
      };
      if (LITE_MODE) {
        Object.assign(entry, liteAudit(filepath, text));
      }
      audited.push(entry);
    }
  }
  return audited;
}

const audited = recentArticles();

mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `${ranAtKstDate}.json`);

// LITE_MODE: 위험도별 카운트 + 평균 비율
let summary = null;
if (LITE_MODE && audited.length > 0) {
  const risk = { low: 0, medium: 0, high: 0 };
  let totalClaims = 0;
  let totalFootnotes = 0;
  let totalSources = 0;
  for (const a of audited) {
    risk[a.riskLevel ?? 'low']++;
    totalClaims += a.claimsCount ?? 0;
    totalFootnotes += a.footnoteCount ?? 0;
    totalSources += a.sourceUrlCount ?? 0;
  }
  summary = {
    risk,
    avgClaimsPerArticle: Number((totalClaims / audited.length).toFixed(2)),
    avgFootnotesPerArticle: Number((totalFootnotes / audited.length).toFixed(2)),
    avgSourcesPerArticle: Number((totalSources / audited.length).toFixed(2)),
    totalClaims,
    totalFootnotes,
    totalSources,
  };
}

const payload = {
  agent: 'fact-checker',
  ranAt,
  windowDays: WINDOW_DAYS,
  mode: STUB_MODE ? 'stub' : LITE_MODE ? 'lite' : 'full',
  auditedCount: audited.length,
  ...(LITE_MODE
    ? { summary, audited }
    : {
        audited: audited.map((a) => `${a.collection}/${a.filename}`),
        discrepancies: [],
      }),
  note: STUB_MODE
    ? 'M1+ 활성 시: Claude API 로 출처 URL 본문 fetch + claim fuzzy match → 정정 PR 자동 오픈'
    : LITE_MODE
      ? 'LITE: 로컬 정적 audit — 수치 주장·footnote·sources 비율. 네트워크 X. M3+ 시 Claude SDK 통합 예정.'
      : '실제 감사 결과',
};

writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

console.log(`[fact-checker] 감사 대상 ${audited.length}건 → ${outPath}`);
if (LITE_MODE && summary) {
  console.log(
    `[fact-checker] LITE 요약 — 위험: low ${summary.risk.low} / medium ${summary.risk.medium} / high ${summary.risk.high}`,
  );
  console.log(
    `[fact-checker] LITE 평균 — 수치 ${summary.avgClaimsPerArticle} / 각주 ${summary.avgFootnotesPerArticle} / 출처 ${summary.avgSourcesPerArticle} (per article)`,
  );
}
// 위험 high 가 있어도 LITE 단계에서는 exit 0 — 정책 결정 (운영자 검토용 신호만 출력)
process.exit(0);
