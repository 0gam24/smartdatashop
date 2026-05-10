# Today — 2026-05-10 (일) (KST)

> 자동 생성 — 매 빌드 + 매 cron 갱신. 운영자 일일 시야 단일 진입점.
> 마지막 실행: 2026-05-10T11:48:12.863Z

## 📝 검수 대기 drafts

_검수 대기 0건 — 다음 cron 사이클 (00:30 KST) 까지 대기._

## ✅ 오늘 발행된 콘텐츠

_오늘 발행 0건 — drafts 검수해서 `src/content/pulse/` 로 이동 시 자동 발행._

## 📊 데이터 SSOT freshness

| 파일 | 출처 | fetchedAt | 신선도 |
|---|---|---|---|
| `ecos-timeseries.json` | ECOS 시계열 5종 | 2026-05-10 01:13 | ✅ today |
| `key-100.json` | ECOS 100대 지표 | 2026-05-10 01:13 | ✅ today |
| `kosis-indicator.json` | KOSIS 지표 | 2026-05-10 01:13 | ✅ today |
| `government.json` | 정부 RSS 14피드 / 66 sources | 2026-05-10 01:13 | ✅ today |
| `keywords.json` | 뉴스 키워드 (7 언론사) | 2026-05-10 01:13 | ✅ today |
| `network-index.json` | 자매 네트워크 인덱스 | 2026-05-10 02:42 | ✅ today |

## 📈 ECOS 핵심 지표 (직전 갱신값)

| 지표 | 값 | Δ% (직전) | YoY% | cycle |
|---|---|---|---|---|
| 기준금리 | 2.5 % | 0.00% | -9.09% | M |
| 원/달러 환율 | 1,450.8 원 | -0.41% | -0.22% | D |
| CPI 총지수 | 119.37 2020=100 | +0.48% | +2.57% | M |
| KOSPI | 7,498 1980.01.04=100 | +0.11% | +84.08% | D |
| 가계부채 | 1,326,681.3 십억원 | +0.76% | +4.21% | Q |

## 🌐 자매 mirror 신선도

| 자매 | 콘텐츠 | 마지막 갱신 | 신선도 |
|---|---|---|---|
| awoo (awoo.or.kr) | 123 | 2026-05-09 06:54 | ⚙ 1d |
| moneylook (asiatop.co.kr) | 108 | 2026-05-09 21:45 | ✅ today |
| calculatorhost (calculatorhost.com) | 75 | 2026-05-08 10:22 | ⚙ 2d |
| iknowhowinfo (iknowhowinfo.com) | 18 | 2026-05-08 08:54 | ⚙ 2d |

## 📥 정부 RSS 신착 (직전 24h)

_24h 신착 0건._

## 🤖 writer agent 마지막 실행

- 시점: 2026-05-10 19:03
- 상태: `stub-no-key`

## 📊 publish funnel 누적

- 누적 drafts in: **3건**
- 누적 published: **0건**
- 누적 killed: 0건
- 누적 skipped: 0건
- 통과율: **0.0%** (목표 40%)

---

## 자동화 흐름 (참고)

```
00:30 KST — fetch-data: ECOS / KOSIS / RSS / 뉴스 → JSON commit + drafts 4건 생성
02:00 KST — sync-sister-mirrors: 자매 4 mirror 동기화
drafts push → writer agent: Claude 본문 자동 작성 + PR 자동 생성
PR merge → publisher: IndexNow ping (Bing/Yandex 즉시)
CF Pages 빌드 → today.md / OPERATOR_INBOX.md 자동 갱신
```
