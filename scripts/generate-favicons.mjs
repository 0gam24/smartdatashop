#!/usr/bin/env node
/**
 * generate-favicons.mjs — SVG 1개 → PNG 4 variants (apple-touch / 192 / 512 / favicon-32)
 *
 * 입력: public/favicon.svg
 * 출력:
 *   - public/apple-touch-icon.png  (180×180 — iOS Home Screen)
 *   - public/icon-192.png          (192×192 — PWA manifest)
 *   - public/icon-512.png          (512×512 — PWA splash + 큰 카드)
 *   - public/favicon-32.png        (32×32 — 일부 브라우저 PNG fallback)
 *
 * 사용:
 *   node scripts/generate-favicons.mjs
 *
 * 의존성: @resvg/resvg-js (이미 dependency 등록됨 — Satori OG 생성용 공유)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const ROOT = process.cwd();
const SVG_PATH = resolve(ROOT, 'public/favicon.svg');
const svg = readFileSync(SVG_PATH, 'utf8');

const TARGETS = [
  { size: 180, out: 'public/apple-touch-icon.png' },
  { size: 192, out: 'public/icon-192.png' },
  { size: 512, out: 'public/icon-512.png' },
  { size: 32, out: 'public/favicon-32.png' },
];

for (const { size, out } of TARGETS) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  });
  const pngBuffer = resvg.render().asPng();
  const outPath = resolve(ROOT, out);
  writeFileSync(outPath, pngBuffer);
  console.log(`[favicon] ${out} ${size}×${size} (${pngBuffer.byteLength} bytes)`);
}

console.log('\n[favicon] 모든 variant 재생성 완료.');
