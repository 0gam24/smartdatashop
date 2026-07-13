#!/usr/bin/env node
/**
 * draft-pulse-from-rss.mjs
 *
 * 정부 RSS / 정책브리핑 / 부서별 신규 항목에서 펄스 초안 .mdx 1건 자동 생성.
 *
 * 출력: daily-queue/drafts/draft-pulse-{date}-{slug}.mdx
 *
 * 운영자 워크플로우:
 *   1. cron 이 매일 1 draft 생성
 *   2. 운영자 검수: 1차 출처 deep link 확인 + 본문 explanatory framing 작성
 *   3. 검수 완료 후 src/content/pulse/ 로 이동 + commit
 *   4. 발행. (검수 미완 시 placeholder.ts 가 자동 noindex)
 *
 * ADR 0006 4기준 충족 설계:
 *   - 수치 환각 0 — RSS 제목·요약·URL 만 인용
 *   - 운영자 검수 마커 — `[검수 후 본문 작성]` 자동 noindex 트리거
 *   - 1차 출처 sources[] — RSS link 그대로
 *   - 발표 일자 — RSS pubDate 그대로
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const REPO_ROOT = process.cwd();
const RSS_PATH = resolve(REPO_ROOT, 'data/rss/government.json');
const PULSE_DIR = resolve(REPO_ROOT, 'src/content/pulse');
const OUT_DIR = resolve(REPO_ROOT, 'daily-queue/drafts');

// 출처별 사이트 카테고리 매핑 (5 enum 중 1개)
const CATEGORY_MAP = {
  // korea.kr
  'korea-policy': 'policy',
  'korea-report': 'policy',
  'korea-pressrelease': 'policy',
  'korea-cabinet': 'policy',
  'korea-ebriefing': 'policy',
  'korea-fact': 'policy',
  'korea-column': 'policy',
  'korea-insight': 'policy',
  'korea-expdoc': 'policy',
  'korea-speech': 'policy',
  'korea-president': 'policy',
  'korea-archive': 'policy',
  'korea-media': 'policy',
  'korea-reporter': 'policy',
  // 핵심 부서별
  'korea-dept-moef': 'tax-finance',
  'korea-dept-nts': 'tax-finance',
  'korea-dept-fsc': 'tax-finance',
  'korea-dept-customs': 'tax-finance',
  'korea-dept-ftc': 'policy',
  'korea-dept-molit': 'policy',
  'korea-dept-moel': 'policy',
  'korea-dept-mss': 'tax-finance',
  'korea-dept-msit': 'ai-tech',
  'korea-dept-mois': 'policy',
  'korea-dept-mods': 'stats',
  'korea-dept-mw': 'policy',
  'korea-dept-kdca': 'policy',
  'korea-dept-mfds': 'policy',
  'korea-dept-mogef': 'policy',
  'korea-dept-moe': 'policy',
  'korea-dept-mafra': 'stats',
  'korea-dept-mof': 'stats',
  'korea-dept-mcst': 'policy',
  'korea-dept-moleg': 'policy',
  'korea-dept-moj': 'policy',
  'korea-dept-pps': 'policy',
  'korea-dept-pipc': 'policy',
  'korea-dept-acrc': 'policy',
  'korea-dept-mpm': 'policy',
  'korea-dept-opm': 'policy',
  // 정부24
  'gov24-030000': 'tax-finance',
  'gov24-090000': 'policy',
  'gov24-020000': 'tax-finance',
  'gov24-060000': 'policy',
  'gov24-050000': 'policy',
  'gov24-010000': 'policy',
};

// 우선순위 — Tier 1 출처 우선
const PRIORITY_SOURCES = [
  'korea-report',     // 정책브리핑 보도자료
  'korea-pressrelease',
  'korea-cabinet',    // 국무회의
  'korea-dept-moef',  // 기재부
  'korea-dept-nts',   // 국세청
  'korea-dept-fsc',   // 금융위
  'korea-dept-mods',  // 통계청
  'korea-dept-msit',  // 과기정통부
  'korea-dept-mois',  // 행안부
  'gov24-030000',
  'gov24-090000',
];

function fmtKstNow() {
  const d = new Date();
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const Y = kst.getUTCFullYear();
  const M = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const D = String(kst.getUTCDate()).padStart(2, '0');
  const h = String(kst.getUTCHours()).padStart(2, '0');
  const m = String(kst.getUTCMinutes()).padStart(2, '0');
  return { date: `${Y}-${M}-${D}`, time: `${h}:${m}`, iso: `${Y}-${M}-${D}T${h}:${m}:00+09:00` };
}

// 한글 + 영문 → URL-safe slug
function slugify(s) {
  return s
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 50);
}

function loadCoveredUrls() {
  // 기존 src/content/pulse/ 에서 sources[].url 를 모두 수집
  const covered = new Set();
  if (!existsSync(PULSE_DIR)) return covered;
  for (const fname of readdirSync(PULSE_DIR)) {
    if (!fname.endsWith('.mdx')) continue;
    try {
      const text = readFileSync(resolve(PULSE_DIR, fname), 'utf8');
      const urlMatches = text.matchAll(/url:\s*["']?(https?:\/\/[^\s"'\n]+)/g);
      for (const m of urlMatches) covered.add(m[1]);
    } catch {}
  }
  return covered;
}

function loadCoveredDrafts() {
  // 이미 생성된 draft 의 link 도 수집해서 중복 회피
  const covered = new Set();
  if (!existsSync(OUT_DIR)) return covered;
  for (const fname of readdirSync(OUT_DIR)) {
    if (!fname.endsWith('.mdx')) continue;
    try {
      const text = readFileSync(resolve(OUT_DIR, fname), 'utf8');
      const urlMatches = text.matchAll(/url:\s*["']?(https?:\/\/[^\s"'\n]+)/g);
      for (const m of urlMatches) covered.add(m[1]);
    } catch {}
  }
  return covered;
}

// HTML 엔티티 + 한자 punctuation 정리
function cleanText(s) {
  if (!s) return '';
  return s
    .replace(/&#x2024;/g, '·')      // 한자 가운뎃점
    .replace(/&#x[0-9a-fA-F]+;/g, '')
    .replace(/&#\d+;/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&[a-z]+;/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/^\[[^\]]+\]\s*/, '')   // 제목 시작의 [기관명] 제거
    .trim();
}

