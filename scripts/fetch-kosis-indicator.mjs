#!/usr/bin/env node
/**
 * fetch-kosis-indicator.mjs
 *
 * 통계청 KOSIS — 지표정보 조회 서비스 (data.go.kr 1240000/IndicatorListService).
 * ECOS KeyStatisticList 와 대응되는 100대 지표 등.
 *
 * ENV: KOSIS_INDICATOR_KEY  (data.go.kr 일반인증키 / .env.local 또는 GitHub Secrets)
 * OUT: data/economy/kosis-indicator.json
 *
 * 403 graceful 처리:
 *   data.go.kr 활용신청 승인 직후 키 propagation 1~24h 지연이 흔함. 403 응답 시
 *   데이터 부재 상태로 종료 (exit 0) — workflow 가 멈추지 않게.
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const REPO_ROOT = process.cwd();
const OUT_PATH = resolve(REPO_ROOT, 'data/economy/kosis-indicator.json');
const ENDPOINT = 'https://apis.data.go.kr/1240000/IndicatorListService/IndicatorListSearchRequest';
const PAGE_SIZE = 200;
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
        'User-Agent': 'smartdatashop-kosis-fetch/1.0 (+https://smartdatashop.kr)',
        Accept: 'application/json',
      },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function writeEmpty(reason) {
  const out = {
    fetchedAt: new Date().toISOString(),
    status: 'pending',
    kind: 'API',
    source: 'KOSIS IndicatorListService',
    sourceUrl: ENDPOINT,
    publisher: '통계청·국가데이터처',
    license: 'data.go.kr 일반인증키 — 출처 표시 의무',
    totalCount: 0,
    note: reason,
    items: [],
  };
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
}

// data.go.kr 표준 응답 패턴 + KOSIS 변형 모두 다루는 defensive 추출
function extractItems(payload) {
  // 패턴 1: { response: { body: { items: { item: [...] } } } }
  const i1 = payload?.response?.body?.items?.item;
  if (Array.isArray(i1)) return i1;
  if (i1 && typeof i1 === 'object') return [i1];

  // 패턴 2: { response: { body: { items: [...] } } }
  const i2 = payload?.response?.body?.items;
  if (Array.isArray(i2)) return i2;

  // 패턴 3: { items: [...] }
  if (Array.isArray(payload?.items)) return payload.items;

  // 패턴 4: 최상위 array
  if (Array.isArray(payload)) return payload;

  return null;
}

function extractResultCode(payload) {
  return payload?.response?.header?.resultCode ?? payload?.resultCode ?? null;
}

function normalizeRow(row) {
  // KOSIS 응답 필드는 서비스마다 다름 — 흔한 패턴 매핑 + 원본 보존
  return {
    raw: row,
    indicatorId:    row?.idxId       ?? row?.IDX_ID       ?? row?.indicatorId   ?? null,
    indicatorName:  row?.idxNm       ?? row?.IDX_NM       ?? row?.indicatorName ?? row?.kStaName ?? null,
    classification: row?.clsNm       ?? row?.CLS_NM       ?? row?.classification ?? null,
    dataValue:      row?.dataValue   ?? row?.DATA_VALUE   ?? row?.value         ?? null,
    unitName:       row?.unitName    ?? row?.UNIT_NM      ?? row?.unit          ?? null,
    cycle:          row?.prdSe       ?? row?.PRD_SE       ?? row?.cycle         ?? null,
    time:           row?.prdDe       ?? row?.PRD_DE       ?? row?.time          ?? row?.year ?? null,
  };
}

async function main() {
  loadDotenv();

  const key = process.env.KOSIS_INDICATOR_KEY;
  if (!key) {
    console.error('[fetch-kosis-indicator] FATAL: KOSIS_INDICATOR_KEY 미설정');
    writeEmpty('KOSIS_INDICATOR_KEY 미설정 — .env.local 또는 GitHub Secret 등록 필요');
    process.exit(1);
  }

  const url = `${ENDPOINT}?serviceKey=${encodeURIComponent(key)}&pageNo=1&numOfRows=${PAGE_SIZE}&type=json`;
  console.log(`[fetch-kosis-indicator] GET ${ENDPOINT}?serviceKey=[KEY]&pageNo=1&numOfRows=${PAGE_SIZE}&type=json`);

  const startedAt = Date.now();
  const fetchedAt = new Date().toISOString();

  let res;
  try {
    res = await fetchWithTimeout(url);
  } catch (err) {
    console.error(`[fetch-kosis-indicator] fetch 실패: ${err.message}`);
    writeEmpty(`fetch 네트워크 오류: ${err.message}`);
    process.exit(0);
  }
  const elapsedMs = Date.now() - startedAt;

  if (res.status === 403) {
    console.warn(`[fetch-kosis-indicator] 403 Forbidden — data.go.kr 활용신청 승인 직후 propagation 지연 (1~24h 흔함)`);
    writeEmpty('403 Forbidden — data.go.kr 활용신청 승인 직후 키 propagation 진행 중 (보통 1~24시간 후 활성화)');
    process.exit(0);
  }

  if (res.status === 401) {
    console.warn(`[fetch-kosis-indicator] 401 Unauthorized — 키 형식 오류 또는 미등록`);
    writeEmpty('401 Unauthorized — KOSIS_INDICATOR_KEY 값 확인 필요 (data.go.kr 일반인증키 인코딩)');
    process.exit(0);
  }

  if (!res.ok) {
    console.warn(`[fetch-kosis-indicator] HTTP ${res.status}`);
    writeEmpty(`HTTP ${res.status} — endpoint 또는 service 상태 확인`);
    process.exit(0);
  }

  let payload;
  const ct = res.headers.get('content-type') || '';
  try {
    if (ct.includes('json')) {
      payload = await res.json();
    } else {
      const text = await res.text();
      // XML 또는 기타 — 일단 raw 저장하고 종료
      console.warn(`[fetch-kosis-indicator] non-JSON response (${ct}) — XML 파싱 미구현, raw 저장`);
      writeEmpty(`응답 형식 비정상 (${ct}) — XML 파싱 향후 추가 예정. raw[:200]: ${text.slice(0, 200)}`);
      process.exit(0);
    }
  } catch (err) {
    console.warn(`[fetch-kosis-indicator] payload parse 실패: ${err.message}`);
    writeEmpty(`payload parse 실패: ${err.message}`);
    process.exit(0);
  }

  const code = extractResultCode(payload);
  if (code && code !== '00' && code !== 'INFO-000') {
    const msg = payload?.response?.header?.resultMsg ?? '(no msg)';
    console.warn(`[fetch-kosis-indicator] data.go.kr 오류 ${code}: ${msg}`);
    writeEmpty(`data.go.kr 오류 ${code}: ${msg}`);
    process.exit(0);
  }

  const rawItems = extractItems(payload);
  if (!rawItems || rawItems.length === 0) {
    console.warn('[fetch-kosis-indicator] 응답에서 items 추출 실패 — payload 구조 확인 필요');
    console.warn(JSON.stringify(payload).slice(0, 500));
    writeEmpty('응답 구조에서 items 추출 실패 — 응답 패턴 변화 가능. 운영자 검토 권장');
    process.exit(0);
  }

  const items = rawItems.map(normalizeRow);

  const out = {
    fetchedAt,
    elapsedMs,
    lastSuccessAt: fetchedAt,
    status: 'ok',
    kind: 'API',
    source: 'KOSIS IndicatorListService',
    sourceUrl: ENDPOINT,
    publisher: '통계청·국가데이터처',
    license: 'data.go.kr 일반인증키 — 출처 표시 의무',
    totalCount: items.length,
    items,
  };
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log(`[fetch-kosis-indicator] 저장 완료 → ${OUT_PATH} (${items.length}건, ${elapsedMs}ms)`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
