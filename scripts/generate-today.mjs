#!/usr/bin/env node
/**
 * generate-today.mjs — today.md 날짜별 단순화 버전.
 *
 * 운영자 시야 단일 진입점:
 *   - 날짜별 발행 글 (제목 + URL + 한 줄 설명)
 *   - 오늘 자동 갱신 요약 (데이터 / 자매 / drafts) — 짧게
 *   - 검색엔진 콘솔 빠른 링크
 *
 * 출력: <repo>/today.md
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const TODAY_PATH = resolve(ROOT, 'today.md');
const SITE = 'https://smartdatashop.kr';

const KST_OFFSET = 9 * 60 * 60 * 1000;
const now = new Date();
const kstNow = new Date(now.getTime() + KST_OFFSET);
const todayKst = kstNow.toISOString().slice(0, 10);

const WEEKDAY_KOR = ['일', '월', '화', '수', '목', '금', '토'];
const DAYS_BACK = 14;
const FRESH_24H_MS = 24 * 60 * 60 * 1000;

function dayLabel(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return `${dateStr} (${WEEKDAY_KOR[d.getUTCDay()]})`;
}

function kstDateOf(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return null;
    return new Date(d.getTime() + KST_OFFSET).toISOString().slice(0, 10);
  } catch { return null; }
}

function readJsonSafe(rel) {
  const abs = resolve(ROOT, rel);
  if (!existsSync(abs)) return null;
  try { return JSON.parse(readFileSync(abs, 'utf8')); } catch { return null; }
}

function extractFm(text) {
  const out = {};
  for (const [key, re] of [
    ['title', /^title:\s*"([^"]+)"/m],
    ['publishedAt', /^publishedAt:\s*"([^"]+)"/m],
    ['tldr', /^tldr:\s*"([^"]+)"/m],
    ['category', /^category:\s*([^\s\n]+)/m],
  ]) {
    const m = text.match(re);
    if (m) out[key] = m[1].replace(/^["']|["']$/g, '');
  }
  return out;
}

function shortLine(text, max = 80) {
  if (!text) return '';
  const cleaned = text.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max - 1) + '…';
}

// URL 정책 (2026-06-12 개정, src/lib/korean.ts pulseUrl 과 동일 규칙):
// 2026-06-13(KST) 이후 발행분 = /카테고리/슬러그(날짜 접두사 제거)/,
// 이전 발행분 = /YYYY/MM/DD/슬러그/ (색인 보존 — 영구 유지).
const CATEGORY_URL_CUTOFF_KST = '2026-06-13';

function pulseUrl(slug, publishedAt, category) {
  const d = new Date(publishedAt);
  const k = new Date(d.getTime() + KST_OFFSET);
  const Y = k.getUTCFullYear();
  const M = String(k.getUTCMonth() + 1).padStart(2, '0');
  const D = String(k.getUTCDate()).padStart(2, '0');
  if (category && `${Y}-${M}-${D}` >= CATEGORY_URL_CUTOFF_KST) {
    return `${SITE}/${category}/${slug.replace(/^\d{4}-\d{2}-\d{2}-/, '')}/`;
  }
  return `${SITE}/${Y}/${M}/${D}/${slug}/`;
}

function insightUrlOf(slug, publishedAt) {
  const d = new Date(publishedAt);
  const k = new Date(d.getTime() + KST_OFFSET);
  const Y = k.getUTCFullYear();
  const M = String(k.getUTCMonth() + 1).padStart(2, '0');
  const D = String(k.getUTCDate()).padStart(2, '0');
  const s = `${Y}-${M}-${D}` >= CATEGORY_URL_CUTOFF_KST
    ? slug.replace(/^\d{4}-\d{2}-\d{2}-/, '')
    : slug;
  return `${SITE}/insight/${s}/`;
}

function urlEnc(s) { return encodeURIComponent(s); }

// ── 콘텐츠 수집 ─────────────────────────────────────
function collectAll() {
  const items = [];
  const dirs = [
    { dir: 'src/content/pulse', kind: '펄스', urlBuilder: (slug, pubAt, cat) => pulseUrl(slug, pubAt, cat) },
    { dir: 'src/content/insight', kind: '인사이트', urlBuilder: (slug, pubAt) => insightUrlOf(slug, pubAt) },
  ];
  for (const { dir, kind, urlBuilder } of dirs) {
    const abs = resolve(ROOT, dir);
    if (!existsSync(abs)) continue;
    for (const f of readdirSync(abs).filter((x) => x.endsWith('.mdx'))) {
      try {
        const text = readFileSync(resolve(abs, f), 'utf8');
        const fm = extractFm(text);
        if (!fm.title || !fm.publishedAt) continue;
        const slug = f.replace(/\.mdx$/, '');
        items.push({
          kind,
          slug,
          title: fm.title,
          tldr: fm.tldr ?? '',
          category: fm.category ?? '',
          publishedAt: fm.publishedAt,
          url: urlBuilder(slug, fm.publishedAt, fm.category),
          dateKst: kstDateOf(fm.publishedAt),
        });
      } catch {}
    }
  }
  return items;
}

const allItems = collectAll();

// 직전 14일만
const cutoffMs = Date.now() - DAYS_BACK * 24 * 60 * 60 * 1000;
const recent = allItems
  .filter((e) => new Date(e.publishedAt).getTime() >= cutoffMs)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

const byDate = new Map();
for (const e of recent) {
  if (!byDate.has(e.dateKst)) byDate.set(e.dateKst, []);
  byDate.get(e.dateKst).push(e);
}

// ── today 자동 갱신 요약 ─────────────────────────────
const ssotFiles = [
  { path: 'data/economy/ecos-timeseries.json', label: 'ECOS', field: 'fetchedAt' },
  { path: 'data/economy/key-100.json', label: 'ECOS 100', field: 'fetchedAt' },
  { path: 'data/rss/government.json', label: '정부 RSS', field: 'fetchedAt' },
  { path: 'data/news/keywords.json', label: '뉴스 키워드', field: 'fetchedAt' },
  { path: 'data/network-index.json', label: '자매 mirror', field: 'lastSyncedAt' },
];

const freshToday = ssotFiles.filter((f) => {
  const j = readJsonSafe(f.path);
  const t = j?.[f.field];
  if (!t) return false;
  return Date.now() - new Date(t).getTime() < FRESH_24H_MS;
});

const draftsDir = resolve(ROOT, 'daily-queue/drafts');
const draftCount = existsSync(draftsDir)
  ? readdirSync(draftsDir).filter((f) => f.endsWith('.mdx')).length
  : 0;

// ── 출력 ────────────────────────────────────────────
const lines = [];
const P = (s = '') => lines.push(s);

P(`# Today — ${dayLabel(todayKst)} (KST)`);
P('');
P(`> 매 cron + 매 빌드 자동 갱신. 직전 14일 발행 + 오늘 자동 활동 요약.`);
P('');

// 오늘 — 발행 + 자동 갱신
const todayItems = byDate.get(todayKst) ?? [];
P(`## ${dayLabel(todayKst)} — 오늘`);
P('');
if (todayItems.length === 0) {
  P('- 📝 발행 0건');
} else {
  P(`- 📝 발행 **${todayItems.length}건**:`);
  for (const e of todayItems) {
    P(`  - [${e.title}](${e.url}) — ${shortLine(e.tldr, 60)}`);
  }
}
if (freshToday.length > 0) {
  P(`- 🔄 자동 갱신 (24h): ${freshToday.map((f) => f.label).join(' · ')}`);
}
if (draftCount > 0) {
  P(`- 📋 검수 대기: **${draftCount}건**`);
}
P('');

// 과거 날짜
const pastDates = [...byDate.keys()].filter((d) => d !== todayKst).sort().reverse();
for (const date of pastDates) {
  const items = byDate.get(date);
  P(`## ${dayLabel(date)}`);
  P('');
  P(`- 📝 발행 **${items.length}건**:`);
  for (const e of items) {
    P(`  - [${e.title}](${e.url}) — ${shortLine(e.tldr, 60)}`);
  }
  P('');
}

// 콘솔 링크
P('---');
P('');
P('## 🔗 검색엔진 콘솔');
P('');
P('- [네이버 서치어드바이저](https://searchadvisor.naver.com/) · [구글 서치 콘솔](https://search.google.com/search-console)');
P(`- [구글 Discover 보고서](https://search.google.com/search-console/discover?resource_id=${urlEnc(SITE + '/')})`);
P('');

writeFileSync(TODAY_PATH, lines.join('\n') + '\n', 'utf8');
console.log(`[generate-today] today.md 갱신 (${lines.length} 줄, ${recent.length}건/${byDate.size}일, drafts ${draftCount}건)`);
