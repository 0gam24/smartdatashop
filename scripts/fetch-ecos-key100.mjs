#!/usr/bin/env node
/**
 * fetch-ecos-key100.mjs
 *
 * 한국은행 ECOS Open API — KeyStatisticList (100대 통계지표) 자동 fetch.
 * 매일 cron 또는 `npm run fetch:ecos:key100` 으로 실행 → data/economy/key-100.json 갱신.
 *
 * ENV: ECOS_API_KEY  (.env.local 로컬 / GitHub Secrets / CF env)
 * OUT: data/economy/key-100.json
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const REPO_ROOT = process.cwd();
const OUT_PATH = resolve(REPO_ROOT, 'data/economy/key-100.json');
const ENDPOINT_BASE = 'https://ecos.bok.or.kr/api/KeyStatisticList';
const PAGE_SIZE = 200; // 응답 100건 + 안전 여유
const FETCH_TIMEOUT_MS = 15000;

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
        'User-Agent': 'smartdatashop-ecos-fetch/1.0 (+https://smartdatashop.kr)',
        Accept: 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function normalizeRow(row) {
  return {
    className: row.CLASS_NAME ?? null,
    keyName: row.KEYSTAT_NAME ?? null,
    dataValue: row.DATA_VALUE ?? null,
    unitName: row.UNIT_NAME ?? null,
    cycle: row.CYCLE ?? null,
    time: row.TIME ?? null,
  };
}

async function main() {
  loadDotenv();

  const key = process.env.ECOS_API_KEY;
  if (!key) {
    console.error('[fetch-ecos-key100] FATAL: ECOS_API_KEY 미설정');
    console.error('  .env.local 파일에 ECOS_API_KEY=발급받은키 한 줄 추가하세요.');
    process.exit(1);
  }

  const url = `${ENDPOINT_BASE}/${encodeURIComponent(key)}/json/kr/1/${PAGE_SIZE}`;
  console.log(`[fetch-ecos-key100] GET ${ENDPOINT_BASE}/[KEY]/json/kr/1/${PAGE_SIZE}`);

  let payload;
  try {
    payload = await fetchWithTimeout(url);
  } catch (err) {
    console.error(`[fetch-ecos-key100] fetch 실패: ${err.message}`);
    process.exit(1);
  }

  // ECOS 표준 오류: { RESULT: { CODE: 'INFO-100', MESSAGE: '...' } }
  if (payload.RESULT) {
    console.error(
      `[fetch-ecos-key100] ECOS 오류 ${payload.RESULT.CODE}: ${payload.RESULT.MESSAGE ?? ''}`
    );
    process.exit(1);
  }

  const block = payload.KeyStatisticList;
  if (!block || !Array.isArray(block.row)) {
    console.error('[fetch-ecos-key100] 응답 구조 비정상 — KeyStatisticList.row 부재');
    console.error(JSON.stringify(payload).slice(0, 600));
    process.exit(1);
  }

  const items = block.row.map(normalizeRow);

  const out = {
    fetchedAt: new Date().toISOString(),
    source: 'ECOS KeyStatisticList',
    sourceUrl: 'https://ecos.bok.or.kr/api/KeyStatisticList',
    publisher: '한국은행',
    license: '한국은행 ECOS 이용약관 — 출처 표시 의무',
    totalCount: items.length,
    items,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log(
    `[fetch-ecos-key100] 저장 완료 → ${OUT_PATH} (${items.length}건)`
  );
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
