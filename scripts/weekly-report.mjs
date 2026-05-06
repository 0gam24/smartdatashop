#!/usr/bin/env node
/**
 * weekly-report.mjs — 주간 운영자 헬스 리포트 (D2, Solo Ops 합의 #1)
 *
 * 매주 월요일 1회 실행 → 단일 마크다운 파일로 모든 운영 결정 포인트 압축.
 *
 * 점검 항목:
 *   1. 1차 출처 링크 헬스 (verify-source-links 결과 요약)
 *   2. 수치 주장 페어링 감사 (extract-numerical-claims 결과 요약)
 *   3. placeholder 글 카운트
 *   4. 빌드 산출 (페이지/OG)
 *   5. 환경변수 미설정 키
 *   6. fact-check-queue 최신 결과 (Layer 4 stub heartbeat 또는 M1+ 감사 결과)
 *   7. OG v1→v2 마이그레이션 D-day
 *
 * 산출: `daily-queue/weekly-YYYY-MM-DD.md` (이미 있으면 덮어쓰기)
 *
 * 사용:
 *   node scripts/weekly-report.mjs
 *   npm run weekly
 *
 * 운영자 의도:
 *   매주 5개 명령(verify:links, verify:claims, build, env 점검, sitemap) 직접 실행
 *   비교/추적하던 부담을 → 1회 실행 + 단일 파일 읽기로 압축.
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const ENV_VARS = [
  'PUBLIC_AUTHOR_SAMEAS',
  'PUBLIC_ORG_SAMEAS',
  'PUBLIC_NAVER_SITE_VERIFICATION',
  'PUBLIC_GOOGLE_SITE_VERIFICATION',
  'PUBLIC_CF_ANALYTICS_TOKEN',
  'PUBLIC_STIBEE_LIST_ID',
];

function todayKstYmd() {
  const now = Date.now() + 9 * 60 * 60 * 1000;
  return new Date(now).toISOString().slice(0, 10);
}

/** 외부 노드 스크립트를 실행해 stdout 의 마지막 N 줄과 exit code 회수 */
function runChild(scriptRelPath, args = []) {
  const result = spawnSync(process.execPath, [join(ROOT, scriptRelPath), ...args], {
    encoding: 'utf8',
    cwd: ROOT,
    timeout: 60_000,
  });
  return {
    code: result.status ?? -1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function envSummary() {
  const env = { ...process.env };
  for (const f of ['.env', '.env.production', '.env.local']) {
    const p = join(ROOT, f);
    if (existsSync(p)) {
      for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  }
  const missing = ENV_VARS.filter((k) => !env[k]);
  return { total: ENV_VARS.length, set: ENV_VARS.length - missing.length, missing };
}

function placeholderCount() {
  let n = 0;
  for (const c of ['pulse', 'insight']) {
    const dir = join(ROOT, 'src/content', c);
    let files;
    try {
      files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
    } catch {
      continue;
    }
    for (const f of files) {
      const text = readFileSync(join(dir, f), 'utf8');
      if (/\[\s*검수\s*후/.test(text)) n++;
    }
  }
  return n;
}

function distStats() {
  const dist = join(ROOT, 'dist');
  if (!existsSync(dist)) return { exists: false };
  let pages = 0;
  let ogV2 = 0;
  function walk(dir) {
    let items;
    try {
      items = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      const p = join(dir, item.name);
      if (item.isDirectory()) walk(p);
      else if (item.name === 'index.html') pages++;
      else if (item.name.endsWith('.png') && p.includes('og') && p.includes('v2')) ogV2++;
    }
  }
  walk(dist);
  return { exists: true, pages, ogV2 };
}

function latestFactCheckResult() {
  const dir = join(ROOT, 'fact-check-queue');
  if (!existsSync(dir)) return null;
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort().reverse();
  } catch {
    return null;
  }
  if (files.length === 0) return null;
  try {
    const json = JSON.parse(readFileSync(join(dir, files[0]), 'utf8'));
    return { file: files[0], ...json };
  } catch {
    return { file: files[0], error: 'parse failed' };
  }
}

function ogMigrationDday() {
  const today = new Date();
  const dday = new Date('2026-06-06T00:00:00+09:00');
  const days = Math.ceil((dday.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  const oldExists = existsSync(join(ROOT, 'src/pages/og/pulse'));
  return { dday: '2026-06-06', daysRemaining: days, oldExists };
}

// ── 메인 실행 ───────────────────────────────────────────────────────
console.log('[weekly] 검증 스크립트 실행 중...');

const links = runChild('scripts/verify-source-links.mjs', ['--json']);
let linksParsed = [];
try {
  linksParsed = JSON.parse(links.stdout);
} catch {
  // parse fail
}
const linksTotal = linksParsed.reduce(
  (acc, file) => acc + (file.results?.length ?? 0),
  0,
);
const linksFailed = linksParsed.reduce(
  (acc, file) =>
    acc + (file.results?.filter((r) => !r.ok).length ?? 0),
  0,
);

const claims = runChild('scripts/extract-numerical-claims.mjs', ['--json']);
let claimsParsed = [];
try {
  claimsParsed = JSON.parse(claims.stdout);
} catch {
  // parse fail
}
const claimsTotal = claimsParsed.reduce(
  (acc, file) => acc + (file.claims?.length ?? 0),
  0,
);
const claimsUnpaired = claimsParsed.reduce(
  (acc, file) => acc + (file.claims?.filter((c) => !c.paired).length ?? 0),
  0,
);

const env = envSummary();
const placeholders = placeholderCount();
const dist = distStats();
const fc = latestFactCheckResult();
const og = ogMigrationDday();

const date = todayKstYmd();
const ranAt = new Date().toISOString();

const lines = [];
lines.push(`# 주간 헬스 리포트 — ${date}`);
lines.push('');
lines.push(`> 자동 생성 — \`npm run weekly\` · 마지막 실행 \`${ranAt}\``);
lines.push('');
lines.push('## 한눈에');
lines.push('');
lines.push('| 항목 | 상태 |');
lines.push('|---|---|');
lines.push(`| 1차 출처 링크 | ${linksTotal - linksFailed}/${linksTotal} 정상 ${linksFailed > 0 ? '⚠' : '✅'} |`);
lines.push(`| 수치 주장 페어링 | ${claimsTotal - claimsUnpaired}/${claimsTotal} 페어링 ${claimsUnpaired > 0 ? '⚠' : '✅'} |`);
lines.push(`| placeholder 글 (자동 noindex) | ${placeholders}건 ${placeholders > 0 ? '⚠' : '✅'} |`);
lines.push(`| 환경변수 | ${env.set}/${env.total} 설정됨 ${env.set < env.total ? '⚠' : '✅'} |`);
lines.push(`| 빌드 산출 | ${dist.exists ? `${dist.pages} 페이지 + ${dist.ogV2} OG ✅` : '⚠ dist/ 없음 — npm run build 필요'} |`);
lines.push(
  `| OG v1→v2 마이그레이션 | D${og.daysRemaining > 0 ? '-' : '+'}${Math.abs(og.daysRemaining)} ${og.oldExists ? (og.daysRemaining <= 0 ? '🚨 도과 + 구 라우트 잔존' : '⚠') : '✅'} |`,
);
lines.push(`| Layer 4 fact-checker (stub) | ${fc ? `최근 실행 ${fc.file} (감사 ${fc.auditedCount ?? '?'}건)` : '미실행'} |`);
lines.push('');

// 디테일
if (linksFailed > 0) {
  lines.push('## 🔴 링크 실패 디테일');
  lines.push('');
  for (const file of linksParsed) {
    const fails = file.results?.filter((r) => !r.ok) ?? [];
    if (fails.length === 0) continue;
    lines.push(`- \`${file.collection}/${file.filename}\``);
    for (const f of fails) {
      lines.push(`  - ${f.error ?? `HTTP ${f.status}`}: ${f.url}`);
    }
  }
  lines.push('');
}

if (env.missing.length > 0) {
  lines.push('## ⚙️ 미설정 환경변수');
  lines.push('');
  for (const k of env.missing) lines.push(`- \`${k}\``);
  lines.push('');
  lines.push('Cloudflare Pages → Settings → Environment variables. `docs/operations.md` 환경변수 섹션 참조.');
  lines.push('');
}

if (claimsUnpaired > 0) {
  lines.push('## 📊 수치 주장 미페어링 (footnote 누락)');
  lines.push('');
  for (const file of claimsParsed) {
    const ups = file.claims?.filter((c) => !c.paired) ?? [];
    if (ups.length === 0) continue;
    lines.push(`- \`${file.collection}/${file.filename}\` — ${ups.length}건`);
    for (const c of ups.slice(0, 3)) {
      lines.push(`  - \`${c.claim}\``);
    }
    if (ups.length > 3) lines.push(`  - ... 외 ${ups.length - 3}건`);
  }
  lines.push('');
}

lines.push('## 다음 주 운영자 액션');
lines.push('');
lines.push(
  `- [${placeholders > 0 ? ' ' : 'x'}] placeholder 글 점진 정리 (현재 ${placeholders}건, 자동 noindex 처리됨)`,
);
lines.push(
  `- [${env.set < env.total ? ' ' : 'x'}] Cloudflare 환경변수 ${env.set}/${env.total} 채우기`,
);
lines.push(`- [ ] GSC Discover 보고서 확인 (수동 — 콘솔 로그인 필요)`);
lines.push(`- [ ] Bing Search Insights 확인`);
if (og.daysRemaining <= 7 && og.daysRemaining > 0 && og.oldExists) {
  lines.push(`- [ ] OG v1 라우트 삭제 준비 (D-${og.daysRemaining})`);
}
lines.push('');

const outDir = join(ROOT, 'daily-queue');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `weekly-${date}.md`);
writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');

console.log(`[weekly] 리포트 작성 완료 — ${outPath}`);
console.log(
  `[weekly] 요약: 링크 ${linksTotal - linksFailed}/${linksTotal} · 수치 ${claimsTotal - claimsUnpaired}/${claimsTotal} · placeholder ${placeholders} · env ${env.set}/${env.total}`,
);
process.exit(0);
