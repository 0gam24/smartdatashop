# CATEGORY_MAP.md — 5 사이트 카테고리 매핑

> 5 사이트 카테고리 시스템 간 매핑 단일 진실.
> Dispatcher 가 본 문서를 read 하여 메인 펄스 → 자매 task 분배.
> 본 문서는 NETWORK.md §8 양방향 링크 프로토콜의 핵심 데이터.
>
> 본 문서는 PURPOSE.md / NETWORK.md 의 하위.
>
> 마지막 갱신: 2026-05-07
> 버전: v1.0
> 상태: active

---

## §1 5 사이트 카테고리 시스템

### 1.1 메인 (smartdatashop.kr) — 5 카테고리

| 코드 | 이름 | 페르소나 | 콘텐츠 유형 |
|---|---|---|---|
| policy | 정책 | 모든 페르소나 | 정부 발표·법령·제도 |
| tax-finance | 세금금융 | 직장인·사업자·투자자 | 세제·예산·금리·소득 |
| market | 시장 | 투자자 | KOSPI·KRX·환율·자산 |
| stats | 통계 | 모든 페르소나 | 통계청·고용·소비자 물가 |
| ai-tech | AI | 사업자·직장인·투자자 | 과기정통부·NIPA·AI 정책 |

### 1.2 calculatorhost.com — 5 카테고리

| 코드 | 이름 | 페르소나 | 콘텐츠 유형 |
|---|---|---|---|
| tax | 세금 | 직장인·사업자 | 소득세·연말정산·종소세 |
| realestate | 부동산 | 부동산 거래자 | 양도세·취득세·전월세 |
| loan | 대출 | 대출 실행 예정자 | 주담대·신용대출·이자 |
| business | 사업·프리랜서 | 사업자·프리랜서 | 부가세·종소세·4대보험 |
| general | 일반 | 모든 페르소나 | 환율·금리·기타 |

### 1.3 awoo.or.kr — 6 페르소나 hub

| 코드 | 이름 | 페르소나 | 콘텐츠 유형 |
|---|---|---|---|
| office-rookie | 사회초년생 | 직장인 (1~3년차) | 취업 지원·청년 정책 |
| self-employed | 자영업·1인사업자 | 사업자 | 소상공인·세제 지원 |
| newlywed-family | 신혼·가족 | 신혼부부·자녀 | 청약·주거·출산·육아 |
| student | 학생 | 대학생·취준생 | 장학·학자금·인턴 |
| senior | 노년 | 60+ | 기초연금·노인 일자리 |
| unemployed-career-shift | 실업·전직 | 구직자·전직자 | 실업급여·재취업 |

### 1.4 moneylook (asiatop.co.kr) — 12 cluster

| 코드 | 이름 | 페르소나 | 콘텐츠 유형 |
|---|---|---|---|
| tax | 세금 | 직장인·사업자 | 소득세·종소세·연말정산 |
| realestate | 부동산 | 신혼·직장인 | 청약·전월세·매매 |
| unemployment | 실업 | 구직자 | 실업급여·구직 |
| gov-support | 정부지원 | 모든 페르소나 | 청년·신혼·자영업 지원 |
| savings | 저축 | 사회초년생·신혼 | 적금·예금·청약통장 |
| insurance-labor | 노동 보험 | 직장인 | 4대보험·산재·고용 |
| auto | 자동차 | 차량 보유자 | 자동차세·보험·구매 |
| public-services | 공공 서비스 | 모든 페르소나 | 행정·민원·증명서 |
| office-tips | 직장 노하우 | 사회초년생·직장인 | 연차·수당·근태 |
| credit-loan | 신용·대출 | 직장인·신혼 | 신용점수·대출·카드 |
| insurance-personal | 개인 보험 | 직장인·신혼·노후 | 실손·암·종신 |
| pension | 연금 | 노후 준비층 | 국민연금·퇴직연금·IRP |

### 1.5 iknowhowinfo.com — 5 카테고리

| 코드 | 이름 | 페르소나 | 콘텐츠 유형 |
|---|---|---|---|
| pulse | 일일 펄스 | ETF 투자자 | 매일 시장 동향 |
| surge | 급등주 | 단기 투자자 | 급등 ETF·종목 |
| flow | 자금 흐름 | 투자자 | 수급·외인·기관 |
| income | 인컴 | 은퇴 준비층 | 월배당·고배당 ETF |
| breaking | 속보 | 모든 투자자 | 정책·시장 속보 |

