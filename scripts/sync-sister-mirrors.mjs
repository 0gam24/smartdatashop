#!/usr/bin/env node
/**
 * sync-sister-mirrors.mjs
 *
 * 매일 02:00 KST 자매 4 의 network-mirror.json fetch + 통합.
 *
 * 출력:
 *   - sister-mirrors/{자매}/posts.json — 각 자매 raw mirror
 *   - data/network-index.json         — 메인 빌드 시 활용 통합 인덱스
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const REPO_ROOT = process.cwd();

const SISTERS = [
  {
    id: 'calculatorhost',
    url: 'https://calculatorhost.com/network-mirror.json',
    persona: 'all',
    isCommercial: true,
  },
  {
    id: 'iknowhowinfo',
    url: 'https://iknowhowinfo.com/network-mirror.json',
    persona: '4050-etf-investor',
    isCommercial: true,
  },
  {
    id: 'awoo',
    url: 'https://awoo.or.kr/network-mirror.json',
    persona: 'subsidy-receivers',
    isCommercial: false,
  },
  {
    id: 'moneylook',
    url: 'https://asiatop.co.kr/network-mirror.json',
    persona: 'office-rookie-newlywed',
    isCommercial: true,
  },
];

const FETCH_TIMEOUT_MS = 10000;

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
        'User-Agent': 'smartdatashop-network-sync/1.0 (+https://smartdatashop.kr)',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ─────────────────────────────────────────────────────────────
// per-sister sync
// ─────────────────────────────────────────────────────────────

async function syncSister(sister) {
  console.log(`[sync] ${sister.id} fetch...`);
  try {
    const mirror = await fetchWithTimeout(sister.url);

    // 기본 필드 검증
    if (!mirror.site || !mirror.posts || typeof mirror.totalPosts !== 'number') {
      throw new Error(`Invalid mirror: missing required fields`);
    }

    // sister-mirrors/{자매}/posts.json 저장
    // 자매가 network-mirror.json 에 parentSite 를 안 넣어 보내도 메인이 항상 주입.
    // (NETWORK.md §7.2 메인 backref 의무 — sister → main canonical link 보강)
    if (!mirror.parentSite) {
      mirror.parentSite = 'https://smartdatashop.kr';
    }
    const outDir = resolve(REPO_ROOT, 'sister-mirrors', sister.id);
    mkdirSync(outDir, { recursive: true });
    const outPath = resolve(outDir, 'posts.json');
    writeFileSync(outPath, JSON.stringify(mirror, null, 2), 'utf8');

    console.log(`  ✓ ${sister.id}: totalPosts=${mirror.totalPosts}${mirror.etfStocksAvailable ? `, etfStocks=${mirror.etfStocksAvailable}` : ''}`);

    return { sister, mirror, status: 'ok' };
  } catch (err) {
    console.error(`  ✗ ${sister.id}: ${err.message}`);
    return { sister, mirror: null, status: 'fail', error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// 통합 인덱스 생성
// ─────────────────────────────────────────────────────────────

function buildNetworkIndex(results) {
  const sisters = results.map(r => {
    if (r.status !== 'ok' || !r.mirror) {
      return {
        id: r.sister.id,
        domain: null,
        persona: r.sister.persona,
        isCommercial: r.sister.isCommercial,
        status: 'fail',
        error: r.error,
        totalPosts: 0,
        categories: [],
        lastSyncedAt: new Date().toISOString(),
      };
    }
    const m = r.mirror;
    return {
      id: m.site,
      siteName: m.siteName,
      domain: m.domain,
      persona: r.sister.persona,
      isCommercial: r.sister.isCommercial,
      status: 'ok',
      totalPosts: m.totalPosts,
      categories: m.categories || [],
      lastSyncedAt: new Date().toISOString(),
      mirrorLastUpdated: m.lastUpdated,
      // 자매별 추가 메타 (있으면 보존)
      ...(m.etfStocksAvailable !== undefined && { etfStocksAvailable: m.etfStocksAvailable }),
      ...(m.etfStocksIndexUrl && { etfStocksIndexUrl: m.etfStocksIndexUrl }),
      ...(m.clusterIndexes && { clusterIndexes: m.clusterIndexes }),
      ...(m.authors && { authors: m.authors }),
      ...(m.personas && { personas: m.personas }),
    };
  });

  const allPosts = results
    .filter(r => r.status === 'ok' && r.mirror?.posts)
    .flatMap(r => r.mirror.posts.map(p => ({
      ...p,
      sisterId: r.sister.id,
      sisterDomain: r.mirror.domain,
    })));

  return {
    networkName: 'smartdata',
    mainSite: 'https://smartdatashop.kr',
    lastSyncedAt: new Date().toISOString(),
    totalSisters: SISTERS.length,
    successfulSyncs: results.filter(r => r.status === 'ok').length,
    failedSyncs: results.filter(r => r.status === 'fail').length,
    sisters,
    aggregateTotalPosts: allPosts.length,
    aggregatePosts: allPosts,
  };
}

// ─────────────────────────────────────────────────────────────
// main
// ─────────────────────────────────────────────────────────────

async function main() {
  const startedAt = Date.now();

  console.log(`[sync-sister-mirrors] start — ${new Date().toISOString()}`);
  console.log(`  Sisters: ${SISTERS.map(s => s.id).join(', ')}`);

  // 4 자매 동시 fetch
  const results = await Promise.all(SISTERS.map(syncSister));

  // 통합 인덱스 생성
  const index = buildNetworkIndex(results);
  const indexPath = resolve(REPO_ROOT, 'data/network-index.json');
  mkdirSync(dirname(indexPath), { recursive: true });
  writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');

  const elapsed = Date.now() - startedAt;
  console.log(`\n[sync-sister-mirrors] complete (${elapsed}ms)`);
  console.log(`  Successful: ${index.successfulSyncs}/${index.totalSisters}`);
  console.log(`  Failed:     ${index.failedSyncs}/${index.totalSisters}`);
  console.log(`  Aggregate posts: ${index.aggregateTotalPosts}`);

  // 모든 자매 fail 시 exit 1 (workflow alert)
  if (index.successfulSyncs === 0) {
    console.error('\n🚨 ALL sisters fail — sync 메커니즘 문제 가능');
    process.exit(1);
  }

  // 일부 자매 fail 시 warning (exit 0 유지)
  if (index.failedSyncs > 0) {
    console.warn(`\n⚠️ ${index.failedSyncs} sister(s) failed — 운영자 확인 권장`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
