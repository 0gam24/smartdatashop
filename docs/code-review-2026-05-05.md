# Code Review — 2026-05-05

Reviewer: independent code-review pass.
Scope: src/, public/, dist/ build artifacts, package.json, astro.config.mjs.
Build status: pass (`astro check`: 0 / 0 / 0; `npm run build`: 39 pages, 5.38s).

## Summary
- Files reviewed: ~70 .astro / .ts / .css / .yml
- Critical issues: 4
- Major issues: 9
- Minor / nits: 12
- Build status: pass

---

## Critical (fix before any release)

1. **`public/admin/config.yml:14` — `local_backend: true` ships in production build.**
   Confirmed at `dist/admin/config.yml`: the production-built site exposes `local_backend: true`. While `/admin/index.html` carries `<meta name="robots" content="noindex, nofollow">` and `robots.txt` disallows `/admin/`, anyone hitting `https://smartdatashop.kr/admin/config.yml` directly can see the GitHub repo path (`0gam24/smartdatashop`) plus the config flag the codebase itself flags as "운영 시에는 이 줄을 주석 처리할 것". Concrete fix: comment the line, or — better — gate it via an env var (e.g. `local_backend: ${LOCAL_DECAP:-false}`) and set the variable only locally; or move admin out of `public/` and copy it in only for `astro dev`.

2. **`src/components/PulseCard.astro:19` — homepage cards are not actually clickable.**
   The card root is `<article class="pulse-card" data-href={href}>`. There is no `<a>` wrapper, no click handler, no `data-href` listener anywhere in the codebase (Grep confirms). The only thing keeping the cursor as a pointer is `cursor: pointer` (line 40). Verified by inspecting `dist/index.html`: 5 cards rendered, none navigable. This breaks the entire "오늘의 펄스" section — the most prominent feature of the homepage. Same defect repeats in `src/components/CategoryColumn.astro:23` (`.cat-item`) and `src/components/SisterSiteCard.astro:12`. Fix: wrap the card body (or the title) in `<a href={href}>`. While there, audit other `cursor: pointer` non-anchor patterns.

3. **`src/components/PreviewBanner.astro` is mounted but the verification protocol is undermined by hardcoded fictional content elsewhere.**
   Banner correctly renders on every page (BaseLayout:147). However, the homepage Hero (`src/components/Hero.astro:34-46`) hardcodes "312만 명", "1.5배", "0.8초", "5분 읽기", "1차 출처 3건", and "AI 보조" badge — none of these flow from the verified content collection. They render as the H1 of the site, *above* the preview banner's "디자인 프리뷰" caveat (banner is sticky at top but visually small; Hero is the dominant page element). For an editorial-integrity-first site this is the single highest reputational risk. Fix: drive Hero from the latest pulse entry (`latest = sortedPulses[0]` already exists in `index.astro:27` but is only used for the link). Pull title/tldr/byline from `latest.data` and gate "AI 보조" on `latest.data.aiAssisted`.

4. **Editorial integrity — at least 4 specific Korean government statistics quoted in MDX entries are AI-generated and have no verified source.**
   - `src/content/pulse/2026-05-05-jongseong-server.mdx:27` — "일평균 접속자는 312만 명, 평균 응답시간은 0.8초", "작년 같은 기간 1.18초 대비 32% 단축" — quoted from an unpublished/non-existent NTS document and a "비공개 자료 (운영자 직접 청취)" source (line 14). The mdx is `aiAssisted: true`, `previewMode: true`, `verifiedBy: []` — protocol-correct in terms of frontmatter, but the body still confidently asserts numbers. The "비공개 자료" source is also dangerous: it cannot be verified.
   - `src/content/pulse/2026-05-05-cpi-april.mdx:5,20` — "2.1%", "외식 3.4%·가공식품 2.8%·신선식품 1.2%" with cited source `통계청 4월 소비자물가동향` published 2026-05-05 (a date the AI cannot have observed).
   - `src/content/pulse/2026-05-05-bok-ecos-household.mdx:5,20` — "+2.4조", "주담대 +3.1조", "신용대출 −0.7조", "5대 시중은행 신규 변동금리 평균 4.21%".
   - `src/content/pulse/2026-05-05-cheongnyeon-jutaek.mdx:5,20` — "121만 좌", "24~34세 가입률 38%".
   - `src/content/pulse/2026-05-05-kospi200-etf.mdx:5,20` — "3.2조", "TIGER·KODEX 양사 점유율이 78%".
   - `src/content/pulse/2026-05-05-nipa-ai-voucher.mdx:5,20` — "최대 800만 원, 800개 사", "작년 신청 경쟁률 4.2:1".
   - `src/content/insight/2026-05-04-korea-etf-map.mdx:27,33-37` — "832종", "2020년 468종", "31개 셀이 비어 있거나 3종 미만".
   The PreviewBanner partially mitigates this — but only partially. Strongly recommend: (a) before any indexing/launch, blank the body of every `previewMode: true` entry to a single placeholder line, *or* (b) add a build-time check that errors when `previewMode: true` AND the body length > N chars (sample-only enforcement).

   Source URLs are all institutional homepages (`https://ecos.bok.or.kr/`, `https://kostat.go.kr/`, `https://nts.go.kr/`, `https://krx.co.kr/`, `https://nipa.kr/`, `https://molit.go.kr/`, `https://kofia.or.kr/`) — that part is acceptable. The risk is in the body claims, not the URLs.

