# 스마트데이터샵 대시보드

> 마지막 갱신: 2026-05-05 (이 문서 수정 시 자동 갱신할 hook은 추후 검토)
> 출처 패턴: book 19307 P5 (1 page 메타). 30초 스캔으로 작업 재개 가능해야 함.

---

## 현재 상태

- **Phase**: 프로덕션 라이브 (M1 시작 준비)
- **마지막 commit**: `e0cb955` — fix(critical+major): editorial integrity, navigation, security, SEO
- **마지막 큰 변경**: editorial integrity fix (Phase B+C) — PulseCard 클릭 가능화 / Decap config endpoint 분리 / KST 타임존 락
- **다음 할 일 ★**: 정책 9페이지 본문 작성 (TODO 마킹 해소)

---

## 라이브 URL

- 메인: https://smartdatashop.kr
- 레포: https://github.com/0gam24/smartdatashop
- 관리: https://smartdatashop.kr/admin/ (`local_backend`는 dev 전용, 프로덕션은 GitHub OAuth)

---

## 운영 메트릭 (수동 갱신)

- 발행된 펄스: **6편** (전부 `previewMode: true`)
- 발행된 인사이트: **1편** (`previewMode: true`)
- 발행된 가이드북: **0권**
- Google News: **미신청** (정식 발행 30~50편 이후)
- Cloudflare Analytics: 토큰 미발급 (`PUBLIC_CF_ANALYTICS_TOKEN` 빈 값)

---

## 운영자 액션 대기 항목

- [ ] 정책 9페이지 본문 작성 (TODO 마킹됨)
- [ ] 정식 발행 펄스 30~50편 (Google News 신청 전제)
- [ ] Stibee API 키 (`PUBLIC_STIBEE_LIST_ID`)
- [ ] Cloudflare Analytics 토큰 (`PUBLIC_CF_ANALYTICS_TOKEN`)
- [ ] OG 카드 운영자 검토 후 picsum.photos 등으로 교체 검토
- [ ] error-log.md 누적 모니터링 (같은 에러 두 번째 = Hook으로 영구 차단 검토)

---

## 자매 사이트 합류 일정

| 시기 | 도메인 | 페르소나 |
|---|---|---|
| M3-M4 | homedata.kr | 부동산 |
| M5-M6 | bizdata.kr | 1인사업자 |
| M7-M8 | familydata.kr | 신혼·육아 |
| M9-M10 | retiredata.kr | 4050 은퇴 |
| M11-M12 | aidata.kr | AI 활용 |

분리 트리거: PLANNING.md §12 toll-gate matrix 룰 (페르소나 30편 + 3K 인상). → ADR 0003.

---

## 다음 작업 세션 시작 절차 (5분 룰)

1. 이 대시보드 30초 스캔
2. `docs/operations.md` 매 세션 시작 체크리스트
3. 직전 commit 메시지 + 인셉션로그
4. 30분 단위 작업 정의

---

## 갱신 규칙

- 큰 commit / 큰 변경 / Phase 전환 시점에만 갱신
- "현재 상태"의 commit hash는 매 세션 종료 시 업데이트
- 운영 메트릭은 매주 1회 (operations.md 매주 체크리스트 참조)
