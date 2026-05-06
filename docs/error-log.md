# 에러 로그 — 같은 에러 두 번째 만나면 1초 안에 해결

> 출처 패턴: book 19307 P8 (에러로그 자산화).
> 디버깅 시간이 5분 넘으면 이 파일에 기록한다. 같은 에러 두 번째 만났을 때 즉시 해결되는 것이 자산.

## 형식

- **증상**: 정확히 무엇이 보였는가
- **원인**: 왜 발생했는가 (근본 원인)
- **해결**: 어떻게 풀었나
- **예방**: 다음에 어떻게 막을 것인가

---

## 2026-05-05 — Cloudflare Pages article URL이 home content 반환

- **증상**: `/2026/05/05/2026-05-05-jongseong-server/`이 200 OK + 33KB (홈 본문). 실제 article HTML 안 나옴.
- **원인**: `pulseUrl()`이 `Date.getFullYear/Month/Date` 사용. 빌드 환경의 로컬 timezone 의존. CF Pages = UTC, 로컬 = KST. KST 5월 5일 publish가 UTC 5월 4일로 빌드돼 `/2026/05/04/...` 파일 생성. `/2026/05/05/...` 요청은 SPA fallback으로 `index.html` 반환.
- **해결**: `Intl.DateTimeFormat({ timeZone: 'Asia/Seoul' })` 기반 `kstParts()` 헬퍼로 모든 날짜 처리 통일. `pulseDateParts()` export. → ADR 0001.
- **예방**: 모든 날짜 추출은 `src/lib/korean.ts`의 KST 헬퍼만 사용. `Date.getFullYear()` 직접 호출 금지 — Hook으로 차단 검토.

---

## 2026-05-05 — Decap config.yml에 local_backend: true 프로덕션 노출

- **증상**: code review 발견. `dist/admin/config.yml`에 `local_backend: true` + `0gam24/smartdatashop` repo 경로 공개 노출.
- **원인**: `public/admin/config.yml`은 정적 파일. dev/prod 구분 없이 동일 빌드 산출.
- **해결**: `public/admin/config.yml` 삭제 → `src/pages/admin/config.yml.ts` (APIRoute)로 변환. `import.meta.env.DEV`일 때만 `local_backend: true` 인라인. → ADR 0004.
- **예방**: 환경별 분기가 필요한 정적 자산은 처음부터 endpoint로 만들기. `public/`은 진정한 static만.

---

## 2026-05-05 — PulseCard 5개가 클릭 안 됨

- **증상**: 홈의 가장 prominent한 5개 카드가 `cursor: pointer` 보여주는데 클릭해도 navigation 없음.
- **원인**: `data-href` 속성 + cursor 스타일만 있고 `<a>` 없음, click handler 없음.
- **해결**: `<article class="pulse-card">` 안에 `<a class="card-link" href={href}>` wrapper 추가. CategoryColumn / SisterSiteCard도 동일 패턴.
- **예방**: 새 클릭 가능한 카드 컴포넌트 만들 때 1초 체크 — "이 카드가 키보드 Tab으로 focusable한가?" 그렇지 않으면 `<a>` 누락.

---

## 2026-05-05 — Hero.astro 가짜 통계 하드코딩 ("312만 명")

- **증상**: code review 발견. 홈 Hero 컴포넌트가 `chartTitle="홈택스 일평균 접속자 (5월 1~4일)"` / `chartValue="312"` / `chartUnit="만"` / `chartDelta="▼ 전년 대비 −5.2%"` 류 default props 로 미검증 수치를 "오늘의 지표" 로 노출.
- **원인**: 컴포넌트 default props 가 fallback 으로 잘 의도되지 않음 — 호출자가 chart 데이터를 안 넘겨도 가짜 수치가 그대로 렌더.
- **해결** (Phase 0): Hero `chartTitle`/`chartValue`/`chartUnit`/`chartDelta`/`chartSource` default 5개 모두 제거. 5개 prop 이 모두 명시 전달될 때만 차트 영역 렌더 (`hasChart` 가드). → 미검증 수치가 자동으로 보이지 않게 차단.
- **예방**: 컴포넌트 fallback 정책 — "값 없으면 빈 화면" 이지 "값 없으면 시연용 default" 아님. 시연 default 가 필요하면 별도 `<HeroSampleData>` 컴포넌트.

---

## 2026-05-06 — `[검수 후 입력]` placeholder 가 색인 가능 상태로 노출

