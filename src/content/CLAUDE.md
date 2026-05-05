# src/content/ 영역 규칙

> 상위 CLAUDE.md 자동 상속. 본 파일은 콘텐츠 컬렉션 편집 시 추가 규칙.

## 절대 금지

### AI가 만들어낸 통계는 발행 금지
<!-- 본 사이트의 존재 이유 = 1차 출처 검증 -->
- "통계청에 따르면 2.1%" 같은 구체적 숫자 새로 만들지 마라
- 기존 샘플 6편의 수치도 운영자 검수 전 = `previewMode: true`
- 검수된 글만 `previewMode: false` + `verifiedBy: ['junhyuk-kim']`

### 1차 출처 URL은 기관 홈페이지로
- ❌ 깊은 링크 (특정 PDF / 특정 보도자료) — 링크 끊어질 위험
- ✅ 기관 루트 (https://nts.go.kr/, https://kostat.go.kr/, https://krx.co.kr/, https://ecos.bok.or.kr/)

## 새 펄스 추가 시
1. 파일명: `YYYY-MM-DD-slug.mdx` (slug는 영어 소문자/하이픈)
2. publishedAt: ISO 8601 + KST 시간대 (예: `2026-05-05T07:32:00+09:00`)
3. category: 5개 enum 중 1개 (`policy`/`tax-finance`/`market`/`stats`/`ai-tech`)
4. tldr: 200자 이내 한 문장 요약
5. sources: 최소 1개 (insight는 최소 2개)
6. tags: persona/dataType/action 중 해당하는 것
7. previewMode: true (검수 전), verifiedBy: []
8. body: H2 섹션 2-4개. 본문 350~500자 권장.

## 새 인사이트 추가 시
- 펄스와 동일하나 sources 최소 2개 + estimatedReadingTime 필수 (정수, 분 단위)

## 가이드북 / 가이드북 챕터 / 데이터 페이지
- guidebook은 type: 'data' (json), 챕터는 type: 'content' (mdx)
- bookSlug 일관성 유지 (가이드북 폴더의 파일명과 1:1 매칭)

## Frontmatter 검증
- `npm run build`가 Zod 검증 자동 실행
- max(60), max(80), max(200), max(300) 등 길이 제한 어기면 빌드 실패