function isRecent(item, days = 14) {
  if (!item.pubDateISO) return false;
  const t = Date.parse(item.pubDateISO);
  if (!Number.isFinite(t)) return false;
  return Date.now() - t < days * 86400000;
}

function pickItem(rssData, covered) {
  // 모든 출처의 모든 항목 → 우선순위 + 최근 7일 필터 + 시간 역순
  const sourcesById = new Map();
  for (const s of rssData.sources ?? []) sourcesById.set(s.id, s);

  const candidates = [];
  for (const sid of [...PRIORITY_SOURCES, ...sourcesById.keys()]) {
    const src = sourcesById.get(sid);
    if (!src || src.status !== 'ok' || !Array.isArray(src.items)) continue;
    const priorityIdx = PRIORITY_SOURCES.indexOf(sid);
    for (const item of src.items) {
      if (!item.title || !item.link) continue;
      if (covered.has(item.link)) continue;
      if (!isRecent(item, 14)) continue;     // 14일 이내 신선
      candidates.push({
        source: src,
        item,
        priorityIdx: priorityIdx < 0 ? 999 : priorityIdx,
        ts: Date.parse(item.pubDateISO),
      });
    }
  }
  // 정렬: priority asc → 발행 시각 desc
  candidates.sort((a, b) => a.priorityIdx - b.priorityIdx || b.ts - a.ts);
  return candidates[0] ?? null;
}

