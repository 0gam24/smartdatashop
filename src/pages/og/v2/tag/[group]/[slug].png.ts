/**
 * 태그 OG 카드 — /og/v2/tag/{group}/{slug}.png
 *
 * 14 태그 (페르소나 5 · 데이터 유형 5 · 액션 4) 각각 고유 1200×630 카드 (G17 마지막 조각).
 *
 * 한글 슬러그(예: '사회초년생')는 정적 빌드 시 한글 파일명으로 생성되고
 * 브라우저는 wire 상에서 percent-encode 해 패치한다. 사이트의 다른 태그
 * 라우트와 동일한 처리.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import {
  GROUP_LABEL,
  GROUP_VALUES,
  type TagGroup,
} from '../../../../../lib/tags';
import { generateSectionOgPng } from '../../../../../lib/og/generate';

const SUBHEAD: Record<TagGroup, string> = {
  persona: '이 페르소나에 직접 영향을 주는 정책·세금·금융 발표 모음.',
  'data-type': '동일 유형의 1차 출처 데이터 발표 모음 — 갱신 주기에 맞춰 추적.',
  action: '독자가 이번 주에 행동할 수 있는 항목 중심 모음.',
};

export const getStaticPaths: GetStaticPaths = async () => {
  const groups: TagGroup[] = ['persona', 'data-type', 'action'];
  return groups.flatMap((group) =>
    GROUP_VALUES[group].map((value) => ({
      params: { group, slug: value },
      props: { group, value },
    })),
  );
};

export const GET: APIRoute = async ({ props }) => {
  const { group, value } = props as { group: TagGroup; value: string };

  const png = await generateSectionOgPng({
    eyebrow: GROUP_LABEL[group].toUpperCase().split('').join(' '),
    headline: value,
    subhead: SUBHEAD[group],
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
