/**
 * 통합 OG 이미지 v2 — Satori 기반 (Reuters/Bloomberg 스타일).
 *
 * 라우트: /og/v2/{pulse|insight}/<slug>.png
 *
 * D9 결정 (4관점 합의 N): 기존 librsvg 라우트
 *   /og/pulse/[slug].png.ts
 *   /og/insight/[slug].png.ts
 * 와 1개월 병행. 이 기간 동안 신규 라우트만 사용하도록 BaseLayout/article 라우트의
 * ogImage 폴백을 점진 변경. 1개월 후 (캐시/공유 카드 만료 충분) 기존 라우트 제거.
 *
 * 입력:
 *   - type: pulse | insight (다른 컬렉션이면 404)
 *   - slug: 콘텐츠 컬렉션 슬러그
 *
 * 출력:
 *   - 1200×630 PNG, max-age 24h public 캐시 (slug-keyed → 버전 변경 시 URL 자체가 바뀜)
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { categoryToKorean, formatKoreanDate } from '../../../../lib/korean';
import { generateOgPng } from '../../../../lib/og/generate';

type EntryUnion = CollectionEntry<'pulse'> | CollectionEntry<'insight'>;

export const getStaticPaths: GetStaticPaths = async () => {
  const pulses = await getCollection('pulse');
  const insights = await getCollection('insight');

  const pulsePaths = pulses.map((entry) => ({
    params: { type: 'pulse', slug: entry.slug },
    props: { entry } as { entry: EntryUnion },
  }));
  const insightPaths = insights.map((entry) => ({
    params: { type: 'insight', slug: entry.slug },
    props: { entry } as { entry: EntryUnion },
  }));

  return [...pulsePaths, ...insightPaths];
};

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: EntryUnion };
  const data = entry.data;

  const png = await generateOgPng({
    title: data.title,
    category: categoryToKorean(data.category).replace(/ /g, ''), // OG 카드는 평문
    publishedDate: formatKoreanDate(data.publishedAt),
    sourceCount: data.sources.length,
    chartData: data.chartData,
  });

  // Buffer → Blob: Astro tsconfig 의 lib.dom Response 시그니처가 Node Buffer 를 BodyInit 로
  // 받지 않아 Blob 으로 우회 (binary 그대로 보존, 추가 복사 1회 — 단일 OG 빌드 비용 무시 가능).
  const body = new Blob([new Uint8Array(png)]);

  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      // 24h 공개 캐시 — slug 변경 시 URL 자체가 달라지므로 cache-bust 자동
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
};
