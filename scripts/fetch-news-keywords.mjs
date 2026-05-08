#!/usr/bin/env node
/**
 * fetch-news-keywords.mjs
 *
 * 한국 주요 언론사 RSS 7 피드 동시 fetch → 제목에서 한글 키워드 추출 →
 * 다중 소스 동시 등장 빈도 집계.
 *
 * "이슈픽" 스타일 트렌드 키워드 대시보드의 데이터 소스. NLP 의존성 0
 * (정규식 기반 명사 추출 — MVP 정확도).
 *
 * OUT: data/news/keywords.json
 *
 * 인증키 불필요 (RSS 공개).
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const REPO_ROOT = process.cwd();
const OUT_PATH = resolve(REPO_ROOT, 'data/news/keywords.json');
const FETCH_TIMEOUT_MS = 12000;
const TOP_N = 100;
const MIN_LENGTH = 2;
const MAX_LENGTH = 10;
const MIN_OCCURRENCE = 2;

const SOURCES = [
  { id: 'sbs',   name: 'SBS',     url: 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=01' },
  { id: 'yna',   name: '연합뉴스', url: 'https://www.yna.co.kr/rss/news.xml' },
  { id: 'donga', name: '동아일보', url: 'https://rss.donga.com/total.xml' },
  { id: 'khan',  name: '경향신문', url: 'https://www.khan.co.kr/rss/rssdata/total_news.xml' },
  { id: 'mk',    name: '매일경제', url: 'https://www.mk.co.kr/rss/30000001/' },
  { id: 'kmib',  name: '국민일보', url: 'https://www.kmib.co.kr/rss/data/kmibRssAll.xml' },
  { id: 'hani',  name: '한겨레',   url: 'https://www.hani.co.kr/rss' },
];

// 의미 없는 일반 부사·조사 결합·동사 활용형 등 stopwords
const STOPWORDS = new Set([
  // 동사/형용사 활용형
  '있다','없다','한다','했다','이다','됩니다','됐다','된다','한다는','했다는',
  '말했다','밝혔다','전했다','강조했다','지적했다','설명했다','덧붙였다','부각시켰다',
  '보인','보였다','보인다','보이는','보일','드러난','드러내','드러나','나선','나서',
  '이뤄','이뤘다','이루어','이뤄진','이뤄질','맡아','맡은','맡았다',
  // 시간 표현
  '이번','지난','오늘','내일','어제','올해','작년','내년','이달','이번주',
  '오늘의','이번의','지난주','이번달','다음달','연속','당시','지금',
  // 조사·접속어
  '대한','관련','대해','관해','위한','위해','대하여','관하여',
  '하지만','그러나','그리고','때문','때문에','따라','따라서',
  '이들','우리','저희','이번에','이때',
  // 단위·수량
  '이상','이하','미만','초과','최대','최소','억원','조원','만원','원으로','억대',
  '경우','경우에','경우는','대부분','일부','전체','대거','절반','다수',
  // 지시어
  '그것','이것','저것','그곳','이곳','저곳',
  // 너무 흔한 일반 명사
  '한국','한국의','한국이','한국은','한국에서',
  '정부','정부의','정부가','정부는',
  '국가가','국가는','국가의',
  // 신문 메타 단어 (제목에 흔히 등장)
  '관계자','담당자','대변인','뉴스','기자','보도','연합','종합','속보','단독',
  // 동사적 의미 우세 (구체 명사 아님)
  '공개','발표','지원','시작','종료','출시','종합','검토','확정','발견','진행','결정','확인',
  '증가','감소','상승','하락','감축','확장','축소',
  '비판','반발','옹호','지원','반대','찬성','수용','거부','대응','대책',
  '위반','논의','발생','존재','확보','달성',
  // 너무 일반적인 형용 명사
  '대표','최고','최저','최대규모','최소규모','우수','미흡',
]);

// ─────────────────────────────────────────────────────────────
// fetch with timeout
// ─────────────────────────────────────────────────────────────

async function fetchText(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'smartdatashop-news-fetch/1.0 (+https://smartdatashop.kr)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// ─────────────────────────────────────────────────────────────
// RSS 2.0 정규식 파서 (의존성 0)
// ─────────────────────────────────────────────────────────────

function stripCDATA(s) {
  if (s == null) return null;
  return s.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim();
}
function decodeEntities(s) {
  if (s == null) return null;
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&amp;/g, '&');
}
function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  if (!m) return null;
  return decodeEntities(stripCDATA(m[1]));
}
function parseTitles(xml) {
  const titles = [];
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const title = extractTag(m[1], 'title');
    if (title) titles.push(title);
  }
  return titles;
}

// ─────────────────────────────────────────────────────────────
// 키워드 추출 (정규식 기반 MVP)
// ─────────────────────────────────────────────────────────────

function extractKeywords(text) {
  if (!text) return [];
  // 한글 시퀀스 (2~10자) — 영문/숫자/한자 섞이면 분리
  const matches = [...text.matchAll(/[가-힣]{2,10}/g)].map((m) => m[0]);
  return matches.filter((w) => w.length >= MIN_LENGTH && w.length <= MAX_LENGTH && !STOPWORDS.has(w));
}

// ─────────────────────────────────────────────────────────────
// per-source fetch
// ─────────────────────────────────────────────────────────────

async function fetchSource(source) {
  const startedAt = Date.now();
  console.log(`[news] ${source.id} fetch...`);
  try {
    const xml = await fetchText(source.url);
    const elapsedMs = Date.now() - startedAt;
    const titles = parseTitles(xml);
    console.log(`  ✓ ${source.id}: ${titles.length}건 (${elapsedMs}ms)`);
    return { ...source, status: 'ok', elapsedMs, itemCount: titles.length, titles };
  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    console.error(`  ✗ ${source.id}: ${err.message} (${elapsedMs}ms)`);
    return { ...source, status: 'fail', elapsedMs, error: err.message, itemCount: 0, titles: [] };
  }
}

// ─────────────────────────────────────────────────────────────
// main — 키워드 빈도 집계
// ─────────────────────────────────────────────────────────────

async function main() {
  const startedAt = Date.now();
  const fetchedAt = new Date().toISOString();
  console.log(`[fetch-news-keywords] start — ${SOURCES.length} sources`);

  const results = await Promise.all(SOURCES.map(fetchSource));
  const okSources = results.filter((r) => r.status === 'ok');

  // term → { total, sources: Set, examples: [titles] }
  const counts = new Map();
  for (const src of okSources) {
    for (const title of src.titles) {
      const kws = new Set(extractKeywords(title));
      for (const kw of kws) {
        const entry = counts.get(kw) ?? { total: 0, sources: new Set(), examples: [] };
        entry.total += 1;
        entry.sources.add(src.id);
        if (entry.examples.length < 3) entry.examples.push({ source: src.id, title });
        counts.set(kw, entry);
      }
    }
  }

  // 정렬: sourceCount desc → total desc
  const allKeywords = [...counts.entries()]
    .map(([term, e]) => ({
      term,
      total: e.total,
      sourceCount: e.sources.size,
      sources: [...e.sources],
      examples: e.examples,
    }))
    .filter((k) => k.total >= MIN_OCCURRENCE);

  const multiSource = allKeywords
    .filter((k) => k.sourceCount >= 2)
    .sort((a, b) => b.sourceCount - a.sourceCount || b.total - a.total)
    .slice(0, TOP_N);

  const singleSourceTop = allKeywords
    .filter((k) => k.sourceCount === 1)
    .sort((a, b) => b.total - a.total)
    .slice(0, 50);

  // 총 수집 헤드라인
  const totalTitles = okSources.reduce((a, s) => a + s.itemCount, 0);

  const out = {
    fetchedAt,
    elapsedMs: Date.now() - startedAt,
    sourceTotal: SOURCES.length,
    sourceSuccess: okSources.length,
    sourceFail: results.length - okSources.length,
    totalHeadlines: totalTitles,
    uniqueKeywords: allKeywords.length,
    multiSourceCount: multiSource.length,
    sources: results.map((r) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      status: r.status,
      itemCount: r.itemCount,
      elapsedMs: r.elapsedMs,
    })),
    multiSourceKeywords: multiSource,
    singleSourceTop: singleSourceTop,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');

  console.log(`\n[fetch-news-keywords] complete (${out.elapsedMs}ms)`);
  console.log(`  Sources: ${okSources.length}/${SOURCES.length}`);
  console.log(`  Headlines: ${totalTitles}`);
  console.log(`  Unique keywords (≥${MIN_OCCURRENCE}): ${allKeywords.length}`);
  console.log(`  Multi-source (≥2 sources): ${multiSource.length}`);
  console.log(`  → ${OUT_PATH}`);

  if (okSources.length === 0) {
    console.error('\n🚨 ALL sources fail');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
