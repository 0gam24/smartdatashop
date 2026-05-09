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

/** Hero 우측 spotlight — ECOS |Δ%| 가장 큰 1종을 단일 카드 데이터로 변환. */
export interface EcosSpotlight {
  topicId: string;
  title: string;
  value: string;
  unit: string;
  delta: string;
  source: string;
}

const STAT_LABEL: Record<string, string> = {
  'base-rate': '한국은행 기준금리',
  'usd-krw': '원/달러 환율',
  cpi: '소비자물가지수',
  kospi: 'KOSPI',
  'household-debt': '가계대출 잔액',
};

/** YYYYMM / YYYYMMDD / YYYYQ 등 ECOS time 코드를 사람-가독 라벨로. */
function formatEcosTime(time: string | null, cycle: string): string {
  if (!time) return '';
  if (cycle === 'D' && time.length === 8) {
    return `${time.slice(0, 4)}.${time.slice(4, 6)}.${time.slice(6, 8)}`;
  }
  if (cycle === 'M' && time.length === 6) {
    return `${time.slice(0, 4)}.${time.slice(4, 6)}`;
  }
  if (cycle === 'Q' && time.length === 5) {
    return `${time.slice(0, 4)} Q${time.slice(4, 5)}`;
  }
  if (cycle === 'Y' && time.length === 4) return time;
  return time;
}

/**
 * Hero 우측 spotlight 단일 데이터 카드.
 *
 * 모든 시계열의 |Δ%| 중 최대 1종을 선택. 단, 변화가 0 이거나 ok 상태가 아니면 null.
 * 매일 자동 갱신되는 ECOS 시계열을 hero 시야권에 자동 노출 — Discover 신선도 신호.
 */
export function getEcosHeroSpotlight(): EcosSpotlight | null {
  const top = getEcosTopChanges(1)[0];
  if (!top) return null;

  // ECOS time 라벨 끌어내기 위해 원본 다시 읽음 (이미 캐시 가까움 — 빌드 시 1회)
  type SeriesPoint = { time: string | null };
  type Series = { id: string; cycle: string; latest: SeriesPoint | null };
  type EcosFile = { series?: Series[] };
  const j = readJson<EcosFile>('data/economy/ecos-timeseries.json');
  const orig = j?.series?.find((s) => s.id === top.id);
  const timeLabel = orig ? formatEcosTime(orig.latest?.time ?? null, orig.cycle) : '';

  const fmtVal = (n: number, unit: string): string => {
    if (Math.abs(n) >= 1000) return n.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
    if (unit === '%') return n.toFixed(2);
    return n.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
  };
  const sign = top.changePct > 0 ? '+' : '';
  const cycleHint = top.cycleLabel === '직전' ? '' : ` (${top.cycleLabel} 대비)`;

  return {
    topicId: top.id,
    title: STAT_LABEL[top.id] ?? top.short,
    value: fmtVal(top.latestValue, top.unit),
    unit: top.unit,
    delta: `${sign}${top.changePct.toFixed(2)}%${cycleHint}`,
    source: timeLabel ? `한국은행 ECOS · ${timeLabel}` : '한국은행 ECOS',
  };
}

// ───────────────────────────────────────────────────────────────────
// /this-week/ 주간 digest 페이지용 helpers — 직전 7일 데이터 집계.
// ───────────────────────────────────────────────────────────────────

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** "이번 주" 라벨 (KST 기준 ISO YYYY-MM-DD ~ YYYY-MM-DD). */
export interface WeekRange {
  startIso: string;
  endIso: string;
  label: string;
}

export function getCurrentWeekRange(now: Date = new Date()): WeekRange {
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const endKst = new Date(now.getTime() + KST_OFFSET);
  const startKst = new Date(endKst.getTime() - WEEK_MS);
  const startIso = startKst.toISOString().slice(0, 10);
  const endIso = endKst.toISOString().slice(0, 10);
  return {
    startIso,
    endIso,
    label: `${startIso} ~ ${endIso}`,
  };
}

/** 7일 윈도우 안 정부 RSS 신착 — pubDateISO 기준 정렬 + 중복 제거. */
export function getWeekRssTop(limit = 8): RssRecentRow[] {
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

  const cutoff = Date.now() - WEEK_MS;
  return j.aggregateItems
    .filter(
      (it) =>
        typeof it.title === 'string' &&
        typeof it.link === 'string' &&
        typeof it.pubDateISO === 'string' &&
        new Date(it.pubDateISO).getTime() >= cutoff,
    )
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

/** 자매 사이트별 가장 최근 글 1건 — sister-mirrors/{id}/posts.json 기반. */
export interface SisterLatestPost {
  title: string;
  url: string;
  publishedAt?: string;
}

export function getSisterLatest(siteId: string): SisterLatestPost | null {
  type Post = { title: string; url: string; publishedAt?: string };
  type MirrorFile = { posts?: Post[] };

  const j = readJson<MirrorFile>(`sister-mirrors/${siteId}/posts.json`);
  if (!j?.posts || j.posts.length === 0) return null;

  // 최신순 — publishedAt 기준 내림차순. 동률이거나 미지정이면 배열 순서 유지.
  const sorted = j.posts
    .slice()
    .sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tb - ta;
    });
  const top = sorted[0];
  if (!top || typeof top.title !== 'string' || typeof top.url !== 'string') return null;
  return {
    title: top.title,
    url: top.url,
    publishedAt: top.publishedAt,
  };
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
