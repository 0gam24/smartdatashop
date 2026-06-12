/**
 * JSON Feed — /feed.json
 *
 * https://www.jsonfeed.org/version/1.1/ — 모던 JSON 기반 피드 형식.
 * RSS 와 병행 — 일부 모던 reader (NetNewsWire, Inoreader) 가 JSON Feed
 * 우선 처리. Naver 는 RSS, Google Discover 는 둘 다 활용.
 */
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { categoryToKorean, pulseUrl, type Category } from '../lib/korean';

const SITE_TITLE = '스마트데이터샵';
const SITE_URL = 'https://smartdatashop.kr';
const FEED_LIMIT = 50;

export async function GET(_context: APIContext) {
  const [pulses, insights] = await Promise.all([
    getCollection('pulse'),
    getCollection('insight'),
  ]);

  type Item = {
    id: string;
    url: string;
    title: string;
    content_text: string;
    summary: string;
    date_published: string;
    tags: string[];
    image?: string;
    authors: { name: string; email: string; url: string }[];
  };

  const author = {
    name: '김준혁',
    email: 'smartdatashop@gmail.com',
    url: `${SITE_URL}/authors/junhyuk-kim/`,
  };

  function toItem(entry: any, kind: 'pulse' | 'insight'): Item {
    const link =
      kind === 'pulse'
        ? `${SITE_URL}${pulseUrl(entry.slug, entry.data.publishedAt, entry.data.category)}`
        : `${SITE_URL}/insight/${entry.slug}/`;
    const cover = entry.data.coverImage as string | undefined;
    const image = cover
      ? cover.startsWith('http')
        ? cover
        : `${SITE_URL}${cover.startsWith('/') ? cover : '/' + cover}`
      : undefined;
    return {
      id: link,
      url: link,
      title: entry.data.title,
      content_text: entry.body ?? '',
      summary: entry.data.tldr,
      date_published: new Date(entry.data.publishedAt).toISOString(),
      tags: [categoryToKorean(entry.data.category as Category)],
      ...(image && { image }),
      authors: [author],
    };
  }

  const items: Item[] = [
    ...pulses.map((e) => toItem(e, 'pulse')),
    ...insights.map((e) => toItem(e, 'insight')),
  ]
    .sort(
      (a, b) =>
        new Date(b.date_published).getTime() - new Date(a.date_published).getTime(),
    )
    .slice(0, FEED_LIMIT);

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: SITE_TITLE,
    home_page_url: `${SITE_URL}/`,
    feed_url: `${SITE_URL}/feed.json`,
    description: '한국의 데이터를 매일 5분으로 — 1차 출처 데이터 저널',
    icon: `${SITE_URL}/icon-192.png`,
    favicon: `${SITE_URL}/favicon.svg`,
    language: 'ko-KR',
    authors: [author],
    items,
  };

  return new Response(JSON.stringify(feed, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/feed+json; charset=utf-8',
      'cache-control': 'public, max-age=600',
    },
  });
}
