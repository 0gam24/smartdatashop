# docs/12 — 생성형 엔진 최적화 (GEO)

2026년 핵심. ChatGPT / Google AI Overviews / Perplexity / Gemini 등 AI 답변 엔진이 본 사이트를 인용하도록 콘텐츠를 설계한다.

---

## ⚠️ 0. 적용 범위 — Google에는 이 문서를 적용하지 않는다

> 🔴 **Google 공식 입장 ([ai-optimization-guide](../G-구글-공식가이드/02-fundamentals-기본/ai-optimization-guide.md) — "오해 풀기: 하지 않아도 되는 작업")**
>
> Google은 아래를 **"효과 없는 AEO/GEO 해킹"**으로 명시했다. Google 검색(AI 개요·AI 모드 포함) 대상 작업에서는 **무시해도 된다**:
>
> | Google이 불필요하다고 밝힌 것 | 공식 설명 |
> |---|---|
> | **콘텐츠 '청킹'** | "AI가 더 잘 이해하도록 콘텐츠를 작은 조각으로 나눌 필요 없다. Google 시스템은 페이지 내 여러 주제의 미묘한 차이를 이해하고 관련 부분을 표시할 수 있다." **이상적인 페이지 길이는 없다.** |
> | **llms.txt 등 특수 파일·마크업** | Google 검색이 무시한다. 가시성·순위에 영향 없음 |
> | **AI 전용 문체로 재작성** | AI는 동의어와 의미를 이해한다. 롱테일 키워드를 전부 커버할 필요 없음 |
> | **진정성 없는 '언급' 확보** | 핵심 순위 시스템은 고품질 콘텐츠 중심, 스팸 시스템이 별도 차단 |
> | **구조화 데이터 과집중** | 생성형 AI에는 불필요. 단, **리치 결과용으로는 계속 유효**하므로 SEO 전략의 일부로 유지 |
>
> **이 문서의 위치**
> - ❌ **Google 최적화 근거로 쓰지 않는다.** Google용은 [creating-helpful-content](../G-구글-공식가이드/02-fundamentals-기본/creating-helpful-content.md) + [ai-optimization-guide](../G-구글-공식가이드/02-fundamentals-기본/ai-optimization-guide.md)를 따른다.
> - ✅ **ChatGPT·Perplexity·Claude 등 Google 외 답변 엔진 대비용**으로만 참고한다.
> - ⚖️ 다행히 아래 기법 대부분(역피라미드, 명확한 헤딩, 자체 완결적 문단, E-E-A-T 강화)은
>   **읽는 사람에게도 좋은 글쓰기**라 Google 기준으로도 손해가 아니다. 다만 **"AI를 위해" 억지로 쪼개지 말 것.**
>
> ### Google 대상 GEO에서 실제로 해야 하는 일
>
> | 할 일 | 근거 문서 |
> |---|---|
> | 기본 SEO 권장사항 준수 (기술 구조 + 차별화된 콘텐츠) | [ai-optimization-guide](../G-구글-공식가이드/02-fundamentals-기본/ai-optimization-guide.md) |
> | 일반 지식을 넘어서는 전문가 주도 고유 콘텐츠 | [creating-helpful-content](../G-구글-공식가이드/02-fundamentals-기본/creating-helpful-content.md) |
> | 지역 비즈니스·이커머스 세부정보 최적화 | [establish-business-details](../G-구글-공식가이드/04-appearance-검색결과표시/establish-business-details.md) |
> | **Search Console '생성형 AI 실적 보고서'로 노출 측정** | 아래 §6 참조 |
> | **에이전트형 환경(AI 에이전트) 대비** | 아래 §10 참조 |

---

## 1. 핵심 원칙 — 인용 가능성(Citability)

AI 답변 엔진은:
1. **개체(Entity)** 기반으로 정보를 이해
2. **청크(Chunk)** 단위로 추출
3. **신뢰 신호(Trust Signal)**가 강한 소스를 인용

