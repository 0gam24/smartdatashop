/**
 * 카테고리별 RSS 피드 (PLANNING.md §13.1)
 *
 * /category/{slug}/feed.xml — pulse + insight 중 해당 카테고리만, 최신 50건.
 * getStaticPaths 로 5개 카테고리를 사전 빌드한다.
 */
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { categoryToKorean, pulseUrl, type Category } from '../../../lib/korean';

const FEED_LIMIT = 50;

const CATEGORIES: Category[] = ['policy', 'tax-finance', 'market', 'stats', 'ai-tech'];

export async function getStaticPaths() {
  return CATEGORIES.map((slug) => ({
    params: { slug },
    props: { category: slug },
  }));
}

interface Props {
  category: Category;
}

export async function GET(context: APIContext) {
  const { category } = context.props as Props;

  const [pulses, insights] = await Promise.all([
    getCollection('pulse', (e) => e.data.category === category),
    getCollection('insight', (e) => e.data.category === category),
  ]);

  type FeedItem = {
    title: string;
    pubDate: Date;
    description: string;
    link: string;
    categories: string[];
  };

  const items: FeedItem[] = [
    ...pulses.map((entry) => ({
      title: entry.data.title,
      pubDate: new Date(entry.data.publishedAt),
      description: entry.data.tldr,
      link: pulseUrl(entry.slug, entry.data.publishedAt),
      categories: [categoryToKorean(entry.data.category as Category)],
    })),
    ...insights.map((entry) => ({
      title: entry.data.title,
      pubDate: new Date(entry.data.publishedAt),
      description: entry.data.tldr,
      link: `/insight/${entry.slug}/`,
      categories: [categoryToKorean(entry.data.category as Category)],
    })),
  ];

  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  const top = items.slice(0, FEED_LIMIT);

  const koLabel = categoryToKorean(category);
  return rss({
    title: `스마트데이터샵 — ${koLabel}`,
    description: `${koLabel} 카테고리 1차 출처 데이터 — 최신 ${FEED_LIMIT}건`,
    site: context.site ?? 'https://smartdatashop.kr',
    items: top,
    customData: '<language>ko-kr</language><copyright>CC BY-NC 4.0 · 김준혁</copyright>',
  });
}
