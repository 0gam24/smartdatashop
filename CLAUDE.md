# CLAUDE.md — 스마트데이터샵 AI 협업 규약

> **이 파일이 자동 로드되어 모든 작업에 적용됩니다.**
> 영역별 추가 규칙은 디렉토리별 CLAUDE.md 참조.

## 프로젝트 한 줄
한국의 정책·세금·금융·시장·통계·AI 1차 출처 데이터를 매일 5분으로 정리하는 데이터 저널 허브.

## 첫 작업 진입 시 반드시 읽을 파일 (우선순위 순)
1. `docs/dashboard.md` — 현재 상태 (30초)
2. `docs/architecture.md` — 폴더 구조 / 어디에 무엇을 둘지
3. `docs/AGENTS.md` — 7 자동화 에이전트 운영 모델
4. `docs/PLANNING.md` — 12개월 KPI / 자매 사이트 합류 일정
5. `docs/DESIGN.md` — 디자인 토큰 / 활자 시스템

## 디렉토리별 추가 규칙 (자동 상속)
- `src/components/CLAUDE.md` — 컴포넌트 작성 규칙
- `src/content/CLAUDE.md` — 콘텐츠 컬렉션 편집 규칙
- (필요 시 추가)

## 절대 금지

<!-- 실수 1회 발생 시 즉시 추가하는 영역 -->

### 편집 무결성 (Editorial integrity)
<!-- AI가 그럴듯한 정부 통계 인용을 사이트 권위로 발행하는 사고를 차단 -->
- 본문에 구체적 정부 통계(312만 명, 2.1% 등) 새로 만들지 마라
- 새 펄스/인사이트는 항상 `previewMode: true` + `verifiedBy: []` 기본값
- 운영자(`junhyuk-kim`)가 1차 출처 대조 검수 끝낸 글만 `previewMode: false` + `verifiedBy: ['junhyuk-kim']`로 변경 가능

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
