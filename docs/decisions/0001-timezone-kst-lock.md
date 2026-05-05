# 0001 — 모든 날짜 처리 KST 고정

> **날짜**: 2026-05-05
> **상태**: 채택
> **결정자**: junhyuk-kim

## 컨텍스트

펄스 URL `/{YYYY}/{MM}/{DD}/{slug}/`이 빌드 환경 로컬 timezone에 의존하고 있었다. Cloudflare Pages 빌드러너는 UTC, 운영자 로컬은 KST. KST 자정 직전에 publish된 글이 UTC 기준 전날로 빌드돼 URL 경로가 어긋났다. 결과적으로 의도한 KST 날짜 URL 요청이 SPA fallback으로 홈 본문(33KB)을 반환하는 사고 발생. (`error-log.md` 첫 항목 참조.)

## 결정

**모든 날짜 추출은 `src/lib/korean.ts`의 KST 헬퍼만 사용한다. `Date.getFullYear/Month/Date()` 직접 호출 금지.**

## 이유

- 한국어 데이터 저널리즘 사이트 = 모든 시간 표현이 KST여야 운영자/독자/검색엔진이 일치
- Cloudflare Pages 빌드 환경(UTC)과 로컬 환경(KST) 격차로 인한 회귀를 영구 차단
- `Intl.DateTimeFormat({ timeZone: 'Asia/Seoul' })`은 표준 API. 외부 의존성 추가 불필요

## 대안

- **A. 빌드 환경에 `TZ=Asia/Seoul` 강제** — Cloudflare Pages가 환경변수 timezone을 100% 보장하지 않음 + 다른 정적 호스트 마이그레이션 시 재발
- **B. 기존 코드 유지 + frontmatter에 ISO 문자열 강제** — 운영자 실수 가능성 (Decap CMS UI에서 timezone 명시하지 않으면 로컬 기준)
- **C. dayjs/date-fns 의존성 추가** — Astro 빌드 번들 비대화 + Intl API로 충분

## 결과

좋은 점:
- KST 6월 5일 발행 글은 빌드 환경과 무관하게 `/2026/06/05/...` 경로로 일관 생성
- 펄스 URL / 빵부스러기 / 관련 글 / sitemap 모두 단일 헬퍼 통과

나쁜 점:
- 새 컴포넌트 작성 시 운영자가 헬퍼 사용을 잊으면 회귀 가능 → 추후 ESLint 룰 또는 PreToolUse Hook으로 차단 검토

## 재검토 트리거

- Astro 빌드 환경이 변경되어 timezone 보장이 명확해질 때
- `getFullYear()` 직접 호출이 다시 발견될 때 (Hook 도입 트리거)

## 관련

- commit `eaf6b60` — fix(timezone): pulse URL/breadcrumb/related dates use Asia/Seoul, not build-env local
- 파일: `src/lib/korean.ts` (`kstParts`, `pulseDateParts`)
- 에러로그 항목: `docs/error-log.md` 2026-05-05 첫 번째
