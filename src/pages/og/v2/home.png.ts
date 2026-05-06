/**
 * 홈 OG 카드 — /og/v2/home.png
 *
 * og-default.png 단일 폴백을 대체하는 사이트 마스트헤드 카드 (G17 픽스).
 * 홈/사이트 자체 공유 시 noised 로고 대신 사이트의 한 줄 정의를 박아 노출.
 */
import type { APIRoute } from 'astro';
import { generateSectionOgPng } from '../../../lib/og/generate';

export const prerender = true;

export const GET: APIRoute = async () => {
  const png = await generateSectionOgPng({
    eyebrow: 'S M A R T   D A T A   S H O P',
    headline: '한국의 데이터를 매일 5분으로',
    subhead:
      '정책·세금·금융·시장·통계·AI 1차 출처 데이터를 매일 5분 안에 정리하는 데이터 저널.',
  });

  const body = new Blob([new Uint8Array(png)]);
  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
};
