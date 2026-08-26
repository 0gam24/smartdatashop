# 📚 웹사이트 개발 레퍼런스 — 마스터 목차

> **스택**: Astro 5+ SSG · Cloudflare Pages · Tailwind CSS 4 · TypeScript
> **목표**: PageSpeed 100점 · Google/네이버 SEO · GEO/AEO · 접근성 WCAG 2.2 AA
> **총 문서**: 260개 (요약 31 + Google 공식 174 + 네이버 공식 55)
> **최종 정리일**: 2026-08-26 (스마트데이터샵 포스팅 구조 엔진 V4 추가)

---

## 🔴 0. 문서 우선순위 규칙 (충돌 시 이대로 따른다)

```
1순위  G-구글-공식가이드   ← Google 관련 모든 판단의 최종 근거
1순위  H-네이버-공식가이드  ← 네이버 관련 모든 판단의 최종 근거
2순위  A~F 내부 요약 문서   ← 실행 방법·프로젝트 규칙·의사결정 기록
3순위  _archive            ← 이력 참고용. 작업 근거로 쓰지 않는다
```

- **A~F는 "어떻게 만들까"를, G~H는 "무엇이 맞나"를 담는다.** 스펙·정책·마크업 규격은 항상 G/H에서 확인한다.
- **Google ≠ 네이버**: 네이버는 `meta keywords` 활용, `Yeti` 크롤러 허용, RSS 제출, IndexNow 등 고유 요구사항이 있다.
  Google 기준으로 대체하지 말고 **양쪽 다 충족**시킨다.

### 🚫 Google이 "하지 않아도 된다"고 공식 명시한 것 (2026-06 반영)

근거: [ai-optimization-guide § 오해 풀기](G-구글-공식가이드/02-fundamentals-기본/ai-optimization-guide.md)

| 하지 말 것 | Google 입장 | 내부 문서 반영 |
|---|---|---|
| `llms.txt` 등 AI 전용 파일 | **Google 검색은 무시.** 순위·가시성에 영향 0 | D4 §5 → **선택**으로 강등 |
| 콘텐츠 '청킹' | 불필요. 이상적 페이지 길이 없음 | D5 §0 → **Google 제외** 명시 |
| AI 전용 문체 재작성 | 불필요. AI가 동의어·의미 이해 | D5 §0 |
| 진정성 없는 '언급' 확보 | 도움 안 됨 | D5 §0 |
| 구조화 데이터 과집중 | 생성형 AI엔 불필요 (단, **리치 결과용으로는 계속 유효**) | D3 |
| **`FAQPage` 마크업** | 🔴 **2026-06 리치 결과 전면 폐지, 공식 문서 삭제** | D1·D3 → 폐지 표기 |

> 위 항목들은 각 내부 문서에 정정 주석을 넣어 두었다. **A~F를 읽을 때 이 표를 함께 본다.**
> `llms.txt`·청킹은 ChatGPT·Perplexity 등 **Google 외 엔진 대비용 선택 사항**으로만 유효하다.

### ✅ 대신 Google이 하라고 한 것

| 할 일 | 문서 |
|---|---|
| 기술 구조 + 차별화된 고유 콘텐츠 (기본 SEO) | [ai-optimization-guide](G-구글-공식가이드/02-fundamentals-기본/ai-optimization-guide.md) · [creating-helpful-content](G-구글-공식가이드/02-fundamentals-기본/creating-helpful-content.md) |
| **Search Console '생성형 AI 실적 보고서'로 측정** | D5 §6-0 (서드파티 도구는 Google 내부 지표 접근 불가) |
| **에이전트형 환경(AI 에이전트) 대비** 🆕 | D5 §10 — 접근성 트리를 읽으므로 [E1-접근성](E-품질-보안-운영/E1-접근성-WCAG.md)이 곧 대응책 |

---

## 🗺️ 전체 폴더 지도

