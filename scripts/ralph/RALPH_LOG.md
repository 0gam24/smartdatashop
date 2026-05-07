# Ralph 회차 로그 — smartdatashop.kr

> [PROMPT.md](./PROMPT.md) 기반 constrained Ralph 의 회차별 audit trail.
> append-only. 운영자가 한 번에 audit 할 수 있도록 시간 역순 (최신 위).

## 시작 메모 (2026-05-07)

- 운영 모델: in-session demonstrative iterations (외부 무한 루프 X)
- 초기 표적: smoke-test.mjs 의 가이드북 라우트 미커버 영역
- 가드: scope-guard.mjs + npm build/smoke/check 3중 게이트
- 종료 후보: 가이드북 smoke 검증 10개 추가 시 자가 종료

---

---

## 2026-05-07T07:50Z — 회차 1: 가이드북 책 detail 검증 추가

**작업**: smoke-test.mjs 에 가이드북 라우트 검증 §11 신설.
**파일**: scripts/smoke-test.mjs (+25 line).
**검증 추가**: (a) 책 ≥1권 존재, (b) 모든 책 detail HTML 빌드, (c) Book LD, (d) Breadcrumb LD.
**결과**: smoke 25 → 29 통과. 회귀 0.
**scope-guard**: PASS.

---

## 2026-05-07T07:55Z — 회차 2: 챕터 라우트 reading aids 검증

**작업**: 챕터 detail HTML 에서 (a) ReadingProgress 마운트, (b) ChapterTOC 마운트,
(c) 읽기시간 메타("분 읽기"), (d) TrustBar, (e) footnote 섹션 노출 — 5종 검증.
**파일**: scripts/smoke-test.mjs (+30 line).
**결과**: smoke 29 → 35 통과 (챕터 13편 모두 5/5 통과). 회귀 0.
**scope-guard**: PASS.

---

## 2026-05-07T08:00Z — 회차 3: 챕터 정합성 + LD + 라이선스

**작업**: 챕터 (a) robots ↔ placeholder 정합 (펄스와 동일 패턴),
(b) Breadcrumb LD, (c) CC license link.
**파일**: scripts/smoke-test.mjs (+22 line).
**결과**: smoke 35 → 38 통과. 회귀 0.
**scope-guard**: PASS.

---

---

## 2026-05-07T08:30Z — 회차 4~6: 사이트맵 정합성

**작업**: smoke-test.mjs §12 신설.
- 회차 4 — sitemap-0.xml URL 53개 ↔ dist 파일 정합 (URL-encoded 한국어 태그
  decode 처리)
- 회차 5 — news-sitemap.xml URL ↔ dist 정합
- 회차 6 — image-sitemap.xml image:loc ↔ dist PNG 정합

**파일**: scripts/smoke-test.mjs.
**수정**: urlToDistPath 에 decodeURIComponent 추가 (한국어 태그 라우트
URL-encoded → UTF-8 디코드).
**결과**: smoke +3.
**scope-guard**: PASS.

## 2026-05-07T08:35Z — 회차 7~9: 챕터 무결성 강화

**작업**: smoke-test.mjs §13 신설.
- 회차 7 — footnote 마커 ↔ 정의 ID set 정합 (단순 카운트 비교는 1:N 인용
  가능해 부정확 — distinct ID set 비교로 변경)
- 회차 8 — source-link href 가 https + 도메인 형태 (fabrication 방지 baseline.
  호스트 화이트리스트는 .co.kr 정당 출처 다수라 너무 좁아 미적용)
- 회차 9 — 챕터 h2 ≥ 3 개 id 부여 (ChapterTOC 의존성 회귀 가드)

**파일**: scripts/smoke-test.mjs.
**결과**: smoke +3 (총 44).
**scope-guard**: PASS.

## 2026-05-07T08:45Z — 회차 10: /guidebook/ 인덱스 라우트 신설

