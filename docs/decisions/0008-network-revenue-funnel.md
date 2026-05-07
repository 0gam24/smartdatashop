# ADR 0008 — Network Revenue Funnel (메인 + 자매 N AdSense)

- 일자: 2026-05-07
- 상태: Accepted
- 관련: ADR 0005 (compensating controls), ADR 0006 (4 publication criteria), ADR 0007 (sourced content writing)

## 배경

본 프로젝트는 단독 사이트가 아니라 **확장형 네트워크의 메인 hub**다. 자매 사이트가 현재 4개 (calculatorhost / awoo / moneylook / iknowhowinfo) 등록되어 있으며, **최대 9개로 확장 가능**.

이전까지의 목적 정의 ("Discover 노출 + 자매 funnel") 는 *메인 트래픽 위주* 였다. 운영자 명시 재정의 (2026-05-07): **메인 + 자매 N 합산 트래픽으로 AdSense 수익화**가 최상위 목적.

이 변경은 콘텐츠 흐름·링크 구조·환각 방지 우선순위를 근본적으로 바꾼다.

## 결정

### D1. 최상위 목적 = 네트워크 합산 AdSense 수익

메인 단독 트래픽이 아니라 **메인 + 자매 N 모든 사이트의 합산 페이지뷰**가 KPI. 모든 콘텐츠·링크·기술 결정이 이 KPI 에 정렬되어야 한다.

### D2. 양방향 funnel 의무

- **메인 → 자매 (forward)**: 메인 펄스 본문에 "더 깊이 →" 톨게이트 박스 — 페르소나/카테고리 매칭으로 자매 1~3 페이지 link.
- **자매 → 메인 (reverse)**: 메인 홈에 "네트워크 최신" 섹션 — 자매 N 개 RSS fetch (build-time) → 최근 발행 link 노출. 자매 페이지 자체에도 메인 backref 박스 (canonical chain).

자매 추가 시 양방향 모두 자동 — 코드 수정 X, config 갱신만.

### D3. 본문 복제 절대 금지 (AdSense 안전)

메인이 자매 콘텐츠 본문을 fetch·표시하지 않는다. *제목·URL·요약* 만 가져온다. 자매도 메인 콘텐츠 본문을 복제하지 않는다 — *backref 링크* 만 표시.

이유: Google AdSense 의 **중복 콘텐츠 정책** — 사이트간 본문 복제는 두 사이트 모두 AdSense 차단 사유.

### D4. fabrication = 네트워크 전체 영구 차단 위험

ADR 0006 의 4기준은 메인 + 자매 N 모든 사이트에 *균일 적용*. fabrication 1건이라도 발생하면 해당 사이트 + 캐노니컬 chain 으로 연결된 다른 사이트까지 AdSense 평가 손상.

### D5. NETWORK.md = 헌법, 자매 합류 시 paste 만으로 룰 적용

네트워크 표준 (디자인·LD·게이트·프로토콜) 은 단일 `NETWORK.md` 파일에 정의. 자매 추가 시:
1. NETWORK.md paste → 자매 Claude 가 룰 학습
2. 자매 specific BRAND.md 신규 작성 → 자매 정체성 정의
3. PLAYBOOK.md 시드 task → 첫 작업 명세
4. BOOTSTRAP-KIT 코드 복사 (BaseLayout, Header, viz, 안전 게이트 workflow)

이 패턴이 **자매 1 → 9 동일**. 신규 자매 합류 1인 운영자 부담 ≤ 1시간.

### D6. 확장 한도 = 최대 9 자매

- 1인 운영 한계 — 동시 active 자매 ≥ 5 시 부담 ↑
- 페르소나 중복 회피 — 9개 슬롯이 한국 데이터 저널 페르소나 spectrum 거의 cover
- 향후 9 초과 필요 시 본 ADR 개정

### D7. 자매 → 메인 reverse curation 안전 메커니즘

메인의 "네트워크 최신" 섹션이 자매 RSS 를 fetch 할 때:
- HTTPS only
- 자매 도메인 화이트리스트 (`config/network-sisters.json`)
- 본문 fetch X — `<title>`, `<link>`, `<description>` 만 추출
- 캐시 max-age = 1시간 (Cloudflare Pages 빌드 빈도)
- 자매 RSS fetch 실패 시 graceful — 섹션 자체 미렌더 (빈 박스 X)

### D8. 운영자 cadence 한계

자매 N 동시 운영 시 발행 cadence 분배:
- 메인: 매일 1편 (자동 SourceWriter 보조)
- 자매: 자매당 주 1-2편 (운영자 수동, 자매 Claude 세션)
- 합산 cadence: 메인 7편/주 + 자매 N×1.5 = 최대 7 + 13.5 = ~20편/주 (자매 9 시)

이 부하가 1인 한계 — 자매 7-8 합류 시 cadence 재조정.

## 결과

본 ADR 채택으로:
- 메인의 콘텐츠 흐름 = Option A (1차 출처 producer) 유지
- 자매의 독립 발행 + 메인 reverse curation 보강
- AdSense 안전이 모든 의사결정의 1순위 제약
- 네트워크 = 분산 + 통일 (각 사이트 독립 발행, NETWORK.md 통일 룰)
- 확장 = 점진적 (1 자매씩 합류, 운영 안정화 후 다음)

## 폐기 / 개정 조건

- 자매 9 합류 후 cadence 한계 명백 시 → 자매 cap 축소 또는 자동화 강화
- 본문 복제 1건이라도 발생 (메인 ↔ 자매) → 즉시 unpublish + ADR 개정
- AdSense 정책 변경으로 본 funnel 구조 위반 시 → 본 ADR 개정
- 자매 `is_signal_only` 가 1차 출처 자체로 진화 시 캐노니컬 정책 재정의

## 참고

- ADR 0005 — Compensating Controls (5 계층 안전망)
- ADR 0006 — 정식 발행 4기준
- ADR 0007 — Sourced Content Writing 워크플로우
- `CLAUDE.md` §프로젝트 목적 (확장)
- `NETWORK.md` (작성 예정) — 네트워크 헌법
- `OPERATOR.md` — 운영자 외부 작업 목록
