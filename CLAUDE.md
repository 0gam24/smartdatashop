# CLAUDE.md — 스마트데이터샵 AI 협업 규약

> **이 파일이 자동 로드되어 모든 작업에 적용됩니다.**
> 영역별 추가 규칙은 디렉토리별 CLAUDE.md 참조.

## 프로젝트 한 줄
한국의 정책·세금·금융·시장·통계·AI 1차 출처 데이터를 매일 5분으로 정리하는 **단일 독립** 데이터 저널 사이트.

## 프로젝트 목적 (2026-05-24 — 네트워크 컬렉트 폐기, ADR 0010)

> 본 사이트는 **단일 독립 사이트**다. 네트워크/자매 컬렉트 컨셉은 폐기.

**최상위 목적**: 본 사이트 단독 트래픽으로 **Google AdSense 수익화** (1년 500만원 → 2년 1,000만원 → 3년+ 2,000만원+).

**역할**:
- **smartdatashop.kr** — Google Discover / Naver 진입 + 1차 출처 NewsArticle 매일 발행 + AdSense 수익원. *단일 독립 운영*.
- 자매 사이트(`calculatorhost.com` / `awoo.or.kr` / `asiatop.co.kr` / `iknowhowinfo.com`)는 **별도 사업체**로 분리 — 본 사이트 하네스·의사결정·콘텐츠 영향 0. 필요 시 운영자가 외부 자원으로 호출.
- 자매 RSS fetch / 네트워크 최신 섹션 / 톨게이트 funnel / 페르소나 매핑 — *하네스 컨텍스트 아님*. 코드가 남아 있어도 새 콘텐츠는 자매를 전제하지 않는다.

**AdSense 안전 — 모든 콘텐츠 작업의 1순위 제약**:
- **fabrication 1건 = AdSense 영구 차단 위험** — ADR 0006 4기준 본 사이트 단독 적용
- YMYL 신뢰성 — `.go.kr` / `.or.kr` 1차 출처 우선
- NewsMediaOrganization LD + ethics/corrections/methodology 정책 URL 의무

**폐기 사유 (2026-05-24)**: 본 사이트 페이지에서 자매 링크 타고 들어가도 자세한 내용 부재 — 사용자 경험 저하. "한 덩어리" 컨셉이 실제 작동하지 않음. 본 사이트 단독으로 모든 콘텐츠·SEO·수익화 완결한다.

## 위계 (2026-08-26 docs 재편 반영)

위계: **본 CLAUDE.md (최상위)** > 영역별 CLAUDE.md (src/content, src/components) > `docs/references/` 라이브러리 > STRUCTURE.md.

구 헌법 문서 체계(`docs/PURPOSE.md` v1.1, `docs/decisions/` ADR 0000~0011, dashboard/operations/PLANNING/DESIGN 등)는 2026-08-26 docs 재편으로 **폐기** — 실질 조항(수익 목표·AdSense 정책·ADR 0006 4기준·발행 방침·디자인 금지 룰)은 전부 본 파일에 인라인되어 있고, 원문은 git 이력으로만 참조한다: `git show 69d20bd:docs/PURPOSE.md` / `git show 69d20bd:docs/decisions/0006-formal-publish-criteria.md`. 본문에서 "ADR 0006" 등 번호 인용은 이 이력 문서를 가리킨다.

## 첫 작업 진입 시 반드시 읽을 파일 (우선순위 순)
1. `docs/references/00-목차-INDEX.md` — 참고 문서 라이브러리 진입점 (260문서, G/H 공식 가이드 1순위)
2. `today.md` / `OPERATOR_INBOX.md` — 현재 상태 (빌드 자동 생성, 구 dashboard 대체)
3. 콘텐츠 작업 시: `src/content/CLAUDE.md` (자동 상속 — 포스팅 구조 엔진 V4 포함) + `docs/references/F-프로젝트별/스마트데이터샵-포스팅구조엔진-V4.md` (라이브러리 정본)
4. 구조 파악 시: `STRUCTURE.md`