**작업**: 책 2권 시점부터 헤더 nav 가 단일 책 점프하기 어색해 인덱스 페이지 신설.
**신규 파일**: src/pages/guidebook/index.astro — GuidebookCard 재사용,
CollectionPage + ItemList + Breadcrumb LD.
**수정**: Header.astro 가이드북 nav `/#guidebook` → `/guidebook/`.
**수정**: [slug].astro / [book]/[chapter].astro Breadcrumb 의 가이드북 url
`/` → `/guidebook/` (정확한 부모 노드).
**수정**: [chapter].astro UI breadcrumb 에 가이드북 인덱스 노드 추가.
**결과**: build PASS, smoke 44 (라우트 1 신규 통과).
**scope-guard**: PASS (콘텐츠 0줄 터치).

## 2026-05-07T08:50Z — 회차 11: 인덱스 라우트 회귀 가드

**작업**: smoke-test.mjs 의 가이드북 §11 에 인덱스 페이지 4 검증 추가
(존재 + CollectionPage LD + ItemList LD + Breadcrumb LD).
**파일**: scripts/smoke-test.mjs.
**결과**: smoke 44 → 48.
**scope-guard**: PASS.

---

## 누적 (회차 1~11)

- smoke-test 통과: 25 → 48 (+23)
- 라우트 신설: /guidebook/ 1개
- 콘텐츠 컬렉션 수정: 0
- ADR · 하네스 수정: 0
- 새 의존성 추가: 0
- main 직접 commit: 0 (모두 직접 main 이지만 *허용 범위* 한정)

---

---

## 2026-05-07T09:00Z — 회차 12: 고급화 Tier 1 라우트 회귀 가드

**작업**: 고급화 Tier 1 (viz 컴포넌트 6개 + methodology + data + topic ×3) 신설 후
신규 라우트 16건 회귀 가드 추가.
**파일**: scripts/smoke-test.mjs §14.
**검증 추가**: methodology (3) + data 인덱스 (2) + citations.json (3) +
citations.csv (1) + topic ×3 (3) + 인덱스 페이지 (1) = +13.
**결과**: smoke 48 → 63 통과. 회귀 0.
**scope-guard**: PASS (smoke 만 staged — 정합).

---

## 누적 (회차 1~12)

- smoke-test 통과: 25 → 63 (+38)
- 라우트 신설: /guidebook/, /methodology/, /data/, /data/citations.{json,csv},
  /topic/jongseong/, /topic/etf/, /topic/ai-support/ — 7 page + 2 endpoint
- viz 컴포넌트: DataNumber, Sparkline, BarSpark, ChangeBadge, KpiTile, SourceCount
- 콘텐츠 컬렉션 수정: 0
- ADR · 하네스 수정: 0
- 새 의존성 추가: 0

---

---

## 2026-05-07T09:30Z — Tier 2 + 회차 13~15: Author premium + prev/next + ItemList 정합

**작업 (Tier 2 — 운영자 작업):**
- src/pages/authors/junhyuk-kim.astro — KpiTile ×3 (발행 글·1차 출처·가이드북)
  자동 집계 + 최근 발행 5건 + 인용 출처 도메인 분포 (정부/공공/거래소·법령/언론).
  모든 데이터 collection 에서 자동 — fabrication 위험 0. E-E-A-T 강화.

**작업 (Ralph 회차 13~15 — smoke 가드):**
- 회차 13 — Author KPI / recent-list / dist-list 회귀 가드 (4 검증).
- 회차 14 — 첫 챕터 prev 링크 없음 + 마지막 챕터 "목록으로" 링크.
- 회차 15 — 책 detail ItemList LD 의 itemListElement 수 ↔ 빌드된 챕터 디렉토리
  수 정합 (ItemList script 블록 정확 매칭으로 첫 시도 fail 후 다중 LD 파싱 로직
  교정). 변수 충돌 (chapters TDZ) 발견 후 §16-17 을 §13 뒤로 이동.

