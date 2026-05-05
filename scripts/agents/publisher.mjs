/**
 * scripts/agents/publisher.mjs — 에이전트 #6 Publisher (스텁)
 *
 * 역할: main에 머지된 새 콘텐츠를 외부 채널에 발행한다.
 *       - Google Indexing API 핑
 *       - 네이버 서치어드바이저 색인 요청
 *       - Stibee 뉴스레터 발송 트리거
 *
 * I/O 계약:
 *   입력:
 *     - 환경변수: GOOGLE_INDEXING_KEY, NAVER_SA_KEY, STIBEE_API_KEY
 *     - GITHUB_EVENT_PATH 의 push 이벤트 페이로드 (변경 파일 목록)
 *   출력:
 *     - tmp/publisher-heartbeat.json (스텁 단계 흔적)
 *     - 실제 단계에서는 외부 API 호출 결과 로그
 *   종료 코드:
 *     - 0 정상, 외부 API 실패는 경고 로그만 남기고 0 으로 종료 (재시도 로직은 M1+)
 *
 * 본 스텁은 어떤 외부 호출도 하지 않는다.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const repoRoot = resolve(process.cwd());
const ranAt = new Date().toISOString();
const outPath = resolve(repoRoot, 'tmp', 'publisher-heartbeat.json');

const haveGoogle = Boolean(process.env.GOOGLE_INDEXING_KEY);
const haveNaver = Boolean(process.env.NAVER_SA_KEY);
const haveStibee = Boolean(process.env.STIBEE_API_KEY);

console.log(`[publisher] ${ranAt} 콘텐츠 발행/색인 요청 (스텁 — 실제 구현은 M1+)`);
console.log(`[publisher] 시크릿 가용성 — google:${haveGoogle} naver:${haveNaver} stibee:${haveStibee}`);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  JSON.stringify(
    {
      agent: 'publisher',
      ranAt,
      status: 'stub-ok',
      secretsPresent: { google: haveGoogle, naver: haveNaver, stibee: haveStibee },
      note: '실제 외부 API 호출은 M1+에서 구현 예정',
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

process.exit(0);
