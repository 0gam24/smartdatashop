#!/usr/bin/env node
/**
 * fetch-rss-government.mjs
 *
 * 14개 정부 RSS 피드 동시 fetch → 정규화 → 1개 JSON 저장.
 * 매일 cron 또는 `npm run fetch:rss:government` 으로 실행.
 *
 * 출처:
 *   - 정부24 portal/rss/{010000~120000}  (12 카테고리)
 *   - 대한민국 정책브리핑 korea.kr {policy.xml, report.xml}
 *
 * OUT: data/rss/government.json
 *
 * 인증키 불필요 (RSS 공개).
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const REPO_ROOT = process.cwd();
const OUT_PATH = resolve(REPO_ROOT, 'data/rss/government.json');
const FETCH_TIMEOUT_MS = 12000;
const MAX_ITEMS_PER_SOURCE = 10;

// ─────────────────────────────────────────────────────────────
// Sources — id, 표시명, URL, 카테고리 (사이트 매핑)
// ─────────────────────────────────────────────────────────────

const KOREA_KR = (path) => `https://www.korea.kr/rss/${path}`;
const GOV24    = (code) => `https://www.gov.kr/portal/rss/${code}`;

const SOURCES = [
  // ─── 정부24 — 12 카테고리 ──────────────────────────────────────
  { id: 'gov24-030000', name: '정부24 경제·세금·법률', url: GOV24('030000'), category: '경제', tier: 1 },
  { id: 'gov24-090000', name: '정부24 주택·부동산',    url: GOV24('090000'), category: '주거', tier: 1 },
  { id: 'gov24-020000', name: '정부24 창업·중소기업',  url: GOV24('020000'), category: '경제', tier: 2 },
  { id: 'gov24-060000', name: '정부24 혼인·육아·교육', url: GOV24('060000'), category: '가계', tier: 2 },
  { id: 'gov24-050000', name: '정부24 보건·의료',     url: GOV24('050000'), category: '보건', tier: 2 },
  { id: 'gov24-010000', name: '정부24 채용·복지일자리', url: GOV24('010000'), category: '고용', tier: 2 },
  { id: 'gov24-040000', name: '정부24 일상생활·병역', url: GOV24('040000'), category: '생활', tier: 3 },
  { id: 'gov24-070000', name: '정부24 환경·재난',     url: GOV24('070000'), category: '환경', tier: 3 },
  { id: 'gov24-080000', name: '정부24 폭력·범죄',     url: GOV24('080000'), category: '안전', tier: 3 },
  { id: 'gov24-100000', name: '정부24 자동차·교통',   url: GOV24('100000'), category: '교통', tier: 3 },
  { id: 'gov24-110000', name: '정부24 자원봉사·지역', url: GOV24('110000'), category: '지역', tier: 3 },
  { id: 'gov24-120000', name: '정부24 여가·문화',     url: GOV24('120000'), category: '문화', tier: 3 },

  // ─── 정책브리핑 (korea.kr) — 카테고리 14개 ────────────────────────
  { id: 'korea-policy',       name: '정책브리핑 정책정보',  url: KOREA_KR('policy.xml'),       category: '정책', tier: 1 },
  { id: 'korea-report',       name: '정책브리핑 보도자료',  url: KOREA_KR('report.xml'),       category: '정책', tier: 1 },
  { id: 'korea-pressrelease', name: '정책브리핑 보도참고',  url: KOREA_KR('pressrelease.xml'), category: '정책', tier: 1 },
  { id: 'korea-cabinet',      name: '정책브리핑 국무회의',  url: KOREA_KR('cabinet.xml'),      category: '정책', tier: 1 },
  { id: 'korea-ebriefing',    name: '정책브리핑 e-브리핑',  url: KOREA_KR('ebriefing.xml'),    category: '정책', tier: 1 },
  { id: 'korea-fact',         name: '정책브리핑 팩트체크',  url: KOREA_KR('fact.xml'),         category: '검증', tier: 1 },
  { id: 'korea-column',       name: '정책브리핑 칼럼',     url: KOREA_KR('column.xml'),       category: '해설', tier: 2 },
  { id: 'korea-insight',      name: '정책브리핑 인사이트',  url: KOREA_KR('insight.xml'),      category: '해설', tier: 2 },
  { id: 'korea-expdoc',       name: '정책브리핑 전문가자료', url: KOREA_KR('expdoc.xml'),       category: '해설', tier: 2 },
  { id: 'korea-speech',       name: '정책브리핑 연설',     url: KOREA_KR('speech.xml'),       category: '정책', tier: 2 },
  { id: 'korea-president',    name: '정책브리핑 대통령실',  url: KOREA_KR('president.xml'),    category: '정책', tier: 2 },
  { id: 'korea-archive',      name: '정책브리핑 자료실',   url: KOREA_KR('archive.xml'),      category: '자료', tier: 2 },
  { id: 'korea-media',        name: '정책브리핑 미디어',   url: KOREA_KR('media.xml'),        category: '미디어', tier: 3 },
  { id: 'korea-reporter',     name: '정책브리핑 기자단',   url: KOREA_KR('reporter.xml'),     category: '미디어', tier: 3 },

  // ─── 정책브리핑 부서별 — 핵심 정부 부처·청 (사이트 직결) ─────────────
  { id: 'korea-dept-moef',    name: '기획재정부',        url: KOREA_KR('dept_moef.xml'),    category: '경제', tier: 1 },
  { id: 'korea-dept-nts',     name: '국세청',           url: KOREA_KR('dept_nts.xml'),     category: '세금', tier: 1 },
  { id: 'korea-dept-fsc',     name: '금융위원회',        url: KOREA_KR('dept_fsc.xml'),     category: '금융', tier: 1 },
  { id: 'korea-dept-ftc',     name: '공정거래위원회',     url: KOREA_KR('dept_ftc.xml'),     category: '소비자', tier: 1 },
  { id: 'korea-dept-molit',   name: '국토교통부',        url: KOREA_KR('dept_molit.xml'),   category: '주거', tier: 1 },
  { id: 'korea-dept-moel',    name: '고용노동부',        url: KOREA_KR('dept_moel.xml'),    category: '고용', tier: 1 },
  { id: 'korea-dept-mss',     name: '중소벤처기업부',     url: KOREA_KR('dept_mss.xml'),     category: '경제', tier: 1 },
  { id: 'korea-dept-msit',    name: '과학기술정보통신부',  url: KOREA_KR('dept_msit.xml'),    category: 'AI',   tier: 1 },
  { id: 'korea-dept-mois',    name: '행정안전부',        url: KOREA_KR('dept_mois.xml'),    category: '정책', tier: 1 },
  { id: 'korea-dept-mods',    name: '통계청·국가데이터처', url: KOREA_KR('dept_mods.xml'),    category: '통계', tier: 1 },

  // ─── 정책브리핑 부서별 — Tier 2 (가치 있음) ──────────────────────
  { id: 'korea-dept-mw',      name: '보건복지부',        url: KOREA_KR('dept_mw.xml'),      category: '보건', tier: 2 },
  { id: 'korea-dept-kdca',    name: '질병관리청',        url: KOREA_KR('dept_kdca.xml'),    category: '보건', tier: 2 },
  { id: 'korea-dept-mfds',    name: '식품의약품안전처',   url: KOREA_KR('dept_mfds.xml'),    category: '보건', tier: 2 },
  { id: 'korea-dept-mogef',   name: '여성가족부',        url: KOREA_KR('dept_mogef.xml'),   category: '가계', tier: 2 },
  { id: 'korea-dept-moe',     name: '교육부',           url: KOREA_KR('dept_moe.xml'),     category: '가계', tier: 2 },
  { id: 'korea-dept-mafra',   name: '농림축산식품부',     url: KOREA_KR('dept_mafra.xml'),   category: '농수산', tier: 2 },
  { id: 'korea-dept-mof',     name: '해양수산부',        url: KOREA_KR('dept_mof.xml'),     category: '농수산', tier: 2 },
  { id: 'korea-dept-mcst',    name: '문화체육관광부',     url: KOREA_KR('dept_mcst.xml'),    category: '문화', tier: 2 },
  { id: 'korea-dept-moleg',   name: '법제처',           url: KOREA_KR('dept_moleg.xml'),   category: '정책', tier: 2 },
  { id: 'korea-dept-moj',     name: '법무부',           url: KOREA_KR('dept_moj.xml'),     category: '정책', tier: 2 },
  { id: 'korea-dept-customs', name: '관세청',           url: KOREA_KR('dept_customs.xml'), category: '세금', tier: 2 },
  { id: 'korea-dept-pps',     name: '조달청',           url: KOREA_KR('dept_pps.xml'),     category: '정책', tier: 2 },
  { id: 'korea-dept-pipc',    name: '개인정보보호위원회', url: KOREA_KR('dept_pipc.xml'),    category: '안전', tier: 2 },
  { id: 'korea-dept-acrc',    name: '국민권익위원회',     url: KOREA_KR('dept_acrc.xml'),    category: '정책', tier: 2 },
  { id: 'korea-dept-mpm',     name: '인사혁신처',        url: KOREA_KR('dept_mpm.xml'),     category: '정책', tier: 2 },
  { id: 'korea-dept-opm',     name: '국무조정실',        url: KOREA_KR('dept_opm.xml'),     category: '정책', tier: 2 },

  // ─── 정책브리핑 부서별 — Tier 3 (보조) ──────────────────────────
  { id: 'korea-dept-mofa',    name: '외교부',           url: KOREA_KR('dept_mofa.xml'),    category: '외교', tier: 3 },
  { id: 'korea-dept-unikorea',name: '통일부',           url: KOREA_KR('dept_unikorea.xml'),category: '외교', tier: 3 },
  { id: 'korea-dept-mnd',     name: '국방부',           url: KOREA_KR('dept_mnd.xml'),     category: '안보', tier: 3 },
  { id: 'korea-dept-mma',     name: '병무청',           url: KOREA_KR('dept_mma.xml'),     category: '안보', tier: 3 },
  { id: 'korea-dept-dapa',    name: '방위사업청',        url: KOREA_KR('dept_dapa.xml'),    category: '안보', tier: 3 },
  { id: 'korea-dept-mpva',    name: '국가보훈부',        url: KOREA_KR('dept_mpva.xml'),    category: '안보', tier: 3 },
  { id: 'korea-dept-npa',     name: '경찰청',           url: KOREA_KR('dept_npa.xml'),     category: '안전', tier: 3 },
  { id: 'korea-dept-spo',     name: '검찰청',           url: KOREA_KR('dept_spo.xml'),     category: '정책', tier: 3 },
  { id: 'korea-dept-kcg',     name: '해양경찰청',        url: KOREA_KR('dept_kcg.xml'),     category: '안전', tier: 3 },
  { id: 'korea-dept-forest',  name: '산림청',           url: KOREA_KR('dept_forest.xml'),  category: '환경', tier: 3 },
  { id: 'korea-dept-rda',     name: '농촌진흥청',        url: KOREA_KR('dept_rda.xml'),     category: '농수산', tier: 3 },
  { id: 'korea-dept-kma',     name: '기상청',           url: KOREA_KR('dept_kma.xml'),     category: '환경', tier: 3 },
  { id: 'korea-dept-nssc',    name: '원자력안전위원회',   url: KOREA_KR('dept_nssc.xml'),    category: '안전', tier: 3 },
  { id: 'korea-dept-kasa',    name: '우주항공청',        url: KOREA_KR('dept_kasa.xml'),    category: 'AI',   tier: 3 },
];

// ─────────────────────────────────────────────────────────────
// fetch with timeout
// ─────────────────────────────────────────────────────────────

async function fetchWithTimeout(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'smartdatashop-rss-fetch/1.0 (+https://smartdatashop.kr)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// ─────────────────────────────────────────────────────────────
// Minimal RSS 2.0 XML parser (regex 기반 — 의존성 0)
// ─────────────────────────────────────────────────────────────

function stripCDATA(s) {
  if (s == null) return null;
  return s.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim();
}

function decodeXmlEntities(s) {
  if (s == null) return null;
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  if (!m) return null;
  return decodeXmlEntities(stripCDATA(m[1]));
}

function stripHtml(s) {
  if (s == null) return null;
  return s
    .replace(/<[^>]+>/g, '')           // HTML 태그
    .replace(/&nbsp;/g, ' ')            // 비분리 공백
    .replace(/&[a-z]+;/gi, ' ')         // 그 외 HTML 엔티티 (&copy; 등)
    .replace(/\s+/g, ' ')               // 공백 정리
    .trim();
}

function truncate(s, max = 200) {
  if (s == null) return null;
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd() + '…';
}

function parseRSS(xml) {
  const channelTitle = extractTag(xml, 'title');
  const channelLink = extractTag(xml, 'link');
  const channelDesc = extractTag(xml, 'description');
  const lastBuild = extractTag(xml, 'lastBuildDate');

  const items = [];
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const inner = m[1];
    const title = extractTag(inner, 'title');
    const link = extractTag(inner, 'link');
    const pubDate = extractTag(inner, 'pubDate');
    const description = extractTag(inner, 'description');
    const guid = extractTag(inner, 'guid');
    const category = extractTag(inner, 'category');

    if (!title) continue;
    items.push({
      title: title,
      link: link,
      pubDate: pubDate,
      pubDateISO: pubDate ? safeParseDate(pubDate) : null,
      description: truncate(stripHtml(description), 200),
      guid: guid || link || null,
      category: category,
    });
  }

  return {
    channelTitle,
    channelLink,
    channelDesc,
    lastBuild,
    items,
  };
}

function safeParseDate(s) {
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// per-source fetch
// ─────────────────────────────────────────────────────────────

async function fetchSource(source) {
  console.log(`[rss] ${source.id} fetch...`);
  const startedAt = Date.now();
  const fetchedAt = new Date().toISOString();
  try {
    const xml = await fetchWithTimeout(source.url);
    const elapsedMs = Date.now() - startedAt;
    const parsed = parseRSS(xml);
    const items = parsed.items
      .sort((a, b) => {
        const ta = a.pubDateISO ? Date.parse(a.pubDateISO) : 0;
        const tb = b.pubDateISO ? Date.parse(b.pubDateISO) : 0;
        return tb - ta;
      })
      .slice(0, MAX_ITEMS_PER_SOURCE);

    console.log(`  ✓ ${source.id}: ${items.length}건 (전체 ${parsed.items.length}, ${elapsedMs}ms)`);

    return {
      ...source,
      status: 'ok',
      kind: 'RSS',
      fetchedAt,
      elapsedMs,
      lastSuccessAt: fetchedAt,
      lastUpdated: parsed.lastBuild,
      itemCount: items.length,
      items,
    };
  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    console.error(`  ✗ ${source.id}: ${err.message} (${elapsedMs}ms)`);
    return {
      ...source,
      status: 'fail',
      kind: 'RSS',
      fetchedAt,
      elapsedMs,
      lastSuccessAt: null,
      error: err.message,
      lastUpdated: null,
      itemCount: 0,
      items: [],
    };
  }
}

// ─────────────────────────────────────────────────────────────
// main
// ─────────────────────────────────────────────────────────────

async function main() {
  const startedAt = Date.now();
  console.log(`[fetch-rss-government] start — ${new Date().toISOString()}`);
  console.log(`  Sources: ${SOURCES.length}`);

  // 14 동시 fetch
  const results = await Promise.all(SOURCES.map(fetchSource));

  // 모든 항목 합쳐 중복 제거 (guid 또는 link 기준)
  const seen = new Set();
  const allItems = [];
  for (const r of results) {
    for (const it of r.items) {
      const key = it.guid || it.link;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      allItems.push({
        ...it,
        sourceId: r.id,
        sourceName: r.name,
        sourceCategory: r.category,
      });
    }
  }
  // 시간 역순 정렬
  allItems.sort((a, b) => {
    const ta = a.pubDateISO ? Date.parse(a.pubDateISO) : 0;
    const tb = b.pubDateISO ? Date.parse(b.pubDateISO) : 0;
    return tb - ta;
  });

  const out = {
    fetchedAt: new Date().toISOString(),
    sourceTotal: SOURCES.length,
    sourceSuccess: results.filter((r) => r.status === 'ok').length,
    sourceFail: results.filter((r) => r.status === 'fail').length,
    aggregateTotal: allItems.length,
    sources: results,
    aggregateItems: allItems,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');

  const elapsed = Date.now() - startedAt;
  console.log(`\n[fetch-rss-government] complete (${elapsed}ms)`);
  console.log(`  Successful: ${out.sourceSuccess}/${out.sourceTotal}`);
  console.log(`  Failed:     ${out.sourceFail}/${out.sourceTotal}`);
  console.log(`  Aggregate items: ${out.aggregateTotal}`);
  console.log(`  → ${OUT_PATH}`);

  if (out.sourceSuccess === 0) {
    console.error('\n🚨 ALL sources fail');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
