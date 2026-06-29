/**
 * Atom 1.0 피드 — /atom.xml
 *
 * RSS(/feed.xml)·JSON Feed(/feed.json) 와 병행하는 표준 피드.
 * Atom 은 수정일(updated) 등 메타데이터를 정밀하게 담는 형식으로, 일부
 * 리더·수집기가 RSS 보다 Atom 을 우선 처리한다. pulse + insight 를 합쳐
 * publishedAt 내림차순 최신 50건을 싣는다. (feed.xml.ts 와 동일 데이터·정렬)
 */
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { pulseUrl, insightUrl, type Category } from '../lib/korean';

const SITE_TITLE = '스마트데이터샵';
const SITE_URL = 'https://smartdatashop.kr';
const SITE_DESC = '한국의 데이터를 매일 5분으로 — 1차 출처 데이터 저널';
const FEED_LIMIT = 50;

// categoryToKorean 은 디자인용 자간 라벨('정 책')을 반환하므로, 피드에는
// 기계가독·인용 친화의 깨끗한 라벨을 별도로 쓴다. (llms.txt.ts 와 동일 방침)
const CATEGORY_LABEL: Record<Category, string> = {
  policy: '정책',
  'tax-finance': '세금·금융',
  market: '시장',
  stats: '통계',
  'ai-tech': 'AI·기술',
};

const AUTHOR_NAME = '김준혁';
const AUTHOR_EMAIL = 'smartdatashop@gmail.com';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(_context: APIContext) {
  const [pulses, insights] = await Promise.all([
    getCollection('pulse'),
    getCollection('insight'),
  ]);

  type Item = {
    title: string;
    link: string;
    published: Date;
    summary: string;
    category: Category;
  };

  const items: Item[] = [
    ...pulses.map((e) => ({
      title: e.data.title,
      link: `${SITE_URL}${pulseUrl(e.slug, e.data.publishedAt, e.data.category)}`,
      published: new Date(e.data.publishedAt),
      summary: e.data.tldr,
      category: e.data.category as Category,
    })),
    ...insights.map((e) => ({
      title: e.data.title,
      link: `${SITE_URL}${insightUrl(e.slug, e.data.publishedAt)}`,
      published: new Date(e.data.publishedAt),
      summary: e.data.tldr,
      category: e.data.category as Category,
    })),
  ]
    .sort((a, b) => b.published.getTime() - a.published.getTime())
    .slice(0, FEED_LIMIT);

  const updated = items[0]?.published.toISOString() ?? new Date(0).toISOString();

  const entries = items
    .map((it) => {
      const iso = it.published.toISOString();
      return `  <entry>
    <title>${escapeXml(it.title)}</title>
    <link href="${escapeXml(it.link)}" rel="alternate" type="text/html"/>
    <id>${escapeXml(it.link)}</id>
    <published>${iso}</published>
    <updated>${iso}</updated>
    <summary>${escapeXml(it.summary)}</summary>
    <category term="${escapeXml(CATEGORY_LABEL[it.category])}"/>
    <author><name>${escapeXml(AUTHOR_NAME)}</name></author>
  </entry>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ko">
  <title>${escapeXml(SITE_TITLE)}</title>
  <subtitle>${escapeXml(SITE_DESC)}</subtitle>
  <link href="${SITE_URL}/atom.xml" rel="self" type="application/atom+xml"/>
  <link href="${SITE_URL}/" rel="alternate" type="text/html"/>
  <id>${SITE_URL}/</id>
  <updated>${updated}</updated>
  <rights>CC BY-NC 4.0 · ${escapeXml(AUTHOR_NAME)}</rights>
  <generator uri="${SITE_URL}/">smartdatashop</generator>
  <author><name>${escapeXml(AUTHOR_NAME)}</name><email>${AUTHOR_EMAIL}</email></author>
${entries}
</feed>
`;

  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'application/atom+xml; charset=utf-8',
      'cache-control': 'public, max-age=600',
    },
  });
}