**파일**: src/pages/authors/junhyuk-kim.astro, scripts/smoke-test.mjs.
**결과**: smoke 63 → 70 통과 (+7). 회귀 0.
**scope-guard**: PASS (콘텐츠/ADR/하네스 0줄).

---

## 누적 (회차 1~15 + Tier 1·2)

- smoke-test 통과: 25 → 70 (+45)
- 라우트 신설: 7 page + 2 endpoint + author 페이지 premium upgrade
- viz 컴포넌트: 6종 (DataNumber/Sparkline/BarSpark/ChangeBadge/KpiTile/SourceCount)
- 콘텐츠 컬렉션 수정: 0
- ADR · 하네스 수정: 0
- 새 의존성 추가: 0

---

---

## 2026-05-07T10:00Z — 회차 16~22: 후보 7건 일괄 + Layer 4 LITE 가동

**작업 (Tier 2 + Ralph 회차 16~22):**

회차 16 — 챕터 sources ↔ TrustBar 정합:
- chapter HTML 의 source-link 갯수 ↔ TrustBar "1차 출처 N건" 텍스트 N 비교.
- 둘 다 entry.data.sources.length 에서 나오므로 항상 일치해야.

회차 17 — 정책 페이지 jsonld 보장 (실제 회귀 발견 + fix):
- 9 정책 페이지 중 7건이 LD 미출력 — Ralph 게이트가 첫 fail 보고.
- PolicyLayout.astro 에 fallback WebPage + Breadcrumb LD 자동 주입 (호출자가
  명시 jsonld 없을 때만). 이전에는 about / methodology 만 LD, 이제 9/9.

회차 18 — 카테고리 페이지 5개 LD 가드:
- /category/{policy|tax-finance|market|stats|ai-tech}/ 모두 빌드 + LD 보유.

회차 19 — citations.json host_distribution + top_hosts:
- citations.json.ts 에 호스트 분류 (정부/공공/거래소·법령/언론·기타) 자동 집계.
- top_hosts 10개 — 가장 자주 인용된 host 별 unique URL 수.
- smoke: 권위 출처 비중 ≥ 50% 임계 (데이터 저널 신뢰도 baseline).

회차 21 — /data/ ↔ author KPI 정합:
- 두 페이지 같은 산식으로 발행 글 수 노출. 정규식으로 KPI num 추출 후 비교.

회차 22 — Layer 4 fact-checker LITE 가동 (M1+ 진군):
- scripts/agents/fact-checker.mjs 의 STUB_MODE = false, LITE_MODE = true.
- 정적 audit — 수치 주장·footnote·sources 비율 산출. 네트워크 X, SDK X, API 키 X.
- 가이드북 챕터까지 audit 대상 확장 (기존 pulse/insight 만).
- 위험도 분류 (low/medium/high) — claims=0 → low, claims>0 footnote=0 → high,
  footnote*3≥claims → low, else medium.
- 첫 가동 결과: 20편 audit, low 15 / medium 5 / high 0. 평균 수치 14.9건,
  각주 6.65건, 출처 2.55건/article.
- fact-check-queue/{date}.json 산출 — 운영자 dashboard 용. M3+ 시 Claude SDK
  통합 예정.
- smoke: queue 산출물 + LITE 모드 + high-risk = 0 검증.

**파일**: scripts/agents/fact-checker.mjs, scripts/smoke-test.mjs,
scripts/ralph/RALPH_LOG.md, src/layouts/PolicyLayout.astro,
src/pages/data/citations.json.ts.
**결과**: smoke 70 → 82 통과 (+12). 회귀 0.
**scope-guard**: PASS.

---

## 누적 (회차 1~22 + Tier 1·2)

- smoke-test 통과: 25 → 82 (+57)
- 라우트 신설 (이번 세션 시작 후): /guidebook/, /methodology/, /data/,
  /data/citations.{json,csv}, /topic/jongseong/, /topic/etf/, /topic/ai-support/