---

## §2 메인 → 자매 매핑 매트릭스

메인 펄스 카테고리에 따라 어떤 자매에 어떤 task 분배할지.

### 2.1 메인 policy (정책)

| 자매 | 매핑 카테고리 | 매칭 점수 (0-10) | task 유형 |
|---|---|---|---|
| calculatorhost | (해당 없음) | 0 | 분배 X |
| awoo | gov-support / 페르소나별 | 10 | 신청 가이드 (HowTo) |
| moneylook | gov-support | 9 | 케이스 가이드 |
| iknowhowinfo | breaking (정책 속보 시) | 5 | 시장 영향 분석 |

### 2.2 메인 tax-finance (세금금융)

| 자매 | 매핑 카테고리 | 매칭 점수 | task 유형 |
|---|---|---|---|
| calculatorhost | tax / business | 10 | 인터랙티브 계산기 |
| awoo | self-employed (사업자 세제 시) | 7 | 신청 가이드 |
| moneylook | tax / credit-loan / pension | 9 | 페르소나 케이스 |
| iknowhowinfo | flow (세제 변경 시장 영향) | 6 | 시장 영향 분석 |

### 2.3 메인 market (시장)

| 자매 | 매핑 카테고리 | 매칭 점수 | task 유형 |
|---|---|---|---|
| calculatorhost | general (환율·금리 계산기) | 7 | 계산기 |
| awoo | (해당 없음) | 0 | 분배 X |
| moneylook | savings / pension (시장 영향 시) | 6 | 페르소나 영향 |
| iknowhowinfo | pulse / surge / flow / income | 10 | 시장 분석 |

### 2.4 메인 stats (통계)

| 자매 | 매핑 카테고리 | 매칭 점수 | task 유형 |
|---|---|---|---|
| calculatorhost | general (CPI·물가 계산기) | 8 | 인터랙티브 도구 |
| awoo | (페르소나별 영향 시) | 5 | 가이드 |
| moneylook | tax / savings (영향 시) | 7 | 케이스 |
| iknowhowinfo | flow / breaking (자금 영향) | 6 | 시장 분석 |

### 2.5 메인 ai-tech (AI)

| 자매 | 매핑 카테고리 | 매칭 점수 | task 유형 |
|---|---|---|---|
| calculatorhost | (해당 없음) | 0 | 분배 X |
| awoo | self-employed (1인 사업자 AI 도구) | 6 | 가이드 |
| moneylook | office-tips (직장인 AI 활용) | 6 | 케이스 |
| iknowhowinfo | breaking (AI 정책 시장) | 5 | 시장 영향 |

---

## §3 자매 → 메인 backref 매핑

자매가 페이지 발행 시 어떤 메인 펄스 카테고리를 backref 할지.

### 3.1 calculatorhost → 메인

| calculatorhost 카테고리 | 메인 backref 카테고리 |
|---|---|
| tax | tax-finance |
| realestate | tax-finance / policy (부동산 정책 시) |
| loan | tax-finance / market (금리 변동 시) |
| business | tax-finance / policy (사업자 정책 시) |
| general | stats / market |

### 3.2 awoo → 메인

| awoo 페르소나 | 메인 backref 카테고리 |
|---|---|
| office-rookie | policy / tax-finance |
| self-employed | policy / tax-finance / ai-tech |
| newlywed-family | policy / tax-finance |
| student | policy |
| senior | policy / tax-finance |
| unemployed-career-shift | policy |

### 3.3 moneylook → 메인

| moneylook cluster | 메인 backref 카테고리 |
|---|---|
| tax | tax-finance |
| realestate | tax-finance / policy |
| unemployment | policy |
| gov-support | policy |
| savings | tax-finance / market |
| insurance-labor | policy |
| auto | tax-finance |
| public-services | policy |
| office-tips | policy / ai-tech |
| credit-loan | tax-finance / market |
| insurance-personal | tax-finance |
| pension | tax-finance / market |

### 3.4 iknowhowinfo → 메인

| iknowhowinfo 카테고리 | 메인 backref 카테고리 |
|---|---|
| pulse | market |
| surge | market |
| flow | market / stats |
| income | market / tax-finance (배당세 시) |
| breaking | market / policy / ai-tech |

