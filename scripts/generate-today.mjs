#!/usr/bin/env node
/**
 * generate-today.mjs — today.md 자동 생성기 (운영자 일일 시야 단일 진입점).
 *
 * 매일 cron / postbuild / 매 push 마다 갱신. 직전 24h 안 일어난 cron 자동화 활동 +
 * 콘텐츠 큐 + 데이터 SSOT freshness + 자매 mirror 상태 + 검수 대기 drafts 를 한 페이지에 모음.
 *
 * 출력: <repo>/today.md (overwrite, KST 기준)
 *
 * 입력 (없으면 graceful skip):
 *   - data/economy/ecos-timeseries.json
 *   - data/economy/key-100.json
 *   - data/economy/kosis-indicator.json
 *   - data/rss/government.json
 *   - data/news/keywords.json
 *   - data/network-index.json
 *   - sister-mirrors/{calculatorhost,awoo,moneylook,iknowhowinfo}/posts.json
 *   - daily-queue/drafts/*.mdx
 *   - src/content/pulse/*.mdx (오늘 발행 분 필터)
 *   - tmp/writer-heartbeat.json
 *   - tmp/publish-funnel.json
 *
 * 운영자 1.5h/일 — 이 한 파일만 보면 어제~오늘 모든 자동화 결과 + 검수 큐 한눈에.
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const TODAY_PATH = resolve(ROOT, 'today.md');

const KST_OFFSET = 9 * 60 * 60 * 1000;
const now = new Date();
const kstNow = new Date(now.getTime() + KST_OFFSET);
const todayKst = kstNow.toISOString().slice(0, 10);

const WEEKDAY_KOR = ['일', '월', '화', '수', '목', '금', '토'];
const todayLabel = `${todayKst} (${WEEKDAY_KOR[kstNow.getUTCDay()]})`;

const FRESH_24H_MS = 24 * 60 * 60 * 1000;

function readJsonSafe(rel) {
  const abs = resolve(ROOT, rel);
  if (!existsSync(abs)) return null;
  try {
    return JSON.parse(readFileSync(abs, 'utf8'));
  } catch {
    return null;
  }
}

function fmtKst(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return '—';
    const k = new Date(d.getTime() + KST_OFFSET);
    const Y = k.getUTCFullYear();
    const M = String(k.getUTCMonth() + 1).padStart(2, '0');
    const D = String(k.getUTCDate()).padStart(2, '0');
    const h = String(k.getUTCHours()).padStart(2, '0');
    const m = String(k.getUTCMinutes()).padStart(2, '0');
    return `${Y}-${M}-${D} ${h}:${m}`;
  } catch {
    return '—';
  }
}

function elapsedHours(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return (Date.now() - t) / (1000 * 60 * 60);
}

function freshMark(iso) {
  const h = elapsedHours(iso);
  if (h === null) return '—';
  if (h < 6) return '✅ fresh';
  if (h < 24) return '✅ today';
  if (h < 48) return '⚙ 1d';
  if (h < 168) return `⚙ ${Math.floor(h / 24)}d`;
  return `❌ ${Math.floor(h / 24)}d stale`;
}

const lines = [];
function P(s = '') { lines.push(s); }

// ─────────────────────────────────────────────────────
// 1. Header
// ─────────────────────────────────────────────────────
P(`# Today — ${todayLabel} (KST)`);
P('');
P(`> 자동 생성 — 매 빌드 + 매 cron 갱신. 운영자 일일 시야 단일 진입점.`);
P(`> 마지막 실행: ${now.toISOString()}`);
P('');

// ─────────────────────────────────────────────────────
// 2. 검수 대기 drafts (운영자 액션 항목 — 가장 위)
// ─────────────────────────────────────────────────────
P('## 📝 검수 대기 drafts');
P('');
const draftsDir = resolve(ROOT, 'daily-queue/drafts');
const draftFiles = existsSync(draftsDir)
  ? readdirSync(draftsDir).filter((f) => f.endsWith('.mdx')).sort()
  : [];

if (draftFiles.length === 0) {
  P('_검수 대기 0건 — 다음 cron 사이클 (00:30 KST) 까지 대기._');
} else {
  P(`총 **${draftFiles.length}건** — 검수 후 \`src/content/pulse/\` 로 이동 시 발행.`);
  P('');
  P('| # | 파일 | 제목 |');
  P('|---|---|---|');
  draftFiles.slice(0, 10).forEach((f, i) => {
    let title = '';
    try {
      const text = readFileSync(resolve(draftsDir, f), 'utf8');
      const m = text.match(/^title:\s*"([^"]+)"/m);
      title = m ? m[1] : f.replace('.mdx', '');
    } catch {
      title = f;
    }
    const short = f.length > 50 ? f.slice(0, 47) + '...' : f;
    const tShort = title.length > 60 ? title.slice(0, 57) + '...' : title;
    P(`| ${i + 1} | \`${short}\` | ${tShort} |`);
  });
  if (draftFiles.length > 10) {
    P('');
    P(`_(${draftFiles.length - 10}건 추가)_`);
  }
}
P('');

// ─────────────────────────────────────────────────────
// 3. 오늘 발행된 콘텐츠 (publishedAt KST date == today)
// ─────────────────────────────────────────────────────
P('## ✅ 오늘 발행된 콘텐츠');
P('');

function listTodayPublished(dir, kind) {
  const abs = resolve(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      try {
        const text = readFileSync(resolve(abs, f), 'utf8');
        const titleM = text.match(/^title:\s*"([^"]+)"/m);
        const pubM = text.match(/^publishedAt:\s*"([^"]+)"/m);
        if (!titleM || !pubM) return null;
        const pubDate = new Date(pubM[1]);
        const pubKst = new Date(pubDate.getTime() + KST_OFFSET);
        const pubKstDate = pubKst.toISOString().slice(0, 10);
        if (pubKstDate !== todayKst) return null;
        return { kind, file: f, title: titleM[1], publishedAt: pubM[1] };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

const todayPulses = listTodayPublished('src/content/pulse', 'pulse');
const todayInsights = listTodayPublished('src/content/insight', 'insight');
const todayChapters = listTodayPublished('src/content/guidebookChapter', 'chapter');
const todayTotal = todayPulses.length + todayInsights.length + todayChapters.length;

if (todayTotal === 0) {
  P('_오늘 발행 0건 — drafts 검수해서 \`src/content/pulse/\` 로 이동 시 자동 발행._');
} else {
  P(`총 **${todayTotal}건** (펄스 ${todayPulses.length} / 인사이트 ${todayInsights.length} / 챕터 ${todayChapters.length})`);
  P('');
  P('| 종류 | 제목 | 발행시각 (KST) |');
  P('|---|---|---|');
  for (const e of [...todayPulses, ...todayInsights, ...todayChapters]) {
    P(`| ${e.kind} | ${e.title} | ${fmtKst(e.publishedAt)} |`);
  }
}
P('');

// ─────────────────────────────────────────────────────
// 4. 데이터 SSOT freshness
// ─────────────────────────────────────────────────────
P('## 📊 데이터 SSOT freshness');
P('');
P('| 파일 | 출처 | fetchedAt | 신선도 |');
P('|---|---|---|---|');

const ssotFiles = [
  { path: 'data/economy/ecos-timeseries.json', label: 'ECOS 시계열 5종', field: 'fetchedAt' },
  { path: 'data/economy/key-100.json', label: 'ECOS 100대 지표', field: 'fetchedAt' },
  { path: 'data/economy/kosis-indicator.json', label: 'KOSIS 지표', field: 'fetchedAt' },
  { path: 'data/rss/government.json', label: '정부 RSS 14피드 / 66 sources', field: 'fetchedAt' },
  { path: 'data/news/keywords.json', label: '뉴스 키워드 (7 언론사)', field: 'fetchedAt' },
  { path: 'data/network-index.json', label: '자매 네트워크 인덱스', field: 'lastSyncedAt' },
];

for (const f of ssotFiles) {
  const j = readJsonSafe(f.path);
  const ts = j?.[f.field] ?? null;
  P(`| \`${f.path.split('/').pop()}\` | ${f.label} | ${fmtKst(ts)} | ${freshMark(ts)} |`);
}
P('');

// ─────────────────────────────────────────────────────
// 5. ECOS 핵심 지표 (직전 갱신값)
// ─────────────────────────────────────────────────────
P('## 📈 ECOS 핵심 지표 (직전 갱신값)');
P('');
const ecos = readJsonSafe('data/economy/ecos-timeseries.json');
if (!ecos?.series) {
  P('_ECOS 데이터 없음 — fetch-data cron 실행 후 채워짐._');
} else {
  P('| 지표 | 값 | Δ% (직전) | YoY% | cycle |');
  P('|---|---|---|---|---|');
  for (const s of ecos.series.filter((x) => x.status === 'ok')) {
    const v = s.latest?.value;
    const valStr = typeof v === 'number'
      ? v.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
      : '—';
    const dPct = s.change?.pct;
    const yPct = s.yoyChange?.pct;
    const fmtPct = (n) =>
      typeof n !== 'number' || !Number.isFinite(n)
        ? '—'
        : `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
    P(`| ${s.short ?? s.id} | ${valStr} ${s.unit ?? ''} | ${fmtPct(dPct)} | ${fmtPct(yPct)} | ${s.cycle} |`);
  }
}
P('');

// ─────────────────────────────────────────────────────
// 6. 자매 mirror 상태
// ─────────────────────────────────────────────────────
P('## 🌐 자매 mirror 신선도');
P('');
P('| 자매 | 콘텐츠 | 마지막 갱신 | 신선도 |');
P('|---|---|---|---|');

const sisters = ['awoo', 'moneylook', 'calculatorhost', 'iknowhowinfo'];
for (const id of sisters) {
  const j = readJsonSafe(`sister-mirrors/${id}/posts.json`);
  if (!j) {
    P(`| ${id} | — | — | ❌ 없음 |`);
    continue;
  }
  const total = j.totalPosts ?? '—';
  const last = j.lastUpdated ?? null;
  P(`| ${id} ${j.domain ? `(${j.domain.replace('https://', '')})` : ''} | ${total} | ${fmtKst(last)} | ${freshMark(last)} |`);
}
P('');

// ─────────────────────────────────────────────────────
// 7. RSS 신착 (직전 24h)
// ─────────────────────────────────────────────────────
P('## 📥 정부 RSS 신착 (직전 24h)');
P('');
const rss = readJsonSafe('data/rss/government.json');
if (!rss?.aggregateItems) {
  P('_RSS 데이터 없음._');
} else {
  const cutoff = Date.now() - FRESH_24H_MS;
  const recent = rss.aggregateItems.filter(
    (it) => it.pubDateISO && new Date(it.pubDateISO).getTime() >= cutoff,
  );
  if (recent.length === 0) {
    P('_24h 신착 0건._');
  } else {
    P(`총 **${recent.length}건** (전체 풀 ${rss.aggregateTotal ?? rss.aggregateItems.length})`);
    P('');
    // sourceName 별 카운트
    const bySource = new Map();
    for (const it of recent) {
      const k = it.sourceName ?? '(unknown)';
      bySource.set(k, (bySource.get(k) ?? 0) + 1);
    }
    const top = [...bySource.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    P('| 출처 | 신착 갯수 |');
    P('|---|---|');
    for (const [name, n] of top) {
      P(`| ${name} | ${n} |`);
    }
  }
}
P('');

// ─────────────────────────────────────────────────────
// 8. writer agent + publish funnel
// ─────────────────────────────────────────────────────
P('## 🤖 writer agent 마지막 실행');
P('');
const wh = readJsonSafe('tmp/writer-heartbeat.json');
if (!wh) {
  P('_writer-heartbeat.json 없음 — 아직 실행 0._');
} else {
  P(`- 시점: ${fmtKst(wh.ranAt)}`);
  P(`- 상태: \`${wh.status ?? 'unknown'}\``);
  if (wh.model) P(`- 모델: \`${wh.model}\``);
  if (wh.enhanced) P(`- enhanced: ${wh.enhanced.length}건`);
  if (wh.skipped) P(`- skipped: ${wh.skipped.length}건`);
  if (wh.failed) P(`- failed: ${wh.failed.length}건`);
}
P('');

P('## 📊 publish funnel 누적');
P('');
const funnel = readJsonSafe('tmp/publish-funnel.json');
if (!funnel?.total) {
  P('_funnel 데이터 없음._');
} else {
  P(`- 누적 drafts in: **${funnel.total.drafts_in ?? 0}건**`);
  P(`- 누적 published: **${funnel.total.drafts_published ?? 0}건**`);
  P(`- 누적 killed: ${funnel.total.drafts_killed ?? 0}건`);
  P(`- 누적 skipped: ${funnel.total.drafts_skipped ?? 0}건`);
  if (funnel.total.drafts_in > 0) {
    const rate = ((funnel.total.drafts_published ?? 0) / funnel.total.drafts_in) * 100;
    P(`- 통과율: **${rate.toFixed(1)}%** (목표 40%)`);
  }
}
P('');

// ─────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────
P('---');
P('');
P('## 자동화 흐름 (참고)');
P('');
P('```');
P('00:30 KST — fetch-data: ECOS / KOSIS / RSS / 뉴스 → JSON commit + drafts 4건 생성');
P('02:00 KST — sync-sister-mirrors: 자매 4 mirror 동기화');
P('drafts push → writer agent: Claude 본문 자동 작성 + PR 자동 생성');
P('PR merge → publisher: IndexNow ping (Bing/Yandex 즉시)');
P('CF Pages 빌드 → today.md / OPERATOR_INBOX.md 자동 갱신');
P('```');

writeFileSync(TODAY_PATH, lines.join('\n') + '\n', 'utf8');
console.log(`[generate-today] today.md 갱신 완료 (${lines.length} 줄)`);
