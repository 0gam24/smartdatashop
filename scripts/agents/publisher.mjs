/**
 * scripts/agents/publisher.mjs — 에이전트 #4 Publisher
 *
 * 역할: main 에 머지된 새 콘텐츠를 외부 채널에 발행한다.
 *   - IndexNow (Bing/Yandex 즉시 색인 + Google hint) — 무료, 키 불필요
 *   - Google Indexing API 핑 (M1+, GOOGLE_INDEXING_KEY 필요)
 *   - 네이버 서치어드바이저 색인 요청 (M1+, NAVER_SA_KEY 필요)
 *   - Stibee 뉴스레터 발송 트리거 (M1+, STIBEE_API_KEY 필요)
 *
 * 활성 단계 (Phase 12, ADR 0005):
 *   - IndexNow: 디폴트 OFF (PUBLISHER_LIVE_INDEXNOW=true 시 활성).
 *     키는 self-published (`/13dec8276bdcd28efefae0bcf9f67879.txt`),
 *     비용 0, 외부 인증 0. 운영자가 환경변수 1줄 변경으로 활성.
 *   - Google/Naver/Stibee: 모두 stub. 각 키 + STUB 모드 해제 후 동작.
 *
 * I/O 계약:
 *   입력:
 *     - 환경변수: PUBLIC_SITE_URL (선택), GOOGLE_INDEXING_KEY, NAVER_SA_KEY,
 *       STIBEE_API_KEY, PUBLISHER_LIVE_INDEXNOW
 *     - GITHUB_EVENT_PATH 의 push 이벤트 페이로드 (변경 파일 목록)
 *   출력:
 *     - tmp/publisher-heartbeat.json
 *
 * 종료 코드:
 *   0 정상. 외부 API 실패는 경고 로그만 남기고 0 으로 종료 (재시도는 Layer 4 fact-checker
 *   다음 사이클 또는 운영자 수동 재실행 — fail-open 원칙).
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pingIndexNow } from './shared/indexnow.mjs';

const repoRoot = resolve(process.cwd());
const ranAt = new Date().toISOString();
const outPath = resolve(repoRoot, 'tmp', 'publisher-heartbeat.json');

const SITE = process.env.PUBLIC_SITE_URL || 'https://smartdatashop.kr';
const haveGoogle = Boolean(process.env.GOOGLE_INDEXING_KEY);
const haveNaver = Boolean(process.env.NAVER_SA_KEY);
const haveStibee = Boolean(process.env.STIBEE_API_KEY);
const liveIndexNow = process.env.PUBLISHER_LIVE_INDEXNOW === 'true';

console.log(
  `[publisher] ${ranAt} — IndexNow:${liveIndexNow ? 'LIVE' : 'stub'} · google:${haveGoogle} naver:${haveNaver} stibee:${haveStibee}`,
);

/**
 * GitHub push 이벤트 페이로드에서 src/content/(pulse|insight)/ 변경 파일 추출 →
 * 사이트 절대 URL 로 변환. push 이벤트가 아니거나 파일 정보 없으면 빈 배열.
 */
function affectedUrls() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) return [];
  let event;
  try {
    event = JSON.parse(readFileSync(eventPath, 'utf8'));
  } catch {
    return [];
  }
  const commits = event.commits ?? [];
  const changedFiles = new Set();
  for (const c of commits) {
    for (const f of [...(c.added ?? []), ...(c.modified ?? [])]) {
      changedFiles.add(f);
    }
  }
  // URL 정책 (2026-06-12 개정, src/lib/korean.ts pulseUrl 과 동일 규칙):
  //   2026-06-13 이후 발행 pulse → /<category>/<slug>/ (frontmatter category 를 파일에서 읽음)
  //   그 이전 발행 pulse → /YYYY/MM/DD/<날짜포함slug>/ (색인 보존)
  //   insight → /insight/<파일명slug>/
  // IndexNow 핑은 사이트 인덱스 페이지 + 구체 URL 두 후보 모두 보내 색인 보장.
  const CATEGORY_URL_CUTOFF = '2026-06-13';
  const urls = new Set([SITE, `${SITE}/news-sitemap.xml`]);
  for (const f of changedFiles) {
    const m = f.match(
      /^src\/content\/(pulse|insight)\/(\d{4}-\d{2}-\d{2})-(.+)\.mdx$/,
    );
    if (!m) continue;
    const [, kind, date, slug] = m;
    if (kind === 'insight') {
      // 6/13 이후 발행 인사이트는 URL 슬러그에서 날짜 접두사 제거
      urls.add(date >= CATEGORY_URL_CUTOFF
        ? `${SITE}/insight/${slug}/`
        : `${SITE}/insight/${date}-${slug}/`);
    } else if (date >= CATEGORY_URL_CUTOFF) {
      // 신형 URL — 워크플로 checkout 에서 frontmatter category 추출 (실패 시 date URL 폴백)
      let category = null;
      try {
        const text = readFileSync(f, 'utf8');
        category = text.match(/^category:\s*([^\s\n]+)/m)?.[1] ?? null;
      } catch {}
      if (category) {
        urls.add(`${SITE}/${category}/${slug}/`);
      } else {
        const [yyyy, mm, dd] = date.split('-');
        urls.add(`${SITE}/${yyyy}/${mm}/${dd}/${date}-${slug}/`);
      }
    } else {
      const [yyyy, mm, dd] = date.split('-');
      urls.add(`${SITE}/${yyyy}/${mm}/${dd}/${date}-${slug}/`);
    }
  }
  return [...urls];
}

const urls = affectedUrls();
const indexNowResult = liveIndexNow && urls.length > 0
  ? await pingIndexNow(urls)
  : { ok: false, status: 0, error: 'stub-mode' };

if (liveIndexNow && urls.length > 0) {
  console.log(
    `[publisher] IndexNow ${urls.length} URLs → ${indexNowResult.ok ? '✓' : '✗'} status=${indexNowResult.status}${indexNowResult.error ? ' err=' + indexNowResult.error : ''}`,
  );
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  JSON.stringify(
    {
      agent: 'publisher',
      ranAt,
      status: 'ok',
      indexnow: {
        live: liveIndexNow,
        urlsPinged: liveIndexNow ? urls : [],
        result: indexNowResult,
      },
      stubs: {
        google: { secretPresent: haveGoogle, called: false },
        naver: { secretPresent: haveNaver, called: false },
        stibee: { secretPresent: haveStibee, called: false },
      },
      note: 'IndexNow 는 PUBLISHER_LIVE_INDEXNOW=true 시 활성. 나머지는 M1+ 본격 구현.',
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

process.exit(0);
