# /admin/ — Decap CMS 편집기

## (a) 이 폴더가 뭔가요?
`/admin/`은 Decap CMS(오픈소스 헤드리스 CMS)가 마운트되는 정적 SPA입니다.
`index.html`이 CDN에서 Decap을 불러오고, `/admin/config.yml`을 읽어
`src/content/*` 아래 마크다운/JSON 파일을 GitHub에 직접 커밋합니다.

> **중요**: `config.yml`은 더 이상 정적 파일이 아니라 Astro 엔드포인트에서
> 빌드 시점에 생성됩니다 (`src/pages/admin/config.yml.ts`).
> 컬렉션 스키마를 수정하려면 그 TS 파일을 편집하세요. 이렇게 한 이유는
> `local_backend: true`가 프로덕션에 노출되어 운영 의도와 GitHub 저장소
> 경로를 그대로 광고하는 보안/SEO 이슈를 막기 위함입니다.
> 엔드포인트는 `import.meta.env.DEV`가 true일 때만 `local_backend`를 포함합니다.

## (b) 로컬 테스트 (인증 없음)
1. `npm run dev` 실행 — 엔드포인트가 자동으로 `local_backend: true`를 포함합니다.
2. 새 터미널에서 `npx decap-server`를 실행합니다 (8081 포트).
3. http://localhost:4321/admin/ 접속.
4. 운영자가 따로 토글할 일이 없습니다 — 프로덕션 빌드(`npm run build`)에서는
   `local_backend` 줄이 자동으로 제거됩니다.
   참고: https://decapcms.org/docs/working-with-a-local-git-repository/

## (c) 프로덕션: GitHub OAuth 설정
1. GitHub OAuth App 생성 (Settings → Developer settings → OAuth Apps).
   - Authorization callback URL: 사용하는 OAuth 게이트웨이의 콜백 URL.
2. 게이트웨이 옵션:
   - Netlify(권장): Netlify Identity + Git Gateway 활성화.
   - 자체 호스팅: https://github.com/vencax/netlify-cms-github-oauth-provider 등.
3. 게이트웨이 환경변수: `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, `ORIGIN`, `REDIRECT_URL`.
4. `config.yml`의 `repo: PLACEHOLDER_OWNER/PLACEHOLDER_REPO`를 실제 값으로 교체.
   상세: https://decapcms.org/docs/github-backend/

## (d) 컬렉션 추가/수정
편집할 파일: `src/pages/admin/config.yml.ts` (TypeScript에 YAML이 템플릿
리터럴로 들어 있음). `src/content/config.ts`의 Zod 스키마와 필드 이름·타입이
일치해야 빌드가 깨지지 않습니다.

## 로컬 테스트 검증 결과 (2026-05-05)

검증 절차에서 다음을 확인했습니다.

- `src/pages/admin/config.yml.ts`는 YAML로 정상 출력됨 (5개 컬렉션 모두 존재).
- 백엔드: `0gam24/smartdatashop@main`, dev 모드에서만 `local_backend: true`, `media_folder=public/uploads`, `public_folder=/uploads`.
- Astro dev 서버는 `/admin/index.html`(200), `/admin/config.yml`(200)을 정상 제공.
  - 참고: `/admin/`(디렉터리 인덱스)은 dev 모드에서 404가 정상이며, 빌드/프로덕션에서는 어댑터/호스팅이 인덱스를 처리합니다. 브라우저 접속 시에는 `/admin/index.html`로 자동 리다이렉트되거나 직접 접근하세요.
- `npx decap-server`는 8081 포트에 즉시 바인딩되며 `POST /api/v1 {action:"info"}`로 `{"repo":"...","publish_modes":["simple"],"type":"local_fs"}` 응답 확인됨.

### 알려진 스키마 드리프트 (Decap UI ↔ Zod)

빌드를 깨뜨리지 않는 누락된 선택적 필드(편집기에서 입력 불가, 파일에 직접 추가해야 함):

- `pulse`: `chartUrl?`, `coverImage?`, `correctionLog[]` 없음
- `insight`: `coverImage?`, `correctionLog[]` 없음

`guidebook`, `guidebookChapter`, `dataPage`는 일치. `body`는 MDX 본문이므로 Zod 프런트매터 스키마에 없는 것이 정상입니다.

### 운영자용 표준 실행 순서

```
# Terminal 1 (already done by Astro dev or build)
npm run dev

# Terminal 2 — decap-server only needed for /admin/ to authenticate locally
npx decap-server

# Then visit:
http://localhost:4321/admin/
```

`decap-server`는 `--no-save`로 즉시 받아 실행되며 별도 설정이 필요 없습니다.
