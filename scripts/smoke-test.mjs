#!/usr/bin/env node
/**
 * smoke-test.mjs — 빌드 산출물 회귀 검출 (Phase 13)
 *
 * 자동 안전장치 5계층의 빌드-결과 단계 검증.
 * Phase 0~12 동안 도입된 모든 자산이 dist/ 에 정상 생성됐는지 1회 점검.
 *
 * 사용:
 *   npm run smoke         # 정상이면 exit 0, 회귀 1건이라도 있으면 exit 1
 *
 * 검증 항목:
 *   1. 핵심 sitemap 3종 존재 (sitemap-index, news-sitemap, image-sitemap)
 *   2. 모든 OG v2 카드 PNG 정상 (≥10KB, valid PNG header)
 *   3. 정책 페이지 8개 자동 noindex 적용 여부
 *   4. 모든 article 페이지에 TrustBar + JSON-LD 3종(Article/Breadcrumb/Dataset) 발행
 *   5. robots.txt 에 AI 봇 차단 블록 존재
 *   6. CC license link 존재
 *   7. Pagefind 인덱스 정상 (`/pagefind/pagefind.js`)
 */

import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');

const failures = [];
const passes = [];

function check(name, ok, detail = '') {
  if (ok) {
    passes.push(name);
  } else {
    failures.push(`${name}${detail ? ' — ' + detail : ''}`);
  }
}

function readDist(rel) {
  try {
    return readFileSync(join(DIST, rel), 'utf8');
  } catch {
    return null;
  }
}

// ── 1. dist/ 존재 ──────────────────────────────────────────────────
if (!existsSync(DIST)) {
  console.error('[smoke] dist/ 없음 — `npm run build` 먼저 실행');
  process.exit(2);
}

// ── 2. 핵심 sitemap 3종 ────────────────────────────────────────────
check('sitemap-index.xml', existsSync(join(DIST, 'sitemap-index.xml')));
check('sitemap-0.xml', existsSync(join(DIST, 'sitemap-0.xml')));
check('news-sitemap.xml', existsSync(join(DIST, 'news-sitemap.xml')));
check('image-sitemap.xml', existsSync(join(DIST, 'image-sitemap.xml')));

// ── 3. OG v2 카드 ──────────────────────────────────────────────────
function walkOgPngs(dir, out = []) {
  let items;
  try {
    items = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const item of items) {
    const p = join(dir, item.name);
    if (item.isDirectory()) walkOgPngs(p, out);
    else if (item.name.endsWith('.png')) out.push(p);
  }
  return out;
}
const ogV2Dir = join(DIST, 'og', 'v2');
const ogPngs = walkOgPngs(ogV2Dir);
check('OG v2 카드 ≥ 14개', ogPngs.length >= 14, `현재 ${ogPngs.length}개`);
const tooSmall = ogPngs.filter((p) => statSync(p).size < 10_000);
check('모든 OG v2 ≥ 10KB', tooSmall.length === 0, tooSmall.length > 0 ? `${tooSmall.length}개 미달` : '');
const invalidPng = ogPngs.filter((p) => {
  const buf = readFileSync(p);
  return !(buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47);
});
check('PNG 헤더 시그니처', invalidPng.length === 0, invalidPng.length > 0 ? `${invalidPng.length}개 손상` : '');

// ── 4. 정책 페이지 robots ↔ TODO/placeholder 정합 ──────────────────
// 동적 검사: TODO 마커 있으면 noindex, 없으면 index. 어느 쪽이든 동치성 충족.
const policyPages = [
  'about',
  'corrections',
  'editorial-policy',
  'ai-policy',
  'terms',
  'privacy',
  'contact',
  'affiliate-disclosure',
];
let policyConsistent = 0;
for (const slug of policyPages) {
  const html = readDist(`${slug}/index.html`);
  if (!html) continue;
  // 페이지 본문에 TODO/검수후 토큰이 잔존하면 noindex 가 강제돼야 한다.
  const hasUnresolvedToken = /\[\s*TODO\b[^\]]*\]/i.test(html) || /\[\s*검수\s*후/.test(html);
  const robotsMatch = html.match(/<meta name="robots" content="([^"]+)"/);
  const hasNoIndex = robotsMatch ? /noindex/.test(robotsMatch[1]) : false;
  if (hasUnresolvedToken === hasNoIndex) policyConsistent++;
}
check(
  '정책 페이지 robots ↔ TODO 정합',
  policyConsistent === policyPages.length,
  `${policyConsistent}/${policyPages.length}`,
);

