# 아키텍처 — Context Map

> 출처 패턴: book 19303 P6 (Context Maps). AI 에이전트와 사람이 코드베이스를 5분 안에 탐색하기 위한 단일 페이지 레퍼런스.
>
> 이 문서는 **구조적 오리엔테이션 전용**. 비즈니스 전략은 `PLANNING.md`, 디자인 토큰은 `DESIGN.md`, 에이전트 자동화 명세는 `AGENTS.md` 참조.

---

## 한 줄 사이트 정의

> **smartdatashop.kr** — Astro 5 기반 한국어 데이터 저널리즘 사이트. 1 토픽 → N 페르소나로 동시 발행하는 펄스/인사이트/가이드북 모델.

**Tech stack**: Astro 5 + TypeScript + Tailwind 3 + MDX + Decap CMS + Cloudflare Pages + Pagefind + Chart.js + Stibee. 정적 사이트(SSG), Node.js 서버 없음.

---

## 폴더 맵

| 폴더 | 역할 (한 줄) |
|---|---|
| `src/components/` | 30+ Astro 컴포넌트. scoped CSS 원칙. 글로벌 토큰 직접 수정 금지. |
| `src/layouts/` | `BaseLayout` / `ArticleLayout` / `InsightLayout` / `PolicyLayout` 4종. |
| `src/lib/` | `korean.ts` (KST 헬퍼) / `jsonld.ts` (LD 빌더) / `stibee.ts` (뉴스레터) / `tags.ts`. |
| `src/data/` | `sister-sites.ts` / `toll-gate-matrix.ts` (PLANNING.md §12). 정적 데이터 소스. |
| `src/content/` | Astro content collections (`pulse` / `insight` / `guidebook` / ...). Zod 스키마로 검증. |
| `src/pages/` | 파일 기반 라우트. 펄스/인사이트는 collection 기반 동적 라우트. |
| `public/` | 정적 자산. `/admin/` (Decap loader), favicons, OG 카드, `robots.txt`. |
| `scripts/agents/` | 6 에이전트 stub (writer / desk-reviewer / scout / publisher / network-orchestrator / editor). M1+ 본격 구현. |
| `.github/workflows/` | 7 CI/cron 워크플로우 (build / sitemap / sister-sync 등). |
| `docs/` | `DESIGN.md` / `PLANNING.md` / `AGENTS.md` + `references/` (참고 책 5권 요약) + `decisions/` (ADR). |

---

## 크리티컬 파일 — "이걸 건드리면 같이 보세요"

| 파일 | 역할 + 같이 검토할 것 |
|---|---|
| `src/styles/global.css` | **토큰 권위(authority)**. `:root` 블록만 디자인 토큰. 컴포넌트 전용 스타일 절대 추가 금지 → `DESIGN.md`. |
| `src/content/config.ts` | 모든 collection의 Zod 스키마. 필드 변경 시 기존 `*.mdx` 마이그레이션 필요 → `PLANNING.md` §6. |
| `src/layouts/BaseLayout.astro` | head 주입 지점 (OG / JSON-LD / manifest / Cloudflare Analytics). 변경 시 SEO 회귀 검증. |
| `astro.config.mjs` | sitemap filter, integrations (mdx / sitemap / pagefind). 라우트 노출/숨김 로직 여기. |
| `public/admin/index.html` + `src/pages/admin/config.yml.ts` | Decap CMS. config는 APIRoute로 `import.meta.env.DEV`일 때만 `local_backend: true`. → ADR 0004. |
| `src/lib/korean.ts` | KST 시간대 헬퍼. **모든 날짜 추출은 여기 통과**. `Date.getFullYear()` 직접 호출 금지. → ADR 0001. |
| `src/data/toll-gate-matrix.ts` | 자매 사이트 라우팅 룰. 새 사이트 합류 시 매트릭스 + `sister-sites.ts` 동시 갱신 → ADR 0003. |
| `.gitignore` | `.claude/` / `tmp/` / `.env` 절대 untrack 금지. 개인 설정·학습 메모리·시크릿 보호. |
| `package.json` | 의존성 추가 시 빌드 시간/번들 크기 영향 검토. Cloudflare Pages 빌드 캐시 고려. |
| `docs/AGENTS.md` | 룰 파일. 변경 시 일반 코드 PR과 동등하게 리뷰. (book 19470 A5) |

---

## 새 것은 어디에 — 결정 트리

| 추가하려는 것 | 위치 | 검증 |
|---|---|---|
| 새 펄스 글 | `src/content/pulse/YYYY-MM-DD-slug.mdx` | frontmatter Zod 통과 / `previewMode` 명시 |
| 새 인사이트 글 | `src/content/insight/...` | collection 스키마 + `verifiedBy` 명시 |
| 새 컴포넌트 | `src/components/[Name].astro` | scoped CSS만, global.css 미수정 |
| 새 페이지 라우트 (정적) | `src/pages/...` | 단, 인사이트/펄스는 collection 기반 동적 라우트 |
| 새 디자인 토큰 | `src/styles/global.css` `:root` 블록 | DESIGN.md 토큰 표 갱신 |
| 새 자매 사이트 | `src/data/sister-sites.ts` 추가 + `toll-gate-matrix.ts` 갱신 | PLANNING.md §12 룰 통과 |
| 새 콘텐츠 타입 | `src/content/config.ts` 스키마 추가 + 폴더 생성 + ArticleLayout 변형 | 마이그레이션 검토 |
| 새 lib 헬퍼 | `src/lib/[name].ts` | 단일 책임 / 테스트 가능 (book 19303 P2) |
| 새 ADR | `docs/decisions/NNNN-제목.md` | `0000-template.md` 형식 준수 |
| 새 정적 자산 (이미지/폰트) | `public/` 하위 | 빌드 시 그대로 배포되는 진정한 static만 |

---

## 이 문서에 추가하지 말 것

- **비즈니스 전략 / KPI / 12개월 로드맵** → `docs/PLANNING.md`
- **디자인 토큰 / 컴포넌트 시각 스펙** → `docs/DESIGN.md`
- **에이전트 자동화 명세 / Sub-agent 4요소 / Hook 정책** → `docs/AGENTS.md`
- **일일/주간/월간 운영 체크리스트** → `docs/operations.md`
- **에러 디버깅 이력** → `docs/error-log.md`
- **큰 의사결정 발자국** → `docs/decisions/NNNN-*.md`

이 파일은 **순수 구조 오리엔테이션**. 폴더가 어디에 있고, 새 것을 어디에 두며, 무엇을 같이 검토해야 하는지만 답한다.

---

## 관련 문서

- `docs/PLANNING.md` — 12개월 로드맵 / KPI / 자매 사이트 합류 일정
- `docs/DESIGN.md` — 디자인 토큰 / 컴포넌트 카탈로그
- `docs/AGENTS.md` — 룰 파일 / 에이전트 자동화
- `docs/dashboard.md` — 30초 스캔용 현재 상태
- `docs/operations.md` — 운영 체크리스트
- `docs/references/04-통합-3레이어-OS.md` — 외부/실행/제어 3-레이어 의사결정 가이드
