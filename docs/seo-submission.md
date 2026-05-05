# smartdatashop.kr — 검색엔진 등록 & SEO 제출 플레이북

> 대상: 운영자(GitHub `0gam24`, Cloudflare 계정 `kjh791213@gmail.com`)
> 사이트: <https://smartdatashop.kr> (Cloudflare Pages, project `smartdatashop`, repo `0gam24/smartdatashop`)
> 목표: Google · Naver · Bing · Daum 색인 + Google News Publisher Center 신청
> 전제: 사이트는 이미 배포 완료(19 pages, sitemap-index.xml, news-sitemap.xml, robots.txt, RSS feed.xml, 5 카테고리 피드).
> 본 문서는 **코드 변경 없이** 브라우저 클릭 + DNS 설정만으로 끝나는 작업만 담는다.

---

## 0. 시작 전 준비물 (5분)

- [ ] Google 계정 (Search Console + Publisher Center 공용)
- [ ] Naver 계정 (없으면 <https://nid.naver.com/user2/joinGlobal.naver>에서 생성)
- [ ] Microsoft 계정 (Bing Webmaster Tools, Google 계정으로 로그인 가능)
- [ ] Daum/Kakao 계정 (Daum 등록 시 필요)
- [ ] Cloudflare 대시보드 접속: <https://dash.cloudflare.com/> (이메일 `kjh791213@gmail.com`)

**막혔을 때**: Cloudflare 로그인 시 2FA 코드는 `Authy`/`Google Authenticator` 백업 확인.

---

## 1. Google Search Console 등록

> URL: <https://search.google.com/search-console>
> 예상 소요: **20분** (DNS 전파 포함)

### 1-1. 속성 추가

1. Search Console 접속 → 좌측 상단 드롭다운 → **속성 추가**
2. **도메인** 옵션 선택 (URL 접두어 아님). 입력값: `smartdatashop.kr`
   - 도메인 속성은 `http`, `https`, `www`, 모든 서브도메인을 한 번에 커버한다.

### 1-2. 소유권 확인 — 방법 비교

| 방법 | 장점 | 단점 | 권장 |
|---|---|---|---|
| **DNS TXT** | 도메인 속성 가능, 영구적 | DNS 전파 대기 (보통 5분, 최대 24h) | **★ 채택** |
| HTML 파일 업로드 | 즉시 검증 | URL 접두어 속성만 가능, `public/`에 파일 추가 필요 (코드 변경) | × |
| HTML 메타태그 | 즉시 검증 | URL 접두어 속성만, BaseLayout 수정 필요 (코드 변경) | × |

> 본 사이트는 **이미 배포된 Cloudflare Pages**이고 코드 변경을 피하려면 DNS TXT가 유일한 깔끔한 선택이다.

### 1-3. Cloudflare에 TXT 레코드 추가

1. <https://dash.cloudflare.com/> → **Websites** → `smartdatashop.kr` 선택
2. 좌측 메뉴 **DNS → Records → Add record**
3. 입력:
   - Type: `TXT`
   - Name: `@` (루트 도메인)
   - Content: Search Console이 발급한 `google-site-verification=xxxxxxxxxxxxx`
   - TTL: `Auto`
   - Proxy status: **DNS only (회색 구름)** — TXT는 프록시 불가
4. **Save** → Search Console로 돌아가 **확인** 클릭

**막혔을 때**: 5분 대기 후 재시도. 그래도 실패 시 `dig TXT smartdatashop.kr +short`로 전파 확인.

### 1-4. 사이트맵 제출

좌측 **Sitemaps** 메뉴 → 두 개 모두 등록:

```
https://smartdatashop.kr/sitemap-index.xml
https://smartdatashop.kr/news-sitemap.xml
```

`feed.xml`은 사이트맵이 아니므로 등록하지 않는다 (Naver에 등록).

### 1-5. 색인 요청 (URL 검사 도구)

좌측 **URL 검사** → 한 번에 한 URL씩, 우선순위:

1. `https://smartdatashop.kr/`
2. `https://smartdatashop.kr/about/`
3. `https://smartdatashop.kr/editorial-policy/`
4. `https://smartdatashop.kr/authors/junhyuk-kim/`

검사 후 **색인 생성 요청**. 24h 내 1회/URL 제한.

### 1-6. 모니터링 일정

- **주 1회**: Coverage(색인 범위) 리포트에서 `오류`/`제외` 페이지 확인
- **월 1회**: Core Web Vitals (LCP/INP/CLS) — 모바일/데스크톱
- **분기 1회**: 검색어 분석 (Performance) → 카테고리별 CTR

**막혔을 때**: 색인 거부 시 robots.txt에 `Disallow: /`가 있는지 먼저 확인.

---

## 2. Naver Search Advisor (네이버 서치어드바이저)

> URL: <https://searchadvisor.naver.com/>
> 예상 소요: **15분**

### 2-1. 사이트 등록

1. <https://searchadvisor.naver.com/> 접속 → 우측 상단 **로그인** (Naver ID)
2. 상단 **웹마스터 도구** 클릭
3. 사이트 URL 입력: `https://smartdatashop.kr` → **확인**

### 2-2. 소유권 확인 — 방법 선택

| 방법 | 비고 |
|---|---|
| HTML 메타태그 | BaseLayout `<head>`에 한 줄 추가 → **코드 변경 필요** |
| HTML 파일 업로드 | `public/`에 파일 추가 → **코드 변경 필요** |
| **DNS TXT** | Cloudflare 대시보드에서 처리 → **★ 채택** (코드 변경 0) |

> 운영자 제약(코드 변경 회피)에 맞춰 **DNS TXT 권장**. Naver는 `naver-site-verification=...` 형식 TXT를 지원한다. (1번과 동일하게 Cloudflare에서 추가)

만약 DNS TXT 옵션이 안 보인다면 차선책으로 HTML 메타태그 — 단 한 줄(`<meta name="naver-site-verification" content="..." />`)이라 BaseLayout에 추가 가능. 이 경우는 별도 PR로 진행.

### 2-3. 사이트맵 / RSS 제출

좌측 **요청 → 사이트맵 제출**:

```
https://smartdatashop.kr/sitemap-index.xml
```

좌측 **요청 → RSS 제출**:

```
https://smartdatashop.kr/feed.xml
```

> RSS는 Naver의 "콘텐츠 신선도" 시그널 핵심 채널. 새 글 발행 시 즉각 반영된다.

### 2-4. News Sitemap (뉴스 신선도 시그널)

Naver SA는 별도 News Sitemap 입력란이 없으므로 `news-sitemap.xml`도 일반 사이트맵 메뉴에 등록:

```
https://smartdatashop.kr/news-sitemap.xml
```

### 2-5. robots.txt 검증 — Yeti 봇

좌측 **검증 → robots.txt** → URL 입력 후 **수집** 클릭. 결과에 `Yeti: Allow`가 보이면 OK.

> 본 사이트는 이미 `User-agent: Yeti`/`Allow: /`로 설정 완료.

### 2-6. 네이버 뷰탭 등록 가능성

- "뷰탭"은 블로그·카페 중심 → 일반 도메인 직접 등록 불가
- **현실적 전략**: 운영자가 네이버 블로그(`blog.naver.com/...`)에 동일 기사 요약 + 원문 링크를 cross-post → 뷰탭 노출
- 장기 전략이지 즉각 SEO 작업은 아님

**막혔을 때**: 사이트맵 "성공" 떠도 색인은 1~2주 걸린다. 색인 현황은 **리포트 → 사이트 최적화** 메뉴에서 확인.

---

## 3. Bing Webmaster Tools

> URL: <https://www.bing.com/webmasters>
> 예상 소요: **5분** (Search Console 동기화 활용 시)

### 3-1. Google Search Console 임포트 (최단 경로)

1. <https://www.bing.com/webmasters> → Google 계정으로 로그인
2. **Import your sites from Google Search Console** 버튼 클릭
3. Search Console 권한 허용 → `smartdatashop.kr` 선택 → **Import**
4. 사이트맵·소유권 모두 자동 동기화

> 1번을 끝낸 직후라면 **5분이면 끝남.** 별도 DNS 작업 불필요.

### 3-2. IndexNow API 연동 (Cloudflare 통합)

Cloudflare는 IndexNow를 네이티브 지원한다 (Bing/Yandex 즉시 색인 핑).

1. Cloudflare 대시보드 → `smartdatashop.kr` → **Caching → Configuration**
2. **Crawler Hints** 섹션 → **Enable**
3. Bing Webmaster Tools → **Settings → Configure My Site → IndexNow** → 활성 확인

> 새 글 배포 시 Cloudflare가 자동으로 IndexNow 핑을 보낸다. 코드 변경 0.

**막혔을 때**: Crawler Hints 항목이 안 보이면 Cloudflare 플랜 확인 (Free 플랜도 지원하지만 위치가 가끔 바뀐다 — `Speed → Optimization`도 확인).

---

## 4. Daum 검색 등록

> URL: <https://register.search.daum.net/index.daum>
> 예상 소요: **5분**

### 4-1. 등록 절차

1. 위 URL 접속 → **신규 등록 → 사이트 등록**
2. URL: `https://smartdatashop.kr` 입력
3. 분류: `뉴스/미디어` 또는 `정보/컨텐츠`
4. 사이트 설명 (200자 이내):
   ```
   스마트데이터샵 — 1차 출처 데이터 저널. 정책·세금·금융·시장·통계·AI 분야 데이터를 검증·시각화하여 한국 독자에게 제공.
   ```
5. 운영자 정보 입력 → 약관 동의 → 제출

### 4-2. 우선순위

- 다음 검색 점유율은 한 자릿수지만 일부 시니어/공무원 사용자층 존재
- 1회 등록 후 추가 작업 불필요 (자동 크롤링)
- **카카오뷰는 별도 채널** (kakao.com 계정으로 채널 개설 필요, 본 SEO 작업 범위 밖)

**막혔을 때**: 등록 후 영업일 기준 7~14일 심사. 거절되면 사이트 설명을 더 구체적으로 바꿔 재신청.

---

## 5. Google News Publisher Center

> URL: <https://publishercenter.google.com/>
> 예상 소요: **신청 30분 + 심사 2~4주**

### 5-1. 신청 전 필수 점검표

| 항목 | 경로 | 상태 |
|---|---|---|
| About 페이지 (운영자 신원) | `/about/` | ✓ |
| 편집정책 | `/editorial-policy/` | ✓ |
| AI 정책 | `/ai-policy/` | ✓ |
| 저자 프로필 | `/authors/junhyuk-kim/` | ✓ |
| 정정 이력 | `/corrections/` | ✓ |
| 연락처 | `/contact/` | ✓ |
| 개인정보처리방침 | `/privacy/` | ✓ |
| 이용약관 | `/terms/` | ✓ |
| News Sitemap | `/news-sitemap.xml` | ✓ |
| JSON-LD NewsArticle 구조화 데이터 | (전 기사) | ✓ |
| **기사 30~50편 발행** | — | **⚠ 운영자 보충 필요** (현재 6편) |
| **일관된 발행 빈도** | — | **⚠ 운영자 작성 계획 필요** (예: 주 3편 × 4주) |

> Publisher Center는 콘텐츠 깊이를 본다. 6편으로는 거절 가능성 매우 높음. **30편 이상 + 최소 4주 발행 이력** 확보 후 신청 권장.

### 5-2. 신청 단계

1. <https://publishercenter.google.com/> 로그인 (Google 계정)
2. **Add publication** → Publication name: `Smartdatashop / 스마트데이터샵`
3. Property URL: `https://smartdatashop.kr`
4. **Google News** 탭 활성화 → **Sections** 추가:
   - 정책 (Policy)
   - 세금 (Tax)
   - 금융 (Finance)
   - 시장 (Market)
   - 통계 (Statistics)
   - AI
   - 각 섹션의 RSS feed URL 매핑 (`/feeds/policy.xml` 등 — 카테고리 피드 5개 + 메인 1개)
5. **Publication settings**:
   - Country: South Korea
   - Primary language: Korean
   - Logo: 1000×1000 정사각형 + 200×40 가로형 (각각 PNG, 투명 배경)
6. **Editorial contact** + **Technical contact** 입력
7. **Review and publish** → 제출

### 5-3. 심사 & 거절 시 재신청

- 평균 2~4주, 길면 6주
- 거절 사유 메일로 통보. 흔한 거절 사유:
  - 콘텐츠 부족 (해결: 기사 추가)
  - 저자 정보 불충분 (해결: 저자 페이지 강화)
  - 사이트 정책 페이지 누락 (해결: 본 사이트는 이미 충족)
- 거절 후 **30일** 대기 → 문제 보완 → 재신청

**막혔을 때**: 거절 메일을 그대로 운영자가 보관할 것. 재신청 폼에 "이전 거절 이후 변경사항"을 명시해야 통과율이 오른다.

---

## 6. Cloudflare Web Analytics

> 무료, 쿠키 사용 X, GDPR 친화
> 예상 소요: **3분**

### 6-1. 활성화

1. <https://dash.cloudflare.com/> → 좌측 상단 **Analytics & Logs → Web Analytics**
2. **Add a site** → `smartdatashop.kr` 선택
3. **Automatic Setup** 옵션 선택
   - Cloudflare Pages이고 DNS가 프록시 상태(주황 구름)면 자동 활성화
   - Beacon JS 코드 삽입 불필요 → 코드 변경 0

### 6-2. 수동 Beacon 코드 (Plan B)

자동 모드가 작동하지 않을 때만 — 별도 PR로 BaseLayout에 한 줄 추가:

```html
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
```

> 본 작업은 운영자가 자동 모드로 먼저 시도하고, 데이터가 24h 내 안 들어오면 수동으로 전환.

**막혔을 때**: Cloudflare Pages는 기본적으로 자동 동작. 데이터 안 보이면 DNS가 `Proxied (orange cloud)`인지 먼저 확인.

---

## 7. 사이트 헬스 모니터링 체크리스트 (월 1회)

매월 1일 1시간 블록 잡고 다음 5개 점검:

- [ ] **Google Search Console → Core Web Vitals**: 모바일 LCP < 2.5s, INP < 200ms, CLS < 0.1
- [ ] **Naver SearchAdvisor → 리포트 → 사이트 최적화**: 색인 페이지 수가 sitemap 항목 수의 80%↑
- [ ] **깨진 링크**: <https://smartdatashop.kr/sitemap-index.xml>를 `https://www.xml-sitemaps.com/validate-xml-sitemap.html`에 입력 → 검증
- [ ] **robots.txt 정합성**: <https://smartdatashop.kr/robots.txt>가 200 응답 + 모든 봇(`*`, `Googlebot`, `Yeti`, `Bingbot`) 정책 명시
- [ ] **GSC Coverage 리포트**: `오류` 0건 유지, `제외` 사유 검토

**막혔을 때**: Core Web Vitals 빨강 → Cloudflare **Speed → Optimization**에서 Auto Minify, Brotli, Early Hints 활성화 확인.

---

## 8. 1차 출처 인용 가능성 — 미디어 사이트 등록 (장기)

본 사이트의 차별점인 "1차 출처 데이터 저널" 포지션을 살리려면 미디어 생태계 신뢰도가 필요하다.

### 8-1. 한국언론진흥재단 BIGKinds (옵션)

- URL: <https://www.bigkinds.or.kr/>
- 인터넷신문 등록 후 BIGKinds 콘텐츠 파트너 신청 가능
- 인터넷신문 등록 선결: 관할 지자체에 **인터넷신문 등록증** 발급 신청 (취재기자 3인 이상 요건 등)
- **현 단계에서는 보류** — 1인 운영 단계에서는 요건 미충족. 사이트가 자리잡고 기자 충원 후 추진.

### 8-2. 한국언론학회 (장기 신뢰도)

- URL: <https://www.comm.or.kr/>
- 개인 회원 가입 → 학술 네트워크 진입
- 즉각적 SEO 효과는 없지만 인용 가능성 + 외부 백링크 자산
- 운영자 개인 회원 등록 권장 (연회비 발생)

---

## 최단 경로 — 1시간 안에 끝내는 핵심 5개 작업

오늘 1시간만 쓸 수 있다면 **이 순서대로**:

1. **Google Search Console** — 도메인 속성 추가 + Cloudflare DNS TXT 추가 + 사이트맵 2개 제출 (20분) → §1
2. **Naver Search Advisor** — 사이트 등록 + DNS TXT 검증 + sitemap-index.xml + feed.xml + news-sitemap.xml 제출 (15분) → §2
3. **Bing Webmaster Tools** — Google Search Console에서 Import (5분) → §3-1
4. **Cloudflare IndexNow** — Caching → Crawler Hints **Enable** (2분) → §3-2
5. **Cloudflare Web Analytics** — Add a site → Automatic Setup (3분) → §6-1

> 합계 약 **45분**. 나머지 15분은 1번에서 우선순위 4개 URL `색인 요청` 클릭에 쓴다.
>
> 그 다음 단계(Daum 등록, Publisher Center 신청, 학회 가입)는 시간 여유 있을 때 별도 진행.

---

## 부록 — 등록 URL 빠른 참조

| 서비스 | URL |
|---|---|
| Google Search Console | <https://search.google.com/search-console> |
| Naver Search Advisor | <https://searchadvisor.naver.com/> |
| Bing Webmaster Tools | <https://www.bing.com/webmasters> |
| Daum 검색 등록 | <https://register.search.daum.net/index.daum> |
| Google News Publisher Center | <https://publishercenter.google.com/> |
| Cloudflare 대시보드 | <https://dash.cloudflare.com/> |
| Cloudflare Web Analytics | <https://dash.cloudflare.com/?to=/:account/web-analytics> |
| Sitemap 검증 도구 | <https://www.xml-sitemaps.com/validate-xml-sitemap.html> |
| BIGKinds (참고) | <https://www.bigkinds.or.kr/> |
| 한국언론학회 (참고) | <https://www.comm.or.kr/> |

---

*문서 갱신일: 2026-05-05 — 운영자: GitHub `0gam24` / Cloudflare `kjh791213@gmail.com`*
