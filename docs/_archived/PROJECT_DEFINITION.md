# smartdatashop network — 프로젝트 정의

> 본 문서는 5~9 사이트 네트워크의 전체 그림.
> PURPOSE.md (목적) 의 하위 — 본 문서가 PURPOSE 와 충돌 시 PURPOSE 우위.
> NETWORK.md / CATEGORY_MAP.md / ADR / STRUCTURE.md 의 상위.
> 본 문서가 모든 후속 결정의 anchor (PURPOSE 와 함께).
>
> 마지막 갱신: 2026-05-07
> 버전: v1.0
> 상태: active

---

## §1 한 줄 요약

한국 정부·공공기관 1차 출처 데이터를 발표 즉시 5분 분량으로 검증해 발행하는 메인 사이트 + 페르소나별 깊이 자매 사이트 4~8개 네트워크. 1인 운영 + Google AdSense 사업, 1년 월 500만원 / 2년 월 1,000만원 수익 목표.

---

## §2 사업 모델

### 2.1 운영자
- 김준혁 (1인) · smartdatashop@gmail.com
- 사업자: 406-06-34485 · 인천 계양 새벌로 88

### 2.2 수익 구조
- Google AdSense (자매 4 가동 — calculatorhost / awoo* / asiatop / iknowhowinfo)
  *awoo 비영리 — AdSense 없음
- 메인 사이트 광고 없음 또는 최소 (신뢰 자산 모델)
- 직접 광고·구독·강의 X

### 2.3 수익 목표 (PURPOSE.md §1)

| 시점 | 월 수익 | 합산 일 PV |
|---|---|---|
| 1년 | 500만원 | ~50,000 |
| 2년 | 1,000만원 | ~100,000 |
| 3년+ | 2,000만원+ | 200,000+ |

### 2.4 비용
- Claude API: ~$11/월 (Hybrid Sonnet/Haiku)
- 도메인 5: ~$6/월
- Cloudflare Pages: $0
- GitHub Actions: $0
- **총: ~$17/월**

→ 손익분기 매우 안전.

---

## §3 네트워크 구조

### 3.1 5~9 사이트 (NETWORK.md v0.6 §2)

**메인 1**:
- smartdatashop.kr — Astro 5 — 1차 출처 데이터 저널 (Google Discover 진입 엔진)

**자매 4 (현재)**:

| 도메인 | Stack | 페르소나 | 카테고리 |
|---|---|---|---|
| calculatorhost.com | Next.js 15 | 모든 페르소나 | 인터랙티브 계산기 |
| awoo.or.kr | Astro 6 | 정부 지원금 수령자 | 신청 가이드 (비영리) |
| asiatop.co.kr (moneylook) | Astro 6 | 사회초년생·신혼·직장인 | 케이스 가이드 |
| iknowhowinfo.com | Next.js 16 | 4050 ETF 투자자 | 시장 분석 |

**확장 슬롯 5** — 페르소나·도메인 미정. NETWORK.md 헌법 paste 만으로 합류.

### 3.2 9 사이트 한도 (PURPOSE §4)

최대 9 사이트 (메인 1 + 자매 8) 한도 절대 준수.
한도 갱신은 PURPOSE / PROJECT_DEFINITION 동시 갱신 필요.

### 3.3 멀티 스택 인정 (NETWORK.md v0.6 §2.4)

자매 자율성:
- ✓ 프레임워크 (Astro / Next.js / 기타)
- ✓ CSS 프레임워크 (Tailwind v3 / v4 / 기타)
- ✓ 디자인 토큰 (자매 페르소나 적합)
- ✓ 자체 검증 게이트 (자매가 메인보다 강력해도 OK)

자매 자율성 한계:
- ✗ 메인 backref 박스 (의무)
- ✗ 1차 출처 검증 (4 절대 규칙)
- ✗ 페르소나 매핑 일관성

---

## §4 4 절대 규칙 (PURPOSE §3 + NETWORK §3)

| 규칙 | 의미 | 검증 게이트 |
|---|---|---|
| ① 신뢰성 | .go.kr / .or.kr 1차 출처만 | source-verifier verbatim |
| ② 실시간 | 발표 H+3~4 이내 발행 | Scout LITE 매시 cron |
| ③ 정확성 | 5 계층 안전망 통과 | Layer 1~5 (Zod / TrustBar / placeholder / fact-checker / verify:strict) |
| ④ 출처표기 | footnote + TrustBar + SourceList + LD | 자동 검증 |

→ 1건이라도 위반 시 작성 reject.

---

## §5 콘텐츠 흐름

