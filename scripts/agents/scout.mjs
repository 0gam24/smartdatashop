#!/usr/bin/env node
/**
 * scripts/agents/scout.mjs — 에이전트 #2 Data Scout (LITE 단계).
 *
 * 매시 정각 (.github/workflows/scout.yml cron) 마다 config/sources.json 의
 * RSS/feed URL 들을 polling 하여 최신 발행 후보를 data-queue/ 에 적재.
 *
 * 단계:
 *   STUB  (구) — heartbeat 만 기록.
 *   LITE  (현) — config 의 RSS 자동 fetch + 파싱 + 일자별 후보 JSON 생성.
 *                네트워크만 사용. SDK/API 키 X. 실패 graceful — heartbeat 만 commit.
 *   FULL  (M3+) — Claude SDK 로 후보별 자동 요약·분류·writer 호출.
 *
 * 출력:
 *   data-queue/heartbeat.json       — 항상 갱신 (매시 commit 트리거)
 *   data-queue/{YYYY-MM-DD}.json    — 후보 ≥1 건일 때만 생성·갱신
 *
 * 운영자 활용:
 *   data-queue/{today}.json 의 candidates[] 가 SourceWriter 워크플로우의
 *   Stage 1 입력 (주제 + 후보 출처). 운영자가 1건 선택 → source-cache → writer.
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const REPO_ROOT = process.cwd();
const CONFIG_PATH = resolve(REPO_ROOT, 'config', 'sources.json');
const QUEUE_DIR = resolve(REPO_ROOT, 'data-queue');
mkdirSync(QUEUE_DIR, { recursive: true });

const ranAt = new Date().toISOString();
const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
const todayKst = kstNow.toISOString().slice(0, 10);

// ── config 로드 (없으면 stub heartbeat 만 기록) ────────────────────
let config = null;
try {
  config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
} catch {
  console.log(`[scout] ${ranAt} config/sources.json 없음 — heartbeat 만 기록`);
}

const feeds = (config && Array.isArray(config.feeds)) ? config.feeds : [];

// ── feed 별 fetch + 파싱 ──────────────────────────────────────────
const candidates = [];
const errors = [];
let fetchedFeeds = 0;
let parsedItems = 0;

/** RSS/Atom 본문에서 <item>/<entry> 단위로 link + title 추출. */
function parseFeedItems(xml) {
  const items = [];
  const blockRe = /<(item|entry)\b[\s\S]*?<\/\1>/g;
  for (const m of xml.matchAll(blockRe)) {
    const block = m[0];
    // RSS link
    let link = block.match(/<link>([^<]+)<\/link>/)?.[1]?.trim();
    // Atom link href
    if (!link) link = block.match(/<link[^>]+href="([^"]+)"/)?.[1]?.trim();
    // title (CDATA 또는 plain)
    const titleMatch = block.match(/<title(?:\s[^>]*)?>(?:<!\[CDATA\[)?([^<\]]+)/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    // 발행일 (RSS pubDate / Atom updated|published)
    const date =
      block.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1]?.trim() ||
      block.match(/<updated>([^<]+)<\/updated>/)?.[1]?.trim() ||
      block.match(/<published>([^<]+)<\/published>/)?.[1]?.trim() ||
      '';
    if (link) items.push({ link, title, date });
  }
  return items;
}

for (const feed of feeds) {
  if (!feed.url) continue;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(feed.url, {
      headers: {
        'user-agent':
          'smartdatashop-scout/0.2 (+https://smartdatashop.kr; smartdatashop@gmail.com)',
        accept: 'application/rss+xml,application/atom+xml,application/xml,text/xml,text/html',
        'accept-language': 'ko-KR,ko;q=0.9',
      },
      redirect: 'follow',
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      errors.push({ feed: feed.name, status: res.status });
      continue;
    }
    const text = await res.text();
    fetchedFeeds++;
    if (!/<rss\b|<feed\b|<item\b|<entry\b/i.test(text)) {
      errors.push({ feed: feed.name, reason: 'not-feed-format' });
      continue;
    }
    const items = parseFeedItems(text);
    parsedItems += items.length;
    // 각 feed 의 최근 5건만 — over-saturation 방지
    for (const it of items.slice(0, 5)) {
      candidates.push({
        source: feed.name,
        host: feed.host,
        category: feed.category,
        title: it.title,
        url: it.link,
        date: it.date,
      });
    }
  } catch (e) {
    errors.push({ feed: feed.name, error: e.message });
  }
}

// ── 출력: heartbeat (항상) + {date}.json (후보 있을 때) ──────────
const heartbeatPath = join(QUEUE_DIR, 'heartbeat.json');
writeFileSync(
  heartbeatPath,
  JSON.stringify(
    {
      agent: 'data-scout',
      ranAt,
      mode: feeds.length === 0 ? 'stub' : 'lite',
      status: errors.length === 0 ? 'ok' : 'partial-error',
      fetchedFeeds,
      parsedItems,
      candidatesProduced: candidates.length,
      errors,
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

// 후보 통합 — 같은 날 추가 호출 시 dedupe (URL 기준)
if (candidates.length > 0) {
  const datePath = join(QUEUE_DIR, `${todayKst}.json`);
  let existing = { date: todayKst, candidates: [] };
  try {
    if (existsSync(datePath)) existing = JSON.parse(readFileSync(datePath, 'utf8'));
  } catch {}
  const seen = new Set(existing.candidates.map((c) => c.url));
  const merged = existing.candidates.slice();
  for (const c of candidates) {
    if (!seen.has(c.url)) {
      merged.push({ ...c, firstSeenAt: ranAt });
      seen.add(c.url);
    }
  }
  writeFileSync(
    datePath,
    JSON.stringify(
      {
        date: todayKst,
        lastRanAt: ranAt,
        candidates: merged,
        note: 'SourceWriter Stage 1 입력 — 운영자가 1건 선택 → source-cache → writer.',
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );
}

console.log(
  `[scout] ${ranAt} LITE — feeds=${fetchedFeeds}/${feeds.length} items=${parsedItems} candidates=${candidates.length} errors=${errors.length}`,
);
process.exit(0);