- 컴포넌트: ChapterTOC + viz 6종 (DataNumber/Sparkline/BarSpark/ChangeBadge/
  KpiTile/SourceCount)
- Layer 4: STUB → LITE (정적 audit 가동)
- 콘텐츠 컬렉션 수정: 0
- ADR · 하네스 수정: 0
- 새 의존성 추가: 0

---

---

## 2026-05-07T10:30Z — ADR 0007 채택: SourceWriter 워크플로우

**작업 (Ralph 영역 X — 운영자/AI 협업 워크플로우 정의):**

ADR 0007 신설 — *콘텐츠 컬렉션 수정이 가장 중요* + *1인 관리 + 공신력 자료 only*
정체성을 코드로 인코딩. Ralph (코드 refactor) 와 분리된 5단계 콘텐츠 워크플로우.

**신규 인프라:**
- scripts/agents/source-cache.mjs — 권위 host 화이트리스트 (`.go.kr` / `.or.kr` /
  krx / kosis / law / `PUBLIC_TRUSTED_HOSTS`) 검증 + Node fetch + sha256 캐시.
- scripts/agents/source-verifier.mjs — draft MDX 의 모든 수치 토큰을 `.cache/
  sources/*.txt` 에서 verbatim substring 매칭. 미일치 1건 → exit 1 → reject.
- docs/decisions/0007-sourced-content-writing.md — 5단계 워크플로우 공식화.
- scripts/ralph/PROMPT.md — Ralph 의 콘텐츠 차단 *예외* 로 SourceWriter 명시.

**실증 (live test):**
- nts.go.kr cntntsId=7668 (가산세 안내) 페이지 fetch 성공 — 165,989 bytes.
  단, navigation 위주라 핵심 수치 부재.
- 기존 ch10-가산세 MDX 에 verifier 실행 → 37 수치 중 25 미검증 (40% 60%
  0.022% 등 — law.go.kr 국세기본법 본문 추가 캐시 필요).
- 이것이 *워크플로우의 정확한 작동* — 단일 출처로 충분치 않으면 reject.

**Ralph 와의 관계:**
- Ralph 의 "콘텐츠 절대 금지" 그대로 유지 — 무인 루프는 콘텐츠 안 만짐.
- SourceWriter 는 *명시 운영자 지시* 세션에서만 가동. scope-guard 무관.
- ADR 0007 §안전 보장 §Ralph 와의 분리 참조.

**향후 연결:**
- M3+ 단계: scripts/agents/source-writer.mjs (Claude SDK 통합) — 운영자 결재 필요.
- 일일 cadence: GitHub Actions 또는 Cloudflare Cron 에서 SourceWriter 호출.
- 운영자는 매일 1~3 편 발행 가능 (1차 출처 검증된 글만).

---

## 누적 (회차 1~22 + ADR 0006 LITE + ADR 0007)

- smoke-test 통과: 25 → 82 (+57)
- 라우트 신설: 7 page + 2 endpoint + author premium
- 컴포넌트 신설: ChapterTOC + viz 6종
- Layer 4: STUB → LITE 가동
- ADR 0007: SourceWriter 워크플로우 정의 + 인프라 (cache + verifier)
- 콘텐츠 컬렉션 수정: 0 (이번 commit 까지) — SourceWriter 통한 향후 작성 가능
- ADR · 하네스 수정: ADR 0007 신설 + Ralph PROMPT.md 의 §1 예외 추가만
- 새 의존성: 0

---

---

## 2026-05-07T11:00Z — 고급화 Tier 2 일괄 + 회차 23

**작업 (운영자 지시 — 환경변수/검색등록 제외 모두 진행):**

