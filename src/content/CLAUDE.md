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
4. tldr: 200자 이내 한 문장 요약 — **"X 는 Y 다" 정의 문장 포함** (LLM 인용 친화)
5. sources: 최소 1개 (`url` 권장 — Dataset LD 자동 발행 조건). **3개+ 시 GEO·SEO 가산 신호**.
6. tags: persona/dataType/action 중 해당하는 것
7. body: **본문 1,500~2,500자 권장** (Google Discover + 일반 SEO + LLM 인용 모두 충족)
8. (선택) `chartData`: Reuters/Bloomberg 스타일 OG 차트 오버레이 — `{ type, values, label, unit? }`
9. (선택) `coverImage`: 1200×630 16:9 — 없으면 동적 OG v2 (Satori) 자동 사용

### 본문 구조 — SEO/GEO 고급화 체크리스트 (2026-05-14 추가)

신규 펄스 작성 시 본문 구조 표준 — 운영자·writer agent 공통:

- ☐ **도입 첫 단락** — 핵심 사실 1-2 문장 + 1차 출처 명시 + `[^1]` + "정의 문장" 1개
- ☐ **## H2 섹션 3-5개** — 배경 / 본인 영향 / 시사점 / 액션 / FAQ 중 3-5개
- ☐ **footnote `[^N]` 3-6회** — sources 순서대로 본문 자연 분포
- ☐ **표 1개** — 비교·매트릭스·체크리스트 (LLM 인용 시 구조 보존)
- ☐ **인용 단락** — `> 원문` 형식 + 직후 `[^N]` (왜곡 0)
- ☐ **자주 묻는 질문 2-3개 Q&A** — 자동 FAQPage LD 발행 조건 (`**Q1. ...?**\nA. ...` 패턴)
- ☐ **본인 액션 / 체크리스트 3단계+** — 자동 HowTo LD 발행 조건 (`1. ... / 2. ... / 3. ...` 번호 리스트, 섹션 제목에 "본인 액션" / "체크리스트" / "절차" 포함)
- ☐ ~~**자매 cross-ref 1-2개**~~ — ADR 0010(2026-05-24) 폐기, 신규 작성 금지

### Google SEO 바이브코딩 체크리스트 (2026-05-26 의무, `docs/google-seo-vibe-coding/`)

**매 펄스 발행 시 자체 검증 의무**:

📄 `04-ranking-appearance.md` 적용:
- ☐ **title** 60자 내 + 핵심 키워드 앞부분 배치 (검색결과 우위)
- ☐ **tldr (meta description 역할)** 155-200자 + 검색의도 답변 명확
- ☐ **NewsArticle LD 자동 발행 확인** — sources[] 있어야 트리거됨
- ☐ **E-E-A-T 신호**: 1차 출처 명시 (`.go.kr` / `.or.kr`) + 발표 일자 + 저자 바이라인

📄 `06-site-specific-guides.md` §뉴스 적용:
- ☐ **NewsArticle schema** — `datePublished` (publishedAt frontmatter, KST ISO 8601), `dateModified` (수정 시 갱신)
- ☐ **뉴스 sitemap 자동 포함** — `/news-sitemap.xml` 빌드 자동
- ☐ **Google News 정책 준수** — 정치 편향 X, 광고-콘텐츠 분리, 1차 출처 우선

📄 `07-vibe-coding-seo-template.md` 배포 전 체크:
- ☐ canonical URL 자동 (라우트 자동 처리)
- ☐ og:image (16:9 1200×630) — `coverImage` 또는 동적 OG v2 자동
- ☐ 이미지 alt 속성 (펄스에 이미지 임베드 시)
- ☐ 내부 링크 자연어 (앵커 텍스트 "여기 클릭" 금지)

📄 `02-seo-fundamentals.md` 적용:
- ☐ URL slug: 영문 소문자·하이픈만 (예: `2026-05-26-mohw-wha79-bilateral`)
- ☐ 본문 내부 링크는 의미있는 앵커 (1차 출처 deep link 권장)
- ☐ 단락 구조: H2 → H3 계층 일관

**위계 충돌 시**: `docs/google-seo-vibe-coding/` (Google 공식) > `docs/references/06-구글-SEO-종합.md` (정리본) > 본 CLAUDE.md

LD 자동 발행 (코드):
- NewsArticle: 모든 펄스
- Dataset: `sources[].url` 1개+ 시
- BreadcrumbList: 모든 펄스
- **FAQPage**: 본문에 Q&A 패턴 2개+ 시 자동 (`src/lib/jsonld.ts` `buildFaqLDFromMarkdown`)
- **HowTo**: "본인 액션" / "체크리스트" 섹션에 번호 리스트 3단계+ 시 자동 (`buildHowToLDFromMarkdown`)

## 새 인사이트 추가 시
- 펄스와 동일하나 sources 최소 2개 + estimatedReadingTime 필수 (정수, 분 단위)

## 가이드북 / 가이드북 챕터 / 데이터 페이지
- guidebook은 type: 'data' (json), 챕터는 type: 'content' (mdx)
- bookSlug 일관성 유지 (가이드북 폴더의 파일명과 1:1 매칭)

## Frontmatter 검증
- `npm run build`가 Zod 검증 자동 실행
- max(60), max(80), max(200), max(300) 등 길이 제한 어기면 빌드 실패
