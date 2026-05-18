# 0009 — 펄스 URL 구조 (Pulse URL Structure)

> **날짜**: 2026-05-19
> **상태**: 채택 (이행 보류 — AdSense 인증 통과 후 실행)
> **결정자**: junhyuk-kim
> **연관**: ADR 0008 (Network Revenue Funnel), CLAUDE.md §AdSense 안전

## 컨텍스트

현재 펄스 URL 구조에 날짜가 2번 중복된다.

```
https://smartdatashop.kr/2026/05/17/2026-05-17-kdca-ebola-pheic/
                         ^^^^/^^/^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^
                         라우트 경로  파일명 prefix
```

원인:
- 라우트: `src/pages/[year]/[month]/[day]/[slug].astro` — `/year/month/day/` 경로 자동 생성
- 파일명 컨벤션: `YYYY-MM-DD-slug.mdx` — `entry.slug` 가 날짜 prefix 포함

결과: `/2026/05/17/` + `2026-05-17-kdca-ebola-pheic` = 날짜 2회 노출.

이는 2026-05-15 운영자 발견 후 일시적 합의 (Option C: 현행 유지, Option D: 인증 후 fix) 로 진행됐으나 ADR 미작성 상태로 5/19 재지적되어 본 ADR 로 결정 명문화한다.

## 결정

### D1. 현행 URL 구조 *잠정* 유지 — AdSense 인증 통과 시점까지

펄스 URL 은 `/{year}/{month}/{day}/{slug-with-date-prefix}/` 형식을 그대로 유지한다. 머지 32 펄스 (5/19 기준) 가 본 URL 로 인덱싱 중인 상태를 변경하지 않는다.

### D2. AdSense 인증 통과 후 Option D 마이그레이션 의무 실행

인증 통과 신호 (AdSense 대시보드 "approved" 상태 또는 운영자 이메일 수신) 시점에 별도 PR 로 Option D 실행한다. 본 ADR 채택 시점부터 인증 통과 시점까지의 *지연이 없도록* 운영자 또는 자동화가 즉시 PR 착수.

### D3. Option D 기술 spec — 파일명에서 날짜 prefix 제거

- **파일명 변경**: `YYYY-MM-DD-slug.mdx` → `slug.mdx`
- **라우트 유지**: `src/pages/[year]/[month]/[day]/[slug].astro` 그대로 — 라우트 경로는 frontmatter `publishedAt` 의 KST 날짜에서 계산
- **slug 정의**: `entry.slug` = 파일명 (확장자 제외) — `pulseDateParts(publishedAt)` 헬퍼가 year/month/day 산출
- **결과 URL**: `https://smartdatashop.kr/2026/05/17/kdca-ebola-pheic/`

### D4. 마이그레이션 PR 체크리스트

1. **파일명 일괄 rename** — `src/content/pulse/*.mdx` 32+ 건의 `YYYY-MM-DD-` prefix 제거 (script: `scripts/migrate-pulse-slugs.mjs` 작성)
2. **`pulseUrl` helper 검증** — `src/lib/korean.ts` 의 `pulseUrl(slug, publishedAt)` 가 새 컨벤션 호환인지 확인 (이미 publishedAt 으로 날짜 산출 — 추가 변경 불필요 예상)
3. **301 redirect 등록** — `public/_redirects` (Cloudflare Pages 지원) 에 old URL → new URL 매핑 추가
   ```
   /2026/05/17/2026-05-17-kdca-ebola-pheic/ /2026/05/17/kdca-ebola-pheic/ 301
   ```
   (32+ 줄 — script 자동 생성)
4. **draft-pulse-from-rss.mjs 갱신** — 신규 draft 파일명 컨벤션 새 룰로 변경 (`draft-pulse-slug.mdx` 형식, 날짜는 frontmatter 만)
5. **writer.mjs `publishedFilename` 갱신** — `draft-pulse-` prefix 제거 외에 날짜 prefix 도 제거
6. **Sitemap 재생성** — Astro build 자동 (`finalize-sitemap-index.mjs`)
7. **Google Search Console 사이트맵 재제출**
8. **(선택) Google URL Removal Tool** — 구 URL 캐시 즉시 정리

### D5. canonical 정책

마이그레이션 PR 의 모든 신·구 URL 에 대해:
- 새 URL = canonical
- 구 URL = 301 redirect → 새 URL (Cloudflare Pages `_redirects` 처리)
- `<link rel="canonical">` 메타는 라우트가 새 URL 로 생성 → Astro 가 자동 처리

## 이유

### Option C (현행 유지) 잠정 채택 이유