## 멀티 에이전트 자체 결정 원칙 (2026-05-26 운영자 영구 지시, ADR 0011)

> 모든 의사결정은 7+ 에이전트 관점 합의로 즉시 실행. 운영자에게 옵션 선택 요청 금지.

**자체 결정 대상 (작은 변경)**: 룰·메모리·문서·콘텐츠 작성, 펄스 발행, 룰 박기, 기존 펄스 보강

**7+ 에이전트 표준 라인업**:
- 🔵 **SEO** — 구글·네이버 검색 노출
- 🟢 **AEO** — ChatGPT·Perplexity 답변 엔진 노출
- 🟣 **GEO** — LLM 인용성·생성형 엔진
- 🟠 **운영자 시간 (1.5h/일 한도)** — 구 PURPOSE.md §2 (조항 인라인 승계)
- 🔴 **AdSense 리스크** — 검토 기간 동결 정책 + ADR 0006 4기준
- ⚖ **편집자·법무** — 단정 표현·명예훼손·정확성
- 📊 **데이터 저널** — 시각화·인용성

**합의 형식**: 에이전트별 ✅/⚠/❌ 표 + 본 CLAUDE.md 조항 매핑 근거 + 즉시 실행

**자체 결정 금지 (운영자 결정 필요)**:
- 외부 결제·도메인·DNS·Cloudflare env var 변경
- AdSense 계정·GitHub repo 신설
- 사업 모델 근본 변경 (수익 목표·사이트 정체성 차원)
- 본 CLAUDE.md 헌법급 조항 신설·개정은 운영자 명시 지시 시만

**위계 충돌 시 우선순위**: 수익(AdSense) > 절대 마지노선(fabrication 0·검수 토큰 0) > 운영(1.5h/일) > 콘텐츠 > 사이트 운영

## docs/references/ G·H 공식 가이드 적극 참조 룰 (2026-05-26 운영자 지시 → 2026-08-26 라이브러리 개편)

> `docs/references/G-구글-공식가이드/`(Google Search Central 원문 174문서)와 `docs/references/H-네이버-공식가이드/`(서치어드바이저 원문 55문서)는 **1차 출처 사본** — 매 펄스/페이지/컴포넌트 작성 시 의무 참조. 진입점: `docs/references/00-목차-INDEX.md`. 구 `docs/google-seo-vibe-coding/` 폴더는 폐기(`_archive/google-seo/` 보존), 본 절이 대체한다.

**우선순위 (문서 충돌 시)**:
1. `G-구글-공식가이드/` · `H-네이버-공식가이드/` — 스펙·정책의 최종 근거
2. `D-SEO-GEO/`(D1~D5) 등 A~F 내부 요약 — 실행 방법·프로젝트 적용
3. `_archive/` — 이력 참고용, **작업 근거 사용 금지**

**🔴 매 펄스 발행 시 의무 적용** (구 04·06·07·02 체크의 실질 승계 — 상세 체크 항목은 `src/content/CLAUDE.md` §Google SEO 발행 전 체크리스트):
1. **title·snippet** — `G/04-appearance-검색결과표시/title-link.md` + `snippet.md`: title 목표 30~40자(상한 60), tldr 목표 90~150자(상한 200)
2. **NewsArticle LD** — `G/05-structured-data-구조화데이터/article.md` + `sd-policies.md`: 정확한 `datePublished`·`dateModified`
3. **뉴스 sitemap·게시일** — `G/03-crawling-indexing-크롤링색인/sitemaps/news-sitemap.md` + `G/04-appearance-검색결과표시/publication-dates.md`
4. **E-E-A-T** — `G/02-fundamentals-기본/creating-helpful-content.md`: 1차 출처·발표 일자·저자 신호
5. **URL·링크·이미지** — `G/03-crawling-indexing-크롤링색인/url-structure.md` + `links-crawlable.md` + `G/04-appearance-검색결과표시/google-images.md`
6. **글 구조** — `docs/references/F-프로젝트별/스마트데이터샵-포스팅구조엔진-V4.md` (scaled content 회피 — `npm run verify:structure` 게이트)

