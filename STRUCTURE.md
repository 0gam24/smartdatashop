# smartdatashop.kr 메인 사이트 — STRUCTURE.md

> smartdata HQ 가 본 사이트를 관리하기 위한 구조 문서.
> 본 문서는 본 repo 분석 결과 자동 생성 (수치/이름은 모두 실제 파일 확인).
>
> 마지막 갱신: 2026-05-07
> 분석 기준 commit: caf93b1 (caf93b14c30aa9d8a6b8e544bf27b77e9155885d)

## 1. 정체성
- 도메인: smartdatashop.kr
- 역할: 메인 hub (Google Discover / Naver 진입 엔진, 1차 출처 NewsArticle 매일 발행)
- repo: github.com/0gam24/smartdatashop
- 네트워크 헌법: docs/NETWORK.md v0.6 (2026-05-07 동기화 완료, 5~9 사이트 공통 헌법, multi-stack + dual-brand 인정)

## 1.5 🏛️ 네트워크 헌법 (docs/)

본 메인 사이트는 smartdata network HQ 의 헌법을 따른다:

- **docs/PURPOSE.md** — 사업·운영·콘텐츠 목적 (최상위 anchor)
  - 1년 월 500만원 / 2년 월 1,000만원 수익 목표
  - 1인 + AdSense + 환각 0
- **docs/PROJECT_DEFINITION.md** v1.0 — 5~9 사이트 네트워크 전체 그림
  - 메인 1 + 자매 4~8 = 최대 9 사이트
  - 333편 + 1099 prerender 콘텐츠 자산
- **docs/NETWORK.md** v0.6 — 5~9 사이트 공통 헌법
  - 4 절대 규칙 (신뢰성·실시간·정확성·출처표기)
  - multi-stack + dual-brand 인정
- **docs/CATEGORY_MAP.md** — 5 사이트 카테고리 매핑
  - Dispatcher 가동의 단일 진실
  - 메인 5 ↔ 자매 (calc 5 / awoo 6 / moneylook 12 / ikhi 5)

본 헌법과 충돌하는 메인 사이트 코드·콘텐츠는 무효.
헌법 위계: PURPOSE > PROJECT_DEFINITION > NETWORK > CATEGORY_MAP.