따라서 본 표준은:
- ✅ 청크화 가능한 구조
- ✅ 개체 신호 강화
- ✅ E-E-A-T 강화
- ✅ AI 친화적 사이트 메타(llms.txt)

---

## 2. 콘텐츠 청킹(Chunkability) 표준

### 2-1. 역피라미드 구조

**결론을 첫 문단에 명시 → 근거 → 세부 사항** 순.

```
✅ 좋음:
"X는 Y이다. 그 이유는 다음과 같다.
첫째, ...
둘째, ...
이를 뒷받침하는 데이터는 ..."

❌ 나쁨:
"오늘 우리가 다룰 주제는 매우 흥미롭습니다.
이 글에서는 X에 대해 알아볼 것입니다.
먼저 배경부터 살펴보면..."
```

AI는 첫 문단의 핵심 명제를 가장 자주 인용한다. 첫 50자에 핵심 결론을 압축.

### 2-2. 헤딩 — 자체 완결적 질문 또는 명사구

```
✅ 좋음:
## React Server Components란 무엇인가?
## 클라이언트 컴포넌트와 서버 컴포넌트의 차이
## RSC를 도입할 때 주의할 점

❌ 나쁨:
## 1단계
## 좀 더 알아보기
## 결론
```

AI가 헤딩만 보고도 "이 질문에 대한 답이 여기 있구나"를 인식하게.

### 2-3. 단일 명제 단위 섹션

- 한 섹션은 **하나의 명제만**
- 섹션 길이는 2~5문단
- 너무 길면 분할

### 2-4. 핵심 정의는 격리

```html
<section>
  <h2>RSC란?</h2>
  <p><dfn>React Server Components(RSC)</dfn>는 서버에서만 실행되는 React 컴포넌트로, 클라이언트 번들에 포함되지 않는다.</p>
</section>
```

`<dfn>` 태그 + 첫 등장 시 명확한 정의.

### 2-5. 단계별 안내

```html
<ol>
  <li>첫 단계: 명령형, 50자 이내.</li>
  <li>둘째 단계: ...</li>
</ol>
```

- `<ol>` 명시적 순서
- 각 단계 50자 이내 명령형

### 2-6. 비교·대조는 표

```html
<table>
  <thead>
    <tr>
      <th>항목</th>
      <th>옵션 A</th>
      <th>옵션 B</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>속도</td><td>빠름</td><td>보통</td></tr>
    <tr><td>비용</td><td>높음</td><td>낮음</td></tr>
  </tbody>
</table>
```

행/열에 명확한 헤더 → AI가 표 구조를 정확히 이해.

### 2-6-b. 표 전후 산문 컨텍스트 (신규 발행 글부터)

표만 나열하면 AI 답변 엔진이 추출할 산문 단위가 없다. 표 전후에 다음 5룰 적용:

1. **표 앞 1문장은 완결 평서문** — 레이블 콜론("본인 한도 시뮬레이션:") 금지. 짧은 완결문은 허용·권장 (G8 S14 단문 비율 15%+ 유지에 기여).
2. **핵심 표 1~2개당 표 뒤 2~3문장 수치 해설 의무** — 재서술 수치는 본문 기존 토큰 재사용 또는 "약 N" 근사만 사용 (파생 계산값 신규 생성 금지 — G4 호환).
3. **기호 전보문 금지** — "A = B", "↑/↓" 식 문장 금지. 리드·TL;DR·섹션 요약 전부 완결 평서문으로.
4. **표 셀 ⚠️/✅/❌ 단독 사용 금지** — "가능/불가/주의 + 사유" 텍스트 병기.
5. **표 밀도 H2당 최대 1개** (글당 총량 상한 아님).

적용: 신규 발행 글부터.

### 2-7. 통계·수치는 출처 명시

```html
<figure>
  <p>2026년 1분기 React 사용률은 39.5%로 전년 대비 2.3%p 상승했다.</p>
  <figcaption>출처: Stack Overflow Developer Survey 2026</figcaption>
</figure>
```

수치는 **출처 + 단위 + 시점** 항상 명시.

---

