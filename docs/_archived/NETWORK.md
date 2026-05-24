---

# smartdatashop network — 운영 헌법

> 본 문서는 5~9 사이트 모두에 적용되는 공통 헌법.
> 모든 자매 사이트는 본 문서를 paste 후 합류.
>
> 본 문서는 PURPOSE.md 의 하위.
> PURPOSE 와 충돌 시 PURPOSE 우위.
>
> 버전: v0.6
> 마지막 갱신: 2026-05-07
> 상태: active (핵심 5 섹션 + 자매 자율성 인정. §5/§6/§8/§9~§12 추후 보완)

---

## §1 네트워크 정체성

### 1.1 누구
- 운영자: 김준혁 (1인) · smartdatashop@gmail.com
- 사업자: 406-06-34485 · 인천 계양 새벌로 88

### 1.2 무엇
한국 정부·공공기관 **1차 출처 데이터**를 **발표 즉시·검증되게** 정리해 발행하는 **5~9 사이트 네트워크**.

### 1.3 왜
1인 운영 + Google AdSense **수익 목표** (PURPOSE.md §1):
- 1년: 월 500만원
- 2년: 월 1,000만원

### 1.4 어떻게
- 메인 1 + 자매 4~8 = 최대 9 사이트 한 덩어리 운영
- 각 사이트는 자체 stack·디자인·게이트 자율 (multi-stack + dual-brand 허용)
- 한 덩어리 의 핵심 = 메인 ↔ 자매 backref + 페르소나 매핑 + 1차 출처 chain
- 같은 1차 출처 → N 가지 페르소나·형식으로 분기
- AI 협업 (Claude Opus 4.7 + 안티그래비티) + 자동화
- 운영자 daily 1.5h 이내

### 1.5 정체성 한 줄
> **한국의 데이터를 매일 5분으로 — 1차 출처 데이터 저널 + 페르소나별 깊이 N**

---

## §2 사이트 역할 분담

### 2.1 메인 (smartdatashop.kr) — 단일 hub

| 항목 | 내용 |
|---|---|
| 역할 | Google Discover · Naver Search 진입 엔진 |
| 발행 | 매일 펄스 1편 + 주 1편 인사이트 + 가이드북 챕터 |
| 카테고리 | 정책 · 세금금융 · 시장 · 통계 · AI |
| 광고 | 없음 또는 최소 (신뢰 자산 모델) |
| 정체성 | 1차 출처 데이터 저널 |

### 2.2 자매 4~8 — 페르소나별 깊이

기존 4 자매:

| 도메인 | 페르소나 | 콘텐츠 유형 | 카테고리 매핑 |
|---|---|---|---|
| calculatorhost.com | 모든 페르소나 | 인터랙티브 계산기·시뮬레이터 | 모든 카테고리 |
| awoo.or.kr | 정부 지원금 수령자 | 신청 가이드·자격 체크 (HowTo) | 정책 |
| asiatop.co.kr (moneylook) | 사회초년생·신혼부부 | 첫 직장·연말정산·청약 케이스 | 세금금융 |
| iknowhowinfo.com | 투자자 | ETF·종목·시장 분석 | 시장 |

확장 슬롯 5 — 페르소나·도메인 미정. Onboarder 에이전트로 합류.

### 2.3 역할 차별화 원칙
- 메인은 사실·요약·1차 출처 ownership
- 자매는 깊이·도구·페르소나 적용
- **메인과 자매 콘텐츠 본문 절대 복제 X** (canonical chain — link 만)
- 자매 ↔ 자매 본문 복제 절대 X

### 2.4 자매 자율성 — 5 사이트 multi-stack 인정

각 사이트는 자체 stack·디자인·게이트 자율 운영. NETWORK 가 강제하지 않음:

