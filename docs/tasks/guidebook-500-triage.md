# guidebook 500 triage — 다음 세션 task

> 큐잉 사유: 본 이슈는 PR #5 (Phase B SisterDeepDive) / PR #6 (awoo 매칭 정정) 와 무관.
> 이전 commit `9f4dfa9` 또는 그 이전에서 시작된 별개 routing/deploy 이슈.
> 별도 task 로 분리해 본 세션 마무리.
>
> 발견 시점: 2026-05-08 (PR #6 머지 직후 운영자 시각 확인 중)
> 큐잉 commit: `1d8ef21` (PR #6 merge)

## 증상

| URL 패턴 | local dist | production |
|---|---|---|
| `/guidebook/` (인덱스) | ✅ 24KB HTML | ❌ 500 |
| `/guidebook/{book-slug}/` (책 detail — etf-map-2026, jongseong-2026) | ✅ 24~32KB | ❌ 500 |
| `/guidebook/{book-slug}/{number}/` (chapter number) | ✅ 32~34KB | ❌ 500 |
| `/guidebook/{book-slug}/{chapter-slug}/` (chapter slug — `ch1-shingo-daesang`) | ❌ 빌드 안 됨 | ✅ 200 |

production 응답 특징:
- `cf-cache-status: DYNAMIC`
- response body 0 byte
- → static asset 매칭 실패 후 Functions fallback fail

## 원인 가설

`getStaticPaths` 가 number 기반으로 변경됐으나, production 은 이전 slug 기반 빌드의 chapter 페이지가 200 서빙 중. 책 detail / 인덱스 / number-chapter 는 일부 페이지 deploy 누락 가능성.

근거:
- production chapter URL 패턴 = entry.slug (`ch1-shingo-daesang`)
- local 의 `src/pages/guidebook/[book]/[chapter].astro` getStaticPaths = `chapter: String(entry.data.chapterNumber)` ("1", "2", ...)
- 두 패턴이 동일 코드에서 동시 빌드될 수 없음 → 빌드 시점 차이 (production stale 또는 코드 회귀)

## 주의

⚠ **빈 commit 으로 무작정 재빌드 금지**.
- slug → number 전환 시 기존 production URL (`ch1-shingo-daesang` 등) 404 → 색인 손실 위험
- redirect 또는 코드 통일이 선행되어야 안전

## 작업 순서 (권장)

1. **CF Pages 빌드 로그 확인** — 운영자가 빌드 ID 캡처해둠
   - https://dash.cloudflare.com/?to=/7e4ec5d0713002f29bbc8a133c15b2cd/pages/view/smartdatashop/4c1a2412-8e8d-475c-b436-9f1fe5429b05
   - "Build log" 탭 → guidebook 관련 누락/에러 확인
2. **`[chapter].astro` 의 params 를 entry.slug 기반으로 통일** — production 매칭 보존
   - 또는 number → slug 마이그레이션 + 301 redirect 박힘
3. **로컬 `dist/` 에 인덱스/책 detail HTML 정상 출력 확인** — npm run build 결과 grep
4. **단독 PR 로 분리** — 본 작업 (PR #5/#6) 와 머지 충돌 없도록 격리

## 영향 범위

- guidebook 라우트만 (`/guidebook/**`)
- ArticleLayout / InsightLayout / category 라우트 무관
- SisterDeepDive / 자매 sync 메커니즘 무관
- sitemap-news / RSS / OG / lighthouse 영향 없음 (이미 정상)

## 참고 commit

- `9f4dfa9` feat(ralph): 회차 4~11 — sitemap·footnote·heading 가드 + /guidebook/ 인덱스
- `ca84a3e` feat(guidebook): 위키독스 비교 4-에이전트 진단 후속
- `057178c` feat(guidebook): clickable cards + /guidebook/{slug} 라우트 신설

## 관련 컴포넌트 / 파일

- `src/pages/guidebook/index.astro` — 인덱스
- `src/pages/guidebook/[slug].astro` — 책 detail
- `src/pages/guidebook/[book]/[chapter].astro` — chapter 본문 (params 변경 후보)
- `src/components/GuidebookCard.astro` — 카드
- `src/components/ChapterTOC.astro` — chapter 목차
- `src/content/guidebook/*.json` — 책 메타
- `src/content/guidebookChapter/*.mdx` — chapter 본문
