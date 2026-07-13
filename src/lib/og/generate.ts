/**
 * OG 이미지 생성기 (Satori → SVG → PNG).
 *
 * 사용:
 *   const png = await generateOgPng({
 *     title: '...',
 *     category: '정 책',
 *     publishedDate: '2026-05-05',
 *     sourceCount: 3,
 *     chartData: { type: 'sparkline', values: [..], label: 'KOSPI 4월', unit: 'pt' },
 *   });
 *   return new Response(png, { headers: { 'Content-Type': 'image/png' } });
 *
 * D8 합의: OG 배지 = α "📊 1차 출처 N건"
 * D9 합의: 신규 통합 라우트 (og/v2/[type]/[slug].png.ts) 1개월 병행, 종료 시 기존 librsvg 라우트 제거
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { OG_FONTS } from './fonts';
import { defaultTemplate, type DefaultTemplateProps } from './templates/default';
import { sectionTemplate, type SectionTemplateProps } from './templates/section';

export type OgPayload = DefaultTemplateProps;

/**
 * 기사용 OG (default 템플릿 — 1200×630, Reuters/Bloomberg 스타일).
 */
export async function generateOgPng(payload: OgPayload): Promise<Buffer> {
  const svg = await satori(defaultTemplate(payload), {
    width: 1200,
    height: 630,
    fonts: OG_FONTS,
  });
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    background: '#faf7f0',
  })
    .render()
    .asPng();
  return Buffer.from(png);
}

/**
 * 비-기사 페이지(home/category/author/tag) OG (section 템플릿).
 * 글마다 고유 이미지 정책의 비-기사 사이드 — og-default.png 단일 폴백 제거 (G17).
 */
export async function generateSectionOgPng(payload: SectionTemplateProps): Promise<Buffer> {
  const svg = await satori(sectionTemplate(payload), {
    width: 1200,
    height: 630,
    fonts: OG_FONTS,
  });
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    background: '#faf7f0',
  })
    .render()
    .asPng();
  return Buffer.from(png);
}
