/**
 * scripts/agents/writer.mjs — 에이전트 #3 Pulse Writer (스텁)
 *
 * 역할: 편집장이 떨군 daily-queue/YYYY-MM-DD.json 을 읽어 src/content/pulse/ 하위에
 *       MDX 초안 파일들을 생성한다. 그 결과물은 워크플로우의 다음 스텝
 *       (peter-evans/create-pull-request@v6) 이 자동으로 PR로 묶어 올린다.
 *
 * I/O 계약:
 *   입력:
 *     - daily-queue/*.json
 *     - 환경변수 ANTHROPIC_API_KEY (M1+에서 사용)
 *   출력:
 *     - src/content/pulse/<slug>.mdx (실제 초안 — M1+)
 *     - tmp/writer-heartbeat.json   (스텁 단계의 흔적)
 *   종료 코드:
 *     - 0 정상
 *
 * 스텁은 실제 MDX 를 만들지 않는다 (src/ 영역 보호) — 단지 heartbeat만 남긴다.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const repoRoot = resolve(process.cwd());
const ranAt = new Date().toISOString();
const outPath = resolve(repoRoot, 'tmp', 'writer-heartbeat.json');

console.log(`[writer] ${ranAt} 펄스 라이터 초안 생성 (스텁 — 실제 구현은 M1+)`);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  JSON.stringify(
    {
      agent: 'pulse-writer',
      ranAt,
      status: 'stub-ok',
      drafts: [],
      note: '실제 MDX 생성은 M1+에서 구현 예정',
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

process.exit(0);
