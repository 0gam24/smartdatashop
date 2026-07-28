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
import { execSync } from 'node:child_process';
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
 * 변경된 콘텐츠 파일 추출 → 사이트 절대 URL 로 변환.
 *
 * 1차 소스: `git diff --name-only HEAD^ HEAD` — PR 머지 커밋의 첫 부모(직전
 * main)와의 diff 가 곧 그 PR 이 발행한 파일 전체다. push 이벤트 payload 의
 * commits[].added 는 머지 커밋에서 비어 오는 경우가 많아(2026-07-28 실측:
 * 모든 머지에서 기사 URL 0건 → 홈+뉴스사이트맵 2 URL 만 ping) 보조로 강등.
 * 워크플로 checkout 은 fetch-depth: 2 로 HEAD^ 를 보장한다.
 */
function affectedUrls() {
  const changedFiles = new Set();

  // 1차: 머지 커밋 diff (로컬 git). shallow 미달 등 실패 시 조용히 폴백.
  try {
    // HEAD~1 = 첫 부모 (머지 커밋이면 직전 main). HEAD^ 표기는 Windows cmd 의
    // 이스케이프 문자와 충돌해 로컬 실행이 조용히 실패하므로 ~1 표기 고정.
    const out = execSync('git diff --name-only HEAD~1 HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    for (const f of out.split('\n').map((s) => s.trim()).filter(Boolean)) {
      changedFiles.add(f);
    }
  } catch {
    /* fall through to event payload */
  }

  // 2차: push 이벤트 payload (직접 push 등 머지 커밋이 아닌 경우 보완).
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath) {
    try {
      const event = JSON.parse(readFileSync(eventPath, 'utf8'));
      for (const c of event.commits ?? []) {
        for (const f of [...(c.added ?? []), ...(c.modified ?? [])]) {
          changedFiles.add(f);
        }
      }
    } catch {
      /* ignore */
    }
  }
  if (changedFiles.size === 0 && !eventPath) return [];
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
        // 감지된 URL 은 stub 여부와 무관하게 기록 — 추출 로직 회귀를 로그로 잡는다
        urlsDetected: urls,
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
