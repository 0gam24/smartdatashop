# CLAUDE.md — 스마트데이터샵 AI 협업 규약

> **이 파일이 자동 로드되어 모든 작업에 적용됩니다.**
> 영역별 추가 규칙은 디렉토리별 CLAUDE.md 참조.

## 프로젝트 한 줄
한국의 정책·세금·금융·시장·통계·AI 1차 출처 데이터를 매일 5분으로 정리하는 데이터 저널 허브.

## 프로젝트 목적 (확장 — 2026-05-07 ADR 0008 합의)

> 본 사이트는 *확장형 네트워크* 의 **메인 hub** 다. 단독 운영 X.

**최상위 목적**: 메인 + 자매 (현재 4 → 최대 9, 총 최대 10 사이트) 의 *합산 트래픽* 으로 **AdSense 수익화**.

**역할 분담**:
1. **메인 (smartdatashop.kr)** — Google Discover / Naver 진입 엔진. 1차 출처 NewsArticle 매일 발행. 자매 funnel hub. *고정 단일*.
2. **자매 사이트 (확장형, 현재 4 → 최대 9)** — 페르소나별 *독립 콘텐츠* + 자체 SEO + 메인 backref. 합류 시 NETWORK.md paste 만으로 룰 적용.

   현재 가동 (4):
   - `calculatorhost.com` — 인터랙티브 계산기·시뮬레이터
   - `awoo.or.kr` — 정부 지원금 신청 가이드
   - `asiatop.co.kr (moneylook)` — 사회초년생·신혼부부 재무 가이드
   - `iknowhowinfo.com` — ETF·종목·시장 분석

   확장 슬롯 (5 추가 가능 — 페르소나/도메인 미정):
   - 신규 자매 추가 시 본 항목에 도메인·페르소나 추가
   - 부트스트랩 절차: NETWORK.md paste + BRAND.md 신규 작성 + PLAYBOOK.md 시드 task

**양방향 cross-link funnel**:
- 메인 → 자매: 펄스 본문 톨게이트 + 카테고리/페르소나 매핑 (forward) — 자매 수 증가에 따라 매핑 표 자동 확장
- 자매 → 메인: 메인 홈 "네트워크 최신" 섹션 + 자매 페이지 backref (reverse)
- 메인이 자매 RSS *제목·URL·요약* 만 fetch — 본문 복제 절대 금지 (중복 콘텐츠 AdSense 차단 회피)
- 메인의 "네트워크 최신" 섹션은 자매 N 개 모두 자동 fetch — 신규 자매 합류 시 코드 수정 0 (config 갱신만)

**AdSense 안전 — 모든 콘텐츠 작업의 1순위 제약**:
- **fabrication 1건 = 네트워크 전체 영구 AdSense 차단 위험** — ADR 0006 4기준 모든 사이트 (메인 + 자매 N) 균일 적용
- 모든 사이트 각자 *고유* 콘텐츠 — 사이트간 본문 복제 금지 (canonical chain 으로 link 만 cross)
- YMYL 신뢰성 — `.go.kr` / `.or.kr` 1차 출처 우선
- NewsMediaOrganization LD + ethics/corrections/methodology 정책 URL 모든 사이트 의무

**네트워크 헌법**: 본 repo 의 `docs/NETWORK.md` v0.6 (2026-05-07 동기화) 가 모든 사이트 공통 표준. 자매 추가 시 NETWORK.md paste 만으로 합류 — 1 → 9 자매 동일 패턴. 본 4 문서 (PURPOSE / PROJECT_DEFINITION / NETWORK / CATEGORY_MAP) 가 본 repo 의 헌법 anchor (아래 §네트워크 헌법 참조).

**확장 안전 (신규 자매 합류 시)**:
- 1인 운영 부담 한계 고려 — 동시 부트스트랩 자매 ≤ 1, 안정화 후 다음
- 자매당 자체 verifier·fact-checker·smoke 게이트 의무 (네트워크 신뢰도 분산 위험 방지)
- 신규 자매 도메인 등록 + Cloudflare Pages 연결은 운영자 외부 작업 (OPERATOR.md)
- 자매 수 증가에 따라 메인 → 자매 매핑 충돌 가능 — 페르소나 중복 회피 의무

## 네트워크 헌법

본 repo 는 smartdata network HQ 의 헌법을 따른다 (2026-05-07 동기화).

- `docs/PURPOSE.md` — 사업·운영·콘텐츠 목적 (최상위 anchor)
- `docs/PROJECT_DEFINITION.md` v1.0 — 5~9 사이트 네트워크 전체 그림
- `docs/NETWORK.md` v0.6 — 5~9 사이트 공통 헌법 (multi-stack + dual-brand 인정)
- `docs/CATEGORY_MAP.md` v1.0 — 5 사이트 카테고리 매핑 (Dispatcher 가동의 단일 진실)

위 4 문서와 충돌하는 코드·콘텐츠 작성 금지.
위계: PURPOSE > PROJECT_DEFINITION > NETWORK > CATEGORY_MAP > 본 CLAUDE.md > ADR > STRUCTURE.

## 첫 작업 진입 시 반드시 읽을 파일 (우선순위 순)
1. `docs/PURPOSE.md` — 최상위 anchor (5분)
2. `docs/dashboard.md` — 현재 상태 (30초)
3. `docs/architecture.md` — 폴더 구조 / 어디에 무엇을 둘지
4. `docs/AGENTS.md` — 7 자동화 에이전트 운영 모델
5. `docs/PLANNING.md` — 12개월 KPI / 자매 사이트 합류 일정
6. `docs/DESIGN.md` — 디자인 토큰 / 활자 시스템

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

### 디자인 시스템 (DESIGN.md v1.0)
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
- `docs/error-log.md`에 자산화

## 권한
- Git 커밋: 명시 사용자 요청 시만
- Push to main: 명시 사용자 요청 시만
- 새 GitHub repo / Cloudflare project 생성: 사용자에 의뢰
- npm install: 사용자 승인 후

## 운영 사이클
- 매 작업 세션 시작/종료: `docs/operations.md` 체크리스트
- 매주: error-log.md 점검
- 매월: 하네스 정기 리뷰 (book 19470 P7)

## 변경 시 이 파일은 별도 PR
<!-- book 19470 P7 - 하네스도 코드다 -->
이 CLAUDE.md 변경은 일반 코드 변경과 분리된 PR로 제출하고, 변경 사유를 PR 설명에 명시한다.
PR 템플릿의 "하네스 변경 체크리스트" 섹션 사용.