## 3. FOX Method — 인용 친화 콘텐츠 패턴

### F: Factual (사실 기반)

- 검증 가능한 사실
- 1차 자료 인용 (정부 사이트, 학술 논문, 공식 문서)
- 추측·의견 표시 분리

### O: Original (독창적)

- 자체 데이터, 인터뷰, 사례 연구
- 다른 사이트와 차별화된 관점
- AI는 같은 정보의 여러 사이트 중 **독창적인 것**을 우선 인용

### X: eXplicit (명시적)

- 결론 모호함 없이
- 핵심 수치 ✅ "39.5%" — ❌ "약 40% 정도"
- 조건부 진술도 명확히 ("X 조건일 때 Y이다" 식)

**예외 (R95-9 정합)**: 1차 출처로 검증된 법정·공시 수치는 단정 표기, 추정·변동·계산 수치만 근사 표현("약 N"). 이는 R95-9 amount-sanitizer 의 실제 동작 (검증 토큰 유지, unmatched 토큰만 "약 X" wrap) 과 문서를 정합화한 것이다. sanitizer 코드 자체는 불변.

---

## 4. 개체(Entity) 신호 강화

### 4-1. 핵심 개체 페이지

회사, 제품, 인물 등 핵심 개체는 **별도 페이지** 필수:

- `/about` — Organization
- `/team`, `/author/[slug]` — Person
- `/products/[slug]` — Product

각 페이지에 해당 스키마 부착(`docs/10` 참조).

### 4-2. sameAs로 외부 권위 연결

```json
{
  "@type": "Organization",
  "sameAs": [
    "https://www.wikidata.org/wiki/Q123456",
    "https://en.wikipedia.org/wiki/Company_Name",
    "https://www.linkedin.com/company/example",
    "https://twitter.com/example",
    "https://github.com/example"
  ]
}
```

위키데이터 항목이 있으면 강력 — 없으면 생성 검토.

### 4-3. NAP 일관성

Name, Address, Phone — 사이트 + 외부 디렉토리 모두 동일:

- 네이버 플레이스
- 카카오맵
- Google Business Profile
- 위키데이터
- LinkedIn 회사 페이지

표기 차이 하나도 신호 약화.

### 4-4. 위키데이터·위키피디아

가능한 경우:

1. 위키데이터에 항목 생성/편집 (`Q123456`)
2. 위키피디아 문서 (스스로 만드는 건 NPOV 위반 — 외부 노출 자연스럽게)
3. 사이트에서 위키데이터로 sameAs 링크

---

## 5. E-E-A-T 강화

**Experience, Expertise, Authoritativeness, Trustworthiness**

### 5-1. 저자 정보

모든 글에:

```html
<div itemscope itemtype="https://schema.org/Person">
  <img src="/authors/jane.jpg" alt="저자명" itemprop="image" width="80" height="80" loading="lazy" />
  <h3 itemprop="name">저자명</h3>
  <p itemprop="jobTitle">시니어 엔지니어</p>
  <p>약력 2~3문장 (전문성 어필)</p>
  <a href="/author/jane" itemprop="url">전체 글 목록</a>
  <a href="https://twitter.com/..." itemprop="sameAs">Twitter</a>
  <a href="https://github.com/..." itemprop="sameAs">GitHub</a>
</div>
```

### 5-2. 저자 페이지 (필수)

`/author/[slug]`:
- 사진, 이름, 직함, 약력
- 전문 분야 (`knowsAbout`)
- 외부 권위 링크 (논문, 강연, 인터뷰)
- 작성 글 목록
- Person 스키마 부착

### 5-3. 편집 정책 페이지

`/editorial-policy`:
- 사실 확인 절차
- 정정 정책 (수정 시 표기 방법)
- 광고·스폰서 정책 (협찬·제휴 표시)
- AI 생성 콘텐츠 정책
- 윤리 강령

### 5-4. 연락처 페이지

`/contact`:
- 실주소
- 사업자등록번호 (한국)
- 대표자명
- 전화·이메일
- 문의 양식

