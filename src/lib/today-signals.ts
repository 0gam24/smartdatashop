/**
 * 오늘의 활동 시그널 — 메인 Masthead 멀티시그널 카운터 빌드용.
 *
 * "발행 0편" 인 날도 메인이 살아있어 보이도록, 다음을 24h 윈도우로 집계:
 *   1. 자동 fetch SSOT 데이터 파일들의 fetchedAt / lastSyncedAt
 *   2. daily-queue/drafts/ 의 검수 대기 펄스 초안 수
 *
 * 모든 함수는 **런타임 fail-soft** — 파일이 없거나 파싱 실패해도 0/[] 반환.
 * (운영자가 cron 미가동 환경에서도 메인이 정상 빌드되도록.)
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();

/** 24h (한 시간 단위 ms) — Discover/D.I.A. freshness 신호 윈도우. */
const FRESH_WINDOW_MS = 24 * 60 * 60 * 1000;

/** 본 사이트의 매일 자동 fetch SSOT 데이터 파일 목록 + 시간 필드명. */
const TRACKED_DATA_FILES: ReadonlyArray<{ path: string; field: string; label: string }> = [
  { path: 'data/economy/ecos-timeseries.json', field: 'fetchedAt', label: 'ECOS 시계열' },
  { path: 'data/economy/key-100.json', field: 'fetchedAt', label: 'ECOS 100대 지표' },
  { path: 'data/economy/kosis-indicator.json', field: 'fetchedAt', label: 'KOSIS' },
  { path: 'data/rss/government.json', field: 'fetchedAt', label: '정부 RSS' },
  { path: 'data/news/keywords.json', field: 'fetchedAt', label: '뉴스 키워드' },
  { path: 'data/network-index.json', field: 'lastSyncedAt', label: '자매 네트워크' },
];

/** 한 데이터 파일의 fetchedAt 가 24h 윈도우 안인지. */
function isFreshFile(file: { path: string; field: string }): boolean {
  const abs = resolve(ROOT, file.path);
  if (!existsSync(abs)) return false;
  try {
    const j = JSON.parse(readFileSync(abs, 'utf8'));
    const t = j[file.field];
    if (typeof t !== 'string') return false;
    const ms = new Date(t).getTime();
    if (!Number.isFinite(ms)) return false;
    return Date.now() - ms < FRESH_WINDOW_MS;
  } catch {
    return false;
  }
}

/** 24h 윈도우 안에 갱신된 SSOT 데이터 파일 갯수. */
export function countFreshDataSources(): number {
  return TRACKED_DATA_FILES.reduce((n, f) => n + (isFreshFile(f) ? 1 : 0), 0);
}

