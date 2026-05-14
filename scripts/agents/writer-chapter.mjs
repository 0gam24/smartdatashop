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
 * 표준 5 섹션 자동 포함:
 *   - 본문 (H2/H3, 1차 출처 footnote)
 *   - 본인 시나리오 3 종
 *   - 본인 체크리스트
 *   - FAQ 5 Q&A
 *   - 본인 액션
 *   - 자매 사이트 cross-ref
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
5. 표·체크리스트·시나리오 적극 활용 (가독성)
6. 한국어, 드라이한 데이터 저널 톤, 단호한 문장
7. "본인" 어조 — 독자 직접 호명

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
aiAssisted: draft
---

## 한 줄 요약
...

## N.1 ...
...본문 + [^1]

## N.2 ...
...

## N.X 본인 시나리오 3 종
**시나리오 A** — ...
**시나리오 B** — ...
**시나리오 C** — ...

## N.Y 본인 체크리스트
- ☐ ...

## N.Z 자주 묻는 질문 (FAQ 5)
**Q1. ...?**
A. ...

## N.W 본인 액션
1. ...

## N.V 자매 사이트 — 더 깊이
- ...

## 다음 챕터
{N+1}장 — **...**.

[^1]: 출처 — \`url\`
[^2]: 출처 — \`url\`
\`\`\`

총 분량 4000-6000자 권장. 첫 줄부터 즉시 \`---\` 시작 (인사말·코드 펜스 X).`;

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
- 표준 5 섹션 모두 포함 (시나리오 3종 / 체크리스트 / FAQ 5 / 액션 / 자매 cross-ref)`;

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