function buildMdx({ source, item, kst }) {
  const category = CATEGORY_MAP[source.id] ?? 'policy';
  const cleanTitle = cleanText(item.title ?? '');
  const cleanDesc = cleanText(item.description ?? '');
  const safeTitle = cleanTitle.replace(/"/g, '\\"').slice(0, 60);
  const safeDesc = cleanDesc.replace(/"/g, '\\"').slice(0, 180);
  // 발행일 — RSS pubDate 가 14일 이내이면 사용, 아니면 KST 오늘
  const pubDateIso =
    item.pubDateISO && Date.now() - Date.parse(item.pubDateISO) < 14 * 86400000
      ? item.pubDateISO
      : kst.iso;
  const accessed = kst.date;

  const tldr = `${safeDesc} [검수 후 보강]`.slice(0, 195) + ' [검수 후]';

  const frontmatter = `---
title: "${safeTitle}"
publishedAt: "${pubDateIso}"
category: ${category}
tldr: "${tldr}"
sources:
  - name: "${(source.name ?? source.id).replace(/"/g, '\\"')} — ${safeTitle.slice(0, 30)}"
    date: "${kst.date}"
    url: "${item.link}"
    accessedAt: "${accessed}"
tags:
  personas: []
  dataTypes: ["정부발표"]
  actions: []
---

## 자동 생성 초안 — 운영자 검수 필요

본 글은 \`scripts/draft-pulse-from-rss.mjs\` 가 \`${source.name ?? source.id}\` 의 RSS 1차 출처에서
자동 생성한 초안. ADR 0006 4기준 충족을 위해 운영자가 다음 항목을 검수 후 발행한다:

[검수 후 본문 작성]

## 1차 출처 인용 (편집 금지 — 원문)

> ${cleanDesc.slice(0, 280)}

원문 링크: [${cleanTitle}](${item.link})

## 운영자 검수 체크리스트

1. ☐ 1차 출처 deep link 접속 확인 (위 URL)
2. ☐ 제목 정확성 (RSS 인용이 맞는지) 확인
3. ☐ 본문 explanatory framing 작성 (수치 환각 금지 — RSS 인용만)
4. ☐ tldr 보강 (200자 이내) — \`[검수 후]\` 토큰 제거
5. ☐ tags.personas / tags.actions 채우기 (해당 시)
6. ☐ sources[] 추가 (1차 출처 외 보조 보도 인용 시)
7. ☐ 검수 완료 후 \`src/content/pulse/\` 로 이동 + commit
`;
  return frontmatter;
}

/**
 * --count N 플래그: 1회 실행에서 최대 N 건 draft 생성 (기본 1).
 * Phase 9 — 발행 펌프 가속. cron 다중 스케줄 대신 한 실행에서 4건 생성.
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let count = 1;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) {
      const n = parseInt(args[i + 1], 10);
      if (Number.isFinite(n) && n > 0 && n <= 10) count = n;
      i++;
    } else if (args[i].startsWith('--count=')) {
      const n = parseInt(args[i].slice('--count='.length), 10);
      if (Number.isFinite(n) && n > 0 && n <= 10) count = n;
    }
  }
  return { count };
}

function main() {
  if (!existsSync(RSS_PATH)) {
    console.error('[draft-pulse] FATAL: data/rss/government.json 없음 — fetch-rss-government 먼저 실행');
    process.exit(1);
  }
  const { count: targetCount } = parseArgs();
  const rssData = JSON.parse(readFileSync(RSS_PATH, 'utf8'));
  const coveredPulse = loadCoveredUrls();
  const coveredDraft = loadCoveredDrafts();
  const covered = new Set([...coveredPulse, ...coveredDraft]);
  console.log(`[draft-pulse] 기존 펄스 ${coveredPulse.size}건 + 기존 draft ${coveredDraft.size}건 커버됨 / 목표 ${targetCount}건`);

  const created = [];
  const skipped = [];

  for (let i = 0; i < targetCount; i++) {
    const picked = pickItem(rssData, covered);
    if (!picked) {
      console.warn(`[draft-pulse] 신규 항목 풀 고갈 (${i}/${targetCount}건 생성 후) — 모든 RSS 항목 커버됨`);
      break;
    }

    const kst = fmtKstNow();
    const slug = slugify(picked.item.title);
    const fname = `draft-pulse-${kst.date}-${slug || 'untitled'}.mdx`;
    const outPath = resolve(OUT_DIR, fname);

    // pickItem 결과를 즉시 covered 에 추가 — 다음 iteration 에서 동일 항목 재선택 차단.
    covered.add(picked.item.link);

    if (existsSync(outPath)) {
      console.log(`[draft-pulse] 이미 존재 → ${fname} (skip)`);
      skipped.push({ fname, reason: 'file-exists' });
      continue;
    }

    const mdx = buildMdx({ source: picked.source, item: picked.item, kst });
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(outPath, mdx, 'utf8');

    console.log(`[draft-pulse] 신규 draft 생성 → ${fname}`);
    console.log(`  source: ${picked.source.name} (${picked.source.id})`);
    console.log(`  title:  ${picked.item.title.slice(0, 80)}`);
    console.log(`  link:   ${picked.item.link}`);
    created.push({
      fname,
      sourceId: picked.source.id,
      sourceName: picked.source.name,
      title: picked.item.title,
      link: picked.item.link,
    });
  }

  // ── publish-funnel.json 누적 (Phase 9 — 통과율 측정 게이트) ─────
  // 운영자 1.5h 예산 안에서 drafts 의 src/content/pulse 승격율을 추적.
  const funnelPath = resolve(REPO_ROOT, 'tmp', 'publish-funnel.json');
  let funnel = {
    history: [],
    total: { drafts_in: 0, drafts_killed: 0, drafts_skipped: 0, drafts_published: 0 },
  };
  if (existsSync(funnelPath)) {
    try { funnel = JSON.parse(readFileSync(funnelPath, 'utf8')); } catch {}
  }
  const nowIso = new Date().toISOString();
  funnel.history.push({
    at: nowIso,
    target: targetCount,
    created: created.length,
    skipped: skipped.length,
    pulse_collection_size: coveredPulse.size,
    draft_queue_size: coveredDraft.size + created.length,
  });
  // 최근 90일치만 보관 (history 무한 증가 회피)
  const cutoff = Date.now() - 90 * 86400000;
  funnel.history = funnel.history.filter((h) => Date.parse(h.at) >= cutoff);
  funnel.total.drafts_in = (funnel.total.drafts_in ?? 0) + created.length;
  funnel.total.drafts_skipped = (funnel.total.drafts_skipped ?? 0) + skipped.length;
  // drafts_published / drafts_killed 는 editor 워크플로 측에서 누적 — 본 스크립트는 in 만.

  mkdirSync(dirname(funnelPath), { recursive: true });
  writeFileSync(funnelPath, JSON.stringify(funnel, null, 2), 'utf8');

  console.log(`\n[draft-pulse] 요약 — 생성 ${created.length}건 / 스킵 ${skipped.length}건`);
  console.log(`[draft-pulse] funnel 누적 → tmp/publish-funnel.json (총 in ${funnel.total.drafts_in}건)`);
  if (created.length > 0) {
    console.log(`\n운영자 검수 후 src/content/pulse/ 로 이동.`);
  }
}

main();