| 자매 | Stack | 디자인 | 자체 게이트 |
|---|---|---|---|
| 메인 (smartdatashop.kr) | Astro 5 | Noto Serif KR + #8b1538 accent | smoke 95+ / verify:strict / Layer 4 fact-check |
| calculatorhost.com | Next.js 15.0.3 + React 19 | Pretendard/Inter + #595FF7 (Fintech) | Lighthouse CI + Playwright 864 + 시각 회귀 32/32 |
| awoo.or.kr | Astro 6.1.10 + Tailwind v4 | Pretendard Variable + 자체 토큰 | smoke + LHCI 4×100 + lint-content + 13 audit |
| asiatop.co.kr (moneylook) | Astro 6.2.0 + Tailwind v4 | cluster.ts accent + Pretendard | G0~G9 10단계 + go-live-check + secrets-scan + lighthouse-ci |
| iknowhowinfo.com | Next.js 16.2.4 + Tailwind v4 | Pretendard + 7 에이전트별 accent | YMYL guard + verify-parity + monthly Lighthouse 95점 |

자매 자율성 인정 범위:
- ✓ 프레임워크 (Astro / Next.js / 기타)
- ✓ CSS 프레임워크 (Tailwind v3 / v4 / 기타)
- ✓ 디자인 토큰 (자매 페르소나 적합한 색·폰트)
- ✓ 자체 검증 게이트 (자매가 메인보다 강력해도 OK)
- ✓ 광고 정책 (메인 X / 자매 AdSense / 일부 자매 비영리)

자매 자율성 한계 (네트워크 정합 의무):
- ✗ 메인 backref 박스 (의무 — §8 양방향 링크)
- ✗ 1차 출처 검증 (4 절대 규칙 — §3)
- ✗ 페르소나 매핑 일관성 (Dispatcher 매칭)
- ✗ NewsMediaOrganization LD 정책 URL 의무

---

## §3 절대 원칙 — 4 절대 규칙

PURPOSE.md §3 의 콘텐츠 목적이 본 §3 으로 구체화.

### ① 신뢰성 — 검증 가능한 1차 출처만

**허용 호스트**:
- .go.kr (정부)
- .or.kr (공공기관)
- krx.co.kr (한국거래소)
- kosis.kr (통계청 KOSIS)
- law.go.kr (법령정보센터)

**금지**:
- 익명 블로그·SNS
- "전문가에 따르면" 류 출처 불명
- 추측·전망·예측 (1차 발표 없으면)
- AI 훈련 데이터 환각

→ source-verifier 가 verbatim 매칭 강제. 출처 외 발화 1건이라도 → 작성 reject.

### ② 실시간 — 발표 즉시 가장 빠르게

| 시점 | 동작 |
|---|---|
| H시 | 정부 발표 |
| H+1 이내 | Scout LITE RSS·HTML 감지 |
| H+2~3 | SourceWriter 작성 |
| H+3~4 | 메인 발행 + Discover sitemap ping |
| H+12 이내 | 자매 응용 콘텐츠 발행 (Dispatcher 분배) |

→ 한국 데이터 저널 최단 발행 시점 목표.

### ③ 정확성 — 검증 통과한 것만

**5 계층 자동 안전망**:
- Layer 1: Zod 스키마
- Layer 2: TrustBar
- Layer 3: placeholder 자동 noindex
- Layer 4: fact-checker LITE (매일)
- Layer 5: verify:strict CI 게이트

**ADR-0006 4기준**:
1. 출처 페어링 (footnote)
2. 정확한 출처 URL (deep link)
3. 발표 일자 명시
4. 검증 불가 격리

### ④ 출처표기 — 모든 본문에 의무

| 위치 | 표기 |
|---|---|
| 본문 수치 옆 | `[^N]` footnote |
| 글 상단 | TrustBar (1차 출처 N건) |
| 글 하단 | SourceList (번호 + "원문 →" deep link) |
| 자매 페이지 상단 | 메인 backref 박스 |
| Schema.org LD | sources[] url + isBasedOn |
| /data/citations.json | 인용 그래프 공개 |

→ 출처 없는 수치는 작성 자체 불가.

---

## §4 디자인 시스템 — Dual-brand 인정

NETWORK 는 5~9 사이트 단일 디자인 강제 X.
각 사이트가 자기 페르소나에 맞는 디자인 자율.

### 4.1 메인 토큰 (smartdatashop.kr 만 적용)
--color-paper: #faf7f0
--color-ink: #1a1a1a
--color-accent: #8b1538
--color-muted: #6b6b6b
--color-line: #d4d0c5
--color-warm: #f5e6d3
font-serif: 'Noto Serif KR'    /* 제목 /
font-sans:  'Pretendard'        / 본문 /
font-mono:  'JetBrains Mono'    / 수치 */