1. **AdSense 인증 검토 중 URL 변경 = 신호 혼란**
   - Google 크롤러가 신·구 URL 매핑 학습 기간 필요 (보통 2~6 주)
   - 검토 중 사이트의 안정성·신뢰성 평가 점수에 부정적 영향 가능
   - AdSense 정책: "사이트 구조의 급격한 변경 시 재검토 트리거"

2. **현재 인덱싱된 펄스 32건 보호**
   - Google·Naver 모두 인덱싱 시작 — 임시 404 / soft 404 발생 시 ranking 손실
   - 301 redirect 가 즉시 적용되어도 크롤러 재방문까지 ranking 저하 가능

3. **수동 발행 가속 시점**
   - 5/15 이후 자동 발행 중단, 수동 발행으로 신규 콘텐츠 유입 중
   - URL 마이그레이션은 자동 발행 복귀·안정화 후 일괄 처리가 안전

### Option D 인증 후 실행 이유

1. **Google SEO 권장사항** — short, descriptive, no duplication
   - Google 가이드: "URL 은 가능한 한 짧고 인간 가독성 높게"
   - 중복 토큰은 keyword stuffing 으로 오인될 risk

2. **사용자 가독성 + 공유 최적화**
   - Telegram·소셜 공유 시 깔끔한 URL = 클릭률 ↑
   - 5/17 운영자가 Telegram 스크린샷에서 직접 지적

3. **canonical 단일화**
   - 향후 자매 사이트 cross-link 시 URL 안정성·일관성

4. **인증 후 안전 시점**
   - AdSense approved = 사이트 안정성·정책 준수 검증 완료
   - 이 시점 이후 구조 변경은 ranking 영향 최소화 (이미 신뢰 누적)

## 대안

| 대안 | 이유 | 기각 사유 |
|---|---|---|
| **A. 즉시 fix (인증 전)** | 깔끔한 URL 빨리 적용 | AdSense 검토 시그널 혼란 위험, 인증 지연 가능 |
| **B. 영구 현행 유지** | 변경 비용 회피 | 미적·SEO 손실 누적, Google 가이드 위반 |
| **C. 새 글만 새 컨벤션** | 점진적 변경 | URL 일관성 깨짐, canonical 혼란, redirect 매핑 복잡 |

## 결과

본 ADR 채택으로:
- ✅ 현행 32 펄스 URL 안정성 — AdSense 검토 안전
- ✅ 결정·이유·이행 시점 명문화 — 운영자·에이전트 양쪽 단일 진실
- ✅ 인증 통과 시점 즉시 마이그레이션 — 지연 0
- ⚠ 인증 검토 기간 동안 중복 URL 잔존 — 미적·SEO 손실 부분 누적 (감수)
- ⚠ Telegram 메시지의 URL 가시성 손상 (Cloudflare deploy 미리보기에서 운영자가 매번 노출) — 감수

## 재검토 트리거

본 ADR 은 다음 시점에 재평가·실행된다.

| 트리거 | 액션 |
|---|---|
| **AdSense 인증 통과** (대시보드 approved + 이메일) | 즉시 마이그레이션 PR 착수 (Option D 실행) |
| AdSense 검토 30일+ 지연 (5/19 + 30 = 6/18 까지 미통과) | 조기 마이그레이션 가능성 재평가 |
| Google Search Console 에서 중복 URL 패널티 조기 발견 | 인증 검토 중이라도 패널티 회피용 부분 마이그레이션 검토 |
| AdSense 인증 거부 + 재신청 결정 | 거부 사유 분석 후 본 ADR 또는 마이그레이션 선후관계 재결정 |
| 자매 사이트 N → 9 확장 중 URL 정책 변경 필요 | 자매 사이트와 일관 적용 가능 여부 재검토 |

## 관련

- ADR 0008 — Network Revenue Funnel (AdSense 안전 1순위 제약)
- `src/pages/[year]/[month]/[day]/[slug].astro` — 현재 라우트
- `src/lib/korean.ts:pulseUrl()` — URL 생성 헬퍼 (마이그레이션 시 검증 대상)
- `scripts/draft-pulse-from-rss.mjs` — draft 파일명 생성 (마이그레이션 시 갱신)
- `scripts/agents/writer.mjs:publishedFilename()` — drafts → publish 파일명 변환 (마이그레이션 시 갱신)
- `public/_redirects` — 마이그레이션 PR 에서 신규 작성 (현재 미존재 가능)
- CLAUDE.md §AdSense 안전 — fabrication 1건 = 네트워크 전체 영구 차단 (URL 변경도 동일 신중도)
