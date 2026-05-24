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

## 위계

위계: `docs/PURPOSE.md` v1.1 > 본 CLAUDE.md > ADR > STRUCTURE.

폐기된 헌법 문서 (2026-05-24, ADR 0010):
- `docs/_archived/PROJECT_DEFINITION.md` — 5~9 사이트 네트워크 그림 (참조용 archive)
- `docs/_archived/NETWORK.md` — 네트워크 공통 헌법 (참조용 archive)
- `docs/_archived/CATEGORY_MAP.md` — 5 사이트 카테고리 매핑 (참조용 archive)

위 3 문서는 현행 하네스에 영향 없음. 호기심 차원의 참조만 가능.

## 첫 작업 진입 시 반드시 읽을 파일 (우선순위 순)
1. `docs/PURPOSE.md` — 최상위 anchor (5분)
2. `docs/dashboard.md` — 현재 상태 (30초)
3. `docs/architecture.md` — 폴더 구조 / 어디에 무엇을 둘지
4. `docs/AGENTS.md` — 자동화 에이전트 운영 모델
5. `docs/PLANNING.md` — 12개월 KPI
6. `docs/DESIGN.md` — 디자인 토큰 / 활자 시스템

## docs/references/ 적극 참조 룰 (2026-05-09 합의)

7 참고 자료 우선순위 — 매 작업 진입 시 해당 자료 검증 의무.

**🏆 최우선 (모든 콘텐츠·페이지 작업)**:
- `docs/references/06-구글-SEO-종합.md` (27KB) — E-E-A-T / AI 콘텐츠 정책 §5.3 / 스팸 §6 / URL 구조 §8 / Discover
- `docs/references/07-네이버-SEO-종합.md` (43KB) — C-Rank / D.I.A. §3 / Yeti / 서치어드바이저 §5 / RSS 제출 §7

**★ 적극 (매 작업 시작·매 모듈 작성)**:
- `01-바이브코딩-왜-실패하는가.md` — 노트-First / 시간 예산 / ADR / 에러로그
- `02-안티그래비티-바이브코딩.md` — 모듈 분리 1줄 기준 / 컨텍스트 엔지니어링
- `03-함께해요-하네스-엔지니어링.md` — 4 신호 / Sub-agent 4요소 / 5계층 설정

**선택 (큰 결정·보안 결정)**:
- `04-통합-3레이어-OS.md` — 외부/실행/제어 매트릭스
- `05-Hermes-Agent-멀티에이전트.md` — 격리 수준 / Claude Code vs Hermes

**적용 의무**:
- 새 펄스/인사이트/가이드북 챕터 작성 시 06 §5.3 + 07 §3 명시 검증
- 새 페이지 작성 시 06 §7~8 + 07 §5~6 점검
- 매 컴포넌트 작성 시 02 P2 (모듈 분리 1줄 기준) 자문
- CLAUDE.md / Hook / Sub-agent 작업 시 03 4 신호 매핑

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

## AdSense 사이트 승인 검토 기간 동결 정책 (2026-05-24 ~ 승인까지)

본 사이트는 AdSense 사이트 승인 "준비 중" 단계 (2026-05-14 시작). 검토 기간 중 다음 작업 동결:

- **신규 광고 코드 통합 금지** — `<ins>` ad unit 추가, AdSense 광고 영역 신규 배치 금지. 승인 후 일괄 적용
- **사이트 구조 큰 변경 금지** — 라우트·도메인·디자인 시스템 전면 변경, 대량 콘텐츠 삭제·이동 금지
- **fabrication 0건 절대 사수** — ADR 0006 4기준 100% 엄수. 검토 중 1건이라도 환각 발행 시 영구 reject 위험
- **검수 미완 토큰 0건** — `[검수 후 입력]` / `[검수 후]` 등 placeholder 라이브 노출 금지 (이미 noindex 자동 차단되나 사전 방지)
- **daily 발행 cadence 유지** — 발행 멈춤 = abandoned 신호. 최소 1건/일 발행 유지
- **AdSense `<script>` 제거 금지** — 검토 중 사이트 소유권 인증 유지에 필요

해제 조건: AdSense 콘솔에서 "승인됨" 상태 확인 시 본 섹션 폐기.

## 운영 사이클
- 매 작업 세션 시작/종료: `docs/operations.md` 체크리스트
- 매주: error-log.md 점검
- 매월: 하네스 정기 리뷰 (book 19470 P7)

## 변경 시 이 파일은 별도 PR
<!-- book 19470 P7 - 하네스도 코드다 -->
이 CLAUDE.md 변경은 일반 코드 변경과 분리된 PR로 제출하고, 변경 사유를 PR 설명에 명시한다.
PR 템플릿의 "하네스 변경 체크리스트" 섹션 사용.