```
[정부 발표 H시]
        ↓
Scout LITE 자동 감지 (RSS 매시)
        ↓
SourceWriter 워크플로우 (운영자 결정 + AI 작성)
        ↓
메인 펄스 발행 (H+3~4)
        ↓
Dispatcher → 자매 task 분배 (CATEGORY_MAP.md 매핑)
        ↓
Commander 명령서 → 자매 작업
        ↓
자매 페이지 발행 + 메인 backref 박스
        ↓
Network Index sync (자매 → 메인)
        ↓
메인 "더 깊이 →" 박스 자동 갱신
        ↓
양방향 funnel 완성
```

**5 단계 깊이 매트릭스**:

1. 메인 펄스 (5분, 사실)
2. 자매 가이드 (15-30분, 실행) — awoo / moneylook
3. 자매 도구 (즉답) — calculatorhost
4. 자매 인사이트 (30-60분, 분석) — iknowhowinfo
5. 메인 가이드북 (단행본 깊이)

---

## §6 운영 모델

### 6.1 일일 cadence

| 시간 | 작업 | 부담 |
|---|---|---|
| 06:00 자동 | 메인 cron + 자매 cron 자동 발행 | 0 |
| 09:00 운영자 | 알림 확인 (high-risk 발견 시만) | 5분 |
| 12:00 운영자 | 5 사이트 빠른 둘러봄 | 2.5분 |
| 18:00 운영자 (옵션) | 다음날 brief review | 5분 |

총 daily 5~10분 (정상) / 30분 (알림 발생 시).

### 6.2 운영자 한계 (PURPOSE §2)
- daily 1.5h 한계
- burnout 0
- 외부 작업은 운영자만 (DNS·Pages·AdSense·GitHub 콘솔)
- AI 협업 (Claude Opus 4.7 + 안티그래비티 + 8 에이전트)

### 6.3 8 에이전트 (HQ agents/)

사고 5종: Planner / Reviser / Diagnostician / Commander / General
작업 3종: Documenter / Onboarder / Dispatcher

→ 운영자 daily 결정·기획·실행 모두 8 에이전트로 처리.

---

## §7 자동화 인프라

### 7.1 메인 (smartdatashop.kr)
- Scout LITE (매시 RSS polling 5종)
- Layer 4 fact-checker LITE (매일 02:00 KST)
- smoke-test 95+
- source-cache + source-verifier
- Astro 5 + GitHub Actions 8

### 7.2 자매별 자동화