**작업 유형별 적용 의무**:
- 새 페이지/컴포넌트: `G/02-fundamentals-기본/seo-starter-guide.md` + 위 1·5 + `D-SEO-GEO/D4-메타데이터-기본SEO.md`(Astro 메타 템플릿)·`D3-구조화데이터-JSON-LD.md`
- 사이트 구조 변경: `G/03-crawling-indexing-크롤링색인/` + `G/08-crawling-크롤링전문/` (robots.txt·크롤러 목록은 2026년 문서 분리로 **08**에 있음)
- 매월 하네스 리뷰: `G/06-monitor-debug-모니터링/search-console-start.md` + `debugging-search-traffic-drops.md` + `G/04-appearance-검색결과표시/core-web-vitals.md`
- 네이버 대응: H 폴더는 Google로 대체 불가 (Yeti·meta keywords·RSS 제출·IndexNow) — `H-네이버-공식가이드/00-목차.md` 진입
- GEO/AEO 작업: `G/02-fundamentals-기본/ai-optimization-guide.md` **먼저** (llms.txt·청킹은 Google 검색에 무효 공식 명시) → `D-SEO-GEO/D5`는 ChatGPT·Perplexity 등 Google 외 엔진 전용

## docs/references/ 내부 요약(A~F) 참조 룰 (2026-05-09 합의 → 2026-08-26 개편)

구 references 01~07 은 `_archive/` 이동·보존. 현행 참조 대상:

**🏆 최우선 (모든 콘텐츠·페이지 작업)**:
- `D-SEO-GEO/D1-구글-SEO.md` — 구 06-구글-SEO-종합 후속: E-E-A-T / AI 콘텐츠 정책 / 스팸 / URL·canonical / Discover
- `D-SEO-GEO/D2-네이버-SEO.md` — 구 07-네이버-SEO-종합 후속: C-Rank·D.I.A. / Yeti / 서치어드바이저 / 유사문서

**★ 적극 (매 작업 시작·매 모듈 작성)**:
- `A-바이브코딩-방법론/A1-바이브코딩-핵심원칙.md` — 구 01~05 통합본: 3레이어 OS / 노트-First·시간 예산 / 모듈 분리 1줄 기준 / 컨텍스트 엔지니어링 / 하네스 제어

**선택 (구현 시 코드 템플릿)**:
- `D-SEO-GEO/D3-구조화데이터-JSON-LD.md` / `D4-메타데이터-기본SEO.md` — 구 07-vibe-coding-seo-template 의 템플릿 역할 승계

**적용 의무** (기존 실질 유지):
- 새 펄스/인사이트/챕터 작성 시 D1(AI 콘텐츠 정책) + D2(C-Rank/D.I.A.) 검증 — 최종 근거는 `G/01-essentials-필수정책/spam-policies.md` + `H/03-콘텐츠 가이드라인/`
- 매 컴포넌트 작성 시 A1 모듈 분리 1줄 기준 자문
- CLAUDE.md / Hook / Sub-agent 작업 시 A1 제어 레이어 매핑
- D 요약은 G·H 공식의 하위 — 충돌 시 항상 G·H 우선

## 디렉토리별 추가 규칙 (자동 상속)
- `src/components/CLAUDE.md` — 컴포넌트 작성 규칙
- `src/content/CLAUDE.md` — 콘텐츠 컬렉션 편집 규칙
- (필요 시 추가)

## 절대 금지

<!-- 실수 1회 발생 시 즉시 추가하는 영역 -->

### 편집 무결성 (Editorial integrity, ADR 0005 + ADR 0006)
<!-- 검수 게이트는 폐기되었다. 5계층 자동 안전장치 + 정식 발행 기준 룰로 대체. -->
- 본문에 구체적 정부 통계(312만 명, 2.1% 등) 새로 만들지 마라 — 환각 위험
- 라이터 에이전트가 검수 미완 토큰(`[검수 후 입력]`, `[검수 후]`, `[검수 후 발표일]` 등) 을 본문/제목/tldr 에 남기면 `src/lib/placeholder.ts` 가 자동 검출해 robots `noindex,nofollow` 자동 출력 — 색인 차단으로 보호
- 글 상단 `<TrustBar>` 가 1차 출처 수 / AI 보조 등급 / 마지막 업데이트 / 정정 횟수를 시각화
- `previewMode` / `verifiedBy` 프론트매터 필드는 2026-05-06 폐기 (ADR 0002 → 0005). 신규 글 frontmatter 에 절대 다시 등장 금지

