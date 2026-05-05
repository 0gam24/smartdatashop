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

## 추가 가이드

- 이 로그가 10건 넘으면 `매월 정기 리뷰`(operations.md) 시점에 분류·요약
- 같은 에러가 2회 이상 나타나면 즉시 → `CLAUDE.md` 규칙 또는 `.claude/settings.json` Hook으로 영구 차단
- 출처: book 19470 Mitchell Hashimoto — "AI가 실수하면, 구조적으로 그 실수를 반복할 수 없게 만든다."
