/**
 * scripts/agents/desk-reviewer.mjs — 에이전트 #5 Desk Reviewer (스텁)
 *
 * 역할: PR로 들어온 src/content/** 변경분을 검토하여 리뷰 리포트를 산출한다.
 *       워크플로우는 산출된 tmp/review-report.json 을 읽어 PR 코멘트로 게시한다.
 *
 * I/O 계약:
 *   입력:
 *     - PR diff (실제 구현 단계에서는 GITHUB_EVENT_PATH 또는 git diff)
 *     - 환경변수 ANTHROPIC_API_KEY (M1+에서 사용)
 *   출력:
 *     - tmp/review-report.json
 *         {
 *           summary: string,
 *           issues: string[],
 *           verdict: "approve" | "request-changes" | "comment"
 *         }
 *   종료 코드:
 *     - 0 정상 (리뷰 자체가 거절이어도 0 — 리뷰 결과는 verdict 필드에 담김)
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const repoRoot = resolve(process.cwd());
const ranAt = new Date().toISOString();
const outPath = resolve(repoRoot, 'tmp', 'review-report.json');

console.log(`[desk-reviewer] ${ranAt} 데스크 리뷰 자동 검수 (스텁 — 실제 구현은 M1+)`);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  JSON.stringify(
    {
      agent: 'desk-reviewer',
      ranAt,
      summary: '스텁 리뷰: 자동 검수 로직은 M1+에서 구현 예정입니다.',
      issues: [],
      verdict: 'comment',
      status: 'stub-ok',
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

process.exit(0);
