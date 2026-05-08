#!/usr/bin/env node
// dist/sitemap-index.xml 후처리 — @astrojs/sitemap 가 만든 sitemap-index 에
// news-sitemap.xml + image-sitemap.xml 을 추가한다.
//
// Why: @astrojs/sitemap 은 sitemap-0.xml 만 sitemap-index 에 등록한다.
// 06 §7.2 + 07 §5.1 — 베스트 프랙티스는 모든 sitemap 을 sitemap-index 에 포함.
// robots.txt 의 Sitemap: 라인만으로도 검색엔진은 인식하지만, 서치콘솔/서치어드바이저
// 의 sitemap-index 자동 발견 단일 진입점을 보강한다.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
const INDEX = resolve(DIST, 'sitemap-index.xml');
const SITE = 'https://smartdatashop.kr';
const EXTRA_SITEMAPS = ['news-sitemap.xml', 'image-sitemap.xml'];

if (!existsSync(INDEX)) {
  console.error('[finalize-sitemap-index] dist/sitemap-index.xml 이 없습니다. astro build 먼저.');
  process.exit(1);
}

const original = readFileSync(INDEX, 'utf8');

// 이미 추가돼 있으면 스킵
const alreadyHas = EXTRA_SITEMAPS.every((name) => original.includes(`${SITE}/${name}`));
if (alreadyHas) {
  console.log('[finalize-sitemap-index] 모든 추가 sitemap 이미 등록됨 — skip.');
  process.exit(0);
}

// 추가 sitemap 등록 — dist/{name} 이 실제로 존재할 때만
const additions = EXTRA_SITEMAPS.filter((name) => existsSync(resolve(DIST, name)))
  .map((name) => `<sitemap><loc>${SITE}/${name}</loc></sitemap>`)
  .join('');

if (!additions) {
  console.log('[finalize-sitemap-index] 추가 sitemap 파일이 dist 에 없음 — skip.');
  process.exit(0);
}

// </sitemapindex> 직전에 삽입
const updated = original.replace('</sitemapindex>', `${additions}</sitemapindex>`);
writeFileSync(INDEX, updated, 'utf8');
console.log(`[finalize-sitemap-index] 추가 ${EXTRA_SITEMAPS.length}건 등록 완료.`);