---

## Major (fix this week)

5. **`src/layouts/InsightLayout.astro:80` — insight pages have no JSON-LD.**
   `pages/insight/[slug].astro` does not call `buildArticleLD()` (it's defined in `lib/jsonld.ts:108` but never imported). The InsightLayout never accepts/passes a `jsonld` prop to BaseLayout. Result: insight pages emit zero structured data despite the framework being in place. Fix: mirror what `[year]/[month]/[day]/[slug].astro:38` does — `buildArticleLD(entry)` and thread it through InsightLayout.

6. **`src/layouts/PolicyLayout.astro:18` — policy pages have no JSON-LD.**
   Same pattern: PolicyLayout never accepts `jsonld`, so /about, /editorial-policy, /ai-policy, /corrections, /contact, /privacy, /terms, /affiliate-disclosure, /authors/junhyuk-kim ship without WebPage structured data. `buildWebPageLD` exists and is used on category/tag pages, just not policy pages. Fix: thread `jsonld` through PolicyLayout, default to `buildWebPageLD(title, description ?? title)` so all 9 policy pages get coverage automatically.

7. **`src/components/BreadcrumbMasthead.astro:25` — broken category breadcrumb.**
   `<a href="#" class="no-underline crumb-link">{breadcrumbCategoryLabel}</a>` always points to `#` (top of page) instead of the actual `/category/{slug}/` archive. Fix: take a category slug, build href via Astro `Astro.url.pathname` mapping or pass a `categoryHref` prop.

8. **`src/components/Footer.astro:27-52` — every footer link is `href="#"`.**
   Five content links + five policy links + four sister-site links + RSS link all use `#`. The sitemap lists /about, /editorial-policy, /ai-policy, /corrections, /privacy, /terms, /affiliate-disclosure as live, the category and insight archives exist, and `feed.xml` is generated — these should all be wired up. As-shipped the footer is decorative, not functional.

9. **`src/pages/index.astro:166-203` — sections 03/04/05/06 are completely fake.**
   `categories[]` (lines 47-92), `guidebooks[]` (95-118), and `sisters[]` (121-146) are inline arrays of strings hand-coded in the page. None come from content collections. Section 03 displays counts like "23편 · 31편 · 28편 · 19편 · 12편" against actual collection counts of 1/2/1/1/1. Section 06 hardcodes "최신 글" claims for sister sites. The home page's PreviewBanner does not change the meaning of this — the "분야별 최신" stories are presented as real headlines (e.g. "청년월세 특별지원 6월 마감, 잔여 예산 38%"). Fix: derive section 03 from `getCollection('pulse')` grouped by category; gate sections 04 (guidebook) / 06 (sisters) behind real data.

10. **`src/pages/article.astro:17` — meta-refresh redirect has no anti-loop guard, but more importantly, when there are no pulse entries it falls back to `/` — fine — but the page is also indexable.**
    No `<meta name="robots" content="noindex">` on this transient page. Crawlers may index `/article/` as a duplicate of the latest pulse. Fix: add `<meta name="robots" content="noindex,follow">`. Not an open-redirect — `target` is computed at build time from a known content collection, so this is safe.

11. **Tag chips on `PulseCard.astro:28` are non-linking spans.** Per the agent note, this is confirmed: `<span class={tag.action ? 'tag-chip action' : 'tag-chip'}>{tag.label}</span>` is a span, no anchor. The /tag/[group]/[slug] pages exist and work, so this is purely a wiring task: change to `<a href={tagUrl(groupOf(tag.label), tag.label)}>`. Note the PulseCard doesn't currently know the group of each tag — you'll either need to thread group info through the tag object (recommended) or call `groupOf()` from `lib/tags.ts` per chip.

12. **`src/components/Header.astro:30-34` — search-button SVG missing `aria-hidden`.**
    The button itself has `aria-label="기사 검색 열기"` so screen-reader name is fine, but the inner `<svg>` is announced redundantly. Add `aria-hidden="true"` to the svg. Sparkline svg in `Hero.astro:57` is purely decorative and similarly missing `aria-hidden="true"` — purely cosmetic but easy fix.

13. **`src/lib/articleUrl.ts` — dead module.**
    Only exports `pulseUrl as articleUrl`. Grep across `src/` shows zero importers (the actual consumers all import `pulseUrl` directly from `lib/korean.ts`). Either delete the file or actually use it. Likewise the `FUTURE_SISTER_SITES` block in `src/data/sister-sites.ts:42-74` is dead commented-out code — keep only if a Storybook-style future ref is intentional, otherwise remove.

---

## Minor / nits

14. **`public/admin/config.yml:8` — `repo: 0gam24/smartdatashop`** is a real-looking GitHub owner/repo, but the comments above it (line 4) reference `PLACEHOLDER_OWNER/PLACEHOLDER_REPO` as if it were unset. Either the comments are stale or the repo path was committed by mistake.

15. **`src/components/NewsletterCTA.astro:55` — `novalidate` plus manual `checkValidity()`.**
    The form sets `novalidate` (disables HTML5 validation tooltips) but then calls `emailInput.checkValidity()` (line 150). `checkValidity()` still works on a `novalidate` form — but the user no longer sees the native invalid-pattern bubble, only the JS-set status text. This is intentional per the comment style, but worth flagging.

16. **`src/components/NewsletterCTA.astro:34-35` — Stibee env var is exposed as `PUBLIC_*`.**
    Acceptable for a public subscribe endpoint (Stibee designs the endpoint to be public), but document this in `lib/stibee.ts` since the file already explains. Fine as-is.

17. **`src/layouts/BaseLayout.astro:111-125` — head loads three heavy network pings on every page.**
    `preconnect` to `fonts.googleapis.com`, `fonts.gstatic.com`, `cdn.jsdelivr.net`, plus a stylesheet from each. The Pretendard CDN call is render-blocking (as=style without onload swap). Two practical wins:
    - Self-host Pretendard subset (Korean glyphs are large; subsetting can save ~70%).
    - Remove the `dns-prefetch` line (114) — `preconnect` already implies dns lookup; the duplicate is harmless but noisy.

18. **`src/lib/jsonld.ts:85` — `articleSection` uses the spaced glyph form ("정 책") instead of plain "정책".** Search engines parse `articleSection` as a plain category string. The spaced form is a *visual* design treatment, not data. Use plain "정책"/"세금금융"/"시장"/"통계"/"AI기술" in JSON-LD. Add a `categoryToKoreanPlain()` helper (or just `.replace(/ /g, '')`).

19. **`src/components/SearchModal.astro:201` — `excerptEl.innerHTML = d.excerpt`.**
    Pagefind returns excerpts with `<mark>` tags, so the innerHTML is necessary. Pagefind sanitizes its index input from your built HTML, so this is acceptable in our static-site context, but worth a comment confirming the trust boundary (you already have a one-liner — fine).

20. **`src/content/pulse/2026-05-05-jongseong-server.mdx:14` — "비공개 자료 (운영자 직접 청취)".**
    A "비공개" source is a structural footgun for editorial credibility. It satisfies the schema (only `name` is required), but a source the reader cannot verify is *not* a 1차 출처. Recommendation: forbid this pattern via a zod refinement or, at minimum, emit a build warning when a source has no URL and the note matches `/비공개|미공개/`.

21. **`src/components/Hero.astro:172-174` — semantic color confusion.**
    `.delta.down` is colored `#1f4d8a` (link blue) for a *negative* delta, while positive uses `#8b1538` (accent). DESIGN.md forbids color-coded categories but says nothing about deltas; still, blue-for-down is unusual and may confuse readers. Either rename `.down` to something neutral or document the convention.

22. **`src/pages/[year]/[month]/[day]/[slug].astro:46` — `await getCollection('pulse')` called twice per article.**
    The same call is made on lines 13 and 46. Trivial perf, but for 6 articles the build runs 12 collection reads. Cache it.

23. **`src/pages/insight/[slug].astro:38` — same double `getCollection('insight')`.**

24. **`tailwind.config.ts:5` — `darkMode: 'media'` but no dark-mode tokens.**
    `global.css:35` notes "v1.0 is light-only — do not auto-switch on OS preference." But Tailwind is configured to do exactly that for any `dark:` utility a contributor may add. Set to `darkMode: 'class'` until v1.2 ships.

25. **`src/components/MobileBottomTabs.astro:46-51`** — "데일리" tab uses `href="/"` and is `active: false` always (line 51), while the "홈" tab also points to `/`. Two tabs to the same route, one never active.

---

## Out-of-scope but worth tracking

- The `dataPage`, `guidebook`, `guidebookChapter` collections are declared in `src/content/config.ts` but their directories are empty. `astro check` correctly emits glob-loader warnings (4 warnings on each build). Either remove the collection definitions until content lands or add `_placeholder.md` files.
- No automated test runs at all. Build passes is the only signal.
- No CSP / security headers configured. Cloudflare Pages can set these in `_headers`; PreviewBanner inline scripts and Chart.js / Pretendard CDN dependencies will need `script-src 'self' 'unsafe-inline' cdn.jsdelivr.net static.cloudflareinsights.com` — plan this before launch.
- Pagefind index size 783 KB for ~40 pages with 1,567 indexed words; will scale linearly, monitor at 100+ articles.
- The "VOL I · NO 89" counter is hardcoded in `Masthead.astro`, `BreadcrumbMasthead.astro`, `Footer.astro`, and 4 page files. When real volume tracking ships, this will be a multi-file refactor.

---

## Build report

### `npx astro check`
```
Result (70 files):
- 0 errors
- 0 warnings
- 0 hints
```
Three glob-loader runtime warnings on empty content directories (`guidebook`, `guidebookChapter`, `dataPage`) — non-blocking.

### `npm run build`
- 39 pages built in 5.38s
- 1 fallback warning: `[NewsletterCTA] PUBLIC_STIBEE_LIST_ID 미설정 — 구독 폼은 fallback 모드(실제 API 호출 없음)로 동작합니다.`
- Pagefind: 1 ko language, 39 pages, 1,567 words, "doesn't support stemming for ko" (informational).

### Build artifact size
- Total `dist/`: ~2.0 MB (115 files)
- `dist/pagefind/`: 783 KB (Pagefind UI bundles dominate)
- Largest 10 files:
  ```
  175,488 dist/pagefind/pagefind-component-ui.js
  119,987 dist/pagefind/pagefind-ui.js
   68,023 dist/pagefind/wasm.unknown.pagefind
   57,019 dist/index.html
   45,555 dist/pagefind/pagefind.js
   44,352 dist/pagefind/pagefind-highlight.js
   43,339 dist/pagefind/pagefind-component-ui.css
   41,255 dist/pagefind/pagefind-worker.js
   34,521 dist/2026/05/05/2026-05-05-jongseong-server/index.html
   32,197 dist/pagefind/index/ko_5624685.pf_index
  ```
  Note: `pagefind-component-ui.*` and `pagefind-ui.*` and `pagefind-highlight.js` are NOT used by `SearchModal.astro` (it dynamically imports only `/pagefind/pagefind.js`). Pagefind ships them by default; consider running `pagefind --site dist --keep-index-url --output-subdir pagefind` with subset flags or removing the unused UI bundles in postbuild — saves ~380 KB.

### News sitemap
- `dist/news-sitemap.xml` correctly lists all 6 pulses within the 48-hour window.
- Dates emitted in UTC ("2026-05-04T22:32:00.000Z") — KST source 2026-05-05T07:32+09:00 round-trips correctly. Verified.

### Type-safety inventory
- `: any` / `as any`: 0 occurrences.
- `as` casts: a handful (`Astro.props as Props` in dynamic routes, `window as unknown as { openSearch }` in SearchModal:100). All justified.
- `tsconfig` extends `astro/tsconfigs/strict`. Good.
