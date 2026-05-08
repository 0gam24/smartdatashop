#!/usr/bin/env node
/**
 * fetch-ecos-timeseries.mjs
 *
 * 한국은행 ECOS StatisticSearch — 핵심 거시 시계열 fetch.
 * 펄스 본문 차트 / 토픽 hub / 가이드북 차트 임베드 등 시계열 시각화 데이터 소스.
 *
 * 매일 cron 또는 `npm run fetch:ecos:timeseries` 으로 실행.
 *
 * ENV: ECOS_API_KEY  (.env.local 또는 GitHub Secrets)
 * OUT: data/economy/ecos-timeseries.json
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const REPO_ROOT = process.cwd();
const OUT_PATH = resolve(REPO_ROOT, 'data/economy/ecos-timeseries.json');
const ENDPOINT_BASE = 'https://ecos.bok.or.kr/api/StatisticSearch';
const FETCH_TIMEOUT_MS = 15000;

// ─────────────────────────────────────────────────────────────
// 시계열 정의 — id / label / 통계코드 / 항목코드 / 주기 / 기간
// ─────────────────────────────────────────────────────────────

function recentMonthsRange(months) {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  const start = new Date(end.getFullYear(), end.getMonth() - months + 1, 1);
  const fmt = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  return { start: fmt(start), end: fmt(end) };
}

function recentDaysRange(days) {
  const now = new Date();
  const end = now;
  const start = new Date(now.getTime() - days * 86400000);
  const fmt = (d) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return { start: fmt(start), end: fmt(end) };
}

function recentQuartersRange(quarters) {
  const now = new Date();
  const m = now.getMonth();
  const endQ = Math.floor(m / 3) + 1;
  const endY = now.getFullYear();
  let startY = endY, startQ = endQ - quarters + 1;
  while (startQ <= 0) { startQ += 4; startY -= 1; }
  return { start: `${startY}Q${startQ}`, end: `${endY}Q${endQ}` };
}

const SERIES = [
  {
    id: 'base-rate',
    label: '한국은행 기준금리',
    short: '기준금리',
    category: '금리',
    statCode: '722Y001',
    itemCode: '0101000',
    cycle: 'M',
    unit: '%',
    range: recentMonthsRange(36),
  },
  {
    id: 'usd-krw',
    label: '원/달러 환율 (매매기준율)',
    short: '원/달러 환율',
    category: '시장',
    statCode: '731Y001',
    itemCode: '0000001',
    cycle: 'D',
    unit: '원',
    range: recentDaysRange(180),
  },
  {
    id: 'cpi',
    label: '소비자물가지수 (총지수, 2020=100)',
    short: 'CPI 총지수',
    category: '물가',
    statCode: '901Y009',
    itemCode: '0',
    cycle: 'M',
    unit: '2020=100',
    range: recentMonthsRange(36),
  },
  {
    id: 'kospi',
    label: 'KOSPI 종합지수',
    short: 'KOSPI',
    category: '시장',
    statCode: '802Y001',
    itemCode: '0001000',
    cycle: 'D',
    unit: '1980.01.04=100',
    range: recentDaysRange(180),
  },
  {
    id: 'household-debt',
    label: '가계신용 (예금취급기관, 분기)',
    short: '가계부채',
    category: '가계',
    statCode: '151Y005',
    itemCode: '1110000',
    cycle: 'Q',
    unit: '십억원',
    range: recentQuartersRange(12),
  },
];

// ─────────────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────────────

function loadDotenv() {
  const envPath = resolve(REPO_ROOT, '.env.local');
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
}

async function fetchWithTimeout(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'smartdatashop-ecos-ts/1.0 (+https://smartdatashop.kr)',
        Accept: 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function buildUrl(key, s) {
  // /{key}/json/kr/{startPage}/{endPage}/{statCode}/{cycle}/{start}/{end}/{itemCode}
  return `${ENDPOINT_BASE}/${encodeURIComponent(key)}/json/kr/1/500/${s.statCode}/${s.cycle}/${s.range.start}/${s.range.end}/${s.itemCode}`;
}

function normalizePoint(row) {
  // TIME 필드: 'M' → YYYYMM, 'D' → YYYYMMDD, 'Q' → YYYYQ?, 'Y' → YYYY
  const time = row.TIME ?? null;
  const value = row.DATA_VALUE != null ? Number(row.DATA_VALUE) : null;
  return {
    time,
    value: Number.isFinite(value) ? value : null,
    raw: row.DATA_VALUE,
  };
}

async function fetchOne(key, s) {
  const startedAt = Date.now();
  const url = buildUrl(key, s);
  console.log(`[ts] ${s.id} fetch...`);
  try {
    const payload = await fetchWithTimeout(url);
    const elapsedMs = Date.now() - startedAt;

    if (payload.RESULT) {
      throw new Error(`ECOS ${payload.RESULT.CODE}: ${payload.RESULT.MESSAGE ?? ''}`);
    }
    const block = payload.StatisticSearch;
    if (!block || !Array.isArray(block.row)) {
      throw new Error('응답 구조 비정상');
    }

    const points = block.row
      .map(normalizePoint)
      .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));

    // 메타 (첫 행에서 추출)
    const head = block.row[0] ?? {};
    const meta = {
      statName: head.STAT_NAME ?? null,
      itemName: head.ITEM_NAME1 ?? null,
      unitName: head.UNIT_NAME ?? s.unit,
    };

    // 최신값 + 변화율
    const latest = points[points.length - 1];
    const prev = points[points.length - 2];
    const yoyIdx = Math.max(0, points.length - 1 - (s.cycle === 'M' ? 12 : s.cycle === 'D' ? 365 : 4));
    const yoy = points[yoyIdx];

    const change = latest && prev && prev.value && latest.value
      ? { abs: latest.value - prev.value, pct: ((latest.value - prev.value) / prev.value) * 100 }
      : null;
    const yoyChange = latest && yoy && yoy.value && latest.value
      ? { abs: latest.value - yoy.value, pct: ((latest.value - yoy.value) / yoy.value) * 100 }
      : null;

    console.log(`  ✓ ${s.id}: ${points.length}건 (${elapsedMs}ms) latest=${latest?.value} ${meta.unitName ?? ''}`);

    return {
      ...s,
      status: 'ok',
      elapsedMs,
      meta,
      pointCount: points.length,
      latest: latest ?? null,
      change,
      yoyChange,
      points,
    };
  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    console.error(`  ✗ ${s.id}: ${err.message} (${elapsedMs}ms)`);
    return {
      ...s,
      status: 'fail',
      elapsedMs,
      error: err.message,
      meta: null,
      pointCount: 0,
      latest: null,
      change: null,
      yoyChange: null,
      points: [],
    };
  }
}

async function main() {
  loadDotenv();
  const key = process.env.ECOS_API_KEY;
  if (!key) {
    console.error('[fetch-ecos-timeseries] FATAL: ECOS_API_KEY 미설정');
    process.exit(1);
  }

  const startedAt = Date.now();
  const fetchedAt = new Date().toISOString();
  console.log(`[fetch-ecos-timeseries] start — ${SERIES.length} series`);

  const results = await Promise.all(SERIES.map((s) => fetchOne(key, s)));

  const out = {
    fetchedAt,
    elapsedMs: Date.now() - startedAt,
    status: results.every((r) => r.status === 'ok') ? 'ok' : (results.some((r) => r.status === 'ok') ? 'warn' : 'fail'),
    kind: 'API',
    source: 'ECOS StatisticSearch',
    sourceUrl: ENDPOINT_BASE,
    publisher: '한국은행',
    license: '한국은행 ECOS 이용약관 — 출처 표시 의무',
    seriesCount: results.length,
    seriesSuccess: results.filter((r) => r.status === 'ok').length,
    series: results,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log(`\n[fetch-ecos-timeseries] complete (${out.elapsedMs}ms)`);
  console.log(`  Successful: ${out.seriesSuccess}/${out.seriesCount}`);
  console.log(`  → ${OUT_PATH}`);

  if (out.status === 'fail') process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
