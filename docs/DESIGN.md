# DESIGN.md — 디자인 토큰 / 활자 시스템 / 컴포넌트 카탈로그

> **버전**: v1.0 · **시행**: 2026-05-06
> 본 문서는 디자인 권위 출처. 비즈니스 KPI 는 [PLANNING.md](./PLANNING.md), 자동화 명세는 [AGENTS.md](./AGENTS.md).
>
> 토큰 변경은 `src/styles/global.css` `:root` 블록을 권위로 하며, 본 문서는 그 시각화 + 의도 기록.

---

## §1. 한 줄 정의

**한지 톤 + 와인 액센트 단일색 시안.** 신문지 활자 미학과 데이터 저널의 차분한 인포그래픽을 결합. 박스/그림자/그라디언트 금지 — hairline(0.5px) 만 사용.

## §2. 컬러 토큰

`src/styles/global.css` `:root` 블록 권위.

| 토큰 | 값 (Light) | 용도 |
|---|---|---|
| `--color-paper` | `#faf7f0` | 본문 배경 (한지 베이스) |
| `--color-paper-soft` | `#f6f2e9` | 보조 배경 (Trust Bar 등) |
| `--color-paper-deep` | `#ede7d8` | 심화 배경 |
| `--color-ink` | `#1a1a1a` | 본문 활자 |
| `--color-ink-secondary` | `#5a5a5a` | 보조 활자 |
| `--color-ink-tertiary` | `#8a8a8a` | 메타·날짜 |
| `--color-ink-quat` | `#cccccc` | 보더 (hairline) |
| `--color-accent` | `#8b1538` | 와인 — 카테고리 라벨·CTA |
| `--color-accent-soft` | `#e8d5dc` | 와인 약 — 강조 배경 |
| `--color-link` | `#1f4d8a` | 외부 링크 (와인과 분리) |

**다크 모드**: v1.2 예정 (현재 v1.0 light only). `tailwind.config.ts` 의 `darkMode: 'class'` 명시 — 시스템 다크 자동 적용 방지.

## §3. 활자 시스템

| 폰트 | 용도 | 호스팅 |
|---|---|---|
| **Pretendard Variable** | sans (본문 시스템 활자) | jsdelivr CDN |
| **Noto Serif KR** (500/600) | serif (헤드라인) | self-host (`@fontsource/noto-serif-kr`) |
| **Noto Sans KR** (500/700) | OG 이미지 (Satori) | self-host (`@fontsource/noto-sans-kr`) |
| **JetBrains Mono** (400/500) | mono (코드·메타) | self-host (`@fontsource/jetbrains-mono`) |

폰트 추가 금지 — 변경 시 별도 ADR.

### 활자 크기·자간

| 토큰 | 값 |
|---|---|
| 본문 | 17px / line-height 1.85 |
| TLDR | 17px / line-height 1.65 |
| H1 | 36px / line-height 1.35 / letter-spacing -0.015em |
| H2 (article) | 22px / 본문 line-height 1.4 |
| 카테고리 라벨 | 11px / letter-spacing 0.15em (자간 큰 라벨) |
| OG 헤드라인 | 50~96px (글 길이 기반 동적) |

## §4. 폭·여백

| 토큰 | 값 |
|---|---|
| `--width-prose` | 680px (본문 max-width) |
| `--width-page` | 1180px (페이지 max-width) |
| `--width-gutter` | 좌우 16px (모바일) ~ 24px (데스크톱) |
| 섹션 간격 | 56px (데스크톱) ~ 32px (모바일) |

## §5. 카테고리 컬러 코딩 — 절대 금지

CLAUDE.md 절대 금지: **카테고리 컬러 코딩 금지** (활자 라벨로만 구분).

| 카테고리 | 라벨 (자간 큰) |
|---|---|
| policy | 정 책 |
| tax-finance | 세 금 · 금 융 |
| market | 시 장 |
| stats | 통 계 |
| ai-tech | A I · 기 술 |

페르소나 색띠는 **OG 카드** 에서만 와인 액센트 1색을 사용 (페르소나 분류는 카테고리가 아님). 본문 페이지에서 페르소나/카테고리에 따라 다른 색 사용 금지.

## §6. 컴포넌트 카탈로그

### 본문 영역
- `<TrustBar>` — 본문 상단 신뢰 시그널 (📊 1차 출처 N건 · 🤖 AI-보조 등급 · ✏️ 업데이트 · ⚖ 정정 N건)
- `<ArticleHeader>` — 카테고리 라벨 + 발행 메타 + 헤드라인 + 저자/시간/AI 배지
- `<Tldr>` — 한 줄 요약 (paper-soft 배경, hairline border)
- `<SourceList>` — 1차 출처 표 (frontmatter sources 자동)
- `<CitationExport>` — APA/MLA/Chicago 인용 형식
- `<CorrectionsBlock>` — 정정 이력 (frontmatter correctionLog)
- `<AuthorCard>` — 저자 미니 프로필
- `<RelatedList>` — 관련 글 사이드바

### 홈·인덱스 영역
- `<Hero>` — 홈 섹션 01 (헤드라인 + tldr + byline + 선택적 chartData 차트)
- `<PulseCard>` — 펄스 카드 (선택적 coverImage 16:9 썸네일)
- `<PulseList>` — 카드 리스트 (border-top hairline)
- `<CategoryColumn>` / `<CategoryStrip>` — 카테고리별 5x3 그리드
- `<SisterSiteGrid>` / `<SisterSiteCard>` — 자매 사이트 카드

### 시스템 영역
- `<Header>` — sticky top, 네비게이션 + 검색
- `<Footer>` — 4 컬럼 (브랜드 + 콘텐츠 + 정책 + 자매 사이트)
- `<BreadcrumbMasthead>` — 기사 위 breadcrumb
- `<ArticleTOC>` — 데스크톱 사이드 TOC
- `<MobileBottomTabs>` — 모바일 bottom nav
- `<NewsletterCTA>` — Stibee 구독 (env 미설정 시 fallback)

### 동적 OG (Satori)
- `default` 템플릿 — 기사 (1200×630, 차트 오버레이 가능)
- `section` 템플릿 — 홈/카테고리/태그/저자

## §7. 디자인 절대 금지 (CLAUDE.md)

- ❌ `box-shadow`
- ❌ `linear-gradient`
- ❌ `border-radius ≥ 12px`
- ❌ `font-weight: 700` 본문 (max 500)
- ❌ 카테고리 컬러 코딩 (활자 라벨로만 구분)
- ❌ 폰트 추가 (Pretendard / Noto Serif KR / Noto Sans KR / JetBrains Mono 외)
- ❌ 다크 모드 자동 적용 (v1.2 까지 보류, `darkMode: 'class'` 명시)
- ❌ 컴포넌트 안에서 `global.css` 토큰 정의 (정의는 `:root` 만)
- ❌ inline JS event handler (`onclick="..."`) — `<script is:inline>` 만

## §8. 변경 이력

- **2026-05-06** — v1.0 시행. ADR 0005 + 0006 정합화.
- 향후 **v1.1**: 페르소나 색띠 OG 도입 검토 (카테고리 컬러 코딩과 분리).
- 향후 **v1.2**: 다크 모드 토큰 정의.
