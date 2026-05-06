# 스마트데이터샵 대시보드

> 마지막 갱신: 2026-05-06
> 출처 패턴: book 19307 P5 (1 page 메타). 30초 스캔으로 작업 재개 가능해야 함.

---

## 현재 상태

- **Phase**: 프로덕션 라이브 / **검수 게이트 → 자동 안전장치 전환 완료** (ADR 0005)
- **전략 피벗**: Google News (Publisher Center 신청 모델) → **Google Discover** (자동 적격, 별도 신청 없음)
- **마지막 큰 변경 (2026-05-06)**:
  - Phase 0: placeholder 자동 noindex / Hero 하드코딩 통계 제거 / Footer href="#" 정리
  - Phase 1: `previewMode`/`verifiedBy` 스키마+8 .mdx 정리, 3개 컴포넌트(ArticlePreviewWarning/PreviewBanner/VerifiedBadge) 삭제, desk-review 워크플로우+스크립트 삭제, TrustBar 도입, Satori OG v2 라우트 (`/og/v2/{pulse|insight}/<slug>.png`) 도입
  - Phase 2: Dataset/ClaimReview/HowTo/Book LD 빌더 추가, 자동 Dataset LD (sources url 1개 이상 시), InsightLayout JSON-LD 누락 픽스 (G10), Person/Org `sameAs` 환경변수 기반 (`PUBLIC_AUTHOR_SAMEAS` / `PUBLIC_ORG_SAMEAS`)
  - Phase 3: home/category/author 동적 OG 카드 (G17), PulseCard `<img>` 옵셔널, 저자 페이지 강화
- **다음 할 일 ★**: GSC URL 제거 요청 (placeholder 7개) → `PUBLIC_AUTHOR_SAMEAS`/`PUBLIC_ORG_SAMEAS` Cloudflare 환경변수 채우기 → 정책 9페이지 본문 작성

---

## 라이브 URL

- 메인: https://smartdatashop.kr
- 레포: https://github.com/0gam24/smartdatashop
- 관리: https://smartdatashop.kr/admin/ (`local_backend`는 dev 전용, 프로덕션은 GitHub OAuth)

---

## 운영 메트릭 (수동 갱신)

- 발행된 펄스: **6편** (placeholder 검출로 자동 noindex)
- 발행된 인사이트: **1편** (placeholder 검출로 자동 noindex)
- 발행된 가이드북: **0권**
- Google Discover: **자동 적격** (Search Console 첫 노출 후 24~48h 내 Discover 보고서 활성)
- Google News: **후순위** (Discover 안정 후 검토)
- Cloudflare Analytics: 토큰 미발급 (`PUBLIC_CF_ANALYTICS_TOKEN` 빈 값)

---

## 운영자 액션 대기 항목

- [ ] **24h 내**: GSC + Bing Webmaster Tools 에서 placeholder URL 7개 제거 요청 (Risk 에이전트 권고)
- [ ] **즉시**: `PUBLIC_AUTHOR_SAMEAS` 환경변수에 LinkedIn / 네이버 블로그 / X 등 외부 프로필 URL 콤마 구분으로 입력 → Person LD `sameAs` + 저자 페이지 자동 반영
- [ ] **즉시**: `PUBLIC_ORG_SAMEAS` 환경변수에 사이트 SNS 계정 URL 입력 → Org LD `sameAs` 자동 반영
- [ ] 1개월 후 (~2026-06-06): 구 OG 라우트 (`/og/{pulse,insight}/[slug].png.ts`) 삭제 (D9=N 합의)
- [ ] 정책 9페이지 본문 작성 (TODO 마킹됨)
- [ ] 7개 글 placeholder 점진 정리 — 본문을 1차 출처 기반 explanatory framing 으로 재작성 시 자동 색인 복귀
- [ ] Stibee API 키 (`PUBLIC_STIBEE_LIST_ID`)
- [ ] Cloudflare Analytics 토큰 (`PUBLIC_CF_ANALYTICS_TOKEN`)
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