---

## §4 매칭 점수 임계값 (Dispatcher 활용)

NETWORK §9 PLAYBOOK 시스템 + Dispatcher §Stage 4 매칭 점수 산정 기준:

- 합계 ≥ 8: **강력 분배 권장** — 메인 펄스 발행 즉시 자매 task 자동 draft
- 합계 6-7: **표준 분배** — 운영자 review 후 분배 결정
- 합계 4-5: **분배 보류** — 자매 cadence·CONTENT 중복 검사 후
- 합계 < 4: **분배 제외**

---

## §5 cross-link 규칙 (자매 ↔ 자매)

같은 메인 펄스 인용한 자매끼리 cross-link 자동.

예: 메인 펄스 "2026-05-07 종소세 신고 안내" 발행 →

- calculatorhost 가 종소세 계산기 발행
- moneylook 이 사회초년생 종소세 케이스 발행
- awoo 가 self-employed 신청 가이드 발행

→ 3 자매 페이지 하단에 cross-link 박스 자동:

> 이 주제의 다른 사이트 콘텐츠:
>
> - 계산해보기: calculatorhost.com/{path}
> - 케이스 사례: asiatop.co.kr/{path}
> - 신청 가이드: awoo.or.kr/{path}

---

## §6 분배 자매 수 한계

NETWORK §9 PLAYBOOK 시스템 강제:

- 메인 펄스 1편당 **최대 분배 자매 = 3**
- 그 이상 매칭 점수 ≥ 6 시 우선순위 상위 3개만
- 사유: 자매 cadence 부담 + cannibalization 방지

---

## §7 페르소나별 자매 우선순위

특정 페르소나 콘텐츠 시 자매 분배 우선순위:

### 7.1 사회초년생·청년
- 1순위: moneylook (office-rookie / office-tips)
- 2순위: awoo (office-rookie)
- 3순위: calculatorhost (tax / general)

### 7.2 사업자·프리랜서
- 1순위: calculatorhost (business)
- 2순위: awoo (self-employed)
- 3순위: moneylook (tax)

### 7.3 신혼·가족
- 1순위: moneylook (realestate / savings)
- 2순위: awoo (newlywed-family)
- 3순위: calculatorhost (realestate)

### 7.4 투자자
- 1순위: iknowhowinfo (전 카테고리)
- 2순위: calculatorhost (general — 환율·금리)
- 3순위: moneylook (savings / pension)

### 7.5 노후 준비층
- 1순위: iknowhowinfo (income)
- 2순위: moneylook (pension / insurance-personal)
- 3순위: awoo (senior)

### 7.6 구직자·전직자
- 1순위: awoo (unemployed-career-shift)
- 2순위: moneylook (unemployment)

---

## §8 매핑 갱신 절차

본 매핑은 자매 콘텐츠 추가 또는 카테고리 시스템 변경 시 갱신:

- 신규 자매 합류 시 §1 에 자매 카테고리 추가
- 기존 자매 카테고리 변경 시 §2~§3 매핑 갱신
- Dispatcher 매칭 점수 부정확 시 §4 임계값 조정
- 페르소나 우선순위 변경 시 §7 갱신

갱신 절차:

> Reviser 검토 → Documenter 가 본 파일 갱신 → 버전 bump

---

## §9 변경 이력

- 2026-05-07 v1.0 — 초기 작성. 5 사이트 카테고리 + 메인↔자매 매핑 + cross-link 규칙 박힘.

---

## §10 한 페이지 정리

| 항목 | 내용 |
|---|---|
| 5 사이트 카테고리 | 메인 5 / calc 5 / awoo 6 / moneylook 12 / ikhi 5 = 33 카테고리 |
| 매핑 방식 | 메인 → 자매 (분배) + 자매 → 메인 (backref) |
| 매칭 점수 임계 | ≥ 8 강력 / 6-7 표준 / < 4 제외 |
| 분배 자매 수 한계 | 메인 펄스 1편당 최대 3 |
| cross-link | 같은 메인 펄스 인용 자매끼리 자동 |
| 페르소나 우선순위 | 6 페르소나 그룹별 자매 1~3 순위 |

---

본 매핑은 Dispatcher 가동의 단일 진실.
NETWORK.md §8 양방향 링크 프로토콜 + §9 PLAYBOOK 시스템의 핵심 데이터.