| 폴더 | 성격 | 문서 수 | 목차 |
|---|---|---|---|
| **A-바이브코딩-방법론** | 작업 방식 | 2 | [↓](#a-바이브코딩-방법론) |
| **B-기술스택-아키텍처** | 기반 설계 | 4 | [↓](#b-기술스택--아키텍처) |
| **C-성능최적화** | 속도 | 6 | [↓](#c-성능-최적화) |
| **D-SEO-GEO** | 검색/AI 최적화 요약 | 5 | [↓](#d-seo--geo--aeo) |
| **E-품질-보안-운영** | 품질·배포·수익화 | 10 | [↓](#e-품질--보안--운영) |
| **F-프로젝트별** | 사이트 유형별 | 4 | [↓](#f-프로젝트별-참고) |
| **G-구글-공식가이드** | 🔴 **1차 출처** | 174 | [전체 목차 →](G-구글-공식가이드/00-목차.md) |
| **H-네이버-공식가이드** | 🔴 **1차 출처** | 55 | [전체 목차 →](H-네이버-공식가이드/00-목차.md) |
| **_archive** | 정리 전 원본 | 42 | 참고용 보관 |

---

## ⚡ 빠른 참조 — "지금 뭘 봐야 하지?"

| 상황 | 참조 순서 |
|---|---|
| **새 프로젝트 시작** | A1 → B1 → B2 → [G/01-essentials](G-구글-공식가이드/01-essentials-필수정책/00-개요.md) → [H/01-02 웹 사이트를 만들 때](H-네이버-공식가이드/01-검색엔진%20최적화%20기초/02-웹%20사이트를%20만들%20때.md) |
| **성능이 안 나옴** | C1 → C2 → C3 → C4 → [G/core-web-vitals](G-구글-공식가이드/04-appearance-검색결과표시/core-web-vitals.md) |
| **기본 SEO 세팅** | D4 → [G/seo-starter-guide](G-구글-공식가이드/02-fundamentals-기본/seo-starter-guide.md) → [G/special-tags](G-구글-공식가이드/03-crawling-indexing-크롤링색인/special-tags.md) → [H/04-02 콘텐츠 마크업](H-네이버-공식가이드/04-HTML%20마크업/02-콘텐츠%20마크업.md) |
| **robots.txt 작성** | [G/create-robots-txt](G-구글-공식가이드/08-crawling-크롤링전문/robots-txt/create-robots-txt.md) → [G/useful-robots-txt-rules](G-구글-공식가이드/08-crawling-크롤링전문/robots-txt/useful-robots-txt-rules.md) → [G/robots-txt-spec](G-구글-공식가이드/08-crawling-크롤링전문/robots-txt/robots-txt-spec.md) → [H/01-03 robots.txt](H-네이버-공식가이드/01-검색엔진%20최적화%20기초/03-robots.txt%20설정하기.md) |
| **사이트맵 / RSS** | [G/sitemaps](G-구글-공식가이드/03-crawling-indexing-크롤링색인/sitemaps/build-sitemap.md) → [H/05-02 RSS·사이트맵](H-네이버-공식가이드/05-웹사이트%20검색연동/02-RSS%20및%20사이트맵%20제출.md) |
| **크롤러 차단 / AI 봇 제어** | [G/overview-google-crawlers](G-구글-공식가이드/08-crawling-크롤링전문/crawlers-fetchers/overview-google-crawlers.md) → [G/google-common-crawlers](G-구글-공식가이드/08-crawling-크롤링전문/crawlers-fetchers/google-common-crawlers.md) (Google-Extended 등) |
| **크롤링이 안 됨 / 서버 과부하** | [G/about-crawling](G-구글-공식가이드/08-crawling-크롤링전문/about-crawling.md) → [G/crawl-budget](G-구글-공식가이드/08-crawling-크롤링전문/crawl-budget.md) → [G/http-status-codes](G-구글-공식가이드/08-crawling-크롤링전문/troubleshooting/http-status-codes.md) |
| **구조화 데이터(JSON-LD)** | D3 → [G/05 전체](G-구글-공식가이드/05-structured-data-구조화데이터/00-개요.md) → [G/sd-policies](G-구글-공식가이드/05-structured-data-구조화데이터/sd-policies.md) → [H/08 전체](H-네이버-공식가이드/08-구조화된%20데이터%20마크업/01-구조화된%20데이터%20소개.md) |
| **네이버 최적화** | D2 → [H 전체 목차](H-네이버-공식가이드/00-목차.md) → [H/10 IndexNow](H-네이버-공식가이드/10-IndexNow/01-IndexNow%20소개.md) |
| **AI 인용 / GEO / AEO** | [G/ai-optimization-guide](G-구글-공식가이드/02-fundamentals-기본/ai-optimization-guide.md) ⭐먼저 → [G/ai-features](G-구글-공식가이드/04-appearance-검색결과표시/ai-features.md) → D5 |
| **JS 렌더링이 색인 안 됨** | [G/javascript-seo-basics](G-구글-공식가이드/03-crawling-indexing-크롤링색인/javascript/javascript-seo-basics.md) → [G/lazy-loading](G-구글-공식가이드/03-crawling-indexing-크롤링색인/javascript/lazy-loading.md) → [H/02-01 JS 최적화](H-네이버-공식가이드/02-검색엔진%20최적화%20고급/01-자바스크립트%20검색%20최적화.md) → B4 |
| **콘텐츠 품질 기준** | [G/creating-helpful-content](G-구글-공식가이드/02-fundamentals-기본/creating-helpful-content.md) → [H/03-02 콘텐츠 권장](H-네이버-공식가이드/03-콘텐츠%20가이드라인/02-콘텐츠%20작성시%20권장%20사항.md) → E8 |
| **글 구조 설계 (스마트데이터샵)** | [F/스마트데이터샵-포스팅구조엔진-V4](F-프로젝트별/스마트데이터샵-포스팅구조엔진-V4.md) → [G/spam-policies](G-구글-공식가이드/01-essentials-필수정책/spam-policies.md) (scaled content) |
| **트래픽이 떨어짐** | [G/debugging-search-traffic-drops](G-구글-공식가이드/06-monitor-debug-모니터링/debugging-search-traffic-drops.md) → [G/core-updates](G-구글-공식가이드/04-appearance-검색결과표시/core-updates.md) → [H/12-02 미노출](H-네이버-공식가이드/12-FAQ/02-웹%20검색%20미노출.md) |
| **다국어 사이트** | E4 → [G/international](G-구글-공식가이드/07-specialty-특화사이트/international/localized-versions.md) |
| **커머스 사이트** | [G/ecommerce](G-구글-공식가이드/07-specialty-특화사이트/ecommerce/00-개요.md) → [G/merchant-listing](G-구글-공식가이드/05-structured-data-구조화데이터/merchant-listing.md) |
| **배포 전 점검** | E9 → [H/06-01 사이트 간단 체크](H-네이버-공식가이드/06-웹사이트%20검증/01-사이트%20간단%20체크.md) |
| **AdSense 수익화** | E10 → [G/avoid-intrusive-interstitials](G-구글-공식가이드/04-appearance-검색결과표시/avoid-intrusive-interstitials.md) |
| **바이브코딩 막힘** | A1 → A2 |

---

## A. 바이브코딩 방법론

AI와 협업하는 작업 방식과 운영 체계.

| 문서 | 내용 | 참조 시점 |
|---|---|---|
| [A1-바이브코딩-핵심원칙](A-바이브코딩-방법론/A1-바이브코딩-핵심원칙.md) | 3레이어 OS · 안티패턴 · 컨텍스트 엔지니어링 · 하네스 | 작업 시작 전, 막힐 때 |
| [A2-바이브코딩-명령어](A-바이브코딩-방법론/A2-바이브코딩-명령어.md) | 슬래시 명령어 · 워크플로우 순서 | 도구 사용법 필요할 때 |

## B. 기술 스택 & 아키텍처

| 문서 | 내용 | 함께 볼 공식 문서 |
|---|---|---|
| [B1-기술스택-고정](B-기술스택-아키텍처/B1-기술스택-고정.md) | Astro · CF Pages · Tailwind · TypeScript · 금지 목록 | [G/technical](G-구글-공식가이드/01-essentials-필수정책/technical.md) |
| [B2-디렉토리구조-IA](B-기술스택-아키텍처/B2-디렉토리구조-IA.md) | 폴더 구조 · URL 설계 · 사이트맵 · 내비게이션 | [G/url-structure](G-구글-공식가이드/03-crawling-indexing-크롤링색인/url-structure.md) · [H/02-02 URL](H-네이버-공식가이드/02-검색엔진%20최적화%20고급/02-검색%20친화적인%20URL%20구축하기.md) |
| [B3-디자인시스템](B-기술스택-아키텍처/B3-디자인시스템.md) | 디자인 토큰 · 반응형 · 컴포넌트 · 다크 모드 | [H/04-03 모바일 사용성](H-네이버-공식가이드/04-HTML%20마크업/03-모바일%20사용성.md) |
| [B4-렌더링-아키텍처](B-기술스택-아키텍처/B4-렌더링-아키텍처.md) | SSG/SSR/ISR · Astro Islands · 데이터 페칭 | [G/javascript-seo-basics](G-구글-공식가이드/03-crawling-indexing-크롤링색인/javascript/javascript-seo-basics.md) |

## C. 성능 최적화

| 문서 | 내용 | 함께 볼 공식 문서 |
|---|---|---|
| [C1-PageSpeed-전략](C-성능최적화/C1-PageSpeed-전략.md) | CWV 임계값 · LCP/INP/CLS · 100점 로드맵 | [G/core-web-vitals](G-구글-공식가이드/04-appearance-검색결과표시/core-web-vitals.md) · [G/page-experience](G-구글-공식가이드/04-appearance-검색결과표시/page-experience.md) |
| [C2-자바스크립트-최적화](C-성능최적화/C2-자바스크립트-최적화.md) | 번들 한도 · Islands · 코드 스플리팅 · INP 패턴 | [G/lazy-loading](G-구글-공식가이드/03-crawling-indexing-크롤링색인/javascript/lazy-loading.md) |
| [C3-폰트-최적화](C-성능최적화/C3-폰트-최적화.md) | Pretendard · 셀프 호스팅 · 서브셋 · CLS 0 | — |
| [C4-이미지-최적화](C-성능최적화/C4-이미지-최적화.md) | astro:assets · AVIF · LCP 이미지 · alt | [G/google-images](G-구글-공식가이드/04-appearance-검색결과표시/google-images.md) |
| [C5-캐싱-전송](C-성능최적화/C5-캐싱-전송.md) | _headers · Brotli · HTTP/3 · Early Hints | [H/01-08 HTTP 규약](H-네이버-공식가이드/01-검색엔진%20최적화%20기초/08-HTTP%20규약%28Protocol%29.md) |
| [C6-성능예산](C-성능최적화/C6-성능예산.md) | 자원별 한도 · PR 자동 검증 · 회귀 방지 | — |

## D. SEO · GEO · AEO

> ⚠️ 이 폴더는 **요약본**이다. 실제 스펙은 반드시 G/H 공식 문서에서 확인한다.

| 문서 | 내용 | 대응 공식 문서 |
|---|---|---|
| [D1-구글-SEO](D-SEO-GEO/D1-구글-SEO.md) | E-E-A-T · 크롤링 · 핵심 업데이트 · AI 콘텐츠 정책 | → [G 전체](G-구글-공식가이드/00-목차.md) |
| [D2-네이버-SEO](D-SEO-GEO/D2-네이버-SEO.md) | C-Rank · D.I.A. · Yeti · 서치어드바이저 · 메타 키워드 | → [H 전체](H-네이버-공식가이드/00-목차.md) |
| [D3-구조화데이터-JSON-LD](D-SEO-GEO/D3-구조화데이터-JSON-LD.md) | Article · Organization · BreadcrumbList · FAQ | → [G/05](G-구글-공식가이드/05-structured-data-구조화데이터/00-개요.md) · [H/08](H-네이버-공식가이드/08-구조화된%20데이터%20마크업/01-구조화된%20데이터%20소개.md) |
| [D4-메타데이터-기본SEO](D-SEO-GEO/D4-메타데이터-기본SEO.md) | meta 태그 · robots.txt · sitemap · llms.txt · RSS | → [G/special-tags](G-구글-공식가이드/03-crawling-indexing-크롤링색인/special-tags.md) · [H/04-01](H-네이버-공식가이드/04-HTML%20마크업/01-선호%20URL%20및%20로봇%20메타%20태그.md) |
| [D5-GEO-AI인용최적화](D-SEO-GEO/D5-GEO-AI인용최적화.md) | **Google 외** AI 엔진 인용 전략 · FOX Method · 에이전트 대비 | → [G/ai-optimization-guide](G-구글-공식가이드/02-fundamentals-기본/ai-optimization-guide.md) ⭐ Google엔 §0 적용범위 먼저 확인 |

## E. 품질 · 보안 · 운영

| 문서 | 내용 | 함께 볼 공식 문서 |
|---|---|---|
| [E1-접근성-WCAG](E-품질-보안-운영/E1-접근성-WCAG.md) | WCAG 2.2 AA · 컬러 대비 · 키보드 · axe | — |
| [E2-보안](E-품질-보안-운영/E2-보안.md) | 보안 헤더 · CSP · 비밀 관리 · OWASP | [G/security](G-구글-공식가이드/06-monitor-debug-모니터링/security/00-개요.md) |
| [E3-분석-동의](E-품질-보안-운영/E3-분석-동의.md) | GA4 · Consent Mode v2 · CF Analytics | [G/search-console-start](G-구글-공식가이드/06-monitor-debug-모니터링/search-console-start.md) |
| [E4-다국어-i18n](E-품질-보안-운영/E4-다국어-i18n.md) | hreflang · 라우팅 · 번역 | [G/international](G-구글-공식가이드/07-specialty-특화사이트/international/00-개요.md) |
| [E5-테스트-QA](E-품질-보안-운영/E5-테스트-QA.md) | Vitest · Playwright · Lighthouse CI | [G/website-testing](G-구글-공식가이드/03-crawling-indexing-크롤링색인/website-testing.md) |
| [E6-배포](E-품질-보안-운영/E6-배포.md) | CF Pages · GitHub Actions · Deploy Hook | [H/10 IndexNow](H-네이버-공식가이드/10-IndexNow/03-페이지%20갱신%20요청하기.md) |
| [E7-외부API](E-품질-보안-운영/E7-외부API.md) | 빌드 타임 호출 · Content Collections | [H/09 제휴 API](H-네이버-공식가이드/09-제휴%20API/01-수집요청%20API%20명세%20및%20연동.md) |
| [E8-콘텐츠운영](E-품질-보안-운영/E8-콘텐츠운영.md) | 콘텐츠 추가·수정·관리 절차 | [G/creating-helpful-content](G-구글-공식가이드/02-fundamentals-기본/creating-helpful-content.md) · [H/03](H-네이버-공식가이드/03-콘텐츠%20가이드라인/02-콘텐츠%20작성시%20권장%20사항.md) |
| [E9-출시체크리스트](E-품질-보안-운영/E9-출시체크리스트.md) | 출시 전 필수 확인 항목 전체 | [H/06-01 사이트 간단 체크](H-네이버-공식가이드/06-웹사이트%20검증/01-사이트%20간단%20체크.md) |
| [E10-수익화-AdSense](E-품질-보안-운영/E10-수익화-AdSense.md) | AdSense 정책 · 광고 배치 · 성능 유지 | [G/avoid-intrusive-interstitials](G-구글-공식가이드/04-appearance-검색결과표시/avoid-intrusive-interstitials.md) |

## F. 프로젝트별 참고

| 문서 | 내용 |
|---|---|
| [스마트데이터샵-포스팅구조엔진-V4](F-프로젝트별/스마트데이터샵-포스팅구조엔진-V4.md) | smartdatashop.kr 글 구조 규약 — 검색의도 TYPE A~H · 중복 제거 · verify:structure 게이트 (scaled content 회피) |
| [포스팅-아키텍처](F-프로젝트별/포스팅-아키텍처.md) | 콘텐츠 사이트 10 레이어 아키텍처 (머니룩 — smartdatashop 글 구조에 적용 금지) |
| [기능형웹사이트](F-프로젝트별/기능형웹사이트.md) | 기능형 애드센스 사이트 진단 |
| [MISSION-PIVOT](F-프로젝트별/MISSION-PIVOT.md) | 머니룩 미션 피벗 이력 |

## G. Google 검색 공식 가이드 🔴

**174문서 · 1차 출처** — [👉 전체 목차 열기](G-구글-공식가이드/00-목차.md)

| 섹션 | 수 | 핵심 |
|---|---|---|
| [01-essentials-필수정책](G-구글-공식가이드/01-essentials-필수정책/) | 3 | 기술 요구사항 · 스팸 정책 |
| [02-fundamentals-기본](G-구글-공식가이드/02-fundamentals-기본/) | 10 | SEO 기본 가이드 · **AI 최적화 공식 안내** · E-E-A-T |
| [03-crawling-indexing-크롤링색인](G-구글-공식가이드/03-crawling-indexing-크롤링색인/) | 41 | 사이트맵 · canonical · JS SEO · 모바일 · AMP |
| [04-appearance-검색결과표시](G-구글-공식가이드/04-appearance-검색결과표시/) | 31 | **Core Web Vitals** · 랭킹 시스템 · 스니펫 · Discover |
| [05-structured-data-구조화데이터](G-구글-공식가이드/05-structured-data-구조화데이터/) | 39 | JSON-LD 전 타입 + 정책 |
| [06-monitor-debug-모니터링](G-구글-공식가이드/06-monitor-debug-모니터링/) | 14 | Search Console · 트래픽 진단 · 보안 |
| [07-specialty-특화사이트](G-구글-공식가이드/07-specialty-특화사이트/) | 15 | 커머스 · 다국어 |
| [08-crawling-크롤링전문](G-구글-공식가이드/08-crawling-크롤링전문/) 🆕 | 21 | **robots.txt 사양 · 크롤러 전체 목록 · 크롤링 예산 · HTTP 오류** |

> 🆕 **2026년 Google 문서 구조 변경**: 크롤링 문서가 `/search/docs`에서 **별도 `/crawling/docs` 섹션으로 분리**됐다.
> robots.txt 작성·크롤러 user-agent·크롤링 예산은 이제 **08 섹션**을 본다 (03이 아님).

## H. 네이버 서치어드바이저 공식 가이드 🔴

**55문서 · 1차 출처** — [👉 전체 목차 열기](H-네이버-공식가이드/00-목차.md)

| 섹션 | 수 | 핵심 |
|---|---|---|
| [01-검색엔진 최적화 기초](H-네이버-공식가이드/01-검색엔진%20최적화%20기초/) | 8 | robots.txt(Yeti) · 사이트 이전 · HTTP |
| [02-검색엔진 최적화 고급](H-네이버-공식가이드/02-검색엔진%20최적화%20고급/) | 5 | JS 최적화 · URL · 색인 효율 |
| [03-콘텐츠 가이드라인](H-네이버-공식가이드/03-콘텐츠%20가이드라인/) | 2 | 스팸 사례 · 작성 권장 |
| [04-HTML 마크업](H-네이버-공식가이드/04-HTML%20마크업/) | 4 | canonical · **meta keywords** · 모바일 · 파비콘 |
| [05-웹사이트 검색연동](H-네이버-공식가이드/05-웹사이트%20검색연동/) | 2 | RSS · 사이트맵 제출 |
| [06-웹사이트 검증](H-네이버-공식가이드/06-웹사이트%20검증/) | 2 | 사이트 체크 · URL 검사 |
| [07-SEO 리포트](H-네이버-공식가이드/07-SEO%20리포트/) | 5 | 노출·진단·최적화 지표 |
| [08-구조화된 데이터 마크업](H-네이버-공식가이드/08-구조화된%20데이터%20마크업/) | 15 | 네이버 지원 스키마 전 타입 |
| [09-제휴 API](H-네이버-공식가이드/09-제휴%20API/) | 1 | 수집요청 API |
| [10-IndexNow](H-네이버-공식가이드/10-IndexNow/) | 4 | **즉시 색인 요청** |
| [11-네이버 검색 교육 자료](H-네이버-공식가이드/11-네이버%20검색%20교육%20자료/) | 2 | 개념 학습 |
| [12-FAQ](H-네이버-공식가이드/12-FAQ/) | 5 | 미노출·소유확인 문제 해결 |

---

## 📦 _archive

정리 전 원본 42문서 보관. **작업 근거로 사용하지 않는다.** 과거 결정의 맥락을 추적할 때만 참조.

---

## 🔄 문서 갱신

Google 공식 문서는 원문이 자주 바뀐다. **최종 동기화: 2026-07-22**

확인 순서:

1. [최신 문서 업데이트](https://developers.google.com/search/updates?hl=ko) — 검색 문서 변경 이력
2. [크롤링 변경 로그](G-구글-공식가이드/08-crawling-크롤링전문/changelog.md) — 크롤링 섹션 변경 이력
3. 바뀐 문서만 골라 다시 받기 (현재 폴더 구조에 맞춰 저장됨):

```bash
python "docs/references/G-구글-공식가이드/_tools/fetch_missing.py" https://developers.google.com/search/docs/appearance/snippet
```

인자를 주지 않으면 기본 누락 목록을 받는다. `/search/docs`와 `/crawling/docs` 양쪽을 지원한다.
받은 뒤에는 이 목차와 [G 목차](G-구글-공식가이드/00-목차.md)의 문서 수·항목을 함께 갱신한다.

### 2026-07-22 동기화에서 반영된 것

- **신규 섹션 `08-crawling-크롤링전문` 21문서** — Google이 크롤링 문서를 별도 섹션으로 분리한 것을 반영.
  기존 아카이브에 아예 없던 **robots.txt 정식 사양·작성법·규칙 모음**, **Google 크롤러 user-agent 전체 목록**,
  **크롤링 예산**, **속성 탐색(faceted navigation)**, **봇 요청 서명(web-bot-auth, 베타)** 포함.
- `package-tracking` 자격 요건 갱신분(2026-07-14) 재수집.
- 리다이렉트로 중복된 5문서 정리 (`search-result-features`·`practice-problems`·`what-is-hacked`·`safesearch`·`mobile` 랜딩).
- **2026-06-15 업데이트 2건을 내부 문서(D1·D3·D4·D5)에 반영**:
  llms.txt 무효 명시 → D4 §5 선택 강등 / FAQ 리치 결과 폐지 → D1 §12·D3 §3-3 폐지 표기.
- **공식 가이드에만 있고 내부에 없던 2개 주제 신규 작성**:
  Search Console 생성형 AI 실적 보고서(D5 §6-0), 에이전트형 환경 대비(D5 §10).
