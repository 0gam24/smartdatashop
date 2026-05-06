/**
 * 카테고리 OG 카드 — /og/v2/category/{slug}.png
 * 5개 카테고리(policy/tax-finance/market/stats/ai-tech) 각각 고유 이미지 (G17 픽스).
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { categoryToKorean, type Category } from '../../../../lib/korean';
import { generateSectionOgPng } from '../../../../lib/og/generate';

const CATEGORIES: Category[] = ['policy', 'tax-finance', 'market', 'stats', 'ai-tech'];

const SUBHEAD: Record<Category, string> = {
  policy: '정부·지자체 정책 발표 1차 출처. 발표일 기준으로 누가 무엇을 받는지 5분 안에.',
  'tax-finance':
    '국세청·한국은행·금감원 발표 + 5대 은행 시장 데이터. 1인사업자/직장인 절세 시점에 도착.',
  market: 'KRX·KOSPI·KOSDAQ·ETF·환율·원자재. 매일 결제 마감 후 정리된 시장 신호.',
  stats: '통계청 KOSIS·DART·data.go.kr 1차 출처. 정부 발표 → 즉시 재해석.',
  'ai-tech':
    '과기정통부·NIPA·DARPA·OpenAI·Anthropic. 한국 1인사업자/창업자에게 의미 있는 신호.',
};

export const getStaticPaths: GetStaticPaths = async () => {
  // 콘텐츠 컬렉션을 1회 로드해 컬렉션이 정상 빌드 가능한지 확인 (실패 시 즉시 노출).
  await getCollection('pulse');
  return CATEGORIES.map((slug) => ({ params: { slug } }));
};

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug as Category;
  const label = categoryToKorean(slug).replace(/ /g, '');

  const png = await generateSectionOgPng({
    eyebrow: 'C A T E G O R Y',
    headline: label,
    subhead: SUBHEAD[slug],
    footnote: 'smartdatashop.kr',
  });

  const body = new Blob([new Uint8Array(png)]);
  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
};
