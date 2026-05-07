/**
 * 사이트 전체 RSS 피드 (PLANNING.md §13.1)
 *
 * pulse + insight 모두 합쳐 publishedAt 내림차순으로 최신 50건.
 * 각 항목은 카테고리 라벨(한국어)과 tldr description, 절대 URL을 포함한다.
 */
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { categoryToKorean, pulseUrl, type Category } from '../lib/korean';

const SITE_TITLE = '스마트데이터샵';
const SITE_DESC = '한국의 데이터를 매일 5분으로 — 1차 출처 데이터 저널';
const FEED_LIMIT = 50;

export async function GET(context: APIContext) {
  const [pulses, insights] = await Promise.all([
    getCollection('pulse'),
    getCollection('insight'),
  ]);

  // pulse 와 insight 를 통일된 항목 모양으로 정규화한다.
  // Naver SearchAdvisor는 RSS의 본문(전문) 포함을 권장하므로 entry.body(원본 MDX
  // 마크다운)를 그대로 content:encoded 슬롯에 싣는다. RSS 리더는 마크다운을
  // 텍스트로 표시하지만, 검색엔진/색인 시점에서는 description(tldr)만 있을 때보다
  // 본문 신호가 풍부해진다. HTML 살균이 필요하면 sanitize-html 도입을 검토하되,
  // 원본 MDX는 사이트 내부에서만 작성되므로 추가 살균 없이 신뢰한다.
  type FeedItem = {
    title: string;
    pubDate: Date;
    description: string;
    link: string;
    categories: string[];
    content: string;
    /** RFC 3339 author 필드 — 본 사이트는 단일 저자 */
    author?: string;
    /** dc:creator + media:thumbnail per-item customData */
    customData?: string;
  };

  const AUTHOR_EMAIL_NAME = 'smartdatashop@gmail.com (김준혁)';

  /** 펄스/인사이트 entry → 풍부한 RSS 항목.
   *  per-item customData 에 dc:creator + media:thumbnail (coverImage 있을 때) 추가.
   *  Naver/Google 의 feed crawler 가 동영상·이미지·저자 모두 신호로 사용. */
  function richItem(entry: { data: any; slug: string; body?: string }, link: string): FeedItem {
    const cover = entry.data.coverImage as string | undefined;
    const customParts: string[] = [
      `<dc:creator><![CDATA[${AUTHOR_EMAIL_NAME}]]></dc:creator>`,
    ];
    if (cover) {
      const absImg = cover.startsWith('http')
        ? cover
        : `https://smartdatashop.kr${cover.startsWith('/') ? cover : '/' + cover}`;
      customParts.push(`<media:thumbnail url="${absImg}" />`);
      customParts.push(`<media:content url="${absImg}" medium="image" />`);
    }
    return {
      title: entry.data.title,
      pubDate: new Date(entry.data.publishedAt),
      description: entry.data.tldr,
      link,
      categories: [categoryToKorean(entry.data.category as Category)],
      content: entry.body ?? '',
      author: AUTHOR_EMAIL_NAME,
      customData: customParts.join(''),
    };
  }

  const items: FeedItem[] = [
    ...pulses.map((entry) => richItem(entry, pulseUrl(entry.slug, entry.data.publishedAt))),
    ...insights.map((entry) => richItem(entry, `/insight/${entry.slug}/`)),
  ];

  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  const top = items.slice(0, FEED_LIMIT);

  // 채널 customData — language, copyright, atom:link self, dc 네임스페이스, lastBuildDate
  const lastBuild = top[0]?.pubDate.toUTCString() ?? new Date().toUTCString();
  const channelCustom = [
    '<language>ko-kr</language>',
    '<copyright>CC BY-NC 4.0 · 김준혁</copyright>',
    `<lastBuildDate>${lastBuild}</lastBuildDate>`,
    `<managingEditor>${AUTHOR_EMAIL_NAME}</managingEditor>`,
    `<webMaster>${AUTHOR_EMAIL_NAME}</webMaster>`,
    '<atom:link href="https://smartdatashop.kr/feed.xml" rel="self" type="application/rss+xml" />',
  ].join('');

  return rss({
    title: SITE_TITLE,
    description: SITE_DESC,
    site: context.site ?? 'https://smartdatashop.kr',
    items: top,
    customData: channelCustom,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
      dc: 'http://purl.org/dc/elements/1.1/',
      media: 'http://search.yahoo.com/mrss/',
    },
  });
}