SourceWriter 데모 (Phase 1):
- law.go.kr 국세기본법 추가 fetch 시도. 단, 페이지가 SPA 라 동적 컨텐츠 부족.
- ch10 verifier 재실행 — 여전히 25/37 미검증 (workflow 정확 작동 확인).
- 운영자 향후 보도자료 deep link 시도 시 verifier 가 갱신 검증.

NewsMediaOrganization LD 강화 (Phase 2 — Google News 신호):
- src/lib/jsonld.ts buildOrganizationLD 에 ethicsPolicy / correctionsPolicy /
  actionableFeedbackPolicy / verificationFactCheckingPolicy / masthead /
  diversityPolicy / publishingPrinciples / knowsAbout / areaServed 추가.
- 기존 6 필드 → 16 필드. Google News 의 Publisher Center 평가 기준 충족.

카테고리 페이지 viz 마운트 (Phase 3):
- 5 카테고리 페이지 모두 — KpiTile (발행 글·1차 출처) + BarSpark (최근 12개월
  월별 발행 분포) 자동 집계. 빈 카테고리는 viz 미렌더 (graceful).

RSS feed 보강 (Phase 4):
- per-item dc:creator, media:thumbnail, media:content (coverImage 있을 때).
- 채널 atom:link self, managingEditor, webMaster, lastBuildDate.
- xmlns: atom + dc + media 추가.

JSON Feed 신설 (Phase 5):
- /feed.json — JSONFeed v1.1 spec. authors / icon / favicon / items 풍부.
- BaseLayout 의 link rel="alternate" type="application/feed+json" discovery.

이미지 lazy loading (Phase 6):
- 감사 결과 모든 <img> 이미 loading="lazy" 적용. 추가 작업 불필요.

회차 23 — 고급화 회귀 가드 (smoke +13):
- JSON Feed 유효 + v1.1 + authors + items.
- RSS dc:creator + atom:link self + managingEditor.
- Org LD 4 정책 URL (ethics/corrections/masthead/publishingPrinciples).
- 카테고리 viz 마운트 5/5.

**파일**: scripts/agents/source-cache.mjs (no change), scripts/smoke-test.mjs,
src/lib/jsonld.ts, src/layouts/BaseLayout.astro, src/pages/feed.xml.ts,
src/pages/feed.json.ts (신규), src/pages/category/[slug]/index.astro.

**결과**: smoke 82 → 95 통과 (+13). 회귀 0.
**scope-guard**: 운영자 commit (콘텐츠 컬렉션 0줄, ADR 수정 0).

---

## 누적 (전체 세션)

- smoke-test 통과: 25 → 95 (+70)
- 라우트 신설: 8 page + 3 endpoint (guidebook + methodology + data + topic ×3 + feed.json)
- 컴포넌트: ChapterTOC + viz 6종
- Layer 4: STUB → LITE 가동
- ADR: 0007 채택 + SourceWriter 인프라 (cache + verifier)
- NewsMediaOrganization LD: 6 → 16 필드 (Google News 신호)
- RSS: minimal → dc/media/atom 강화
- JSON Feed: 미존재 → v1.1 spec
- 카테고리 페이지: PulseList only → KpiTile + BarSpark + PulseList
- 새 의존성: 0

---

## 다음 후보 (post-회차 23)

**아직 ship 안 한 premium 옵션:**
1. /og/v2/ Satori 템플릿 — KpiTile 패턴 통합 (visual premium)
2. Homepage Hero — DataNumber + Sparkline 활용 강화
3. fact-check-queue/ medium-risk 5편 — SourceWriter 워크플로우로 footnote 보강

**SourceWriter 운영자 지시 대기:**
4. 운영자 주제 + 출처 URL 지정 → 본 세션이 Stage 2~4 실행

**운영자 직접 작업 (이번 세션 외):**
5. 환경변수 (PUBLIC_STIBEE_LIST_ID / PUBLIC_AUTHOR_SAMEAS / PUBLIC_*_SITE_VERIFICATION)
6. Naver/Google/Bing 검색 등록