### 5-5. 발행일·수정일 명시

```html
<time datetime="2026-01-15T08:00:00+09:00">2026년 1월 15일 게재</time>
<time datetime="2026-01-20T10:00:00+09:00">2026년 1월 20일 수정</time>
```

오래된 글은 **6~12개월마다 재검토** 일정 등록. 단순 재발행만으로 dateModified 갱신 금지(스팸).

### 5-6. 전문가 검수 (의료·금융·법률)

YMYL(Your Money Your Life) 분야는:

```html
<div class="medical-review">
  의료 검수: <a href="/author/dr-kim">김의사 의학박사</a> (2026년 1월)
</div>
```

자격 보유 전문가가 검수했다는 표시 + Person 스키마.

### 5-7. 외부 권위 사이트 인용 링크

- 정부 (`go.kr`, `gov`)
- 학술 (`edu`, `ac.kr`, 학술 DB)
- 1차 자료 (공식 문서, 통계청)

자연스럽게 본문에 링크. AI는 "권위 있는 소스 인용"을 신뢰 신호로 인식.

---

## 6. AI 답변 엔진 노출 모니터링

### 6-0. Google — Search Console '생성형 AI 실적 보고서' ⭐ 1순위

Google AI 개요·AI 모드·디스커버에서의 실적은 **추측하지 말고 공식 보고서로 측정한다.**

- 위치: Search Console → 실적 → **생성형 AI 실적 보고서**
- 설명: https://support.google.com/webmasters/answer/16984139?hl=ko
- 근거: [ai-optimization-guide § Search Console로 생성형 AI 기능의 노출 측정](../G-구글-공식가이드/02-fundamentals-기본/ai-optimization-guide.md)

> ⚠️ **서드 파티 도구 주의 (Google 공식 경고)**
> "순위 상승을 약속하거나 '내부' Google 측정항목을 사용한다고 주장하는 서드 파티 도구를 주의하라.
> **어떤 서드 파티 도구도 Google의 내부 순위 또는 AI 시스템에 접근할 수 없다.**"
> 아래 6-2의 도구들은 **Google 외 엔진 추적용**으로만 쓰고, Google 수치의 근거로 삼지 않는다.
> 도구 조언 평가 기준은 [third-party-seo](../G-구글-공식가이드/02-fundamentals-기본/third-party-seo.md) 참조.

### 6-1. 수동 테스트 (월간)

각 AI 엔진에서 타겟 쿼리 20개 입력:

- ChatGPT (검색 모드)
- Perplexity
- Google AI Overviews (Search)
- Gemini

본 사이트 인용 여부 + 인용 내용 정확성 기록.

### 6-2. 인용 추적 도구 (선택)

