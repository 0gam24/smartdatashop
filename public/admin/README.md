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
