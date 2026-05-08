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

const SOURCES = [
  // korea.kr (정책브리핑) — Tier 1: 사이트 정체성 핵심
  { id: 'korea-policy',     name: '정책브리핑 정책정보',  url: 'https://www.korea.kr/rss/policy.xml',         category: '정책',    tier: 1 },
  { id: 'korea-report',     name: '정책브리핑 보도자료',  url: 'https://www.korea.kr/rss/report.xml',         category: '정책',    tier: 1 },

  // 정부24 — 사이트 직결 카테고리 (Tier 1~2)
  { id: 'gov24-030000',     name: '정부24 경제·세금·법률', url: 'https://www.gov.kr/portal/rss/030000',       category: '경제',    tier: 1 },
  { id: 'gov24-090000',     name: '정부24 주택·부동산',   url: 'https://www.gov.kr/portal/rss/090000',       category: '주거',    tier: 1 },
  { id: 'gov24-020000',     name: '정부24 창업·중소기업', url: 'https://www.gov.kr/portal/rss/020000',       category: '경제',    tier: 2 },
  { id: 'gov24-060000',     name: '정부24 혼인·육아·교육', url: 'https://www.gov.kr/portal/rss/060000',       category: '가계',    tier: 2 },
  { id: 'gov24-050000',     name: '정부24 보건·의료',    url: 'https://www.gov.kr/portal/rss/050000',       category: '보건',    tier: 2 },
  { id: 'gov24-010000',     name: '정부24 채용·복지일자리', url: 'https://www.gov.kr/portal/rss/010000',       category: '고용',    tier: 2 },

  // 정부24 — Tier 3 (보조)
  { id: 'gov24-040000',     name: '정부24 일상생활·병역', url: 'https://www.gov.kr/portal/rss/040000',       category: '생활',    tier: 3 },
  { id: 'gov24-070000',     name: '정부24 환경·재난',    url: 'https://www.gov.kr/portal/rss/070000',       category: '환경',    tier: 3 },
  { id: 'gov24-080000',     name: '정부24 폭력·범죄',    url: 'https://www.gov.kr/portal/rss/080000',       category: '안전',    tier: 3 },
  { id: 'gov24-100000',     name: '정부24 자동차·교통',  url: 'https://www.gov.kr/portal/rss/100000',       category: '교통',    tier: 3 },
  { id: 'gov24-110000',     name: '정부24 자원봉사·지역', url: 'https://www.gov.kr/portal/rss/110000',       category: '지역',    tier: 3 },
  { id: 'gov24-120000',     name: '정부24 여가·문화',    url: 'https://www.gov.kr/portal/rss/120000',       category: '문화',    tier: 3 },
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
  try {
    const xml = await fetchWithTimeout(source.url);
    const parsed = parseRSS(xml);
    const items = parsed.items
      .sort((a, b) => {
        const ta = a.pubDateISO ? Date.parse(a.pubDateISO) : 0;
        const tb = b.pubDateISO ? Date.parse(b.pubDateISO) : 0;
        return tb - ta;
      })
      .slice(0, MAX_ITEMS_PER_SOURCE);

    console.log(`  ✓ ${source.id}: ${items.length}건 (전체 ${parsed.items.length})`);

    return {
      ...source,
      status: 'ok',
      lastUpdated: parsed.lastBuild,
      itemCount: items.length,
      items,
    };
  } catch (err) {
    console.error(`  ✗ ${source.id}: ${err.message}`);
    return {
      ...source,
      status: 'fail',
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
