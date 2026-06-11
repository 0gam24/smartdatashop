/**
 * prune-drafts — daily-queue/drafts/ 의 오래된 펄스 초안 자동 정리.
 *
 * 배경 (2026-06-12): draft-pulse-from-rss.mjs 가 매일 4건씩 초안을 생성하지만
 * 삭제 로직이 없어 28일간 102건이 적체됐다. 초안은 당일 "오늘 포스팅" 수동 발행의
 * 후보로만 쓰이므로 (일일 발행 운영 방침 — 토픽 6축 채점은 당일 후보만 대상),
 * 발행 시한이 지난 초안은 보관 가치가 없다. RSS 원문은 data/rss/government.json
 * 과 1차 출처(korea.kr)에 그대로 남는다.
 *
 * 동작: 파일명 패턴 draft-pulse-YYYY-MM-DD-*.mdx 의 날짜가 오늘(UTC 기준 파일명
 * 날짜 비교 — 파일명 날짜는 KST 생성일)로부터 --days(기본 7)일 이전이면 삭제.
 * 날짜 파싱 불가 파일은 건드리지 않는다 (fail-soft).
 *
 * 사용:
 *   node scripts/prune-drafts.mjs            # 7일 이전 삭제
 *   node scripts/prune-drafts.mjs --days 14  # 14일 이전 삭제
 *   node scripts/prune-drafts.mjs --dry-run  # 삭제 대상만 출력
 */
import { readdirSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DRAFTS_DIR = join(process.cwd(), 'daily-queue', 'drafts');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const daysIdx = args.indexOf('--days');
const keepDays = daysIdx >= 0 ? Number.parseInt(args[daysIdx + 1], 10) : 7;

if (!Number.isFinite(keepDays) || keepDays < 1) {
  console.error('[prune-drafts] --days 는 1 이상 정수여야 합니다.');
  process.exit(2);
}

if (!existsSync(DRAFTS_DIR)) {
  console.log('[prune-drafts] drafts 디렉토리 없음 — 종료.');
  process.exit(0);
}

const DATE_RE = /^draft-pulse-(\d{4}-\d{2}-\d{2})-/;
const cutoffMs = Date.now() - keepDays * 24 * 60 * 60 * 1000;

let scanned = 0;
let pruned = 0;
let skipped = 0;

for (const name of readdirSync(DRAFTS_DIR)) {
  if (!name.endsWith('.mdx')) continue;
  scanned += 1;

  const m = name.match(DATE_RE);
  if (!m) {
    skipped += 1;
    continue;
  }

  const fileMs = new Date(`${m[1]}T23:59:59+09:00`).getTime();
  if (!Number.isFinite(fileMs)) {
    skipped += 1;
    continue;
  }

  if (fileMs < cutoffMs) {
    if (dryRun) {
      console.log(`  [dry-run] 삭제 대상: ${name}`);
    } else {
      unlinkSync(join(DRAFTS_DIR, name));
    }
    pruned += 1;
  }
}

console.log(
  `[prune-drafts] 스캔 ${scanned}건 / ${dryRun ? '삭제 대상' : '삭제'} ${pruned}건 / 날짜 파싱 불가 보존 ${skipped}건 (보존 기간 ${keepDays}일)`,
);
