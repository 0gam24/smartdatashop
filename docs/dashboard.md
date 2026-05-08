# 스마트데이터샵 대시보드

> 마지막 갱신: 2026-05-09
> 출처 패턴: book 19307 P5 (1 page 메타). 30초 스캔으로 작업 재개 가능해야 함.

---

## 현재 상태

- **Phase**: **자동화 정체성 100% 도달** (2026-05-08~09 30 PR 머지) — 데이터 fetch / 시각화 / 콘텐츠 차트 / SSOT 완성
- **자동 운영 사이클**: 매일 00:30 KST cron → ECOS + KOSIS + 정부 RSS 14 + 뉴스 RSS 7 → JSON 자동 commit → CF Pages 자동 빌드 → 22+ 페이지 갱신
- **Masthead VOL/NO 자동 계산** (PR #30) — 창간일 기준 일수 +1, 매일 자정 KST 자연 갱신

### 2026-05-08~09 누적 변경 (30 PR)

**자동화 인프라 (PR #11~16)**:
- ECOS Open API 통합 (`/data/100-key/`, `/data/kosis-100/`)
- CLAUDE.md "푸쉬" 단축어 룰 (push + PR + merge 자동화)
- 정부 RSS 14피드 (66 출처) 통합 (`/data/notice/`)
- 운영 보드 (`/data/board/` — 8 섹션 실측 KPI + 정직 표기)
- GitHub Actions cron 자동화 (`fetch-data.yml` 매일 00:30 KST)
- KOSIS API 통합 (propagation 대기 중 — graceful 처리)

**시각화 인프라 (PR #17~19)**:
- ECOS 시계열 5종 (`기준금리·환율·CPI·KOSPI·가계부채`)
- 토픽 hub 7개 (`/topic/{base-rate,usd-krw,cpi,kospi,household-debt,jongseong,etf,ai-support}/`)
- `<EconomyChart>` 재사용 컴포넌트 (Chart.js + ChartLib)

**품질·콘텐츠·SEO (PR #20~30)**:
- Lighthouse a11y v1+v2 fix (skip-link / color-contrast / link-in-text-block)
- 가이드북 1권 7 챕터 차트 임베드 (ch1, 4, 6, 8, 10, 11, 12)
- 가이드북 2권 ch1 + 인사이트 + 펄스 4건 차트
- 뉴스 키워드 트렌드 (`/data/trends/` — 7 언론사 다중 소스)
- stopwords 30+ 보강 (정규식 노이즈 제거)
- Masthead VOL/NO 자동 계산

### 데이터 흐름 (SSOT 검증)

```
data/economy/ecos-timeseries.json (1 파일, 매일 cron)
  → /data/timeseries/ + /topic/{5}/ + 홈 hero
  → 가이드북 1권 7챕터 + 가이드북 2권 ch1 + 인사이트 1 + 펄스 4
  = 22+ 페이지
```

- **다음 할 일 ★**:
  - KOSIS API propagation 비정상 (24h+) → data.go.kr 1566-0025 헬프데스크 escalation
  - KOSIS 통계자료 (#3) 표 코드 → kosis.kr OpenAPI URL 추출 (운영자 외부)
  - Lighthouse 성능 부채 (total-byte-weight / forced-reflow / unused-js — 이미지·폰트 최적화)
  - 신규 펄스 발행 (운영자 콘텐츠 결정)

---

## 라이브 URL

- 메인: https://smartdatashop.kr
- 레포: https://github.com/0gam24/smartdatashop
- 관리: https://smartdatashop.kr/admin/ (`local_backend`는 dev 전용, 프로덕션은 GitHub OAuth)

---

## 운영 메트릭 (수동 갱신)

- 발행된 펄스: **6편** (4건 차트 임베드)
- 발행된 인사이트: **1편** (차트 임베드)
- 발행된 가이드북: **2권** (1권 12챕터 / 7챕터 차트, 2권 1챕터 / 1챕터 차트)
- 데이터 페이지: **6** (timeseries / 100-key / kosis-100 / notice / board / trends)
- 토픽 hub: **8** (jongseong, etf, ai-support, base-rate, usd-krw, cpi, kospi, household-debt)
- 자동 cron 출처: **4** (ECOS + KOSIS + 정부 RSS 14피드 + 뉴스 RSS 7)
- Sitemap 색인: **70 URL**
- Google Discover: **자동 적격**
- Cloudflare Analytics: 토큰 미발급

---

## 운영자 액션 대기 항목 (2026-05-09 갱신)

**즉시 가능**:
- [ ] data.go.kr 1566-0025 헬프데스크 — KOSIS API propagation 비정상 (24h+) escalation
- [ ] kosis.kr 에서 원하는 통계의 OpenAPI URL 추출 (CPI / 실업률 / GDP 등) → KOSIS 통계자료 (#3) 통합 활성화

**환경변수**:
- [ ] `PUBLIC_AUTHOR_SAMEAS` / `PUBLIC_ORG_SAMEAS` (Cloudflare Pages env)
- [ ] `PUBLIC_STIBEE_LIST_ID` (뉴스레터)
- [ ] `PUBLIC_CF_ANALYTICS_TOKEN` (분석)

**콘텐츠**:
- [ ] 신규 펄스 발행 (매일 1차 출처 데이터 저널 정체성)
- [ ] 가이드북 1권 ch2/3/5/7/9 거시 차트 임베드 검토 (현재 부적합 판단 — 절차 중심 챕터)
- [ ] 정책 9페이지 본문 보강

**P2 인프라 (선택)**:
- [ ] 한국어 NLP 도입 (KoNLPy/Mecab) — 트렌드 키워드 정확도 ↑
- [ ] Supabase Postgres 도입 — 시간 윈도우 필터
- [ ] Lighthouse 성능 부채 (이미지 / 폰트 / DOM)

**자동 처리 (운영자 무관)**:
- ✓ 매일 00:30 KST cron → 데이터 4 출처 자동 갱신
- ✓ 매시간 scout cron → Header 날짜 자동 갱신
- ✓ Masthead VOL/NO → 매일 자정 +1 자동 갱신

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
