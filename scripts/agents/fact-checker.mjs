/**
 * scripts/agents/fact-checker.mjs — 에이전트 #6 Fact-Checker (Layer 4 stub, ADR 0005)
 *
 * 역할: 발행 후 14일 이내 글의 본문 수치 주장과 1차 출처 URL 본문을 fuzzy match 해
 *       불일치 항목을 정정 PR 또는 fact-check-queue/ 에 기록한다.
 *       Layer 3 (`extract-numerical-claims.mjs`) 은 빌드 시점 _구조적_ 페어링 (수치 옆
 *       footnote 마커) 만 검증하고, Layer 4 는 _내용 일치_ 까지 검증 — 게이트 폐기 후의
 *       마지막 안전망.
 *
 * I/O 계약 (M1+ 본격 구현 시):
 *   입력:
 *     - 환경변수 ANTHROPIC_API_KEY (필수, 미설정 시 stub 모드만)
 *     - src/content/pulse/*.mdx + src/content/insight/*.mdx (publishedAt 필터)
 *   출력:
 *     - fact-check-queue/YYYY-MM-DD.json { agent, ranAt, audited[], discrepancies[] }
 *     - 불일치 발견 시 GitHub PR 자동 오픈 (라벨: `fact-check-correction`, 본문: 진단)
 *     - 운영자 이메일 다이제스트 (선택, RESEND_API_KEY)
 *   종료 코드:
 *     - 0 정상 (불일치 없음 또는 stub 모드)
 *     - 1 운영자 알림 필요 (불일치 N건 발견)
 *     - 2 스크립트 자체 오류
 *
 * 본 스텁:
 *   - 어떤 네트워크 호출도 하지 않음
 *   - 14일 윈도우 글 카운트만 산출 후 heartbeat 기록
 *   - shared/claude-client.mjs 의 `callClaude()` 가 의도적으로 throw 하므로 활성 시 즉시 검출
 *
 * 활성화 절차 (M1+):
 *   1. `npm install @anthropic-ai/sdk` (운영자 명시 승인 필요 — CLAUDE.md 룰)
 *   2. `scripts/agents/shared/claude-client.mjs` 의 throw 가드 제거 후 SDK 통합
 *   3. 본 파일의 `STUB_MODE = true` 를 `false` 로 변경
 *   4. fuzzy match 로직 본격 구현 (TODO 마커 참조)
 *   5. Cloudflare Pages env 에 ANTHROPIC_API_KEY 등록
 */

import { mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const STUB_MODE = true; // M1+ 활성 시 false 로 변경
const WINDOW_DAYS = 14;

const repoRoot = resolve(process.cwd());
const contentRoot = resolve(repoRoot, 'src/content');
const outDir = resolve(repoRoot, 'fact-check-queue');
const ranAt = new Date().toISOString();
const ranAtKstDate = new Date(Date.now() + 9 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

console.log(
  `[fact-checker] ${ranAt} Layer 4 사후 감사 ${STUB_MODE ? '(stub — Claude 호출 없음)' : '(M1+ 활성)'}`,
);

/** frontmatter 의 publishedAt 추출 (단순 텍스트 매칭). */
function extractPublishedAt(text) {
  const m = text.match(/^publishedAt:\s*["']?([^"'\n]+)["']?\s*$/m);
  return m ? m[1].trim() : null;
}

/** N일 윈도우 내 글 목록 산출 */
function recentArticles() {
  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const collections = ['pulse', 'insight'];
  const audited = [];

  for (const collection of collections) {
    let entries;
    try {
      entries = readdirSync(join(contentRoot, collection)).filter((f) =>
        f.endsWith('.mdx'),
      );
    } catch {
      continue;
    }
    for (const filename of entries) {
      const filepath = join(contentRoot, collection, filename);
      const text = readFileSync(filepath, 'utf8');
      const publishedAt = extractPublishedAt(text);
      if (!publishedAt) continue;
      if (new Date(publishedAt).getTime() < cutoff) continue;
      audited.push({
        collection,
        filename,
        publishedAt,
        // M1+ TODO: extract numerical claims (Layer 3 regex 재사용 가능)
        // M1+ TODO: extract sources[].url
        // M1+ TODO: for each (claim, source), call Claude with system prompt:
        //   "Given this Korean source excerpt and this claim, is the claim
        //    supported by the excerpt? Reply: yes / no / partial / cannot-verify"
        // M1+ TODO: aggregate discrepancies, open correction PR via gh CLI
      });
    }
  }
  return audited;
}

const audited = recentArticles();

mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `${ranAtKstDate}.json`);
writeFileSync(
  outPath,
  JSON.stringify(
    {
      agent: 'fact-checker',
      ranAt,
      windowDays: WINDOW_DAYS,
      stubMode: STUB_MODE,
      auditedCount: audited.length,
      audited: audited.map((a) => `${a.collection}/${a.filename}`),
      discrepancies: [],
      note: STUB_MODE
        ? 'M1+ 활성 시: Claude API 로 출처 URL 본문 fetch + claim fuzzy match → 정정 PR 자동 오픈'
        : '실제 감사 결과',
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

console.log(`[fact-checker] 감사 대상 ${audited.length}건 → ${outPath}`);
process.exit(0);