/** daily-queue/drafts/ 안의 검수 대기 펄스 초안 갯수 (.mdx, .md). */
export function countDraftsInQueue(): number {
  const dir = resolve(ROOT, 'daily-queue/drafts');
  if (!existsSync(dir)) return 0;
  try {
    return readdirSync(dir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md')).length;
  } catch {
    return 0;
  }
}

/** 메인 Masthead 가 한 번에 받을 종합 시그널 묶음. */
export interface TodaySignals {
  /** 24h 안 갱신된 SSOT 데이터 파일 수 (max 6). */
  dataUpdatesToday: number;
  /** 검수 대기 펄스 초안 수. */
  draftsInQueue: number;
}

export function getTodaySignals(): TodaySignals {
  return {
    dataUpdatesToday: countFreshDataSources(),
    draftsInQueue: countDraftsInQueue(),
  };
}

// ───────────────────────────────────────────────────────────────────
// TodayDataDigest 섹션용 helpers — 메인 "오늘의 데이터" 3 레인 데이터.
// 모두 fail-soft: 파일 없거나 파싱 실패 시 [] 반환.
// ───────────────────────────────────────────────────────────────────

function readJson<T>(relPath: string): T | null {
  const abs = resolve(ROOT, relPath);
  if (!existsSync(abs)) return null;
  try {
    return JSON.parse(readFileSync(abs, 'utf8')) as T;
  } catch {
    return null;
  }
}

/** ECOS 시계열 |Δ%| 상위 N 종 — 값·단위·Δ + 토픽 링크. */
export interface EcosChangeRow {
  id: string;
  short: string;
  latestValue: number;
  unit: string;
  changePct: number;
  changeAbs: number;
  /** "전기 대비" / "전월 대비" / "전일 대비" 등 cycle 라벨 */
  cycleLabel: string;
}

const CYCLE_LABEL: Record<string, string> = {
  D: '전일',
  M: '전월',
  Q: '전기',
  Y: '전년',
};

export function getEcosTopChanges(limit = 3): EcosChangeRow[] {
  type SeriesPoint = { time: string | null; value: number | null };
  type EcosSeries = {
    id: string;
    short: string;
    cycle: 'D' | 'M' | 'Q' | 'Y';
    unit: string;
    status: string;
    latest: SeriesPoint | null;
    change: { abs: number; pct: number } | null;
  };
  type EcosFile = { series?: EcosSeries[] };

  const j = readJson<EcosFile>('data/economy/ecos-timeseries.json');
  if (!j?.series) return [];
  return j.series
    .filter((s) => s.status === 'ok' && s.latest && s.change && Number.isFinite(s.latest.value))
    .map((s) => ({
      id: s.id,
      short: s.short,
      latestValue: s.latest!.value as number,
      unit: s.unit,
      changePct: s.change!.pct,
      changeAbs: s.change!.abs,
      cycleLabel: CYCLE_LABEL[s.cycle] ?? '직전',
    }))
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, limit);
}

/** 정부 RSS aggregateItems 최신 N 건 — 제목·링크·기관·발행시각. */
export interface RssRecentRow {
  title: string;
  link: string;
  publishedIso: string;
  sourceName: string;
  sourceCategory: string;
}

export function getRecentRssItems(limit = 5): RssRecentRow[] {
  type AggItem = {
    title: string;
    link: string;
    pubDateISO: string;
    sourceName: string;
    sourceCategory: string;
  };
  type RssFile = { aggregateItems?: AggItem[] };

  const j = readJson<RssFile>('data/rss/government.json');
  if (!j?.aggregateItems) return [];
  return j.aggregateItems
    .filter((it) => typeof it.title === 'string' && typeof it.link === 'string' && typeof it.pubDateISO === 'string')
    .sort(
      (a, b) =>
        new Date(b.pubDateISO).getTime() - new Date(a.pubDateISO).getTime(),
    )
    .slice(0, limit)
    .map((it) => ({
      title: it.title.replace(/&middot;/g, '·').replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
      link: it.link,
      publishedIso: it.pubDateISO,
      sourceName: it.sourceName ?? '',
      sourceCategory: it.sourceCategory ?? '',
    }));
}

/** 뉴스 multiSource 키워드 상위 N — 등장 출처 수 큰 순. */
export interface NewsKeywordRow {
  term: string;
  total: number;
  sourceCount: number;
  exampleTitle?: string;
}

export function getTopNewsKeywords(limit = 3): NewsKeywordRow[] {
  type Example = { source: string; title: string };
  type MultiKeyword = {
    term: string;
    total: number;
    sourceCount: number;
    sources: string[];
    examples: Example[];
  };
  type NewsFile = { multiSourceKeywords?: MultiKeyword[] };

  const j = readJson<NewsFile>('data/news/keywords.json');
  if (!j?.multiSourceKeywords) return [];
  return j.multiSourceKeywords
    .slice()
    .sort((a, b) => b.sourceCount - a.sourceCount || b.total - a.total)
    .slice(0, limit)
    .map((k) => ({
      term: k.term,
      total: k.total,
      sourceCount: k.sourceCount,
      exampleTitle: k.examples?.[0]?.title,
    }));
}
