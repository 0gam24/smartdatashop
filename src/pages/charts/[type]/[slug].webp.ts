/**
 * 리드 차트 WebP 라우트 — /charts/{pulse|insight}/<slug>.webp
 *
 * frontmatter `chart` 가 있는 글만 정적 생성 (없는 글은 라우트 자체가 없음).
 * 본문 상단 <img>(ArticleLayout/InsightLayout), NewsArticle LD image[],
 * 이미지 사이트맵이 이 URL 을 공유한다.
 *
 * OG v2 라우트(og/v2/[type]/[slug].png.ts)와 동일한 컨벤션:
 * raw slug 키 + 24h public 캐시.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { generateLeadChartWebp, type ChartSpec } from '../../../lib/og/lead-chart';

type EntryUnion = CollectionEntry<'pulse'> | CollectionEntry<'insight'>;

export const getStaticPaths: GetStaticPaths = async () => {
  const pulses = await getCollection('pulse', (e) => Boolean(e.data.chart));
  const insights = await getCollection('insight', (e) => Boolean(e.data.chart));

  return [
    ...pulses.map((entry) => ({
      params: { type: 'pulse', slug: entry.slug },
      props: { entry } as { entry: EntryUnion },
    })),
    ...insights.map((entry) => ({
      params: { type: 'insight', slug: entry.slug },
      props: { entry } as { entry: EntryUnion },
    })),
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: EntryUnion };
  const webp = await generateLeadChartWebp(entry.data.chart as ChartSpec);

  const body = new Blob([new Uint8Array(webp)]);
  return new Response(body, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
};
