#!/usr/bin/env node
/**
 * generate-today.mjs — today.md 단순화 버전 (운영자 일일 시야 단일 진입점).
 *
 * 운영자가 매일 보고 싶은 핵심 3 가지만:
 *   1. 최근 7일 새로 발행된 글 (제목 + URL + tldr + 검색엔진 색인 링크)
 *   2. 검수 대기 drafts (운영자 액션)
 *   3. 검색엔진 콘솔 빠른 링크
 *
 * 출력: <repo>/today.md (overwrite, KST 기준)
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
const todayLabel = `${todayKst} (${WEEKDAY_KOR[kstNow.getUTCDay()]})`;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function kstDateOf(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return null;
    const k = new Date(d.getTime() + KST_OFFSET);
    return k.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function extractFm(text) {
  const fields = {};
  const titleM = text.match(/^title:\s*"([^"]+)"/m);
  const pubM = text.match(/^publishedAt:\s*"([^"]+)"/m);
  const tldrM = text.match(/^tldr:\s*"([^"]+)"/m);
  const catM = text.match(/^category:\s*([^\s\n]+)/m);
  if (titleM) fields.title = titleM[1];
  if (pubM) fields.publishedAt = pubM[1];
  if (tldrM) fields.tldr = tldrM[1];
  if (catM) fields.category = catM[1].replace(/^["']|["']$/g, '');
  return fields;
}

function urlEnc(s) {
  return encodeURIComponent(s);
}

function gscInspectLink(absUrl) {
  return `https://search.google.com/search-console/inspect?resource_id=${urlEnc(SITE + '/')}&id=${urlEnc(absUrl)}`;
}

function naverSubmitLink() {
  // 네이버 서치어드바이저는 deep link URL 검사 미지원 — 수동 인덱스 요청 페이지로 이동.
  return `https://searchadvisor.naver.com/console/board/manageInformation?site=${urlEnc(SITE + '/')}`;
}

const lines = [];
const P = (s = '') => lines.push(s);

// ── Header ─────────────────────────────────────────
P(`# Today — ${todayLabel} (KST)`);
P('');
P(`> 마지막 갱신: ${now.toISOString()} · 매 cron + 매 빌드 자동 갱신`);
P('');

// ─────────────────────────────────────────────────────
// 1. 최근 7일 발행 — 핵심 섹션
// ─────────────────────────────────────────────────────

const cutoff = Date.now() - SEVEN_DAYS_MS;

function listRecent(dir, kind, urlBuilder) {
  const abs = resolve(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      try {
        const text = readFileSync(resolve(abs, f), 'utf8');
        const fm = extractFm(text);
        if (!fm.title || !fm.publishedAt) return null;
        const ts = new Date(fm.publishedAt).getTime();
        if (!Number.isFinite(ts) || ts < cutoff) return null;
        const slug = f.replace(/\.mdx$/, '');
        return {
          kind,
          file: f,
          title: fm.title,
          tldr: fm.tldr ?? '',
          category: fm.category ?? '',
          publishedAt: fm.publishedAt,
          url: urlBuilder(slug, fm.publishedAt),
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function pulseUrl(slug, publishedAt) {
  const dt = new Date(publishedAt);
  const k = new Date(dt.getTime() + KST_OFFSET);
  const Y = k.getUTCFullYear();
  const M = String(k.getUTCMonth() + 1).padStart(2, '0');
  const D = String(k.getUTCDate()).padStart(2, '0');
  return `${SITE}/${Y}/${M}/${D}/${slug}/`;
}

const recentPulses = listRecent('src/content/pulse', 'pulse', pulseUrl);
const recentInsights = listRecent(
  'src/content/insight',
  'insight',
  (slug) => `${SITE}/insight/${slug}/`,
);

const allRecent = [...recentPulses, ...recentInsights].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
);

P('## 🆕 최근 7일 새로 발행된 글');
P('');

if (allRecent.length === 0) {
  P('_최근 7일 새 글 0건 — drafts 검수 후 \`src/content/pulse/\` 로 이동 시 자동 발행._');
} else {
  P(`총 **${allRecent.length}건** — 검색엔진 색인 대상`);
  P('');

  // 날짜별 그룹
  const byDate = new Map();
  for (const e of allRecent) {
    const d = kstDateOf(e.publishedAt) ?? '?';
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d).push(e);
  }

  for (const [date, items] of byDate) {
    P(`### ${date} — ${items.length}건`);
    P('');
    for (const e of items) {
      const kindLabel = e.kind === 'pulse' ? '펄스' : e.kind === 'insight' ? '인사이트' : e.kind;
      P(`- **${e.title}** _(${kindLabel}${e.category ? ' · ' + e.category : ''})_`);
      P(`  - URL: <${e.url}>`);
      if (e.tldr) {
        const tldrShort = e.tldr.length > 130 ? e.tldr.slice(0, 127) + '...' : e.tldr;
        P(`  - tldr: ${tldrShort}`);
      }
      P(`  - [구글 색인 확인](${gscInspectLink(e.url)})`);
      P('');
    }
  }
}
P('');

// ─────────────────────────────────────────────────────
// 2. 검수 대기 drafts
// ─────────────────────────────────────────────────────
P('## 📋 검수 대기 drafts (5분 검수 후 발행)');
P('');

const draftsDir = resolve(ROOT, 'daily-queue/drafts');
const draftFiles = existsSync(draftsDir)
  ? readdirSync(draftsDir).filter((f) => f.endsWith('.mdx')).sort()
  : [];

if (draftFiles.length === 0) {
  P('_검수 대기 0건 — 다음 cron 사이클 (00:30 KST) 까지 대기._');
} else {
  P(`총 **${draftFiles.length}건**`);
  P('');
  draftFiles.forEach((f, i) => {
    let title = '';
    try {
      const text = readFileSync(resolve(draftsDir, f), 'utf8');
      const fm = extractFm(text);
      title = fm.title ?? f.replace('.mdx', '');
    } catch {
      title = f;
    }
    P(`${i + 1}. **${title}**`);
    P(`   \`${f}\``);
  });
}
P('');

// ─────────────────────────────────────────────────────
// 3. 검색엔진 콘솔 빠른 링크
// ─────────────────────────────────────────────────────
P('## 🔗 검색엔진 콘솔');
P('');
P('| 도구 | 링크 |');
P('|---|---|');
P(`| 네이버 서치어드바이저 | https://searchadvisor.naver.com/ |`);
P(`| 네이버 — 사이트맵 / RSS 제출 | ${naverSubmitLink()} |`);
P(`| 구글 서치 콘솔 | https://search.google.com/search-console |`);
P(`| 구글 — Discover 보고서 | https://search.google.com/search-console/discover?resource_id=${urlEnc(SITE + '/')} |`);
P('');
P('_위 발행 글 옆 "구글 색인 확인" 링크 클릭 → 즉시 색인 요청 가능 (속성당 일 10건 한도)._');
P('');

writeFileSync(TODAY_PATH, lines.join('\n') + '\n', 'utf8');
console.log(`[generate-today] today.md 갱신 완료 (${lines.length} 줄, 최근 7일 ${allRecent.length}건 / drafts ${draftFiles.length}건)`);
