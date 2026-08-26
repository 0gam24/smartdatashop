/**
 * scripts/agents/writer-chapter.mjs — 에이전트 #3b Chapter Writer (M2 LIVE)
 *
 * 가이드북 챕터 MDX 자동 생성 — Sonnet 4.6 기반.
 *
 * 입력 (환경변수):
 *   CHAPTER_BOOK_SLUG   : 가이드북 slug (예: 'retirement-2026')
 *   CHAPTER_NUMBER      : 챕터 번호 (예: 7)
 *   CHAPTER_TITLE       : 챕터 제목 (예: '부동산 노후')
 *   CHAPTER_SLUG        : 파일 슬러그 (예: 'real-estate')
 *   CHAPTER_OUTLINE     : 챕터 outline (자유 텍스트, 다중 라인)
 *   CHAPTER_SOURCES     : 1차 출처 JSON 배열 — [{name, url, date}]
 *                         url 은 .go.kr / .or.kr / krx.co.kr / kosis.kr / law.go.kr / korea.kr 화이트리스트만
 *   CHAPTER_AUDIENCE    : 페르소나 hint (예: '4050 노후 준비자')
 *   ANTHROPIC_API_KEY   : 필수
 *   WRITER_CHAPTER_MODEL: 기본 'claude-sonnet-4-6'
 *
 * 출력:
 *   src/content/guidebookChapter/{CHAPTER_BOOK_SLUG}-ch{CHAPTER_NUMBER}-{CHAPTER_SLUG}.mdx
 *
 * 구조 (2026-08-26 V4 구조 엔진 — 고정 5 섹션 폐기):
 *   - 본문 (H2/H3, 1차 출처 footnote) — 챕터 주제의 실제 질문 해결 순서로 구성
 *   - 체크리스트성 블록 최대 1개 / FAQ 조건부 / 자매 cross-ref 절대 금지 (ADR 0010)
 *   - "다음 챕터" 네비게이션만 고정 (책 구조상 필요)
 *
 * ADR 0006 4기준:
 *   - 1차 출처 url 화이트리스트 검증 (작성 거부)
 *   - 신규 통계·예측 금지 (시스템 프롬프트 명시)
 *   - footnote [^1] [^2] 자동 삽입
 *   - 검수 미완 토큰 0 (placeholder.ts 가 색인 차단)
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { callClaude } from './shared/claude-client.mjs';

const REPO_ROOT = process.cwd();
const OUT_DIR = resolve(REPO_ROOT, 'src/content/guidebookChapter');
const HEARTBEAT_PATH = resolve(REPO_ROOT, 'tmp/writer-chapter-heartbeat.json');

const MODEL = process.env.WRITER_CHAPTER_MODEL || 'claude-sonnet-4-6';
const API_KEY = process.env.ANTHROPIC_API_KEY;

const BOOK_SLUG = process.env.CHAPTER_BOOK_SLUG;
const CHAPTER_NUMBER = parseInt(process.env.CHAPTER_NUMBER || '0', 10);
const CHAPTER_TITLE = process.env.CHAPTER_TITLE;
const CHAPTER_SLUG = process.env.CHAPTER_SLUG;
const CHAPTER_OUTLINE = process.env.CHAPTER_OUTLINE || '';
const CHAPTER_SOURCES_RAW = process.env.CHAPTER_SOURCES || '[]';
const CHAPTER_AUDIENCE = process.env.CHAPTER_AUDIENCE || '일반 독자';

const ranAt = new Date().toISOString();

// 1차 출처 도메인 화이트리스트 (PURPOSE.md §3)
const ALLOWED_HOST_RE = /\.(?:go\.kr|or\.kr)$|^(?:etf\.krx\.co\.kr|data\.krx\.co\.kr|kosis\.kr|krx\.co\.kr|law\.go\.kr|korea\.kr|nipa\.kr|nia\.kr)$/i;

function writeHeartbeat(payload) {
  mkdirSync(dirname(HEARTBEAT_PATH), { recursive: true });
  writeFileSync(
    HEARTBEAT_PATH,
    JSON.stringify({ agent: 'chapter-writer', ranAt, ...payload }, null, 2) + '\n',
    'utf8',
  );
}

function fail(reason) {
  console.error(`[chapter-writer] FATAL: ${reason}`);
  writeHeartbeat({ status: 'fail', reason });
  process.exit(1);
}

if (!API_KEY) fail('ANTHROPIC_API_KEY 미설정');
if (!BOOK_SLUG) fail('CHAPTER_BOOK_SLUG 미설정');
if (!CHAPTER_NUMBER || CHAPTER_NUMBER < 1) fail('CHAPTER_NUMBER 1 이상 필요');
if (!CHAPTER_TITLE) fail('CHAPTER_TITLE 미설정');
if (!CHAPTER_SLUG) fail('CHAPTER_SLUG 미설정');

let sources;
try {
  sources = JSON.parse(CHAPTER_SOURCES_RAW);
  if (!Array.isArray(sources) || sources.length === 0) {
    fail('CHAPTER_SOURCES 빈 배열');
  }
} catch (err) {
  fail(`CHAPTER_SOURCES JSON 파싱 실패: ${err.message}`);
}

// 출처 host 화이트리스트 검증
for (const src of sources) {
  if (!src.url || !src.name) fail(`source 항목에 name + url 필수: ${JSON.stringify(src)}`);
  try {
    const host = new URL(src.url).hostname;
    if (!ALLOWED_HOST_RE.test(host)) {
      fail(`출처 host 화이트리스트 위반: ${host} (.go.kr / .or.kr / krx / kosis / law 만 허용)`);
    }
  } catch (err) {
    fail(`출처 URL 파싱 실패: ${src.url}`);
  }
}

const SYSTEM_PROMPT = `당신은 한국 데이터 저널 "스마트데이터샵" 의 가이드북 챕터 작성자다.
정책·세금·금융·주거·노후 등 1차 출처 (.go.kr / .or.kr) 기반 가이드를 작성한다.

엄격한 룰 (위반 시 글 폐기):
1. 1차 출처에 명시되지 않은 새 수치·통계·일자·인용 절대 금지 (환각 위험)
2. 가격 예측·전망·"오를 것/내릴 것" 류 절대 금지
3. 추측·정치적 입장·종교적 권유 금지
4. footnote 마커 [^1] [^2] 본문에 자연스럽게 삽입 — sources 순서대로
5. 1인칭 경험("직접 해보니") 금지 / 자매·외부 사이트 cross-link 절대 금지 (ADR 0010)
6. 한국어, 드라이한 데이터 저널 톤, 단호한 문장 (기존 문체 유지)
7. 독자 호명: "독자" ("본인" 호명 폐기 — 표현 자연화 룰)

본문 구조 — V4 구조 엔진 (고정 템플릿 금지):
- 챕터 outline 의 실제 질문이 해결되는 순서로 H2 구성. "시나리오→체크리스트→FAQ→액션"
  고정 순서를 매 챕터 반복하지 마라 (구글 scaled content 신호). 골격은 챕터마다 달라야 한다.
- 독창적 가치 2개+: 직접 계산(계산 기준을 문장에 명시) / 조건별 시나리오 / 판단 기준 / 비교 기준 /
  실무 마찰 지점 / 타임라인 / 분류 중 챕터 주제에 맞게 선택
- 체크리스트성 블록(체크리스트/체크포인트/확인사항) 문서 전체 최대 1개
- FAQ 조건부 — 본문이 답하지 않은 실제 후속 질문·예외만. 본문 재서술 Q&A 금지,
  "Q1. X는 무엇인가요?" 고정 정의 문형 금지. 새 정보 없으면 FAQ 생략
- 마무리 = 본문 재요약 금지 — 독자가 다음에 확인할 공식 자료·조건 제시
- 표는 비교·데이터 구조화 필요 시만. 표 직후 해설은 표에 없는 함의만
- 해석·추정·계산은 라벨이 아니라 문장으로 성격 구분 ("~로 읽힌다" / "대입해 계산하면" /
  "확인된 것은 아니지만 ~를 가정하면"). "편집자 해석:" 류 고정 라벨 문형 절대 금지
- 산문 "→" 최대 1회 / 전각 대시(—) 산문 금지 (각주 서지 예외)
- 습관 표현 금지: "첫째,/둘째,/셋째,", "결론적으로", "정리하면,", "표에서 보듯", "표를 풀어 보면"

출력 형식 (MDX, frontmatter 포함):
\`\`\`
---
bookSlug: "..."
chapterNumber: N
title: "N장 — ..."
publishedAt: "ISO8601+09:00"
sources:
  - name: "..."
    date: "YYYY-MM-DD"
    url: "https://..."
    accessedAt: "YYYY-MM-DD"
---

## N.1 (챕터의 첫 질문을 해결하는 헤딩)
...본문 + [^1]

## N.2 ...
...

## 다음 챕터
{N+1}장 — **...**.

[^1]: 출처 — \`url\`
[^2]: 출처 — \`url\`
\`\`\`
(위 골격에서 고정은 frontmatter 와 "다음 챕터" 네비게이션뿐 — 본문 H2 는 챕터 질문에 맞게 자유 구성)

총 분량 4000-6000자 권장 (중복 없는 분량). 첫 줄부터 즉시 \`---\` 시작 (인사말·코드 펜스 X).`;

const userMsg = `## 가이드북 정보
bookSlug: ${BOOK_SLUG}
챕터 번호: ${CHAPTER_NUMBER}
챕터 제목: ${CHAPTER_TITLE}
파일 슬러그: ${CHAPTER_SLUG}
독자 페르소나: ${CHAPTER_AUDIENCE}
발행 시각: ${ranAt}

## 챕터 outline (운영자 제공)
${CHAPTER_OUTLINE || '(outline 미제공 — 챕터 제목으로 자율 구성)'}

## 1차 출처 (sources)
${sources.map((s, i) => `[^${i + 1}] ${s.name} — ${s.url}${s.date ? ` (${s.date})` : ''}`).join('\n')}

## 작업
위 정보로 MDX 챕터 전체를 작성하라.
- frontmatter 의 publishedAt 은 현재 시각 KST (${new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().replace('Z', '+09:00')}) 사용
- sources[].accessedAt 은 오늘 KST 날짜 (${new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)})
- 본문 footnote 는 sources 순서대로 [^1] [^2] ... 매핑
- 구조는 V4 구조 엔진: outline 의 질문 해결 순서로 자유 구성 (고정 5 섹션 폐기, 자매 cross-ref 절대 금지)`;

async function main() {
  console.log(`[chapter-writer] ${ranAt} ${BOOK_SLUG}-ch${CHAPTER_NUMBER}-${CHAPTER_SLUG} 생성 시작 (${MODEL})`);

  let response;
  try {
    response = await callClaude({
      model: MODEL,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: userMsg,
      maxTokens: 8000,
    });
  } catch (err) {
    fail(`Claude API 호출 실패: ${err.message}`);
  }

  const mdx = response.text;

  // frontmatter 시작 검증
  if (!mdx.startsWith('---')) {
    fail(`MDX 형식 위반 — '---' 로 시작 X. 첫 100자: ${mdx.slice(0, 100)}`);
  }

  // 검수 미완 토큰 검출 (placeholder.ts 와 동일)
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

  // 출력 파일 경로
  const outPath = resolve(OUT_DIR, `${BOOK_SLUG}-ch${CHAPTER_NUMBER}-${CHAPTER_SLUG}.mdx`);
  if (existsSync(outPath)) {
    fail(`이미 존재하는 챕터 — 덮어쓰기 거부: ${outPath}`);
  }

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, mdx, 'utf8');

  console.log(`[chapter-writer] ✓ ${mdx.length} chars → ${outPath}`);
  console.log(`[chapter-writer] usage: ${JSON.stringify(response.usage)}`);

  writeHeartbeat({
    status: 'ok',
    model: response.model,
    bookSlug: BOOK_SLUG,
    chapterNumber: CHAPTER_NUMBER,
    chapterTitle: CHAPTER_TITLE,
    outPath: outPath.replace(REPO_ROOT, '').replace(/\\/g, '/'),
    bytes: mdx.length,
    usage: response.usage,
  });
}

main().catch((err) => {
  console.error('[chapter-writer] FATAL:', err);
  writeHeartbeat({ status: 'fatal', error: String(err?.message ?? err) });
  process.exit(1);
});
