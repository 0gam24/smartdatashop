#!/usr/bin/env node
/**
 * source-cache.mjs — SourceWriter 워크플로우 Stage 2.
 *
 * 입력 URL 들을 권위 호스트 화이트리스트로 필터링 후 본문을 fetch 해
 * `.cache/sources/{sha256-prefix}.txt` 에 저장. SourceWriter (Stage 3) 의
 * 입력 데이터 풀이며 source-verifier (Stage 4) 의 검증 reference.
 *
 * 사용:
 *   node scripts/agents/source-cache.mjs <URL1> [URL2 ...]
 *
 * 종료 코드:
 *   0 — 모든 URL 캐시 hit 또는 fetch 성공
 *   1 — 하나 이상 fetch 실패 (운영자 review 필요)
 *   2 — 인자 부족
 *
 * 화이트리스트 확장:
 *   PUBLIC_TRUSTED_HOSTS 환경변수에 콤마 구분 호스트 추가 가능 (운영자 명시).
 *   추가는 conservative — 정부·공공·거래소·법령·언론 권위지만으로 한정.
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const TRUSTED_PATTERNS = [
  /\.go\.kr$/i,        // 정부 (nts·hometax·kostat·moef·molit·...)
  /\.or\.kr$/i,        // 공공기관 (bok·korea·...)
  /^krx\.co\.kr$/i,    // 한국거래소 (예외적 .co.kr)
  /^www\.krx\.co\.kr$/i,
  /^kosis\.kr$/i,      // 통계청 KOSIS
  /^law\.go\.kr$/i,    // 법령정보센터 (.go.kr 으로도 매칭됨)
  /^policy\.nl\.go\.kr$/i,
];

// 운영자 명시 추가 host (콤마 구분, 도메인만)
const OPERATOR_TRUSTED = (process.env.PUBLIC_TRUSTED_HOSTS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function isTrustedHost(url) {
  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    return false;
  }
  if (TRUSTED_PATTERNS.some((re) => re.test(host))) return true;
  if (OPERATOR_TRUSTED.includes(host)) return true;
  return false;
}

const CACHE_DIR = resolve(process.cwd(), '.cache/sources');
mkdirSync(CACHE_DIR, { recursive: true });

const urls = process.argv.slice(2);
if (urls.length === 0) {
  console.error('사용: node scripts/agents/source-cache.mjs <URL1> [URL2 ...]');
  console.error('       권위 호스트 (.go.kr / .or.kr / krx / kosis / law) 만 허용');
  process.exit(2);
}

const results = [];
let hadFailure = false;

for (const url of urls) {
  if (!isTrustedHost(url)) {
    console.error(`[source-cache] ❌ REJECT — 권위 호스트 아님: ${url}`);
    results.push({ url, status: 'rejected', reason: 'untrusted host' });
    hadFailure = true;
    continue;
  }

  const hash = createHash('sha256').update(url).digest('hex').slice(0, 16);
  const path = resolve(CACHE_DIR, `${hash}.txt`);
  const metaPath = resolve(CACHE_DIR, `${hash}.meta.json`);

  if (existsSync(path)) {
    console.log(`[source-cache] CACHE HIT: ${url} → ${hash}.txt`);
    results.push({ url, hash, status: 'cached', path });
    continue;
  }

  try {
    const res = await fetch(url, {
      headers: {
        'user-agent':
          'smartdatashop-source-cache/0.1 (+https://smartdatashop.kr; smartdatashop@gmail.com)',
        accept: 'text/html,application/xhtml+xml,application/json,text/plain',
        'accept-language': 'ko-KR,ko;q=0.9,en;q=0.5',
      },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    writeFileSync(path, text, 'utf8');
    writeFileSync(
      metaPath,
      JSON.stringify({ url, fetchedAt: new Date().toISOString(), bytes: text.length, status: res.status }, null, 2),
      'utf8',
    );
    console.log(`[source-cache] ✅ FETCHED: ${url} → ${hash}.txt (${text.length} bytes)`);
    results.push({ url, hash, status: 'fetched', bytes: text.length, path });
  } catch (e) {
    console.error(`[source-cache] ❌ FAIL: ${url} — ${e.message}`);
    results.push({ url, status: 'fail', error: e.message });
    hadFailure = true;
  }
}

console.log('\n[source-cache] 결과 요약:');
for (const r of results) {
  console.log(
    `  ${r.status.padEnd(10)} ${r.url}${r.hash ? ` → ${r.hash}.txt` : ''}${r.error ? ` (${r.error})` : ''}`,
  );
}

process.exit(hadFailure ? 1 : 0);
