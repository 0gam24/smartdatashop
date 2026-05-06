# src/content/ 영역 규칙

> 상위 CLAUDE.md 자동 상속. 본 파일은 콘텐츠 컬렉션 편집 시 추가 규칙.

## 절대 금지

### AI가 만들어낸 통계는 발행 금지
<!-- 본 사이트의 존재 이유 = 1차 출처 검증 (ADR 0005 — 5계층 자동 안전장치) -->
- "통계청에 따르면 2.1%" 같은 구체적 숫자 새로 만들지 마라 — 환각 위험
- 검수 미완 토큰 (`[검수 후 입력]` / `[검수 후]` / `[검수 후 발표일]` 등) 이 본문/제목/tldr 에 1회라도 남으면 `src/lib/placeholder.ts` 의 `entryHasPlaceholder()` 가 자동으로 검출해 robots `noindex,nofollow` 메타를 출력 — 색인 자동 차단
- 출처 url 이 1개 이상 있으면 라우트가 자동으로 Dataset JSON-LD 발행 (데이터 저널 차별화). url 없는 source 는 효과 없으므로 항상 url 포함 권장

### 1차 출처 URL — 기관 루트 또는 검증 가능한 deep link
- 기관 홈페이지(루트) 가 가장 안전: `https://nts.go.kr/`, `https://kostat.go.kr/`, `https://krx.co.kr/`, `https://ecos.bok.or.kr/`
- deep link 는 사후 fact-check 가능할 때만 (Layer 4 가동 후) — 그 전까지는 루트 권장
- "비공개 자료 (운영자 직접 청취)" 류 검증 불가 source 는 `sources[]` 에 넣지 마라 — 본문 footnote 로만 표시

### 폐기된 필드 (2026-05-06)
- `previewMode` / `verifiedBy` 두 필드는 ADR 0005 로 폐기됨 — frontmatter 에 절대 다시 등장 금지
- Zod 스키마에서 삭제되어 신규 추가 시 `npm run build` 실패

## 새 펄스 추가 시
1. 파일명: `YYYY-MM-DD-slug.mdx` (slug는 영어 소문자/하이픈)
2. publishedAt: ISO 8601 + KST 시간대 (예: `2026-05-05T07:32:00+09:00`)
3. category: 5개 enum 중 1개 (`policy`/`tax-finance`/`market`/`stats`/`ai-tech`)
4. tldr: 200자 이내 한 문장 요약
5. sources: 최소 1개 (`url` 권장 — Dataset LD 자동 발행 조건)
6. tags: persona/dataType/action 중 해당하는 것
7. body: H2 섹션 2-4개, 350~500자 권장
8. (선택) `chartData`: Reuters/Bloomberg 스타일 OG 차트 오버레이 — `{ type, values, label, unit? }`
9. (선택) `coverImage`: 1200×630 16:9 — 없으면 동적 OG v2 (Satori) 자동 사용

## 새 인사이트 추가 시
- 펄스와 동일하나 sources 최소 2개 + estimatedReadingTime 필수 (정수, 분 단위)

## 가이드북 / 가이드북 챕터 / 데이터 페이지
- guidebook은 type: 'data' (json), 챕터는 type: 'content' (mdx)
- bookSlug 일관성 유지 (가이드북 폴더의 파일명과 1:1 매칭)

## Frontmatter 검증
- `npm run build`가 Zod 검증 자동 실행
- max(60), max(80), max(200), max(300) 등 길이 제한 어기면 빌드 실패
