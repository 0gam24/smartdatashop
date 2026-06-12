#!/usr/bin/env node
/**
 * sitemap·RSS 즉시 동기화 게이트 (postbuild)
 *
 * 콘텐츠 (펄스·인사이트) 가 1건이라도 추가/삭제/이름변경되면 sitemap·RSS 가
 * 자동으로 재생성된다 (Astro Content Collections SSOT). 본 스크립트는 그 동기화가
 * 빌드 시점에 실제로 일어났는지 검증하는 fail-loud 게이트다.
 *
 * 검증 규칙:
 *   1. dist/sitemap-0.xml 의 펄스 URL 수 == src/content/pulse/*.mdx 수
 *   2. dist/sitemap-0.xml 의 인사이트 URL 수 == src/content/insight/*.mdx 수
 *   3. dist/feed.xml 의 모든 펄스 URL ⊆ sitemap-0.xml 펄스 URL (RSS 가 sitemap 보다
 *      더 적은 건 OK — 50건 한도. 그러나 sitemap 에 없는 URL 이 RSS 에 있으면 FAIL.)
 *   4. dist/feed.xml 의 모든 인사이트 URL ⊆ sitemap-0.xml 인사이트 URL
 *   5. dist/sitemap-index.xml 가 sitemap-0 + news-sitemap + image-sitemap 모두 포함
 *
 * 1건이라도 어긋나면 비-0 종료 → CF Pages 빌드 실패 → 운영 배포 안 됨.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://smartdatashop.kr';
const DIST = resolve(ROOT, 'dist');

const errors = [];

function fail(msg) {
  errors.push(msg);
  console.error(`[verify-sync] ✗ ${msg}`);
}

function pass(msg) {
  console.log(`[verify-sync] ✓ ${msg}`);
}

// ── 1. 콘텐츠 컬렉션 파일 카운트 ────────────────────────────────
const pulseDir = resolve(ROOT, 'src/content/pulse');
const insightDir = resolve(ROOT, 'src/content/insight');

const pulseFiles = existsSync(pulseDir)
  ? readdirSync(pulseDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
  : [];
const insightFiles = existsSync(insightDir)
  ? readdirSync(insightDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
  : [];

console.log(`[verify-sync] 콘텐츠: 펄스 ${pulseFiles.length} / 인사이트 ${insightFiles.length}`);

// ── 2. dist/sitemap-0.xml 파싱 ─────────────────────────────────
const sitemapPath = resolve(DIST, 'sitemap-0.xml');
if (!existsSync(sitemapPath)) {
  fail('dist/sitemap-0.xml 미생성 — astro build 가 실패했거나 @astrojs/sitemap 통합 문제');
} else {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  // 펄스 URL 2형식 (2026-06-12 URL 정책 개정):
  //   구형 /YYYY/MM/DD/slug/ (2026-06-13 이전 발행, 색인 보존) +
  //   신형 /카테고리/slug/ (이후 발행). 카테고리 5종 enum 은 config.ts 와 동기.
  const pulseDateUrlRe = /<loc>https:\/\/smartdatashop\.kr\/\d{4}\/\d{2}\/\d{2}\/[^<]+<\/loc>/g;
  const pulseCategoryUrlRe =
    /<loc>https:\/\/smartdatashop\.kr\/(?:policy|tax-finance|market|stats|ai-tech)\/[^<\/]+\/<\/loc>/g;
  const insightUrlRe = /<loc>https:\/\/smartdatashop\.kr\/insight\/[^<\/]+\/<\/loc>/g;

  const pulseInSitemap = [
    ...(sitemap.match(pulseDateUrlRe) ?? []),
    ...(sitemap.match(pulseCategoryUrlRe) ?? []),
  ];
  const insightInSitemap = (sitemap.match(insightUrlRe) ?? []).filter(
    // /insight/index 격인 /insight/ 자체는 제외 (콜렉션 페이지)
    (s) => !/<loc>https:\/\/smartdatashop\.kr\/insight\/<\/loc>/.test(s),
  );

  if (pulseInSitemap.length !== pulseFiles.length) {
    fail(
      `sitemap 펄스 URL 수 불일치: sitemap=${pulseInSitemap.length} / 콘텐츠=${pulseFiles.length}`,
    );
  } else {
    pass(`sitemap 펄스 ${pulseInSitemap.length}건 일치`);
  }

  if (insightInSitemap.length !== insightFiles.length) {
    fail(
      `sitemap 인사이트 URL 수 불일치: sitemap=${insightInSitemap.length} / 콘텐츠=${insightFiles.length}`,
    );
  } else {
    pass(`sitemap 인사이트 ${insightInSitemap.length}건 일치`);
  }

  // ── 3. RSS feed.xml ⊆ sitemap 검증 ───────────────────────────
  const feedPath = resolve(DIST, 'feed.xml');
  if (!existsSync(feedPath)) {
    fail('dist/feed.xml 미생성 — feed.xml.ts endpoint 가 실패');
  } else {
    const feed = readFileSync(feedPath, 'utf8');
    const linkRe = /<link>(https:\/\/smartdatashop\.kr\/[^<]+)<\/link>/g;
    const feedLinks = [...feed.matchAll(linkRe)].map((m) => m[1]);

    // channel root link 제외
    const itemLinks = feedLinks.filter((u) => u !== `${SITE}/`);

    const sitemapUrlSet = new Set([
      ...pulseInSitemap.map((s) => s.replace(/^<loc>|<\/loc>$/g, '')),
      ...insightInSitemap.map((s) => s.replace(/^<loc>|<\/loc>$/g, '')),
    ]);

    const orphanInFeed = itemLinks.filter((u) => !sitemapUrlSet.has(u));
    if (orphanInFeed.length > 0) {
      fail(
        `RSS 에 sitemap 미등록 URL ${orphanInFeed.length}건:\n  ${orphanInFeed.join('\n  ')}`,
      );
    } else {
      pass(`RSS ${itemLinks.length}건 모두 sitemap 에 존재 (RSS ⊆ sitemap)`);
    }
  }
}

// ── 4. sitemap-index 가 모든 sitemap 포함 ──────────────────────
const indexPath = resolve(DIST, 'sitemap-index.xml');
if (!existsSync(indexPath)) {
  fail('dist/sitemap-index.xml 미생성');
} else {
  const idx = readFileSync(indexPath, 'utf8');
  const required = ['sitemap-0.xml', 'news-sitemap.xml', 'image-sitemap.xml'];
  const missing = required.filter((name) => !idx.includes(`${SITE}/${name}`));
  if (missing.length > 0) {
    fail(`sitemap-index 미등록 sitemap: ${missing.join(', ')} — finalize-sitemap-index.mjs 확인`);
  } else {
    pass('sitemap-index 가 sitemap-0 + news-sitemap + image-sitemap 모두 포함');
  }
}

// ── 결과 ───────────────────────────────────────────────────────
if (errors.length > 0) {
  console.error(`\n[verify-sync] ✗ FAIL — ${errors.length}건 동기화 갭 발견. 빌드 차단.`);
  process.exit(1);
}
console.log('\n[verify-sync] ✓ PASS — sitemap·RSS 콘텐츠와 완전 동기화.');
