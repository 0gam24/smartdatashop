## 변경 요약

[한 단락 — 무엇을 / 왜]

## 변경 종류
- [ ] 버그 수정
- [ ] 새 기능
- [ ] 디자인 개선
- [ ] 콘텐츠 추가/검수
- [ ] 인프라 / 빌드 / CI
- [ ] **하네스 변경** (CLAUDE.md / .claude/ / settings.json / scripts/agents 프롬프트)
- [ ] 문서 (docs/references/)

## 하네스 변경 체크리스트 (위 항목 체크 시)
- [ ] 변경 사유가 PR 설명에 기록되어 있는가?
- [ ] 기존 규칙과 충돌하지 않는가?
- [ ] 규칙에 이유 주석 (`<!-- 왜 이 규칙인가 -->`)이 달려 있는가?
- [ ] 결정 근거가 CLAUDE.md(또는 영역 CLAUDE.md)에 기록되었는가? (구 ADR 체계는 2026-08-26 폐기 — git 이력 `docs/decisions/` 참조)

## 편집 무결성 체크리스트 (콘텐츠 변경 시 — ADR 0006 4기준)
- [ ] 모든 구체 수치·인용·발표일에 `[^N]` footnote 페어링이 있는가? (`npm run verify:strict`)
- [ ] 1차 출처 URL은 가능한 한 deep link인가? (root만 가능하면 `accessedAt` 명시)
- [ ] 검수 미완 토큰(`[검수 후 입력]` 등)이 0건인가?
- [ ] V4 구조 게이트를 통과하는가? (`npm run verify:structure` — 2026-08-27+ 발행분)

## 디자인 시스템 체크리스트 (CSS/UI 변경 시)
- [ ] 디자인 토큰(`src/styles/global.css`)만 사용했는가?
- [ ] box-shadow / linear-gradient / border-radius ≥ 12px 추가 안 했는가?
- [ ] font-weight 700 본문 추가 안 했는가?
- [ ] 카테고리 컬러 코딩 추가 안 했는가?

## 빌드 검증
- [ ] `npx astro check` (0 errors)
- [ ] `npm run build` 성공
- [ ] 라이브 검증 필요 시 commit message에 명시

## 관련 문서
- 관련 참고 문서: docs/references/...
- 관련 issue: #
- 라이브 영향: 메인 / 정책 페이지

🤖 Co-authored: Claude Code (or human)
