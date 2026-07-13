/**
 * scripts/agents/writer-insight.mjs — 에이전트 #3c Insight Writer (M3 LIVE)
 *
 * 인사이트 (심층 분석) 자동 생성 — Sonnet 4.6.
 * 펄스(1500자) / 가이드북 챕터(4000자) 와 본질 다른 6000-10000자 심층 분석.
 *
 * 입력 (환경변수, workflow inputs 주입):
 *   INSIGHT_SLUG       : 파일 슬러그 (예: '2026-05-policy-week1-meta')
 *   INSIGHT_TITLE      : 제목 (예: '2026년 5월 1주 정부 발표 9건 메타 분석')
 *   INSIGHT_CATEGORY   : policy | tax-finance | market | stats | ai-tech
 *   INSIGHT_PERSONA    : '4050' | '청년' | '1인사업자' | '투자자' 등
 *   INSIGHT_TOPIC      : 분석 주제 (자유 텍스트)
 *   INSIGHT_SOURCES    : 1차 출처 JSON 배열 [{name, url, date}]
 *   INSIGHT_DATA_HINT  : 본인 사이트 자체 데이터 활용 hint (선택)
 *   ANTHROPIC_API_KEY  : 필수
 *   WRITER_INSIGHT_MODEL : 기본 'claude-sonnet-4-6'
 *
 * 출력:
 *   src/content/insight/{INSIGHT_SLUG}.mdx
 *
 * ADR 0006 가드:
 *   - 1차 출처 host 화이트리스트 검증
 *   - 신규 통계·예측 금지 (시스템 프롬프트)
 *   - footnote [^1] [^N] 자동
 *   - 검수 미완 토큰 검출 → 거부
 *
 * 비용 추정: 1편당 약 $0.50-1.50 (Sonnet 4.6, 입출력 약 30K tok)
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { callClaude } from './shared/claude-client.mjs';

const REPO_ROOT = process.cwd();
const OUT_DIR = resolve(REPO_ROOT, 'src/content/insight');
const HEARTBEAT_PATH = resolve(REPO_ROOT, 'tmp/writer-insight-heartbeat.json');

const MODEL = process.env.WRITER_INSIGHT_MODEL || 'claude-sonnet-4-6';
const API_KEY = process.env.ANTHROPIC_API_KEY;

const SLUG = process.env.INSIGHT_SLUG;
const TITLE = process.env.INSIGHT_TITLE;
const CATEGORY = process.env.INSIGHT_CATEGORY;
const PERSONA = process.env.INSIGHT_PERSONA || '일반';
const TOPIC = process.env.INSIGHT_TOPIC || '';
const SOURCES_RAW = process.env.INSIGHT_SOURCES || '[]';
const DATA_HINT = process.env.INSIGHT_DATA_HINT || '';

const ranAt = new Date().toISOString();

const ALLOWED_HOST_RE =
  /\.(?:go\.kr|or\.kr)$|^(?:etf\.krx\.co\.kr|data\.krx\.co\.kr|kosis\.kr|krx\.co\.kr|law\.go\.kr|korea\.kr|nipa\.kr|nia\.kr|kofia\.or\.kr)$/i;

const VALID_CATEGORIES = ['policy', 'tax-finance', 'market', 'stats', 'ai-tech'];

function writeHeartbeat(payload) {
  mkdirSync(dirname(HEARTBEAT_PATH), { recursive: true });
  writeFileSync(
    HEARTBEAT_PATH,
    JSON.stringify({ agent: 'insight-writer', ranAt, ...payload }, null, 2) + '\n',
    'utf8',
  );
}

function fail(reason) {
  console.error(`[insight-writer] FATAL: ${reason}`);
  writeHeartbeat({ status: 'fail', reason });
  process.exit(1);
}

if (!API_KEY) fail('ANTHROPIC_API_KEY 미설정');
if (!SLUG) fail('INSIGHT_SLUG 미설정');
if (!TITLE) fail('INSIGHT_TITLE 미설정');
if (!CATEGORY || !VALID_CATEGORIES.includes(CATEGORY)) {
  fail(`INSIGHT_CATEGORY 유효 X (${VALID_CATEGORIES.join('|')})`);
}

let sources;
try {
  sources = JSON.parse(SOURCES_RAW);
  if (!Array.isArray(sources) || sources.length < 2) {
    fail('INSIGHT_SOURCES 2개 이상 필수 (인사이트 스키마)');
  }
} catch (err) {
  fail(`INSIGHT_SOURCES JSON 파싱 실패: ${err.message}`);
}

for (const src of sources) {
  if (!src.url || !src.name) fail(`source 항목 name + url 필수: ${JSON.stringify(src)}`);
  try {
    const host = new URL(src.url).hostname;
    if (!ALLOWED_HOST_RE.test(host)) {
      fail(`출처 host 화이트리스트 위반: ${host}`);
    }
  } catch {
    fail(`출처 URL 파싱 실패: ${src.url}`);
  }
}

const SYSTEM_PROMPT = `당신은 한국 데이터 저널 "스마트데이터샵" 의 인사이트 (심층 분석) 작성자다.

본 사이트 3 콘텐츠 위계 차이:
- 펄스 (1,500자) — 일일 뉴스 정리 (사실 전달)
- 가이드북 챕터 (4,000자) — 정책·세금 제도 설명 (구조 설명)
- **인사이트 (6,000-10,000자)** — 시계열·표·차트 + 본인 분석·해석 (해석·결론)

═══ 환각 방지 (위반 시 글 폐기) ═══
1. 1차 출처에 명시되지 않은 새 수치·일자·인용 절대 금지 (ADR 0006)
2. 가격 예측·전망·"오를 것/내릴 것" 절대 금지
3. 본인 의견·해석은 명확하게 "본인 분석:" / "본 사이트 해석:" 표시
4. 추측·정치적 입장 금지

═══ 본문 구조 (인사이트 표준) ═══
- 총 분량 **6,000-10,000자** (12-20분 읽기)
- 도입: 한 줄 요약 + 본 인사이트 핵심 주장 1-2 문장
- H2 5-8개 섹션:
  · 배경 / 무엇이 일어나고 있나
  · 1차 출처 데이터 (표·시계열)
  · 본인 분석 (3-5 관점)
  · 페르소나별 시사점
  · 본인 액션 단계
  · 자주 묻는 질문 (FAQ 5-7)
- H3 시나리오 / 표 / 체크리스트 적극 활용
- footnote [^1]~[^N] 본문에 자연 분포 (5-15회)

═══ 1차 출처 인용 ═══
- 직접 인용은 \`> 원문\` + 직후 [^N]
- 기관·발표 일자 명시: "정책브리핑 2026년 5월 12일 발표"
- 인용 외 사실은 footnote 마커만

═══ 톤 ═══
- 한국어, Reuters/Bloomberg 데이터 저널
- 단호한 문장
- "본인" 어조 (개인 맥락)

═══ 출력 형식 ═══
MDX 전체 (frontmatter 포함) 출력. 첫 줄부터 \`---\` 시작.
인사이트 frontmatter 필수 필드:
- title, publishedAt (ISO8601+09:00), category, tldr (200자 이내, "X 는 Y 다" 정의 문장 포함)
- estimatedReadingTime (정수, 분 단위 — 본문 분량 / 500자)
- sources (2개+, url 필수)
- tags { personas[], dataTypes[], actions[] }

코드 펜스 X, 인사말 X, 메타 설명 X.`;

const userMsg = `## 인사이트 작성 정보

제목: ${TITLE}
파일 슬러그: ${SLUG}
카테고리: ${CATEGORY}
페르소나: ${PERSONA}
분석 주제: ${TOPIC || '제목 기반 자율 구성'}
발행 시각: ${ranAt}

## 1차 출처 (sources)
${sources.map((s, i) => `[^${i + 1}] ${s.name} — ${s.url}${s.date ? ` (${s.date})` : ''}`).join('\n')}

## 본 사이트 자체 데이터 활용 hint
${DATA_HINT || '(미제공 — 1차 출처만 사용)'}

## 작업
위 정보로 MDX 인사이트 전체를 작성하라.
- frontmatter publishedAt = ${new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().replace('Z', '+09:00')}
- sources[].accessedAt = ${new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)}
- 본문 footnote 는 sources 순서대로 [^1] [^2] ... 매핑
- 6,000-10,000자 분량 + H2 5-8개 + 표·시나리오·FAQ 모두 포함`;

async function main() {
  console.log(`[insight-writer] ${ranAt} ${SLUG} 생성 시작 (${MODEL})`);

  let response;
  try {
    response = await callClaude({
      model: MODEL,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: userMsg,
      maxTokens: 12000,
    });
  } catch (err) {
    fail(`Claude API 호출 실패: ${err.message}`);
  }

  const mdx = response.text;

  if (!mdx.startsWith('---')) {
    fail(`MDX 형식 위반 — '---' 로 시작 X. 첫 100자: ${mdx.slice(0, 100)}`);
  }

  const placeholderPatterns = [
    '[검수 후 입력]',
    '[검수 후]',
    '[검수 후 발표일]',
    '[검수 후 본문 작성]',
    '[TODO]',
  ];
  for (const p of placeholderPatterns) {
    if (mdx.includes(p)) {
      fail(`검수 미완 토큰 발견: ${p}`);
    }
  }

  const outPath = resolve(OUT_DIR, `${SLUG}.mdx`);
  if (existsSync(outPath)) {
    fail(`이미 존재 — 덮어쓰기 거부: ${outPath}`);
  }

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, mdx, 'utf8');

  console.log(`[insight-writer] ✓ ${mdx.length} chars → ${outPath}`);
  console.log(`[insight-writer] usage: ${JSON.stringify(response.usage)}`);

  writeHeartbeat({
    status: 'ok',
    model: response.model,
    slug: SLUG,
    title: TITLE,
    category: CATEGORY,
    outPath: outPath.replace(REPO_ROOT, '').replace(/\\/g, '/'),
    bytes: mdx.length,
    usage: response.usage,
  });
}

main().catch((err) => {
  console.error('[insight-writer] FATAL:', err);
  writeHeartbeat({ status: 'fatal', error: String(err?.message ?? err) });
  process.exit(1);
});
