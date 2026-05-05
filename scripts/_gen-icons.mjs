// One-off icon generator. Run via `node scripts/_gen-icons.mjs`.
// Produces PWA + apple-touch icons from an inline SVG using the same
// design tokens as public/favicon.svg.
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, '..', 'public');

// Larger SVG source — designed to render crisply at 192/512 px. The mark
// is centred and sized so it stays legible when iOS/Android masks/rounds it.
function makeSvg({ size, padded = false }) {
  const r = padded ? Math.round(size * 0.18) : Math.round(size * 0.16);
  const dotCx = size * 0.28;
  const dotCy = size * 0.5;
  const dotR = size * 0.075;
  const textX = size * 0.40;
  const textY = size * 0.62;
  const fontSize = Math.round(size * 0.36);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#faf7f0"/>
  <circle cx="${dotCx}" cy="${dotCy}" r="${dotR}" fill="#8b1538"/>
  <text
    x="${textX}"
    y="${textY}"
    font-family="'Noto Serif KR','Noto Serif','Times New Roman',serif"
    font-size="${fontSize}"
    font-weight="600"
    fill="#1a1a1a"
    letter-spacing="-1"
  >SDS</text>
</svg>`;
}

async function render(size, name, opts = {}) {
  const svg = Buffer.from(makeSvg({ size, ...opts }));
  const out = await sharp(svg, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(resolve(publicDir, name), out);
  console.log(`wrote ${name} (${size}x${size}, ${out.length} bytes)`);
}

await render(192, 'icon-192.png');
await render(512, 'icon-512.png');
// Apple touch icon — 180px is the modern iOS standard. Slightly tighter
// corners since iOS rounds the icon itself.
await render(180, 'apple-touch-icon.png', { padded: true });
