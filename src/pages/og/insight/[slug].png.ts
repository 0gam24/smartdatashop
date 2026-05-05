/**
 * 동적 OG 이미지 — 인사이트(/insight/slug/) 기사용 1200×630 PNG.
 *
 * 펄스 OG와 동일한 디자인 톤. 카테고리 라벨 옆에 "인사이트" prefix를 추가해
 * 카드 단위에서 펄스/인사이트가 식별되도록 한다.
 */
import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import sharp from 'sharp';
import { categoryToKorean, formatKoreanDate } from '../../../lib/korean';

export async function getStaticPaths() {
  const entries = await getCollection('insight');
  return entries.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

interface Props {
  entry: CollectionEntry<'insight'>;
}

function wrapTitle(title: string, maxCharsPerLine = 18, maxLines = 4): string[] {
  const lines: string[] = [];
  let current = '';
  const tokens = title.split(/(\s+)/);
  for (const token of tokens) {
    if (token.length === 0) continue;
    if (/^\s+$/.test(token)) {
      if (current.length > 0 && current.length < maxCharsPerLine) current += ' ';
      continue;
    }
    if ((current + token).length <= maxCharsPerLine) {
      current += token;
    } else if (token.length > maxCharsPerLine) {
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
  // 인사이트 식별: 카테고리 라벨 앞에 "인사이트 ·" prefix.
  const category = `인사이트 · ${categoryToKorean(entry.data.category)}`;
  const date = formatKoreanDate(entry.data.publishedAt);

  const lines = wrapTitle(title);
  const lineHeight = 80;
  const titleStartY = 200 + 64;

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
