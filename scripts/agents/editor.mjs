/**
 * scripts/agents/editor.mjs — 에이전트 #1 Editor-in-Chief (스텁)
 *
 * 역할: 매일 06:00 KST에 그날의 편집 큐(daily-queue/YYYY-MM-DD.json)를 산출한다.
 *
 * I/O 계약:
 *   입력:
 *     - data-queue/*.json (Data Scout가 누적한 후보)
 *     - 환경변수 ANTHROPIC_API_KEY (M1+에서 사용)
 *   출력:
 *     - daily-queue/YYYY-MM-DD.json
 *         {
 *           date: string (YYYY-MM-DD),
 *           items: Array<{ id, slug, topic, priority, sourceRefs }>
 *         }
 *   종료 코드:
 *     - 0 정상
 *
 * 스텁: items 배열은 비어있고, 사람이 확인할 수 있는 메타데이터만 기록한다.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const repoRoot = resolve(process.cwd());
const now = new Date();
// KST 기준 날짜 — 06:00 KST에 실행되므로 항상 "오늘 KST"로 라벨링
const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
const yyyy = kstNow.getUTCFullYear();
const mm = String(kstNow.getUTCMonth() + 1).padStart(2, '0');
const dd = String(kstNow.getUTCDate()).padStart(2, '0');
const dateLabel = `${yyyy}-${mm}-${dd}`;

const ranAt = now.toISOString();
const outPath = resolve(repoRoot, 'daily-queue', `${dateLabel}.json`);

console.log(`[editor] ${ranAt} 편집장 일일 큐 산출 (스텁 — 실제 구현은 M1+)`);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  JSON.stringify(
    {
      agent: 'editor-in-chief',
      date: dateLabel,
      ranAt,
      status: 'stub-ok',
      items: [],
      note: '실제 큐 산출 로직은 M1+에서 구현 예정',
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

process.exit(0);