### 4.2 자매 토큰 (자매별 자율)
- calculatorhost: Fintech blue (#595FF7) + Pretendard/Inter
- awoo: 자체 + Pretendard Variable
- moneylook: cluster 별 accent + Pretendard
- iknowhowinfo: 7 에이전트별 accent + Pretendard

각 자매 토큰은 자매 BRAND.md 에 명시.

### 4.3 메인 backref 박스 — 단일 표준 (의무)

자매 페이지에서 메인 출처 link 박스는 메인 토큰 사용:
- 박스 배경: --color-warm 또는 자매 paper
- accent line: --color-accent (#8b1538)
- 폰트: 자매 본문 폰트 (Pretendard)
- 텍스트: "본 데이터 출처: smartdatashop.kr/{펄스}"

→ 독자가 "메인 출처" 한 눈에 시각 인식.

### 4.4 절대 금지 (5~9 사이트 공통)
- ❌ AI 생성 이미지
- ❌ 본문 복제 (메인 ↔ 자매 / 자매 ↔ 자매)
- ❌ 출처 없는 수치
- ❌ 임의 광고 (NETWORK §7 정책 외)

---

## §7 안전 게이트 의무

### 7.1 자매 안전 게이트 — 자매 자율 인정

NETWORK 는 자매에 특정 workflow 강제 X.
다음 4 항목 보장 의무 (구현 방식 자율):

1. **콘텐츠 검증** — 자매가 발행하는 모든 글이 4 절대 규칙 (§3) 준수 확인
   - 메인 패턴: smoke + verify:strict + Layer 4 fact-check
   - 자매 자체 패턴 인정 (G0~G9 / Lighthouse + Playwright / lint-content + 13 audit / YMYL guard 등)
2. **빌드 회귀 가드** — 빌드 시 회귀 검출 (smoke / Lighthouse CI / E2E 등)
3. **검수 미완 격리** — 미완성 토큰 (예: `[검수 후]`) 자동 noindex
4. **YMYL 안전** — 투자·세금·법률 콘텐츠 환각 차단 (BANNED_PHRASES 또는 동등 기능)

자매 게이트 표준 검증:
- 자매 4 모두 위 4 항목 자체 게이트로 통과 ✓ (검증 보고서 2026-05-07)

### 7.2 의무 컴포넌트 — 메인 backref 만 의무

자매 페이지 렌더 시 다음 1 컴포넌트 의무 사용:

- **메인 backref 박스** (모든 자매 페이지 — 메인 출처 또는 페르소나 link)

기타 의무 컴포넌트 (TrustBar / SourceList) 는 자매 자율:
- 자매가 동등 기능 컴포넌트 보유 시 인정
  - calculatorhost: AuthorByline + DataFreshness + TrendBadge + authority-links.ts
  - moneylook: SourceVerificationBadge + VerificationDetails
  - iknowhowinfo: TrustBar + DataFooter + AffiliateNotice + AiAgentDisclosure
  - awoo: 미보유 — 부트스트랩 권장
- 자매가 미보유 시 BRAND.md 에 명시 + 운영자 검토

### 7.3 검증 통과 못 하면 publish 금지

- source-verifier FAIL → 빌드 차단
- placeholder 토큰 잔존 → 자동 noindex
- fact-checker high-risk → 운영자 알림 + unpublish 권장

### 7.4 환각 발견 시 응급 protocol

1. 즉시 사용자 노출 차단 (noindex 또는 unpublish)
2. 운영자 1시간 내 액션
3. Diagnostician emergency 발동
4. 정정 절차 (correctionLog 공개)
5. ADR 갱신 (재발 방지)

→ PURPOSE.md §5 절대 마지노선 위반 = 사업 존속 위협.

### 7.5 본문 복제 사고 응급 protocol

- 메인 ↔ 자매 본문 복제 의심 → 즉시 unpublish
- AdSense 정책 위반 위험 → 1시간 내 정정
- canonical chain 점검 (link 만 cross, 본문 X)

### 7.6 AdSense 안전 의무

- 정책 URL 5 종 의무 (NewsMediaOrganization LD):
  - ethicsPolicy → /editorial-policy/
  - correctionsPolicy → /corrections/
  - verificationFactCheckingPolicy → /methodology/
  - masthead → /authors/junhyuk-kim/
  - aiPolicy → /ai-policy/
- AdSense 자동 광고 활성화 (자매)
- 본 §7.4 / §7.5 응급 protocol 준수

---

## §5 필수 컴포넌트 표준 — 추후 보완 (v0.6+)

자매 1개 (calculatorhost) 가동 후 실제 컴포넌트 list·props 확정.

현재 placeholder:
- BaseLayout / Header / Footer / TrustBar / SourceList
- viz: DataNumber / KpiTile / Sparkline / BarSpark / ChangeBadge / SourceCount
- placeholder.ts (검수 미완 토큰 차단)

---

## §6 JSON-LD 네트워크 표준 — 추후 보완 (v0.6+)

자매 콘텐츠 유형 확정 후 schema.org type 별 표준 작성.

현재 원칙:
- 메인: NewsArticle / Article / Dataset
- calculatorhost: WebApplication
- awoo: HowTo / GovernmentService
- moneylook: Article / Audience
- iknowhowinfo: Article / InvestmentOrFinancialProduct
- 모든 자매 LD 에 parentOrganization: smartdatashop
- 모든 자매 LD 에 isBasedOn: 메인 펄스 URL

---

## §8 메인↔자매 양방향 링크 프로토콜 — 추후 보완 (v0.6+)

Network Index 가동 후 정확한 메커니즘 박힘.

현재 원칙:
- data/network-index.json 단일 색인
- 자매 빌드 시 자기 데이터 push (메인 repo PR)
- 메인 빌드 시 sister-mirrors fetch
- 메인 펄스 본문 "더 깊이 →" 박스 자동 갱신
- 자매 페이지 메인 backref 박스 자동 렌더

---

## §9~§12 — 추후 보완 (v0.6+)

- §9 PLAYBOOK 시스템 (Dispatcher 가동 후)
- §10 환경변수·시크릿 의무
- §11 응급 대응 (§7 보완)
- §12 폐기·개정 조건

---

## §13 변경 이력

- 2026-05-07 v0.5 — 초기 작성. 핵심 §1·§2·§3·§4·§7 박힘. §5·§6·§8·§9~§12 placeholder.
- 2026-05-07 v0.6 — Multi-stack + dual-brand 인정. 자매 자율성 §2.4 신설. §4 전면 재작성 (메인 토큰만 메인용 / 자매 자율). §7.1 자매 게이트 자율 + 4 보장 항목. §7.2 메인 backref 만 의무화. 5 사이트 현실 반영.

---

## 위계 (PURPOSE 와의 관계)

- **PURPOSE.md** (최상위 anchor)
   ↓
- **PROJECT_DEFINITION.md** (전체 그림)
   ↓
- **NETWORK.md** (본 문서 — 5~9 사이트 헌법)
   ↓
- **CLAUDE.md** (HQ 하네스)
   ↓
- **decisions/ADR-*.md** (개별 결정)
   ↓
- **sites/*/STRUCTURE.md / BRAND.md / PLAYBOOK.md** (사이트별)

본 문서가 PURPOSE 와 충돌 시 PURPOSE 우위.
하위 문서가 본 문서와 충돌 시 본 문서 우위.

---

## 한 페이지 정리

| 항목 | 내용 |
|---|---|
| 사이트 수 | 메인 1 + 자매 4~8 = 최대 9 |
| 정체성 | 1차 출처 데이터 저널 + 페르소나별 깊이 |
| 4 절대 규칙 | 신뢰성·실시간·정확성·출처표기 |
| 디자인 토큰 | 6 색 + 3 폰트 (5~9 사이트 동일) |
| 안전 게이트 | 5 GitHub Actions + 의무 컴포넌트 3 |
| 환각 발견 | 1시간 내 응급 protocol |
| 광고 | 메인 X / 자매 AdSense |
| AdSense 안전 | 정책 URL 5 종 + 응급 protocol |
| v0.5 보완 예정 | §5 / §6 / §8 / §9~§12 |

---

본 헌법은 자매 합류·네트워크 운영의 기본 토대.
v0.5 핵심 5 섹션으로 자매 1개 (calculatorhost) 부트스트랩 가능.
자매 1개 가동 후 v0.6 으로 §5/§6/§8 보완.

---
