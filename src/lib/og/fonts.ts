/**
 * OG 이미지 생성에 사용되는 폰트 버퍼 로더.
 *
 * Satori 0.x 는 woff/ttf/otf 만 받는다 (woff2 미지원 — Discussion #157).
 * @fontsource/noto-sans-kr 패키지가 woff/woff2 양쪽을 ship 하므로 woff 사용.
 *
 * 빌드 시 node_modules 에서 1회 read 후 모듈 스코프에 캐시 — Astro 의 39+
 * OG 라우트가 같은 버퍼를 공유한다.
 *
 * D7 결정 (P repo 직접 커밋) 은 Pretendard CDN fetch 가 차단되어 폐기되고
 * D6 정신(의존성 최소화)에 맞춰 fontsource 단일 패키지로 우회했다.
 * Noto Sans KR 은 한국 web typeface 의 사실상 표준이라 시각 일관성도 양호.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FONT_DIR = join(
  process.cwd(),
  'node_modules',
  '@fontsource',
  'noto-sans-kr',
  'files',
);

function load(file: string): Buffer {
  return readFileSync(join(FONT_DIR, file));
}

// 한 번 읽고 모듈 스코프에 보관 — 빌드 중 모든 OG 라우트가 공유.
const noto500 = load('noto-sans-kr-korean-500-normal.woff');
const noto700 = load('noto-sans-kr-korean-700-normal.woff');

export interface SatoriFont {
  name: string;
  data: Buffer;
  weight: 500 | 700;
  style: 'normal';
}

export const OG_FONTS: SatoriFont[] = [
  { name: 'Noto Sans KR', data: noto500, weight: 500, style: 'normal' },
  { name: 'Noto Sans KR', data: noto700, weight: 700, style: 'normal' },
];
