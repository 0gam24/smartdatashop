/**
 * Google News 사이트맵 (PLANNING.md §13.3)
 *
 * 표준 sitemap 프로토콜에 news 네임스페이스를 추가한 형식.
 * pulse 컬렉션 중 publishedAt 이 최근 48시간 이내인 항목만 포함한다.
 * @astrojs/sitemap 은 news 네임스페이스를 지원하지 않아 직접 XML을 만든다.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { pulseUrl } from '../lib/korean';

const PUBLICATION_NAME = '스마트데이터샵';
const PUBLICATION_LANG = 'ko';
const FRESHNESS_WINDOW_MS = 48 * 60 * 60 * 1000;

// XML 안전 문자열 — 5개 엔티티만 escape 한다.
function xmlEscape(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://smartdatashop.kr/')).toString().replace(/\/$/, '');
  const cutoff = Date.now() - FRESHNESS_WINDOW_MS;

  const pulses = await getCollection('pulse');
  const fresh = pulses
    .filter((entry) => new Date(entry.data.publishedAt).getTime() >= cutoff)
    .sort(
      (a, b) =>
        new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime(),
    );

  const urlEntries = fresh
    .map((entry) => {
      const loc = `${origin}${pulseUrl(entry.slug, entry.data.publishedAt)}`;
      const pubIso = new Date(entry.data.publishedAt).toISOString();
      return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${xmlEscape(PUBLICATION_NAME)}</news:name>
        <news:language>${PUBLICATION_LANG}</news:language>
      </news:publication>
      <news:publication_date>${pubIso}</news:publication_date>
      <news:title>${xmlEscape(entry.data.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
};
