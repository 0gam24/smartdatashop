/**
 * 이미지 사이트맵 — /image-sitemap.xml (Discover #4, ADR 0005)
 *
 * 목적: 글마다 동적 OG v2 카드(`/og/v2/{type}/{slug}.png`) 가 14개 + 정책/저자/홈 OG 가
 *      14개로 총 28개 1200×630 자산이 존재하지만, 표준 sitemap.xml 은 이미지 발견 신호를
 *      약하게 줄 뿐이라 별도 image sitemap (Google Image Search Central docs 권고) 를
 *      발행해 발견율을 높인다.
 *
 * Schema (G/03 image-sitemaps.md 현행 기준 — image:title/caption 은 지원 중단이라 미발행):
 *   <urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
 *     <url>
 *       <loc>{글 본문 URL}</loc>
 *       <image:image><image:loc>{OG 카드 URL}</image:loc></image:image>
 *       <image:image><image:loc>{리드 차트 WebP URL}</image:loc></image:image>  ← chart 있는 글만
 *     </url>
 *     ...
 *   </urlset>
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { insightUrl, pulseUrl } from '../lib/korean';

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
    imageUrls: string[];
  }> = [];

  for (const e of pulses) {
    const pageUrl = `${SITE}${pulseUrl(e.slug, e.data.publishedAt, e.data.category)}`;
    const imageUrls = [
      e.data.coverImage
        ? e.data.coverImage.startsWith('http')
          ? e.data.coverImage
          : `${SITE}${e.data.coverImage}`
        : `${SITE}/og/v2/pulse/${e.slug}.png`,
    ];
    // 리드 차트 (frontmatter chart) — 본문 실제 노출 데이터 시각화
    if (e.data.chart) imageUrls.push(`${SITE}/charts/pulse/${e.slug}.webp`);
    entries.push({ pageUrl, imageUrls });
  }

  for (const e of insights) {
    // 페이지 URL 은 insightUrl() 경유 (2026-06-13 이후 발행분 슬러그 날짜 접두사 제거).
    // 이미지 URL 은 OG 라우트가 raw slug 를 쓰므로 그대로 둔다.
    const pageUrl = `${SITE}${insightUrl(e.slug, e.data.publishedAt)}`;
    const imageUrls = [
      e.data.coverImage
        ? e.data.coverImage.startsWith('http')
          ? e.data.coverImage
          : `${SITE}${e.data.coverImage}`
        : `${SITE}/og/v2/insight/${e.slug}.png`,
    ];
    if (e.data.chart) imageUrls.push(`${SITE}/charts/insight/${e.slug}.webp`);
    entries.push({ pageUrl, imageUrls });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
  .map(
    (e) => `  <url>
    <loc>${escapeXml(e.pageUrl)}</loc>
${e.imageUrls
  .map((img) => `    <image:image><image:loc>${escapeXml(img)}</image:loc></image:image>`)
  .join('\n')}
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
