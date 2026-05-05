# 0004 — Decap config.yml을 APIRoute로 마이그레이션

> **날짜**: 2026-05-05
> **상태**: 채택
> **결정자**: junhyuk-kim

## 컨텍스트

Decap CMS는 `/admin/config.yml`을 정적 파일로 기대한다. 초기 구성에서 `public/admin/config.yml`을 그대로 두었더니 `dist/admin/config.yml`에 `local_backend: true` + `0gam24/smartdatashop` repo 경로가 프로덕션에 공개 노출됐다. (`error-log.md` 두 번째 항목.) `local_backend`는 dev 전용 옵션이고 repo 경로 노출은 OAuth 흐름 분석을 용이하게 만들어 보안적으로 부적절하다.

## 결정

**`public/admin/config.yml` 정적 파일을 삭제하고, `src/pages/admin/config.yml.ts` Astro APIRoute로 대체한다. `import.meta.env.DEV`일 때만 `local_backend: true`를 인라인하고, 프로덕션 빌드에는 GitHub OAuth backend 설정만 포함한다.**

## 이유

- 환경별 분기가 필요한 자산은 `public/`이 아니라 endpoint가 자연스러운 위치
- `import.meta.env.DEV`는 Astro 빌드 타임에 평가되어 dead-code elimination이 가능 → 프로덕션 번들에 dev 분기 코드 자체가 남지 않음
- Decap CMS는 `/admin/config.yml` URL만 지키면 정적/동적 구분 없이 동작

## 대안

- **A. `public/admin/config.yml` 유지 + 문서로 "프로덕션 배포 전 수동 편집" 안내** — 휴먼 에러 100% 보장
- **B. 환경변수로 `LOCAL_BACKEND=true` 빌드 분기** — 빌드 단계 추가 + 잊으면 사고 재발
- **C. dev/prod 별도 config 파일 + 빌드 스크립트** — 정적 사이트의 단순함을 해침

## 결과

좋은 점:
- 프로덕션 `dist/admin/config.yml`에 `local_backend` 자동 제외
- dev에서는 `npm run dev` 그대로 돌리면 Decap local_backend가 동작 (별도 설정 X)
- 환경 분기가 코드 한 줄로 가시화됨

나쁜 점:
- Decap 업데이트로 config 스키마 변경 시 endpoint 코드도 업데이트 필요 (정적 파일이었으면 운영자가 직접 편집)
- `public/`과 `src/pages/admin/`을 모두 알아야 Decap 흐름 이해 가능 → architecture.md에 명시

## 재검토 트리거

- Decap CMS 메이저 버전 업그레이드 시
- GitHub OAuth가 아닌 다른 backend로 전환 시 (예: GitLab, self-hosted git-gateway)
- 정적 파일로도 환경 분기 가능한 Astro 기능이 추가될 때

## 관련

- 파일: `src/pages/admin/config.yml.ts` (생성)
- 삭제: `public/admin/config.yml`
- commit `e0cb955` — fix(critical+major): editorial integrity, navigation, security, SEO
- `docs/code-review-2026-05-05.md` — 발견 항목 원천
- 에러로그: `docs/error-log.md` 2026-05-05 두 번째
