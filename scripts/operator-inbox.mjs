#!/usr/bin/env node
/**
 * operator-inbox.mjs — 빌드 후 운영자 펜딩 액션 자동 집계
 *
 * 산출: 루트 OPERATOR_INBOX.md (gitignored)
 *
 * 점검 항목 (Solo Ops 에이전트 합의 #3):
 *   1. Cloudflare Pages 환경변수 6개 — .env / .env.local 에 있는지 (proxy 검증)
 *   2. placeholder noindex 글 카운트
 *   3. dist/ 빌드 산출 (페이지/OG 카드 수)
 *   4. 1차 출처 링크 헬스 (마지막 verify:links 결과 — 별도 실행 권장)
 *   5. 미작성 운영자 docs (PLANNING.md / DESIGN.md)
 *   6. 구 OG 라우트 마이그레이션 D-day (D9=N: 2026-06-06)
 *
 * 실행:
 *   node scripts/operator-inbox.mjs        # 빌드 후 자동 (postbuild hook 권장)
 *
 * 의도:
 *   운영자가 매일 6~7개 펜딩 액션을 머릿속/CLAUDE.md/docs/ 분산 추적하던 부담을
 *   루트 단일 마크다운 파일로 압축. 매 빌드마다 자동 갱신되므로 stale 신호 없음.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const ENV_VARS = [
  'PUBLIC_AUTHOR_SAMEAS',
  'PUBLIC_ORG_SAMEAS',
  'PUBLIC_NAVER_SITE_VERIFICATION',
  'PUBLIC_GOOGLE_SITE_VERIFICATION',
  'PUBLIC_CF_ANALYTICS_TOKEN',
  'PUBLIC_STIBEE_LIST_ID',
];
const REQUIRED_DOCS = [
  ['docs/PLANNING.md', '12개월 KPI / 자매 사이트 합류 일정'],
  ['docs/DESIGN.md', '디자인 토큰 / 활자 시스템 / 컴포넌트 카탈로그'],
];

function envStatus() {
  // Cloudflare Pages env 는 빌드 시 import.meta.env 로 주입.
  // 로컬 .env / .env.production 으로 fallback 검증 (없으면 미설정으로 표시).
  const env = { ...process.env };
  // .env 류 파일 한 번만 파싱 (간단 텍스트, 따옴표 변형은 무시)
  for (const f of ['.env', '.env.production', '.env.local']) {
    const p = join(ROOT, f);
    if (existsSync(p)) {
      const text = readFileSync(p, 'utf8');
      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  }
  return ENV_VARS.map((key) => ({
    key,
    set: !!env[key] && env[key].length > 0,
  }));
}

function placeholderArticles() {
  const collections = ['pulse', 'insight'];
  const flagged = [];
  for (const c of collections) {
    const dir = join(ROOT, 'src/content', c);
    let entries;
    try {
      entries = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
    } catch {
      continue;
    }
    for (const filename of entries) {
      const text = readFileSync(join(dir, filename), 'utf8');
      if (/\[\s*검수\s*후/.test(text)) flagged.push(`${c}/${filename}`);
    }
  }
  return flagged;
}

function distStats() {
  const distDir = join(ROOT, 'dist');
  if (!existsSync(distDir)) {
    return { exists: false, pages: 0, ogV2: 0 };
  }
  // 페이지 수 카운트 (index.html)
  let pages = 0;
  let ogV2 = 0;
  function walk(dir) {
    let items;
    try {
      items = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      const p = join(dir, item.name);
      if (item.isDirectory()) {
        walk(p);
      } else if (item.name === 'index.html') {
        pages++;
      } else if (item.name.endsWith('.png') && p.includes('og') && p.includes('v2')) {
        ogV2++;
      }
    }
  }
  walk(distDir);
  return { exists: true, pages, ogV2 };
}

function ogV1MigrationStatus() {
  // D9=N 합의: 2026-06-06 까지 구 라우트 (og/pulse, og/insight) 병행 후 삭제.
  const today = new Date();
  const dday = new Date('2026-06-06T00:00:00+09:00');
  const daysRemaining = Math.ceil((dday.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  const oldRoutesExist = existsSync(join(ROOT, 'src/pages/og/pulse'));
  return { dday: '2026-06-06', daysRemaining, oldRoutesExist };
}

function newsSitemapFreshness() {
  // dist/news-sitemap.xml 의 <news:publication_date> 값 추출 — 가장 최신 날짜 vs 빌드 시점.
  // Discover/News surface 가 48h 윈도우 사용 — 가장 최근 글이 48h 이내여야 신호 유지.
  const path = join(ROOT, 'dist', 'news-sitemap.xml');
  if (!existsSync(path)) {
    return { exists: false };
  }
  const xml = readFileSync(path, 'utf8');
  const dates = [...xml.matchAll(/<news:publication_date>([^<]+)<\/news:publication_date>/g)].map(
    (m) => new Date(m[1]).getTime(),
  );
  if (dates.length === 0) {
    return { exists: true, count: 0, mostRecentAgeHours: null };
  }
  const mostRecent = Math.max(...dates);
  const ageHours = Math.round((Date.now() - mostRecent) / (60 * 60 * 1000));
  return { exists: true, count: dates.length, mostRecentAgeHours: ageHours };
}

function missingDocs() {
  return REQUIRED_DOCS.filter(([path]) => !existsSync(join(ROOT, path)));
}

function render() {
  const envs = envStatus();
  const placeholders = placeholderArticles();
  const dist = distStats();
  const ogMigration = ogV1MigrationStatus();
  const missing = missingDocs();
  const news = newsSitemapFreshness();
  const ranAt = new Date().toISOString();
  const setCount = envs.filter((e) => e.set).length;

  const lines = [];
  lines.push('# OPERATOR_INBOX — 운영자 펜딩 액션 단일 진입점');
  lines.push('');
  lines.push(`> 자동 생성 — 매 빌드마다 갱신 · 마지막 실행: \`${ranAt}\``);
  lines.push('> 본 파일은 `.gitignore` 처리 — 커밋되지 않음, 로컬 운영자 시야용.');
  lines.push('');

  // 1. 환경변수
  lines.push('## ① Cloudflare Pages 환경변수 — ' + setCount + '/' + envs.length);
  lines.push('');
  lines.push('| 키 | 상태 |');
  lines.push('|---|---|');
  for (const e of envs) {
    lines.push(`| \`${e.key}\` | ${e.set ? '✅ 설정됨' : '⚠ 미설정'} |`);
  }
  lines.push('');
  lines.push('미설정 키는 Cloudflare Pages → Settings → Environment variables 에서 추가. `docs/operations.md` 환경변수 섹션 참조.');
  lines.push('');

  // 2. placeholder 글
  lines.push(`## ② placeholder 글 (자동 noindex 처리됨) — ${placeholders.length}건`);
  lines.push('');
  if (placeholders.length === 0) {
    lines.push('**모든 글이 정리됨** — Discover 색인 가능 상태 ✅');
  } else {
    for (const p of placeholders) {
      lines.push(`- \`src/content/${p}\``);
    }
    lines.push('');
    lines.push('정리 방법: 본문의 `[검수 후 입력]` 토큰을 1차 출처 기반 explanatory framing 으로 재작성. 토큰이 사라지면 자동으로 색인 복귀.');
  }
  lines.push('');

  // 3. 빌드 산출
  lines.push('## ③ 빌드 산출 (`dist/`)');
  lines.push('');
  if (!dist.exists) {
    lines.push('⚠ `dist/` 디렉토리 없음 — `npm run build` 먼저 실행.');
  } else {
    lines.push(`- 정적 페이지: **${dist.pages}**`);
    lines.push(`- 동적 OG v2 카드: **${dist.ogV2}**`);
  }
  lines.push('');

  // 3.5 news-sitemap freshness (Discover 48h 윈도우)
  lines.push('## ③.5 news-sitemap.xml freshness (Discover 48h 윈도우)');
  lines.push('');
  if (!news.exists) {
    lines.push('⚠ news-sitemap 미생성 — `npm run build` 필요.');
  } else if (news.count === 0) {
    lines.push('⚠ news-sitemap 항목 0건 — 48h 이내 발행 글 없음. Discover News surface 신호 손실.');
    lines.push('');
    lines.push('해결: 48h 이내 발행 글이 있어야 함. 또는 scout/editor/writer 가동으로 자동 충전.');
  } else {
    const ageMark =
      news.mostRecentAgeHours !== null && news.mostRecentAgeHours <= 48
        ? '✅'
        : '⚠';
    lines.push(`- 항목 수: **${news.count}편**`);
    lines.push(`- 가장 최근 글 연식: **${news.mostRecentAgeHours}h** ${ageMark} (48h 윈도우)`);
    if (news.mostRecentAgeHours !== null && news.mostRecentAgeHours > 48) {
      lines.push('');
      lines.push('⚠ 48h 초과 — 모든 항목이 Discover News surface 윈도우 밖. 새 글 발행 필요.');
    }
  }
  lines.push('');

  // 4. OG 마이그레이션
  lines.push('## ④ OG v1 → v2 마이그레이션 (D9=N 합의)');
  lines.push('');
  lines.push(`- D-day: **${ogMigration.dday}** (${ogMigration.daysRemaining > 0 ? `D-${ogMigration.daysRemaining}` : `D+${Math.abs(ogMigration.daysRemaining)}`})`);
  lines.push(`- 구 라우트 (\`src/pages/og/pulse\`, \`src/pages/og/insight\`) 잔존: ${ogMigration.oldRoutesExist ? '⚠ 예' : '✅ 삭제됨'}`);
  if (ogMigration.daysRemaining <= 0 && ogMigration.oldRoutesExist) {
    lines.push('');
    lines.push('🚨 **D-day 도과 + 구 라우트 잔존** — 즉시 삭제 권장.');
  }
  lines.push('');

  // 5. 미작성 docs
  lines.push(`## ⑤ 미작성 운영자 docs — ${missing.length}건`);
  lines.push('');
  if (missing.length === 0) {
    lines.push('모든 운영자 doc 작성 완료 ✅');
  } else {
    for (const [path, desc] of missing) {
      lines.push(`- \`${path}\` — ${desc}`);
    }
  }
  lines.push('');

  // 6. 외부 콘솔 액션
  lines.push('## ⑥ 외부 콘솔 액션 (수동, 자동화 불가)');
  lines.push('');
  lines.push('- [ ] Google Search Console — placeholder URL 7개 제거 요청');
  lines.push('- [ ] Bing Webmaster Tools — 동일');
  lines.push('- [ ] (선택) `.claude/settings.json` allowlist 수기 편집 — `docs/operations.md` 참조');
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('관련 자동 검증:');
  lines.push('- `npm run verify` — 1차 출처 링크 헬스 + 수치 페어링 감사');
  lines.push('- `npm run build` — 본 파일 자동 갱신 (postbuild)');
  lines.push('- 매주 수동: GSC Discover 보고서 + Bing Search Insights');
  lines.push('');

  return lines.join('\n');
}

writeFileSync(join(ROOT, 'OPERATOR_INBOX.md'), render() + '\n', 'utf8');
console.log(`[operator-inbox] OPERATOR_INBOX.md 갱신 완료`);
process.exit(0);
