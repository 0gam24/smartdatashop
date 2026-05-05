/**
 * 동적 OG 이미지 — 펄스(/YYYY/MM/DD/slug/) 기사용 1200×630 PNG.
 *
 * 카드 구성 (DESIGN.md 톤 일관):
 *   1. 배경:  #faf7f0 (paper)
 *   2. 상단 0.5px hairline + 좌측 와인 액센트 점
 *   3. 카테고리 라벨(한글, JetBrains Mono caps) — 좌
 *   4. 발행일(YYYY년 M월 D일 X) — 우, mono
 *   5. 제목(Noto Serif KR fallback → serif) — 64px, 본문 폭 wrap
 *   6. 하단 hairline + 푸터 caption "1차 출처 데이터 저널 · smartdatashop.kr"
 *
 * 렌더링 파이프라인: SVG 문자열 → sharp(librsvg) → PNG 1200×630.
 * 폰트는 빌드 환경(Ubuntu CI)에 의존하므로 generic family fallback을 명시한다.
 *
 * 참고: <foreignObject> + HTML 은 librsvg 호환성이 일정치 않아
 * 순수 <text>+<tspan> 으로 수동 줄바꿈한다.
 */
import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import sharp from 'sharp';
import { categoryToKorean, formatKoreanDate } from '../../../lib/korean';

export async function getStaticPaths() {
  const entries = await getCollection('pulse');
  return entries.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

interface Props {
  entry: CollectionEntry<'pulse'>;
}

/**
 * 한글 1글자 ≈ 64px(emSize) → 영문 폭 1글자 ≈ 32px.
 * 1080px 본문 폭에 맞추려면 한글은 약 16자 / 영문 혼합은 더 들어간다.
 * 너무 정밀하지 않게 — 너무 길면 줄넘김으로 처리.
 */
function wrapTitle(title: string, maxCharsPerLine = 18, maxLines = 4): string[] {
  const lines: string[] = [];
  let current = '';
  // 공백 기준 단어 단위 우선 시도, 단어가 길면 글자 단위로 자른다.
  const tokens = title.split(/(\s+)/); // 공백 토큰 보존
  for (const token of tokens) {
    if (token.length === 0) continue;
    if (/^\s+$/.test(token)) {
      if (current.length > 0 && current.length < maxCharsPerLine) current += ' ';
      continue;
    }
    if ((current + token).length <= maxCharsPerLine) {
      current += token;
    } else if (token.length > maxCharsPerLine) {
      // 긴 토큰은 글자 단위로 분할
      let rest = token;
      if (current.length > 0) {
        lines.push(current);
        current = '';
      }
      while (rest.length > maxCharsPerLine) {
        lines.push(rest.slice(0, maxCharsPerLine));
        rest = rest.slice(maxCharsPerLine);
      }
      current = rest;
    } else {
      if (current.length > 0) lines.push(current);
      current = token;
    }
    if (lines.length >= maxLines) break;
  }
  if (current.length > 0 && lines.length < maxLines) lines.push(current);
  // 초과 분량은 줄임표
  if (lines.length === maxLines && (current === '' || current.length === maxCharsPerLine)) {
    const last = lines[lines.length - 1] ?? '';
    lines[lines.length - 1] = (last.length > maxCharsPerLine - 1
      ? last.slice(0, maxCharsPerLine - 1)
      : last) + '…';
  }
  return lines;
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as Props;
  const title = entry.data.title;
  // letter-spacing 0.15em 효과는 SVG에 letter-spacing 속성으로 반영되지만,
  // 카테고리는 시안에서도 글자 사이 공백으로 처리되어 있으므로 그대로 사용.
  const category = categoryToKorean(entry.data.category);
  const date = formatKoreanDate(entry.data.publishedAt);

  const lines = wrapTitle(title);
  const lineHeight = 80; // 64px font * 1.25
  // 제목 블록을 세로 중앙 근처(y=200~)에 배치
  const titleStartY = 200 + 64; // baseline of first line

  const tspans = lines
    .map((line, i) => {
      const dy = i === 0 ? 0 : lineHeight;
      return `<tspan x="60" dy="${dy}">${xmlEscape(line)}</tspan>`;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#faf7f0"/>
  <line x1="60" y1="80" x2="1140" y2="80" stroke="#e0ddd0" stroke-width="0.5"/>
  <circle cx="48" cy="56" r="4" fill="#8b1538"/>
  <text x="60" y="60" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="14" fill="#8b1538" letter-spacing="2.1">${xmlEscape(category)}</text>
  <text x="1140" y="60" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="13" fill="#6b6b6b" text-anchor="end">${xmlEscape(date)}</text>
  <text font-family="'Noto Serif KR', 'Source Han Serif K', 'Nanum Myeongjo', serif" font-size="64" fill="#1a1a1a" font-weight="500" letter-spacing="-1.28" y="${titleStartY}">${tspans}</text>
  <line x1="60" y1="540" x2="1140" y2="540" stroke="#e0ddd0" stroke-width="0.5"/>
  <text x="60" y="580" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="13" fill="#a5a5a5" letter-spacing="0.65">1차 출처 데이터 저널 · smartdatashop.kr</text>
  <circle cx="1130" cy="572" r="4" fill="#8b1538"/>
</svg>`;

  const png = await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .png({ compressionLevel: 9 })
    .toBuffer();

  return new Response(new Uint8Array(png), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
