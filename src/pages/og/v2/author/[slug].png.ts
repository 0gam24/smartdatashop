/**
 * 저자 OG 카드 — /og/v2/author/{slug}.png
 * 현재 단일 저자(junhyuk-kim) — 향후 추가 시 AUTHORS 매핑만 확장.
 * YMYL 사이트의 author entity 카드 — Discover/News E-E-A-T 신호.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { generateSectionOgPng } from '../../../../lib/og/generate';

interface AuthorMeta {
  displayName: string;
  jobTitle: string;
  subhead: string;
}

const AUTHORS: Record<string, AuthorMeta> = {
  'junhyuk-kim': {
    displayName: '김준혁',
    jobTitle: '대표 · 데이터 검증 책임자',
    subhead: '국세청·한국은행·통계청·KRX 1차 출처를 매일 5분 분량으로 정리.',
  },
};

export const getStaticPaths: GetStaticPaths = async () => {
  return Object.keys(AUTHORS).map((slug) => ({ params: { slug } }));
};

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug as keyof typeof AUTHORS;
  const a = AUTHORS[slug];
  if (!a) return new Response('Not found', { status: 404 });

  const png = await generateSectionOgPng({
    eyebrow: 'A U T H O R',
    headline: a.displayName,
    subhead: a.subhead,
    footnote: a.jobTitle,
  });

  const body = new Blob([new Uint8Array(png)]);
  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
};