- **증상**: 7개 글 (pulse 6 + insight 1) 의 본문/제목/tldr 에 `[검수 후 입력]` 류 미완성 토큰 다수. 정상 robots `index,follow` 가 발행되어 Google/Discover 가 placeholder 자체를 색인할 수 있는 상태.
- **원인**: ADR 0002 의 수동 `previewMode: true` 게이트가 색인을 막지 않음 — 사이트 표시는 되지만 정식 발행으로만 카운트 안 함. robots 메타와 무관.
- **해결** (Phase 0): `src/lib/placeholder.ts` 신규. `entryHasPlaceholder({title, tldr, body})` 가 검출 시 동적 라우트가 `noindex={true}` 를 BaseLayout 으로 전달 → robots `noindex,nofollow` 자동 출력. 6 pulse + 1 insight 모두 자동 색인 차단 검증됨.
- **예방**: ADR 0005 — 수동 게이트 폐기 + Layer 3 자동 검출. 운영자 결정 부담 0, 회귀 불가능.
- **운영 후속**: GSC + Bing Webmaster Tools 에서 7개 URL 제거 요청 (이미 색인됐을 가능성).

---

## 2026-05-06 — `og-default.png` 단일 이미지 모든 페이지 폴백

- **증상**: 홈/카테고리/태그/저자/정책 페이지 모두 OG meta 가 `og-default.png` 동일 정적 이미지. Discover 가 글마다 고유 이미지 정책에서 페널티.
- **원인**: BaseLayout 의 `ogImage` default 가 단일 정적 자산. 호출자가 명시 전달 시만 다른 이미지 사용.
- **해결** (Phase 1+3): Satori 기반 `/og/v2/{type}/{slug}.png` 동적 라우트. home/category/author 신규 라우트 추가. BaseLayout default 를 `/og/v2/home.png` 로 변경. 카테고리 페이지 자동 카드 사용.
- **예방**: 새 라우트 타입 추가 시 OG 라우트도 함께 — `og/v2/{tag,...}` 추후 확장 자리 마련됨.

---

## 2026-05-06 — Cloudflare Pages 빌드 환경 폰트 외부 도메인 의존

- **증상**: BaseLayout 이 Google Fonts (`fonts.googleapis.com`) + jsdelivr 두 외부 도메인에서 폰트 다운로드. LCP-critical 헤드라인 폰트가 cross-origin 핸드셰이크 비용 부담.
- **원인**: 초기 구현 시 CDN 가용성 우선. 모바일 Discover (Phase 5 G21) 도입으로 LCP 임계 명시화 후 자명해짐.
- **해결** (Phase 5): `@fontsource/noto-serif-kr` + `@fontsource/jetbrains-mono` npm 설치. BaseLayout 에서 4개 weight CSS import. Vite 가 woff2 를 same-origin asset 으로 번들. Pretendard 만 jsdelivr 잔존 (한국 모바일 캐시 적중률 높음 + fontsource 패키지가 Latin-only 함정).
- **예방**: 새 폰트 추가 시 fontsource npm 채널 우선 검토. 외부 CDN 은 (a) 동의된 패턴 (Pretendard, Cloudflare 인프라) 이거나 (b) 명시 ADR 동반.

---

## 2026-05-06 — 폰트 CDN 다운로드 보안 차단 (해소)

- **증상**: Phase 1 진행 중 `curl` 로 jsdelivr 에서 Pretendard 폰트 binary 다운로드 시도 → 하네스 보안 정책으로 차단 ("Trusting Guessed External Services").
- **원인**: 외부 도메인 binary fetch 가 자동 통과 카테고리 아님 — 사용자 명시 승인 또는 신뢰 패턴 필요.
- **해결**: 차선책 으로 `@fontsource/noto-sans-kr` (npm 단일 채널) 채택. D6 정신 (의존성 최소화) 부합 + npm 채널은 자동 통과.
- **예방**: 외부 binary 가 필요하면 (a) npm 패키지 우회 가능 여부 확인 → (b) 가능하면 그쪽으로 → (c) 불가능하면 사용자 명시 승인. CDN 직접 fetch 는 마지막 옵션.

---

## 추가 가이드

- 이 로그가 10건 넘으면 `매월 정기 리뷰`(operations.md) 시점에 분류·요약
- 같은 에러가 2회 이상 나타나면 즉시 → `CLAUDE.md` 규칙 또는 `.claude/settings.json` Hook으로 영구 차단
- 출처: book 19470 Mitchell Hashimoto — "AI가 실수하면, 구조적으로 그 실수를 반복할 수 없게 만든다."