// ── 5. 저자 페이지는 정상 색인 ─────────────────────────────────────
const authorHtml = readDist('authors/junhyuk-kim/index.html');
if (authorHtml) {
  const robotsMatch = authorHtml.match(/<meta name="robots" content="([^"]+)"/);
  const indexable = robotsMatch && /^index/.test(robotsMatch[1]);
  check('저자 페이지 색인 가능', indexable, '저자 페이지에 noindex 잘못 부여됨');
}

// ── 6. 펄스 글 — TrustBar + JSON-LD + placeholder/noindex 정합 ────
//
// noindex 정합성 검사: 본문에 `[검수 후 ...]` 토큰이 있으면 noindex 가 부여돼야
// 하고, 없으면 index 가 부여돼야 한다. 어느 쪽이든 "placeholder 존재 ↔ noindex"
// 동치성이 핵심. 글이 모두 정리된 상태(현재)에서는 모두 index 가 정상.
const pulseDir = join(DIST, '2026', '05', '05');
let pulseChecked = 0;
let pulseTrustBar = 0;
let pulseDatasetLD = 0;
let pulseRobotsConsistent = 0;
function walkArticleHtmls() {
  let items;
  try {
    items = readdirSync(pulseDir);
  } catch {
    return;
  }
  for (const slug of items) {
    const html = readDist(`2026/05/05/${slug}/index.html`);
    if (!html) continue;
    pulseChecked++;
    const hasPlaceholderText = /\[\s*검수\s*후/.test(html);
    const hasNoIndex = /<meta name="robots" content="noindex/.test(html);
    if (hasPlaceholderText === hasNoIndex) pulseRobotsConsistent++;
    if (/class="trust-bar"/.test(html)) pulseTrustBar++;
    if (/"@type":"Dataset"/.test(html)) pulseDatasetLD++;
  }
}
walkArticleHtmls();
check('펄스 글 빌드됨', pulseChecked > 0, `현재 ${pulseChecked}개`);
check(
  '펄스 robots ↔ placeholder 정합',
  pulseRobotsConsistent === pulseChecked,
  `${pulseRobotsConsistent}/${pulseChecked} — placeholder 있으면 noindex, 없으면 index`,
);
check('펄스 TrustBar 렌더', pulseTrustBar === pulseChecked, `${pulseTrustBar}/${pulseChecked}`);
check('펄스 Dataset LD 자동 발행', pulseDatasetLD === pulseChecked, `${pulseDatasetLD}/${pulseChecked}`);

// ── 7. 인사이트 — JSON-LD G10 픽스 검증 ──────────────────────────
const insightHtml = readDist('insight/2026-05-04-korea-etf-map/index.html');
if (insightHtml) {
  check('인사이트 Article LD', /"@type":"Article"/.test(insightHtml));
  check('인사이트 Breadcrumb LD', /"@type":"BreadcrumbList"/.test(insightHtml));
  check('인사이트 Dataset LD', /"@type":"Dataset"/.test(insightHtml));
  check('인사이트 TrustBar', /class="trust-bar"/.test(insightHtml));
}

// ── 8. robots.txt AI 봇 차단 ───────────────────────────────────────
const robots = readDist('robots.txt');
if (robots) {
  check('robots GPTBot 차단', /User-agent: GPTBot[\s\S]*Disallow: \//.test(robots));
  check('robots ClaudeBot 차단', /User-agent: ClaudeBot[\s\S]*Disallow: \//.test(robots));
  check('robots CCBot 차단', /User-agent: CCBot[\s\S]*Disallow: \//.test(robots));
  check('robots Yeti(네이버) 허용', /User-agent: Yeti\nAllow: \//.test(robots));
  check('robots image-sitemap 등록', robots.includes('image-sitemap.xml'));
}

// ── 9. CC license meta ────────────────────────────────────────────
const homeHtml = readDist('index.html');
if (homeHtml) {
  check(
    'CC license link',
    /<link rel="license" href="https:\/\/creativecommons\.org\/licenses\/by-nc\/4\.0\/"/.test(homeHtml),
  );
  check('홈 OG v2 폴백', /og\/v2\/home\.png/.test(homeHtml));
}

// ── 10. Pagefind 인덱스 ───────────────────────────────────────────
check('Pagefind JS', existsSync(join(DIST, 'pagefind', 'pagefind.js')));

// ── 11. 가이드북 라우트 — Phase 17 신설 회귀 가드 ─────────────────
//
// /guidebook/{slug}/ : 책 detail 페이지 — Book + CollectionPage + ItemList +
//   Breadcrumb LD 4종 + 챕터 ol + 진행률 시각.
// /guidebook/{book}/{chapter}/ : 챕터 본문 — TrustBar + ReadingProgress +
//   ChapterTOC mount + 읽기시간 메타 + footnote 섹션 + Breadcrumb LD.
function walkGuidebookSlugs() {
  const dir = join(DIST, 'guidebook');
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}
const bookSlugs = walkGuidebookSlugs();
check('가이드북 책 ≥ 1권', bookSlugs.length >= 1, `현재 ${bookSlugs.length}권`);

// 가이드북 인덱스 페이지 — Ralph 회차 10 신설
const gbIndex = readDist('guidebook/index.html');
check('가이드북 인덱스 페이지', !!gbIndex);
if (gbIndex) {
  check('가이드북 인덱스 CollectionPage LD', /"@type":"CollectionPage"/.test(gbIndex));
  check('가이드북 인덱스 ItemList LD', /"@type":"ItemList"/.test(gbIndex));
  check('가이드북 인덱스 Breadcrumb LD', /"@type":"BreadcrumbList"/.test(gbIndex));
}

// ── 14. 고급화 라우트 — Ralph 회차 12 ─────────────────────────────
//
// methodology / data 인덱스 / topic ×3 — 모두 신설 라우트 회귀 가드.
// 운영자가 이 페이지 중 하나라도 깨면 즉시 검출.
const methodologyHtml = readDist('methodology/index.html');
check('methodology 페이지', !!methodologyHtml);
if (methodologyHtml) {
  check('methodology Breadcrumb LD', /"@type":"BreadcrumbList"/.test(methodologyHtml));
  check('methodology WebPage LD', /"@type":"WebPage"/.test(methodologyHtml));
  check('methodology 발행 4기준 본문', /발행 4 기준/.test(methodologyHtml));
}

const dataIndexHtml = readDist('data/index.html');
check('데이터셋 인덱스', !!dataIndexHtml);
if (dataIndexHtml) {
  check('데이터셋 인덱스 Dataset LD', /"@type":"Dataset"/.test(dataIndexHtml));
  check('데이터셋 인덱스 distribution', /"@type":"DataDownload"/.test(dataIndexHtml));
}
check('citations.json', existsSync(join(DIST, 'data', 'citations.json')));
check('citations.csv', existsSync(join(DIST, 'data', 'citations.csv')));
const citationsJson = readDist('data/citations.json');
if (citationsJson) {
  let parsed;
  try {
    parsed = JSON.parse(citationsJson);
  } catch {}
  check('citations.json 유효 JSON', !!parsed);
  if (parsed) {
    check('citations.json record 수 > 0', parsed.record_count > 0, `현재 ${parsed.record_count}`);
    check('citations.json 9 컬럼', parsed.columns?.length === 9, `현재 ${parsed.columns?.length}`);
  }
}

const topicSlugs = ['jongseong', 'etf', 'ai-support'];
let topicOK = 0;
let topicLD = 0;
let topicItemList = 0;
for (const t of topicSlugs) {
  const html = readDist(`topic/${t}/index.html`);
  if (!html) continue;
  topicOK++;
  if (/"@type":"CollectionPage"/.test(html)) topicLD++;
  if (/"@type":"ItemList"/.test(html)) topicItemList++;
}
check('Topic 페이지 ≥ 3', topicOK === topicSlugs.length, `${topicOK}/${topicSlugs.length}`);
check('Topic CollectionPage LD', topicLD === topicSlugs.length, `${topicLD}/${topicSlugs.length}`);
check('Topic ItemList LD', topicItemList === topicSlugs.length, `${topicItemList}/${topicSlugs.length}`);

let bookOK = 0;
let bookLDOK = 0;
let bookBreadcrumbOK = 0;
for (const slug of bookSlugs) {
  const html = readDist(`guidebook/${slug}/index.html`);
  if (!html) continue;
  bookOK++;
  if (/"@type":"Book"/.test(html)) bookLDOK++;
  if (/"@type":"BreadcrumbList"/.test(html)) bookBreadcrumbOK++;
}
check('가이드북 책 detail 빌드', bookOK === bookSlugs.length, `${bookOK}/${bookSlugs.length}`);
check('가이드북 Book LD', bookLDOK === bookSlugs.length, `${bookLDOK}/${bookSlugs.length}`);
check(
  '가이드북 책 Breadcrumb LD',
  bookBreadcrumbOK === bookSlugs.length,
  `${bookBreadcrumbOK}/${bookSlugs.length}`,
);

// 챕터 페이지 — 책 폴더 안 숫자 디렉토리 = 챕터 detail 라우트
function collectChapterPaths() {
  const out = [];
  for (const slug of bookSlugs) {
    const bookDir = join(DIST, 'guidebook', slug);
    let items;
    try {
      items = readdirSync(bookDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const it of items) {
      if (!it.isDirectory()) continue;
      // 숫자 챕터 번호만 (책 detail 의 index.html 은 파일이라 무관)
      if (!/^\d+$/.test(it.name)) continue;
      out.push({ slug, chapter: it.name });
    }
  }
  return out;
}
const chapters = collectChapterPaths();
check('가이드북 챕터 ≥ 1편', chapters.length >= 1, `현재 ${chapters.length}편`);

let chReadingProgress = 0;
let chTOC = 0;
let chReadingTimeMeta = 0;
let chTrustBar = 0;
let chFootnoteSection = 0;
for (const c of chapters) {
  const html = readDist(`guidebook/${c.slug}/${c.chapter}/index.html`);
  if (!html) continue;
  if (/data-reading-progress/.test(html)) chReadingProgress++;
  if (/data-chapter-toc/.test(html)) chTOC++;
  if (/분 읽기/.test(html)) chReadingTimeMeta++;
  if (/class="trust-bar"/.test(html)) chTrustBar++;
  if (/section data-footnotes/.test(html)) chFootnoteSection++;
}
check('챕터 ReadingProgress 마운트', chReadingProgress === chapters.length, `${chReadingProgress}/${chapters.length}`);
check('챕터 ChapterTOC 마운트', chTOC === chapters.length, `${chTOC}/${chapters.length}`);
check('챕터 읽기시간 메타', chReadingTimeMeta === chapters.length, `${chReadingTimeMeta}/${chapters.length}`);
check('챕터 TrustBar', chTrustBar === chapters.length, `${chTrustBar}/${chapters.length}`);
// footnote 섹션은 본문에 [^N] 마커가 있는 챕터만 — 13/13 모두 마커 보유 확인됨
check('챕터 footnote 섹션 노출 (display:none 회귀 가드)', chFootnoteSection === chapters.length, `${chFootnoteSection}/${chapters.length}`);

// 챕터 placeholder ↔ noindex 정합 + Breadcrumb LD + CC license meta
let chRobotsConsistent = 0;
let chBreadcrumb = 0;
let chCCLicense = 0;
for (const c of chapters) {
  const html = readDist(`guidebook/${c.slug}/${c.chapter}/index.html`);
  if (!html) continue;
  const hasPlaceholderText = /\[\s*검수\s*후/.test(html);
  const hasNoIndex = /<meta name="robots" content="noindex/.test(html);
  if (hasPlaceholderText === hasNoIndex) chRobotsConsistent++;
  if (/"@type":"BreadcrumbList"/.test(html)) chBreadcrumb++;
  if (/<link rel="license" href="https:\/\/creativecommons\.org\/licenses\/by-nc\/4\.0\/"/.test(html))
    chCCLicense++;
}
check(
  '챕터 robots ↔ placeholder 정합',
  chRobotsConsistent === chapters.length,
  `${chRobotsConsistent}/${chapters.length}`,
);
check('챕터 Breadcrumb LD', chBreadcrumb === chapters.length, `${chBreadcrumb}/${chapters.length}`);
check('챕터 CC license link', chCCLicense === chapters.length, `${chCCLicense}/${chapters.length}`);

// ── 12. 사이트맵 정합성 — Ralph 회차 4~6 ──────────────────────────
//
// (a) sitemap-0.xml URL 들이 dist/ 에 실제로 빌드돼 있는지 (404 회귀 가드)
// (b) news-sitemap.xml 도 동일
// (c) image-sitemap.xml 의 image:loc 가 dist 에 PNG 로 존재
function urlToDistPath(url) {
  // https://smartdatashop.kr/foo/bar/  →  foo/bar/index.html
  // 한국어 태그 라우트는 URL-encoded — dist 파일 시스템은 UTF-8 이라 decode 필요.
  let path = url.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '');
  try {
    path = decodeURIComponent(path);
  } catch {
    // 복원 불가하면 원본 사용 (실패 검출은 다음 existsSync 가 처리)
  }
  if (path === '' || path.endsWith('/')) return `${path}index.html`;
  return path;
}
function extractLocs(xml, tag = 'loc') {
  const re = new RegExp(`<${tag}>([^<]+)</${tag}>`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(xml))) out.push(m[1]);
  return out;
}
const mainSitemap = readDist('sitemap-0.xml') ?? '';
const mainUrls = extractLocs(mainSitemap, 'loc');
let mainExists = 0;
for (const u of mainUrls) {
  if (existsSync(join(DIST, urlToDistPath(u)))) mainExists++;
}
check('sitemap-0 URL ↔ dist 정합', mainExists === mainUrls.length, `${mainExists}/${mainUrls.length}`);

const newsSitemap = readDist('news-sitemap.xml') ?? '';
const newsUrls = extractLocs(newsSitemap, 'loc');
let newsExists = 0;
for (const u of newsUrls) {
  if (existsSync(join(DIST, urlToDistPath(u)))) newsExists++;
}
check('news-sitemap URL ↔ dist 정합', newsExists === newsUrls.length, `${newsExists}/${newsUrls.length}`);

const imgSitemap = readDist('image-sitemap.xml') ?? '';
const imgLocs = extractLocs(imgSitemap, 'image:loc');
let imgExists = 0;
for (const u of imgLocs) {
  const p = u.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '');
  if (existsSync(join(DIST, p))) imgExists++;
}
check('image-sitemap image ↔ dist 정합', imgExists === imgLocs.length, `${imgExists}/${imgLocs.length}`);

// ── 13. 챕터 무결성 추가 — Ralph 회차 7~9 ────────────────────────
//
// (d) footnote 마커 [^N] ↔ footnote 정의 매칭 — MDX 가 모든 마커를
//     <sup data-footnote-ref> 로, 정의를 <li id="user-content-fn-N"> 로 변환.
//     마커 수 = 정의 수 여야 한다 (MDX 자동 처리지만 회귀 가드).
// (e) source-link href 가 https:// + 도메인 형태 — 1차 출처 fabrication 방지.
// (f) chapter h2 에 id 속성 부여 — ChapterTOC 가 의존하는 회귀 가드.
let chFootnoteBalanced = 0;
let chSourceLinksValid = 0;
let chHeadingIdOK = 0;
const httpsDomain = /^https:\/\/(?!\.)[a-z0-9.-]+\.[a-z]{2,}\b/i;
for (const c of chapters) {
  const html = readDist(`guidebook/${c.slug}/${c.chapter}/index.html`);
  if (!html) continue;
  // footnote balance — 마커 href #user-content-fn-N 의 distinct ID set 이
  // 정의 <li id="user-content-fn-N"> 의 set 과 일치해야 한다.
  // (한 footnote 가 본문에서 N 번 인용돼도 정의는 1개 — 단순 카운트 비교는 X)
  const markerIds = new Set(
    [...html.matchAll(/href="#user-content-fn-([a-z0-9_-]+)"/gi)].map((m) => m[1]),
  );
  const defIds = new Set(
    [...html.matchAll(/<li id="user-content-fn-([a-z0-9_-]+)"/gi)].map((m) => m[1]),
  );
  const balanced =
    markerIds.size === defIds.size && [...markerIds].every((id) => defIds.has(id));
  if (balanced) chFootnoteBalanced++;
  // source-link 호스트
  const srcLinks = [...html.matchAll(/href="([^"]+)"\s+class="source-link/g)].map((m) => m[1]);
  const allValid = srcLinks.length === 0 || srcLinks.every((u) => httpsDomain.test(u));
  if (allValid) chSourceLinksValid++;
  // h2 id (ChapterTOC 의존)
  const h2WithId = (html.match(/<h2[^>]*\sid="[^"]+"/g) || []).length;
  if (h2WithId >= 3) chHeadingIdOK++;
}
check('챕터 footnote 마커 ↔ 정의 정합', chFootnoteBalanced === chapters.length, `${chFootnoteBalanced}/${chapters.length}`);
check(
  '챕터 source-link 호스트 baseline (HTTPS + 도메인)',
  chSourceLinksValid === chapters.length,
  `${chSourceLinksValid}/${chapters.length}`,
);
check(
  '챕터 h2 id 부여 ≥ 3 (ChapterTOC 회귀 가드)',
  chHeadingIdOK === chapters.length,
  `${chHeadingIdOK}/${chapters.length}`,
);

// ── 출력 ──────────────────────────────────────────────────────────
console.log('');
console.log(`✅ ${passes.length} 통과`);
if (failures.length === 0) {
  console.log('🎉 회귀 0건 — 빌드 산출물 정상');
  process.exit(0);
} else {
  console.log(`❌ ${failures.length} 실패:`);
  for (const f of failures) console.log(`   ✗ ${f}`);
  process.exit(1);
}
