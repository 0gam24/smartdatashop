/**
 * 이미지 사이트맵 — /image-sitemap.xml (Discover #4, ADR 0005)
 *
 * 목적: 글마다 동적 OG v2 카드(`/og/v2/{type}/{slug}.png`) 가 14개 + 정책/저자/홈 OG 가
 *      14개로 총 28개 1200×630 자산이 존재하지만, 표준 sitemap.xml 은 이미지 발견 신호를
 *      약하게 줄 뿐이라 별도 image sitemap (Google Image Search Central docs 권고) 를
 *      발행해 발견율을 높인다.
 *
 * Schema:
 *   <urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
 *     <url>
 *       <loc>{글 본문 URL}</loc>
 *       <image:image>
 *         <image:loc>{OG 이미지 URL}</image:loc>
 *         <image:title>{글 제목}</image:title>
 *         <image:caption>{글 tldr}</image:caption>
 *       </image:image>
 *     </url>
 *     ...
 *   </urlset>
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { pulseUrl } from '../lib/korean';

const SITE = 'https://smartdatashop.kr';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const pulses = await getCollection('pulse').catch(() => []);
  const insights = await getCollection('insight').catch(() => []);

  const entries: Array<{
    pageUrl: string;
    imageUrl: string;
    title: string;
    caption: string;
  }> = [];

  for (const e of pulses) {
    const pageUrl = `${SITE}${pulseUrl(e.slug, e.data.publishedAt, e.data.category)}`;
    const imageUrl = e.data.coverImage
      ? e.data.coverImage.startsWith('http')
        ? e.data.coverImage
        : `${SITE}${e.data.coverImage}`
      : `${SITE}/og/v2/pulse/${e.slug}.png`;
    entries.push({
      pageUrl,
      imageUrl,
      title: e.data.title,
      caption: e.data.tldr,
    });
  }

  for (const e of insights) {
    const pageUrl = `${SITE}/insight/${e.slug}/`;
    const imageUrl = e.data.coverImage
      ? e.data.coverImage.startsWith('http')
        ? e.data.coverImage
        : `${SITE}${e.data.coverImage}`
      : `${SITE}/og/v2/insight/${e.slug}.png`;
    entries.push({
      pageUrl,
      imageUrl,
      title: e.data.title,
      caption: e.data.tldr,
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
  .map(
    (e) => `  <url>
    <loc>${escapeXml(e.pageUrl)}</loc>
    <image:image>
      <image:loc>${escapeXml(e.imageUrl)}</image:loc>
      <image:title>${escapeXml(e.title)}</image:title>
      <image:caption>${escapeXml(e.caption)}</image:caption>
    </image:image>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
};