| 자매 | 자동 발행 | 자동 검증 |
|---|---|---|
| calculatorhost | daily 03:00 KST 데이터 sync | calc-logic-verifier + Vitest 864 |
| awoo | daily 06:00 KST Claude 영구 포스트 | fact-checker LITE (Cycle #84 가동) |
| moneylook | daily 06:00 KST G0~G9 자동 발행 | G0~G9 10단계 + go-live-check |
| iknowhowinfo | 평일 16:00 KST KRX 마감 후 cron | YMYL guard + verify-parity |

### 7.3 향후 자동화 (Phase 다음)
- Network Index 시스템 (메인 ↔ 자매 sync)
- Dispatcher 자동 task 분배
- 메인 "더 깊이 →" 박스 자동 갱신

---

## §8 KPI

### 8.1 트래픽 (PURPOSE §1 도달 경로)

| 시점 | 메인 일 PV | 자매당 일 PV | 합산 |
|---|---|---|---|
| 3개월 | 1,000+ | 100+ | ~1,500 |
| 6개월 | 5,000+ | 500+ | ~7,000 |
| 1년 | 20,000+ | 3,000+ | ~50,000 |
| 2년 | 40,000+ | 7,000+ | ~100,000 |

### 8.2 신뢰 (PURPOSE §5 마지노선)
- Layer 4 high-risk = 항상 0
- 정정 비율 < 5%
- AdSense 정책 위반 = 0 (영구)

### 8.3 발행 cadence
- 메인: 매일 펄스 1편 + 주 1편 인사이트 + 가이드북 챕터
- 자매: 자매당 주 1-2편 (자동 발행 + 운영자 review)
- 합산: ~13편/주 (자매 9 한도 시)

---

## §9 현재 상태 (2026-05-07)

### 9.1 박힌 인프라

```
✅ HQ (smartdata Project)
   - PURPOSE.md
   - PROJECT_DEFINITION.md (본 문서)
   - architecture/NETWORK.md v0.6
   - architecture/CATEGORY_MAP.md
   - CLAUDE.md
   - agents/ (8 에이전트)
   - 999 STRUCTURE/ (5 사이트 STRUCTURE + profile)

✅ 5 사이트 한 덩어리 (production)
   - 메인 + 자매 4 모두 backref 박스 박힘
   - 5 사이트 모두 환각 자동 차단 게이트 보유
   - PURPOSE §5 마지노선 보장
```

### 9.2 미구축 (다음 Phase)

```
⏭️ Network Index 시스템 — 메인 ↔ 자매 sync
⏭️ 메인 "더 깊이 →" 박스 — 메인 → 자매 link
⏭️ Dispatcher 자동 task 분배
⏭️ 첫 메인 펄스 발행 — 5 사이트 한 덩어리 가동 검증
⏭️ 운영자 외부 작업 (AdSense / GitHub Actions 권한 / Branch protection)
```

### 9.3 발행된 콘텐츠 (5 사이트 합산)
- 메인: 펄스 6 + 인사이트 1 + 가이드북 챕터 13 = 20편
- calculatorhost: 계산기 30 + 가이드 18 + 용어 18 = 66편
- awoo: 활성 지원금 112 + 영구 이슈 9 = 121편
- moneylook: 12 cluster × 9편 = 108편
- iknowhowinfo: 분석 18편 + ETF 종목 사전 1099 prerender

→ 합산 ~333편 + 1099 prerender (5 사이트 콘텐츠 자산).

---

## §10 리스크 + 완화

### 10.1 외부 리스크

| 리스크 | 완화 |
|---|---|
| AdSense 정책 변경 | YMYL 도메인 보수적 운영 + 5 마지노선 |
| Discover 알고리즘 변경 | 다채널 (Naver Search + 자매 SEO + cross-link) |
| 한국 .gov RSS 미공개 | Google News RSS signal + 수동 출처 발견 |

### 10.2 내부 리스크

| 리스크 | 완화 |
|---|---|
| 환각 1건 | 5 사이트 fact-checker + verifier (PURPOSE §5) |
| 운영자 burnout | daily 1.5h 한계 + 자동화 |
| 본문 복제 사고 | NETWORK §7.5 응급 protocol |

---

## §11 위계

```
PURPOSE.md                       ← 최상위 anchor
       ↓
PROJECT_DEFINITION.md (본 문서)   ← 전체 그림
       ↓
NETWORK.md v0.6                   ← 5~9 사이트 헌법
       ↓
CATEGORY_MAP.md                   ← 카테고리 매핑
       ↓
CLAUDE.md                         ← HQ 하네스
       ↓
decisions/ADR-*.md                ← 개별 결정
       ↓
sites/*/STRUCTURE.md / BRAND.md   ← 사이트별 메타
       ↓
sites/*/PLAYBOOK.md               ← 사이트별 일별 task
```

본 문서가 PURPOSE 와 충돌 시 PURPOSE 우위.
하위 문서가 본 문서와 충돌 시 본 문서 우위.

---

## §12 갱신 절차

본 문서는 분기 1회 이상 갱신 금지 (anchor 역할 상실 방지).

갱신 가능 사유:
- 자매 합류·폐기 (5 → 9 또는 4 ← 5)
- 사업 모델 근본 변경
- 수익 목표 조정
- 운영 모델 근본 변경

갱신 절차:
1. Planner 영향 분석
2. Reviser 검토
3. ADR-XXXX 신설 (변경 사유)
4. Documenter 가 본 파일 갱신
5. PURPOSE.md / NETWORK.md / CATEGORY_MAP.md 동시 정합 검증

---

## §13 변경 이력

- 2026-05-07 v1.0 — 초기 작성. 5 사이트 한 덩어리 박힘 시점. PURPOSE / NETWORK v0.6 / CATEGORY_MAP / 5 STRUCTURE 모두 박힌 상태에서 통합.

---

## §14 한 페이지 정리

| 항목 | 내용 |
|---|---|
| 사업 목적 | 1인 + AdSense |
| 네트워크 | 메인 1 + 자매 4~8 (최대 9) |
| 수익 목표 | 1년 500 / 2년 1,000만원 |
| 운영 부담 | daily 1.5h 한계 |
| 콘텐츠 정체성 | 1차 출처 데이터 저널 (정부·공공만) |
| 4 절대 규칙 | 신뢰성·실시간·정확성·출처표기 |
| 검증 게이트 | 5 계층 + ADR 0006 4기준 + 자매별 자체 게이트 |
| 8 에이전트 | 사고 5 + 작업 3 (HQ agents/) |
| 현재 상태 | 333편 + 1099 prerender / 5 사이트 한 덩어리 박힘 |
| 다음 Phase | Network Index + 메인 "더 깊이 →" + 첫 펄스 |
| 위계 | PURPOSE > 본 문서 > NETWORK > CATEGORY > ADR > STRUCTURE |
| 갱신 빈도 | 분기 1회 이상 금지 |

---

본 문서가 본 프로젝트의 전체 그림.
PURPOSE 와 함께 모든 후속 결정의 anchor.
