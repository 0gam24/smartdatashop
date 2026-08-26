/**
 * 카테고리별 RSS 피드 (PLANNING.md §13.1)
 *
 * /category/{slug}/feed.xml — pulse + insight 중 해당 카테고리만, 최신 50건.
 * getStaticPaths 로 5개 카테고리를 사전 빌드한다.
 */
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { categoryToKorean, insightUrl, pulseUrl, type Category } from '../../../lib/korean';

/** 자간용 공백이 들어간 표시 라벨("세 금 · 금 융")을 피드 메타용 평문으로 변환. */
function plainLabel(category: Category): string {
  return categoryToKorean(category).replace(/ /g, '');
}

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

  // Naver SearchAdvisor는 RSS의 본문(전문) 포함을 권장하므로 entry.body(원본 MDX
  // 마크다운)를 그대로 content:encoded 슬롯에 싣는다. (사이트 전체 feed.xml.ts와 동일 패턴)
  type FeedItem = {
    title: string;
    pubDate: Date;
    description: string;
    link: string;
    categories: string[];
    content: string;
  };

  const items: FeedItem[] = [
    ...pulses.map((entry) => ({
      title: entry.data.title,
      pubDate: new Date(entry.data.publishedAt),
      description: entry.data.tldr,
      link: pulseUrl(entry.slug, entry.data.publishedAt, entry.data.category),
      categories: [plainLabel(entry.data.category as Category)],
      content: entry.body,
    })),
    ...insights.map((entry) => ({
      title: entry.data.title,
      pubDate: new Date(entry.data.publishedAt),
      description: entry.data.tldr,
      // insightUrl() 경유 — 2026-06-13 이후 발행분은 슬러그 날짜 접두사가 제거되므로
      // raw slug 로 조립하면 404 URL 을 피드에 발행하게 된다 (2026-08-26 감사 수정).
      link: insightUrl(entry.slug, entry.data.publishedAt),
      categories: [plainLabel(entry.data.category as Category)],
      content: entry.body,
    })),
  ];

  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  const top = items.slice(0, FEED_LIMIT);

  const koLabel = plainLabel(category);
  return rss({
    title: `스마트데이터샵 — ${koLabel}`,
    description: `${koLabel} 카테고리 1차 출처 데이터 — 최신 ${FEED_LIMIT}건`,
    site: context.site ?? 'https://smartdatashop.kr',
    items: top,
    customData: '<language>ko-kr</language><copyright>CC BY-NC 4.0 · 김준혁</copyright>',
  });
}