- Profound (https://www.tryprofound.com/)
- AthenaHQ
- Otterly.ai
- Writesonic AI Search Optimizer

월간 인용 점유율(Citation Share) 리포트 → 경쟁사 대비 우위/열위 분석.

### 6-3. 콘텐츠 갭 분석

경쟁사가 더 많이 인용되는 쿼리 → 해당 주제 콘텐츠 강화 또는 신규 작성.

---

## 7. AI 생성 콘텐츠 정책

### 7-1. 정책

- ❌ AI 단독 생성 후 무편집 발행 금지 (2026 스팸 업데이트 표적)
- ✅ AI 보조 시 — 사람의 사실 확인, 1차 경험 추가, 편집 의무화
- ✅ AI 보조 사실 투명 공개 (편집 정책 페이지에 명시)

### 7-2. 사람의 부가가치

AI가 못 만드는 것:
- 1차 경험·인터뷰
- 자체 데이터·실험
- 전문가 의견·검수
- 깊이 있는 분석·통찰

이런 요소가 **반드시 포함**되어야 인용 가치 있음.

---

## 8. 청킹 표준 적용 게이트

핵심 콘텐츠 페이지 ≥ 20개에 본 청킹 표준을 적용한 후 출시. 적용 항목:

- [ ] 첫 문단에 결론
- [ ] 헤딩이 자체 완결적 질문/명사구
- [ ] 한 섹션 = 하나의 명제
- [ ] 핵심 정의 `<dfn>` 격리
- [ ] 단계 안내 `<ol>` + 50자 이내 명령형
- [ ] 비교는 표
- [ ] 통계는 출처 + 단위 + 시점
- [ ] FOX (Factual / Original / eXplicit) 충족

---

## 9. 검증 체크리스트

- [ ] **Search Console 생성형 AI 실적 보고서 확인** ⭐ Google 실적의 유일한 공식 근거
- [ ] llms.txt 게시 (`docs/11` 참조) — **선택. Google 검색은 무시함**
- [ ] 모든 핵심 페이지 청킹 표준 적용 — **Google 외 엔진 대비용. Google에는 불필요**
- [ ] 모든 글에 저자 정보 + Person 스키마
- [ ] 저자 페이지 게시
- [ ] 편집 정책 페이지 게시
- [ ] 연락처 페이지 게시 (NAP)
- [ ] 발행일/수정일 명시
- [ ] 외부 권위 사이트 인용 링크 포함
- [ ] sameAs 외부 프로필 5개 이상
- [ ] 핵심 개체 별도 페이지 (Organization/Person/Product)
- [ ] 위키데이터 항목 검토
- [ ] AI 답변 엔진 인용 모니터링 시작 (20개 쿼리)
- [ ] AI 생성 콘텐츠 정책 명시
- [ ] 월간 인용 점유율 리포트 도입

---

## 10. 에이전트형 환경(Agentic Experience) 대비 🆕

> 근거: [ai-optimization-guide § 에이전트형 환경 살펴보기](../G-구글-공식가이드/02-fundamentals-기본/ai-optimization-guide.md)
> Google이 2026년 공식 가이드에 새로 추가한 항목. **인용(citation) 다음 단계는 "대신 행동하는 AI"다.**

### 10-1. 무엇이 달라지나

AI 에이전트는 예약·사양 비교 등 **사람을 대신해 작업을 수행하는 자율 시스템**이다.
브라우저 에이전트는 사이트에 직접 접속해서:

1. **시각적 렌더링 분석** (스크린샷)
2. **DOM 구조 검사**
3. **접근성 트리(accessibility tree) 해석**

으로 필요한 데이터를 수집한다.

### 10-2. 실무 시사점 — 접근성이 곧 에이전트 대응

에이전트가 **접근성 트리를 읽는다**는 점이 핵심이다. 별도 "에이전트 최적화" 작업을 새로 만들 게 아니라,
**[E1-접근성-WCAG](../E-품질-보안-운영/E1-접근성-WCAG.md) 준수가 그대로 에이전트 대응**이 된다.

| 이미 하고 있는 것 | 에이전트에 주는 효과 |
|---|---|
| 시맨틱 HTML · 랜드마크 | DOM 구조 해석 정확도 ↑ |
| 정확한 `aria-label`·`alt` | 접근성 트리에서 요소 목적 파악 |
| 폼 `label` 연결 | 에이전트가 입력 필드를 올바로 채움 |
| 키보드 내비게이션 가능 | 에이전트 조작 경로 확보 |
| 명확한 버튼 텍스트("제출" > "클릭") | 행동 대상 식별 |

### 10-3. 참고 자료

- [에이전트 친화적인 웹사이트 권장사항 (web.dev)](https://web.dev/articles/ai-agent-site-ux?hl=ko) — Google이 공식 가이드에서 지목한 문서
- [범용 커머스 프로토콜(UCP)](https://ucp.dev/latest/) — 검색 에이전트가 커머스 작업을 수행하게 하는 신규 프로토콜

> **우선순위**: Google도 *"비즈니스와 관련이 있고 시간이 남는다면"* 검토하라고 표현했다.
> 기본 SEO·콘텐츠 품질보다 **뒤**다. 다만 접근성을 이미 지키고 있다면 추가 비용은 거의 없다.

---

**다음 작업**: `docs/13-accessibility.md` — WCAG 2.2 AA 준수.
