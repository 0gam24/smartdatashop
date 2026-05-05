/**
 * scripts/agents/scout.mjs — 에이전트 #2 Data Scout (스텁)
 *
 * 역할: 매시 정각에 외부 데이터 소스를 폴링하여 신규 후보를 data-queue/ 에 기록한다.
 *
 * I/O 계약:
 *   입력:
 *     - 환경변수 ANTHROPIC_API_KEY (M1+에서 사용)
 *     - 외부 데이터 소스 URL 목록 (config/sources.json — 추후)
 *   출력:
 *     - data-queue/heartbeat.json   { ranAt, agent, status }
 *     - data-queue/<topic>-<ts>.json (실제 후보 — M1+)
 *   종료 코드:
 *     - 0 정상, 그 외 실패
 *
 * 본 스텁은 어떤 네트워크 호출도 하지 않으며, 단순히 heartbeat 파일만 기록한다.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const repoRoot = resolve(process.cwd());
const outPath = resolve(repoRoot, 'data-queue', 'heartbeat.json');
// ISO 8601 UTC, 밀리초 포함 (예: 2026-05-05T03:00:00.000Z)
const ranAt = new Date().toISOString();

console.log(`[scout] ${ranAt} 데이터 스카우트 1차 구동을 실행 (스텁 — 실제 구현은 M1+)`);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  JSON.stringify(
    {
      agent: 'data-scout',
      ranAt,
      status: 'stub-ok',
      note: '실제 데이터 수집 로직은 M1+에서 구현 예정',
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

process.exit(0);