## 2. 기술 스택
- Astro ^5.0.0 (정적 사이트 생성)
- Tailwind ^3.4.17 (`@astrojs/tailwind` ^5.1.4, `applyBaseStyles: false`)
- @astrojs/mdx ^4.3.14 (콘텐츠 컬렉션 본문)
- @astrojs/sitemap ^3.7.2 (자동 sitemap + customPages)
- @astrojs/rss ^4.0.18 (RSS feed)
- Satori ^0.26.0 + @resvg/resvg-js ^2.6.2 (OG 이미지 동적 생성)
- @fontsource/* — Pretendard 미사용, Noto Serif KR + Noto Sans KR + JetBrains Mono self-host
- Pagefind ^1.5.2 (정적 검색 인덱스, postbuild)
- TypeScript ^5.7.0 + @astrojs/check ^0.9.9

## 3. 라우트 (정적)
- `/` — 홈 (index.astro)
- `/about/`
- `/contact/`
- `/methodology/`
- `/corrections/`
- `/editorial-policy/`
- `/ai-policy/`
- `/affiliate-disclosure/`
- `/privacy/`
- `/terms/`
- `/insight/` — 인사이트 인덱스
- `/tag/` — 태그 인덱스
- `/data/` — 데이터 던전 인덱스
- `/guidebook/` — 가이드북 인덱스
- `/authors/junhyuk-kim/` — 저자 프로필
- `/article` — 최신 펄스로 meta-refresh 리디렉트 셸 (sitemap 제외, color: noindex)

## 4. 라우트 (동적)
- `/[year]/[month]/[day]/[slug]/` — 펄스 (일일)
- `/insight/[slug]/` — 인사이트 (에버그린)
- `/category/[slug]/` — 카테고리별 글 인덱스 (5개 카테고리)
- `/tag/[group]/[slug]/` — 태그별 글 인덱스 (group: personas/dataTypes/actions)
- `/topic/[slug]/` — 토픽별 인덱스
- `/guidebook/[slug]/` — 가이드북 메타 (책 단위)
- `/guidebook/[book]/[chapter]/` — 가이드북 챕터 본문

## 5. API endpoints
- `/feed.xml` — 사이트 전체 RSS
- `/feed.json` — JSON Feed 1.1
- `/news-sitemap.xml` — Google News sitemap
- `/image-sitemap.xml` — 이미지 sitemap
- `/sitemap.xml` + `/sitemap-index.xml` — `@astrojs/sitemap` 자동 생성
- `/category/[slug]/feed.xml` — 카테고리별 RSS
- `/data/citations.csv` — 1차 출처 dedupe CSV 다운로드
- `/data/citations.json` — 1차 출처 dedupe JSON
- `/admin/config.yml` — Decap CMS 설정 endpoint (sitemap 제외)
- `/og/v2/home.png` — 홈 동적 OG (Satori v2)
- `/og/v2/[type]/[slug].png` — 글 동적 OG
- `/og/v2/category/[slug].png` — 카테고리 동적 OG
- `/og/v2/author/[slug].png` — 저자 동적 OG
- `/og/v2/tag/[group]/[slug].png` — 태그 동적 OG
- `/og/pulse/[slug].png` — (legacy) 펄스 OG
- `/og/insight/[slug].png` — (legacy) 인사이트 OG

## 6. 레이아웃
- `BaseLayout` — 모든 페이지 wrapper. head meta / OG / canonical / robots / JSON-LD / 폰트 self-host / Pagefind / Cloudflare Web Analytics
- `ArticleLayout` — 펄스 전용. Header(daily) + BreadcrumbMasthead + ArticleHeader + TrustBar + ReadingProgress + ArticleTOC + SourceList + AuthorCard + CorrectionsBlock + CitationExport
- `InsightLayout` — 인사이트 전용. ArticleLayout 과 거의 동일하나 Header(insight) + 브레드크럼이 "홈 › 인사이트 › 카테고리"
- `PolicyLayout` — 정책 페이지 (about/contact/privacy/terms 등) 전용. eyebrow + updatedAt + placeholder 자동 noindex 가드

## 7. 컴포넌트

### 7.1 핵심
- `Header` — 사이트 헤더. KST 오늘 날짜 자동 (`formatKoreanToday`) + 5개 nav (daily/insight/guidebook/data/network)
- `Footer` — 푸터. 발행인 정보(김준혁/사업자번호) + KST 오늘 날짜 자동
- `Masthead` — 홈 마스트헤드. vol/no + 오늘 발행수 + 누적 발행수 + 마지막 발행 freshness
- `BreadcrumbMasthead` — 펄스 브레드크럼 (카테고리/날짜/vol/no)
- `Hero` — 홈 최상단 섹션. 최신 펄스 1편 + (옵션) "오늘의 지표" 차트 어사이드
- `TrustBar` — 본문 상단 신뢰 띠 (AI-보조 등급 / 출처 N건 / 업데이트일 / 정정 N건)
- `ArticleHeader` — 글 상단 (카테고리/제목/발행시각/저자/리딩타임/출처수/AI 등급)
- `ArticleTOC` — 본문 목차 (sticky)
- `ArticleFigure` / `Figure` / `ChartFigure` / `ChartLib` — 본문 그림/차트 래퍼
- `SourceList` — 본문 하단 1차 출처 리스트
- `Tldr` — 본문 도입부 200자 요약 박스
- `AuthorCard` — 저자 정보 박스 (E-E-A-T)
- `CorrectionsBlock` — 정정 이력 표시
- `CitationExport` — 출처 인용 CSV/JSON 내보내기
- `RelatedList` — 관련 글 슬롯
- `ReadingProgress` — 스크롤 진행률 바
- `SectionHead` — 섹션 제목 헤더
- `CategoryColumn` / `CategoryStrip` — 홈 카테고리별 글 열/띠
- `PulseCard` — 펄스 카드 (제목/카테고리/시간/태그/tldr)
- `PulseList` — 펄스 카드 리스트
- `SisterSiteGrid` / `SisterSiteCard` — 자매 사이트 4열 그리드 + 카드
- `GuidebookCard` — 가이드북 카드 (책 단위)
- `ChapterTOC` — 가이드북 챕터 목차
- `Prefetch` — 링크 프리페치 (성능)
- `SmartImage` — 이미지 최적화 래퍼
- `SearchModal` — Pagefind 검색 모달
- `SkipToContent` — 접근성 스킵 링크
- `MobileBottomTabs` — 모바일 하단 탭바
- `ReducedMotion` — `prefers-reduced-motion` 가드
- `BookmarkToggle` — 북마크 토글 (LocalStorage)
- `ToollGate` — 펄스 본문 외부 1차 출처 톨게이트 ("원문 →")
- `NewsletterCTA` — Stibee 뉴스레터 구독 폼 (`PUBLIC_STIBEE_LIST_ID` 미설정 시 fallback)
- `ComingSoon` — 빈 페이지 안내

### 7.2 viz (data visualization)
- `DataNumber` — Reuters/FT 식 거대 tabular 숫자. props: `n / unit? / delta? / deltaDirection? / label? / size?`
- `KpiTile` — Bloomberg Terminal 식 KPI 박스. props: `title / n / unit? / change? / source? / sourceHref?`
- `Sparkline` — 인라인 추세선 (의존성 0). props: `values: number[] / width? / height? / stroke? / ariaLabel`
- `BarSpark` — 카테고리별 미니 막대. props: `values / labels? / width? / height? / max? / ariaLabel`
- `ChangeBadge` — ▲ +2.6% 류 변화량 인디케이터. props: `prev / curr / unit? / polarity? / mode? / digits?`
- `SourceCount` — 출처 N건 인라인 표시. props: `n / emphasis?`

## 8. 콘텐츠 컬렉션
정의: `src/content/config.ts` (Zod schema)

- `pulse` — 일일 펄스 (mdx). frontmatter: `title(max60) / publishedAt / updatedAt? / category(5 enum) / tldr(max200) / sources[](min1) / chartUrl? / coverImage? / chartData? / aiAssisted(false|edit|draft|fact-check) / correctionLog[] / tags{personas,dataTypes,actions}`
- `insight` — 주간 인사이트 (mdx). pulse 와 동일하나 `tldr(max300) / sources[](min2) / estimatedReadingTime` (분, int)
- `guidebook` — 가이드북 메타 (data, json). `title / description / publishedAt / totalChapters / completedChapters / license / coverImage? / pdfUrl?`
- `guidebookChapter` — 가이드북 챕터 (mdx). `bookSlug / chapterNumber / title / publishedAt / sources[] / aiAssisted`
- `dataPage` — 데이터 던전 페이지 (mdx). `title / publishedAt / updatedAt? / dataSource / chartConfig? / description`

공통 sub-schemas: `sourceSchema {name, url(required, ADR 0005), accessedAt?, date?, note?}`, `correctionSchema {date, description}`, `tagGroupsSchema`, `chartDataSchema`, `aiAssistedSchema`.

카테고리 5종: `policy / tax-finance / market / stats / ai-tech`

## 9. lib 모듈
- `jsonld.ts` — Schema.org LD 빌더 (NewsArticle / Article / Person / Organization / Breadcrumb / WebPage / Dataset). `PUBLIC_AUTHOR_SAMEAS` / `PUBLIC_ORG_SAMEAS` 콤마 분리 URL 주입
- `korean.ts` — KST 헬퍼 (`formatKoreanToday / formatKoreanDate / pulseDateParts / pulseUrl / categoryToKorean`). UTC/KST 차이로 인한 빌드 시점 날짜 sliip 차단
- `placeholder.ts` — 검수 미완 토큰 (`[검수 후 입력]` 등) 자동 검출 → robots `noindex,nofollow` 자동 출력 (Layer 1 안전망, ADR 0005)
- `format.ts` — 한국어 숫자/날짜/퍼센트/통화 포맷 (+ `format.test.md` 사례)
- `articleUrl.ts` — `pulseUrl` → `articleUrl` 명료성 alias
- `tags.ts` — 태그 분류 helpers (`tagUrl / TagGroup / TagValue`, PLANNING.md §17)
- `stibee.ts` — Stibee 뉴스레터 클라이언트 (PUBLIC_STIBEE_LIST_ID 사용)
- `og/generate.ts` — Satori → SVG → PNG 동적 OG (`generateOgPng / generateSectionOgPng`)
- `og/fonts.ts` — OG 폰트 버퍼 로더 (`OG_FONTS`)
- `og/templates/default.ts` — 기사용 OG 템플릿 (Reuters/Bloomberg 스타일 1200×630, 차트 오버레이)
- `og/templates/section.ts` — home/category/tag/author 비-기사 페이지 OG 템플릿 (1200×630)

## 10. GitHub Actions

| workflow | 트리거 | 역할 |
|---|---|---|
| `build-check.yml` | PR(모든 브랜치) + push(main 제외) + manual | astro check + npm run build (CF Pages 빌드 실패 사전 차단) |
| `scout.yml` | cron `0 * * * *` (매시 UTC=KST) + manual | 에이전트 #2 Data Scout — RSS polling → data-queue/ commit (data-scout-bot) |
| `editor.yml` | cron `0 21 * * *` (06:00 KST) + manual | 에이전트 #1 Editor-in-Chief — daily-queue/YYYY-MM-DD.json 산출 (editor-in-chief-bot) |
| `writer.yml` | push `daily-queue/**` + manual | 에이전트 #3 Pulse Writer — MDX 초안 → drafts/{run_id} 브랜치 자동 PR (peter-evans/create-pull-request) |
| `publisher.yml` | push main `src/content/{pulse,insight}/**` + manual | 에이전트 #6 Publisher — IndexNow / Google Indexing API / Naver SA / Stibee 발행 (M0: IndexNow stub 활성 토글) |
| `fact-check.yml` | cron `0 17 * * *` (02:00 KST) + manual | 에이전트 #6 Fact-Checker (Layer 4) — 14일 윈도우 글 fuzzy match 감사 → fact-check-queue/ (fact-checker-bot) |
| `network.yml` | cron `0 14 * * *` (23:00 KST) + manual | 에이전트 #7 Network Orchestrator — 자매 사이트 동기화 + 일일 리포트 (Slack/이메일) |
| `lighthouse.yml` | PR main + push main + manual | Lighthouse CI desktop+mobile 4 URL 검증 (perf≥85m/90d, a11y/BP/SEO≥95) + PR 코멘트 |

## 11. scripts

### 11.1 agents (`scripts/agents/`)
- `scout.mjs` — 매시 RSS polling (STUB→LITE). config/sources.json fetch + 파싱 → data-queue/
- `editor.mjs` — 06:00 KST. data-queue/* → daily-queue/YYYY-MM-DD.json (스텁)
- `writer.mjs` — daily-queue 변경 시. → src/content/pulse/*.mdx 초안 (스텁)
- `publisher.mjs` — main 머지 후. IndexNow + Google Indexing + Naver SA + Stibee (M0 stub)
- `fact-checker.mjs` — 02:00 KST. 14일 윈도우 fuzzy match 감사 (Layer 4 stub, ADR 0005)
- `source-cache.mjs` — SourceWriter Stage 2. 권위 호스트 fetch → `.cache/sources/{sha256}.txt`
- `source-verifier.mjs` — SourceWriter Stage 4. draft MDX 수치/인용 verbatim substring 매칭 검증
- `network-orchestrator.mjs` — 23:00 KST. 자매 사이트 동기화 + 운영 리포트 (스텁)
- `shared/claude-client.mjs` — Anthropic SDK wrapper (M1+ 활성)
- `shared/indexnow.mjs` — IndexNow 핑 helper

### 11.2 기타 (`scripts/`)
- `smoke-test.mjs` — `npm run smoke`. 빌드 산출물 회귀 가드 (sitemap 3종, OG 카드 ≥10KB, 정책 noindex, TrustBar+JSON-LD 3종 등 95+ 체크)
- `verify-source-links.mjs` — Layer 3 일부. 모든 source url HEAD 체크 (4xx/5xx/timeout 보고)
- `extract-numerical-claims.mjs` — Layer 3 빌드 게이트. 한국식 수치 토큰 추출 + footnote `[^N]` 페어링 검사
- `auto-cover.mjs` — prebuild. `public/uploads/covers/<slug>.{webp,jpg,png}` → frontmatter `coverImage` 자동 주입
- `operator-inbox.mjs` — postbuild. 운영자 펜딩 액션 자동 집계 → 루트 `OPERATOR_INBOX.md` (gitignored)
- `weekly-report.mjs` — 주간 운영자 헬스 리포트 (`npm run weekly`)
- `_gen-icons.mjs` — 아이콘 생성 (1회성)
- `ralph/scope-guard.mjs` — Ralph 회차 commit 전 금지 경로 터치 검사
- `ralph/PROMPT.md` + `ralph/RALPH_LOG.md` — Ralph 회차 누적 로그

## 12. 빌드·테스트 명령 (package.json scripts)
- `npm run dev` / `npm start` — `astro dev`
- `npm run build` — `astro build` (`prebuild`: auto-cover.mjs / `postbuild`: pagefind --site dist + operator-inbox.mjs)
- `npm run preview` — `astro preview`
- `npm run smoke` — 빌드 산출물 회귀 검증
- `npm run verify` — verify:links + verify:claims (관대)
- `npm run verify:strict` — verify:links --strict + verify:claims --strict (CI 게이트)
- `npm run verify:links` — 1차 출처 url HEAD 체크
- `npm run verify:claims` — 본문 수치 ↔ footnote 페어링
- `npm run weekly` — 주간 운영자 리포트
- `npm run auto-cover` — 표지 이미지 자동 매핑

## 13. 환경변수 의존 (PUBLIC_* — 키 이름만)
- `PUBLIC_NAVER_SITE_VERIFICATION` — 네이버 서치어드바이저 토큰 (BaseLayout meta)
- `PUBLIC_GOOGLE_SITE_VERIFICATION` — 구글 서치 콘솔 토큰 (BaseLayout meta)
- `PUBLIC_AUTHOR_SAMEAS` — 저자 외부 프로필 URL 콤마 분리 (Person LD sameAs)
- `PUBLIC_ORG_SAMEAS` — 조직 외부 프로필 URL 콤마 분리 (Organization LD sameAs)
- `PUBLIC_CF_ANALYTICS_TOKEN` — Cloudflare Web Analytics beacon (PROD only)
- `PUBLIC_STIBEE_LIST_ID` — Stibee 뉴스레터 리스트 ID
- `PUBLIC_TRUSTED_HOSTS` — source-cache 권위 호스트 추가 (콤마 분리, 운영자 명시)
- `PUBLIC_SITE_URL` — publisher.mjs site URL (기본 `https://smartdatashop.kr`)

GitHub Actions secrets/vars (코드 내 참조 — 키만):
- `ANTHROPIC_API_KEY` (모든 agent workflow, M1+ 사용)
- `GOOGLE_INDEXING_KEY` / `NAVER_SA_KEY` / `STIBEE_API_KEY` (publisher M1+)
- `GH_TOKEN` / `SLACK_WEBHOOK_URL` (network-orchestrator)
- `vars.PUBLISHER_LIVE_INDEXNOW` — IndexNow 활성 토글

## 14. 의존성 (핵심)

### dependencies
- `astro@^5.0.0`
- `@astrojs/mdx@^4.3.14`
- `@astrojs/rss@^4.0.18`
- `@astrojs/sitemap@^3.7.2`
- `@astrojs/tailwind@^5.1.4`
- `tailwindcss@^3.4.17`
- `satori@^0.26.0`
- `@resvg/resvg-js@^2.6.2`
- `@fontsource/jetbrains-mono@^5.2.8`
- `@fontsource/noto-sans-kr@^5.2.9`
- `@fontsource/noto-serif-kr@^5.2.9`

### devDependencies
- `@astrojs/check@^0.9.9`
- `pagefind@^1.5.2`
- `typescript@^5.7.0`

(Pretendard / Chart.js 등은 CDN — package.json 비포함, CLAUDE.md 의 npm install 지침과 일치)

## 15. 배포
- 호스팅: Cloudflare Pages (build-check.yml 주석 + lighthouse.yml URL + 코드 내 참조 다수 — `astro.config.mjs site: https://smartdatashop.kr`)
- 프로젝트 이름: (미확인 — repo 내 wrangler.toml / pages.toml 미존재)
- 도메인: smartdatashop.kr
- production branch: `main` (build-check.yml 주석: "main 은 Cloudflare Pages 가 직접 빌드", publisher.yml: `branches: [main]`)

## 16. 현재 콘텐츠 통계 (분석 시점 — 2026-05-07)
- 펄스: 6편 (`src/content/pulse/2026-05-05-*.mdx` × 6)
- 인사이트: 1편 (`2026-05-04-korea-etf-map.mdx`)
- 가이드북: 2권 (`etf-map-2026.json`, `jongseong-2026.json`)
- 가이드북 챕터: 13편 (etf-map-2026 × 1, jongseong-2026 × 12)
- 데이터 던전: 0편 (`.gitkeep` 만 존재)
- 마지막 발행일: 2026-05-06 (펄스 publishedAt 최댓값)

## 17. ADR (`docs/decisions/`)
- 0000-template
- 0001-timezone-kst-lock
- 0002-preview-mode-protocol (폐기 → 0005)
- 0003-toll-gate-matrix
- 0004-decap-config-endpoint
- 0005-compensating-controls (검수 게이트 폐기 + 4-Layer 안전망)
- 0006-formal-publish-criteria (정식 발행 4대 기준)
- 0007-sourced-content-writing
- 0008-network-revenue-funnel (메인 + 자매 N 합산 AdSense, CLAUDE.md 확장 근거)

## 18. 변경 이력
- 2026-05-07 — 초기 자동 생성 (commit caf93b1 기준)
- 2026-05-07 — smartdata network HQ 헌법 동기화
  - docs/PURPOSE.md / PROJECT_DEFINITION.md / NETWORK.md v0.6 / CATEGORY_MAP.md 신설
  - §1 갱신 (NETWORK.md 미존재 → docs/NETWORK.md v0.6 박힘 명시)
  - §1.5 신설 (네트워크 헌법 link 4종 + 위계 명시)
  - 5 사이트 한 덩어리 운영의 메인 사이트 측 헌법 박힘 시점
  - CLAUDE.md 가 본 4 문서를 anchor 로 따름 (§네트워크 헌법 신설)
