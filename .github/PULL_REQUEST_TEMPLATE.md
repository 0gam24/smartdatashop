## 변경 요약

[한 단락 — 무엇을 / 왜]

## 변경 종류
- [ ] 버그 수정
- [ ] 새 기능
- [ ] 디자인 개선
- [ ] 콘텐츠 추가/검수
- [ ] 인프라 / 빌드 / CI
- [ ] **하네스 변경** (CLAUDE.md / AGENTS.md / .claude/ / settings.json)
- [ ] 문서 (docs/)

## 하네스 변경 체크리스트 (위 항목 체크 시)
- [ ] 변경 사유가 PR 설명에 기록되어 있는가?
- [ ] 기존 규칙과 충돌하지 않는가?
- [ ] 규칙에 이유 주석 (`<!-- 왜 이 규칙인가 -->`)이 달려 있는가?
- [ ] 관련 ADR (`docs/decisions/`)이 작성되었는가?

## 편집 무결성 체크리스트 (콘텐츠 변경 시)
- [ ] 새 펄스/인사이트는 `previewMode: true` + `verifiedBy: []`인가?
- [ ] 정식 발행 (`previewMode: false`)이라면 운영자 1차 출처 대조 검수가 끝났는가?
- [ ] 1차 출처 URL이 기관 홈페이지인가? (깊은 링크 금지)

## 디자인 시스템 체크리스트 (CSS/UI 변경 시)
- [ ] DESIGN.md v1.0 토큰만 사용했는가?
- [ ] box-shadow / linear-gradient / border-radius ≥ 12px 추가 안 했는가?
- [ ] font-weight 700 본문 추가 안 했는가?
- [ ] 카테고리 컬러 코딩 추가 안 했는가?

## 빌드 검증
- [ ] `npx astro check` (0 errors)
- [ ] `npm run build` 성공
- [ ] 라이브 검증 필요 시 commit message에 명시

## 관련 문서
- 관련 ADR: docs/decisions/...
- 관련 issue: #
- 라이브 영향: 메인 / 자매 사이트 N개 / 정책 페이지

🤖 Co-authored: Claude Code (or human)
