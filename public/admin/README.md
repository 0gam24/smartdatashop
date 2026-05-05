# /admin/ — Decap CMS 편집기

## (a) 이 폴더가 뭔가요?
`/admin/`은 Decap CMS(오픈소스 헤드리스 CMS)가 마운트되는 정적 SPA입니다.
`index.html`이 CDN에서 Decap을 불러오고, 같은 폴더의 `config.yml`을 읽어
`src/content/*` 아래 마크다운/JSON 파일을 GitHub에 직접 커밋합니다.

## (b) 로컬 테스트 (인증 없음)
1. `config.yml`에서 `# local_backend: true` 줄의 `#`을 제거합니다.
2. 새 터미널에서 `npx decap-server`를 실행합니다 (8081 포트).
3. `npm run dev` 후 http://localhost:4321/admin/ 접속.
4. 테스트가 끝나면 `local_backend: true`를 다시 주석 처리해 푸시하세요.
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
편집할 파일: `public/admin/config.yml`. `src/content/config.ts`의 Zod 스키마와
필드 이름·타입이 일치해야 빌드가 깨지지 않습니다.

## 로컬 테스트 검증 결과 (2026-05-05)

검증 절차에서 다음을 확인했습니다.

- `public/admin/config.yml`은 YAML 파서로 정상 파싱됨 (5개 컬렉션 모두 존재).
- 백엔드: `0gam24/smartdatashop@main`, `local_backend: true` 활성, `media_folder=public/uploads`, `public_folder=/uploads`.
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
