# 0006 — 정식 발행 4대 기준 (Formal Publication Criteria)

> **날짜**: 2026-05-06
> **상태**: 채택
> **결정자**: junhyuk-kim
> **연관**: ADR 0005 (Compensating Controls 5계층 자동 안전장치)

## 컨텍스트

ADR 0005 에서 수동 검수 게이트(`previewMode`/`verifiedBy`) 가 폐기되고 5계층 자동 안전장치(L1~L5) 로 대체됐다. 그러나 7개 초기 글의 placeholder 정리 과정에서 사용자가 명시적으로 요구한 추가 룰 — **"수치·인용·기관 발표 일자 등은 출처와 함께 정확한 출처 링크가 추가해서 정식 발행"** — 이 ADR 0005 의 L3 빌드 게이트보다 더 구체적인 발행 기준을 요구한다.

본 ADR 은 "정식 발행" 의 4대 기준을 명시화하고, 빌드 시점에 자동 검증 가능한 형태로 코드화한다.

## 결정

본문에 등장하는 (a) 구체 수치 (b) 직접 인용 (c) 기관 발표 일자 는 다음 **4대 기준** 을 동시에 충족해야 정식 발행으로 간주된다:

### 1. 출처 페어링 (footnote 마커)
같은 단락 또는 직전·직후 단락에 `[^N]` footnote 마커가 있어야 한다. `scripts/extract-numerical-claims.mjs` 가 빌드 시 검증.

### 2. 정확한 출처 URL (deep link 우선)
`sources[]` 의 url 은 가능한 한 deep link (정부 보도자료 PDF / 통계 DB 특정 페이지). root URL 만 가능한 경우 `accessedAt` 일자를 명시한다.
- ✅ 좋은 예: `https://www.molit.go.kr/2024dreamaccount/news/dream.pdf` (PDF deep link)
- ⚠ 차선: `https://nhuf.molit.go.kr/FP/FP07/FP0701/FP07010301.jsp` (페이지 deep link)
- ❌ 회피: `https://molit.go.kr/` 만 (root 만 — `accessedAt` 명시 시에만 임시 허용)

### 3. 기관 발표 일자 명시
본문에 "통계청이 **2026년 5월 6일** 발표한" 류 일자를 명시한다. 발표 일자가 미확인이면 "발표 시점에 본 글을 갱신한다" 류로 정직 표기.

### 4. 검증 불가 항목 명시적 격리
WebSearch/1차 출처 대조로 검증 못 한 수치는:
- 본문에 등장시키지 않거나
- "공식 발표 후 갱신 예정" 으로 명시 격리
- Layer 1 explanatory framing 으로 회귀 ("1차 출처 원본 참조" 류)

이 4 기준 미충족 시 `npm run verify:strict` 가 fail-loud — CI 게이트에서 빌드 실패. 운영자/에이전트가 우회할 수 없다.

## 이유

- **사용자 신뢰 회복**: 1차 출처와 대조 가능한 수치만 발행 = 표시광고법 §3 (기만적 표시) + 형법 §307 (명예훼손, 한국은 진실 표기도 처벌 가능) 회피
- **Discover 신뢰 신호**: Google Discover 의 YMYL E-E-A-T 평가에서 footnote + 출처 링크 밀도는 핵심 가산점
- **Layer 4 fact-checker 입력 보장**: M1+ 활성 시 fact-checker 가 (claim, source URL) 쌍을 fuzzy match — 본 ADR 이 입력 데이터의 형식적 페어링을 강제

## 대안

- **A. 수치 자체를 본문에서 모두 추방** — Layer 1 explanatory framing 만 유지. 안전하지만 Discover 매력도 -50% 이상 추정.
- **B. footnote 만 강제, deep link 는 권장** — 너무 느슨. root URL 만 있는 sources 가 fact-check 시 무용해짐.
- **C. 수동 검수 부활** — ADR 0005 폐기 결정과 정면 충돌. 솔로 운영자 비현실성 그대로.

## 결과

좋은 점:
- 7개 글 전부 footnote + deep link + 발표 일자 형식으로 재작성됨 (2026-05-06 시점 적용)
- WebSearch + WebFetch 로 1차 출처 확인 가능한 항목만 남김 — 환각 0건
- 빌드 게이트(`verify:strict`) 가 자동 검증 — 회귀 불가

나쁜 점:
- 검증 불가 항목 (1주차 운영 통계 등) 은 본문에서 빠지거나 "추후 갱신" 으로 격리되어 글의 specificity 감소
- WebSearch 결과 의존도 — Korean .gov.kr 사이트의 anti-scraping 정책에 영향 받음

## 재검토 트리거

- Layer 4 fact-checker M1+ 본격 가동 시 (Anthropic API 통합) — fuzzy match 결과 데이터로 4 기준 자동 검증 강화
- 사용자가 1차 출처를 운영자 본인 조사로 채우는 비율이 50% 이상 도달 시 — Layer 1 explanatory framing 의존도 추가 감축

## 관련

- ADR 0002 (preview-mode-protocol) — Superseded
- ADR 0005 (compensating-controls) — 본 ADR 의 상위 결정
- 코드: `scripts/extract-numerical-claims.mjs` (빌드 게이트), `src/lib/placeholder.ts` (Layer 3 검출)
- CLAUDE.md (root) "정식 발행 4대 기준" 섹션