### 정식 발행 4대 기준 (ADR 0006 — 2026-05-06)
<!-- 사용자 명시 지시: "수치·인용·기관 발표 일자 등은 출처와 함께 정확한 출처 링크가 추가해서 정식 발행" -->
모든 본문에 등장하는 (a) 구체 수치 (b) 직접 인용 (c) 기관 발표 일자 는 다음 4개 기준을 동시에 충족해야 한다:

1. **출처 페어링** — 같은 단락 또는 직전·직후 단락에 `[^N]` footnote 마커가 있어야 한다.
2. **정확한 출처 URL** — `sources[]` 의 url 은 root 가 아니라 가능한 한 deep link (정부 보도자료 PDF / 통계 DB 페이지). root 만 가능한 경우 `accessedAt` 일자를 명시한다.
3. **기관 발표 일자 명시** — 본문에 "통계청이 2026년 5월 6일 발표한" 류 일자를 명시한다. 발표 일자가 미확인이면 "발표 시점에 본 글을 갱신한다" 류로 정직 표기.
4. **검증 불가 항목은 명시적 격리** — WebSearch/1차 출처 대조로 검증 못 한 수치는 본문에 등장시키지 않거나 "공식 발표 후 갱신 예정" 으로 명시한다.

이 4 기준 미충족 시 `npm run verify:strict` 가 fail-loud (Layer 3) — CI 게이트에서 빌드 실패. 운영자/에이전트가 우회할 수 없다.

검증 절차 권장 순서:
- WebSearch 로 권위 출처(`.go.kr` / `.or.kr` / 거래소·연구원) 1차 자료 발견
- WebFetch 로 본문 추출 후 본인 직접 대조
- 미발견 시 Layer 1 explanatory framing 으로 회귀 ("1차 출처 원본 참조" 류)

### 디자인 시스템 (구 DESIGN.md v1.0 — 조항 인라인 승계, 원문은 git 이력)
<!-- 한지 톤 + 와인 액센트 단일색 시안 — 시각 일관성 핵심 -->
- 카테고리별 컬러 코딩 금지 (활자 라벨로만 구분)
- box-shadow / linear-gradient / border-radius ≥ 12px 금지
- font-weight 700 본문 금지 (max 500)
- Pretendard / Noto Serif KR / JetBrains Mono 외 폰트 추가 금지
- 다크 모드는 v1.2 기능 — 현재 v1.0은 색상 토큰 light only

### 시간대
<!-- 2026-05-05 timezone bug — error-log.md 참조 -->
- 모든 날짜 추출은 `src/lib/korean.ts`의 KST 헬퍼 (`pulseDateParts`, `formatKoreanDate`, etc.) 사용
- `Date.getFullYear()` / `getMonth()` / `getDate()` 직접 호출 금지 (CF Pages = UTC, 로컬 = KST 차이)

### 날짜 검증 의무 (2026-05-27 — long-session 자정 넘김 사고 후속)
<!-- 운영자 지적: 시스템 reminder 의 currentDate 가 stale 한 채로 5-26 → 5-27 자정을 넘기는 사고 발생. -->

다음 작업 **직전** 반드시 **PowerShell `Get-Date -Format 'yyyy-MM-dd HH:mm zzz'`** (또는 Bash `date '+%Y-%m-%d %H:%M %Z'`) 실행해 *실제 시스템 시각*으로 작업:

- 펄스/인사이트 `publishedAt` 작성
- `today.md` 갱신
- `daily-queue/YYYY-MM-DD.json` 작성
- "오늘" / "어제" / "그저께" 본문 표현
- 발표 일자 본문 인용 ("정부가 2026년 X월 Y일 발표한" — ADR 0006 #3)
- `accessedAt` frontmatter

system-reminder 의 `currentDate` 는 *세션 시작 시점* 기준이며, 자정을 넘긴 long-session 에서는 stale 가능. 매 펄스 발행마다 PowerShell `Get-Date` 결과를 진실로 채택한다 (1초 부담 < AdSense ADR 0006 4기준 위반 위험).

자체 결정 보호 — 위 액션을 운영자에게 묻지 않고 즉시 실행 (멀티 에이전트 자체 결정 원칙).

### 보안
<!-- public/admin/config.yml 누출 사고 — error-log.md 참조 -->
- `public/`은 진정한 정적 자산만. 환경별 분기는 endpoint (`src/pages/.../[name].ts`)로
- API 키 / 시크릿은 코드/문서에 하드코딩 금지. 항상 `import.meta.env.PUBLIC_*` 또는 Cloudflare Pages env var
- `local_backend: true` 같은 dev-only 설정은 `import.meta.env.DEV` 가드 필수

### 패키지
- npm install 새 의존성 추가 시 즉시 사용자 확인 (사용자 승인 없이 추가 금지)
- 가능한 CDN으로 우회 (Chart.js, Pretendard 사례 참조)

## 강력 권장

### 컨텍스트 엔지니어링
<!-- book 19303 P5 - Karpathy 비유 LLM=CPU, context=RAM -->
- 큰 작업 의뢰 받을 때, 먼저 어떤 파일을 읽을지 명시 (예: "src/components/PulseCard.astro와 src/lib/korean.ts 먼저 읽고, 그 다음 시작")
- 탐색 단계와 구현 단계 분리 (Sub-agent 호출 시)

### 모듈 분리 1줄 기준
<!-- book 19303 P2 -->
- 새 컴포넌트 / 새 함수 / 새 라우트 만들 때 자문: "이 기능만 따로 테스트할 수 있는가?"
- 답이 No면 분리 잘못된 것

### Sub-agent 호출 4요소
<!-- book 19470 P3 -->
1. 역할 — "당신은 [SEO 검증 / 코드 리뷰 / 데이터 수집] 에이전트다"
2. 범위 — 어떤 파일/디렉토리만 다룰지
3. 제약 — 무엇 절대 하지 말지
4. 출력 — 어떤 형식으로 반환할지

### 같은 실수 두 번째 = 즉시 규약화
<!-- book 19470 Mitchell Hashimoto -->
- 같은 교정 두 번 반복하면 즉시 본 CLAUDE.md 또는 영역 CLAUDE.md에 반영
- 또는 `.claude/settings.json` Hook으로 영구 차단
- 메모리(`memory/`)에 자산화 (구 docs/error-log.md 는 2026-08-26 폐기 — 이력은 git 참조)

## 권한
- Git 커밋: 명시 사용자 요청 시만
- **"푸쉬" / "push" 단축어 (1인 운영자 룰, 2026-05-08 추인)** — 운영자가 "푸쉬" / "push" 라고 말하면 다음 단계 모두 자동 실행:
  1. 변경분 commit (아직 안 됐다면)
  2. 현재 브랜치를 origin 으로 push (필요 시 `-u` 로 upstream 설정)
  3. `gh pr create` 로 PR 생성 (base 기본 = `main`, 명시적 stack 시 parent 브랜치)
  4. `gh pr merge --merge --delete-branch` 로 머지 + 브랜치 삭제
  5. 결과 (PR 번호 / merge SHA / 자동 trigger 된 Cloudflare Pages 배포 안내) 운영자에게 보고
- "푸쉬" 단축어 예외:
  - CI required checks fail → 머지 보류 후 운영자에게 fail 사유 + 다음 액션 제안
  - PR 본문은 변경 요약 자동 생성 (운영자가 별도 paste 한 본문 있으면 그것 우선)
  - "PR만" / "push만" / "merge만" 부분 명령은 그 단계만 실행
- main 직접 push (브랜치 거치지 않고): 명시 요청 시만 (위험)
- 새 GitHub repo / Cloudflare project 생성: 사용자에 의뢰
- npm install: 사용자 승인 후

## AdSense 거절 후 가치 재건 정책 (2026-05-31 reject ~ 재신청 승인까지)

본 사이트는 2026-05-31 AdSense 사이트 승인이 **"가치 부족 콘텐츠(low value content)"** 사유로 **거절**됐다(이전 "준비 중" 동결 정책은 종료). Google 정책 4문서(thin content / scaled content / 원본 가치 / 사이트 준비) 기준, 원인은 **① 1차 출처 재구성 요약 양산 ② 사이트 전역 자매 링크 네트워크(doorway) ③ thin 마이크로필터 페이지**.

**완료된 대응 (PR #130·#131, 2026-05-31)**: 전 indexed 페이지 자매 링크 0, tag thin 페이지 noindex, 자매 mirror 크론 정지. → [[project_adsense_rejected]]

**재신청 승인까지 — 모든 콘텐츠 작업 제약**:

- 🔴 **원본 가치 미달 글 발행 금지 — 절대 제약은 편수가 아니라 글의 질 (2026-06-12 운영자 결정, 기존 "1편/일 상한" 폐기)** — 구글 scaled content abuse 의 실제 변수는 발행 편수가 아니라 *페이지당 가치* (제재 사례는 일 10~500편 무검수 양산). 기본 **매일 3편**, **상한 5편/일**. 단 모든 글은 골든 레퍼런스 깊이(공백 제외 3,000자+) + ADR 0006 4기준 100% + 원본 가치(배경 분석·교차 종합·독자별 영향)를 충족해야 하며, **기준 미달 글은 1편도 발행 금지** — 깊이를 채울 수 없는 날은 편수를 줄이는 것이 맞고, 늘리는 것은 틀리다.
- 🔴 **원본 가치 의무 (단순 요약 금지)** — 모든 신규 글은 1차 발표 *재구성 요약을 넘어* 원본 가치를 더한다: 배경·원인 분석, 교차 출처 종합, 직접 계산(편집자 계산 명시), 시각화, 페르소나별 의미. "정부가 X 발표" 요약만 있는 글은 발행 금지.
- 🔴 **인사이트·도구 우선** — 데일리 펄스보다 *심층 인사이트(교차종합)·계산기/도구* 가 가치 신호. B 단계 핵심.
- 🔴 **자매/네트워크 cross-link 재등장 절대 금지** — 본문·컴포넌트·nav 어디에도 자매 도메인 링크 신규 작성 금지(ADR 0010 + AdSense).
- **fabrication 0건 절대 사수** — ADR 0006 4기준 100%. 환각 1건 = 재심사 영구 reject 위험(거절 후 더 엄격).
- **검수 미완 토큰 0건** — `[검수 후 입력]` 등 placeholder 라이브 노출 금지.
- **AdSense `<script>` 제거 금지** — 재신청 시 소유권 인증 유지 필요.
- 사이트 구조 변경: *가치 재건을 위한 개선*은 허용(권장). 단 대량 콘텐츠 삭제·도메인·디자인 전면 변경은 운영자 결정.

재신청 권장 시점: 위 원본 가치 작업을 1~2주 누적해 "양산"이 아닌 "심층 저널" 신호가 쌓인 뒤. 해제 조건: AdSense 콘솔 "승인됨" 확인 시 본 섹션 폐기.

## 운영 사이클
- 매 작업 세션 시작/종료: `OPERATOR_INBOX.md` (빌드 자동 생성) 펜딩 액션 확인
- 매주: `npm run weekly` 리포트 점검
- 매월: 하네스 정기 리뷰 (book 19470 P7)

## 변경 시 이 파일은 별도 PR
<!-- book 19470 P7 - 하네스도 코드다 -->
이 CLAUDE.md 변경은 일반 코드 변경과 분리된 PR로 제출하고, 변경 사유를 PR 설명에 명시한다.
PR 템플릿의 "하네스 변경 체크리스트" 섹션 사용.
