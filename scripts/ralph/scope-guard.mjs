#!/usr/bin/env node
/**
 * scope-guard.mjs — Ralph 회차 commit 전 금지 경로 터치 여부 검사.
 *
 * 사용:
 *   node scripts/ralph/scope-guard.mjs   # PASS → exit 0, 위반 → exit 1
 *
 * Ralph 가 PROMPT.md 의 "절대 금지" 항목 중 파일 경로 기반 항목을 자동 enforce.
 * 본문 통계 fabrication 같은 의미론적 위반은 사람·layer 4 fact-checker 의 역할.
 */

import { execSync } from 'node:child_process';

const FORBIDDEN = [
  { pat: /^src\/content\//, why: '콘텐츠 컬렉션 (ADR 0005/0006)' },
  { pat: /^docs\/decisions\//, why: 'ADR' },
  { pat: /^CLAUDE\.md$/, why: '루트 하네스' },
  { pat: /\/CLAUDE\.md$/, why: '영역 하네스' },
  { pat: /^\.claude\//, why: 'Claude 설정' },
  { pat: /^astro\.config\./, why: '빌드 설정' },
  { pat: /^tsconfig/, why: 'TS 설정' },
  { pat: /^package(-lock)?\.json$/, why: '의존성' },
];

function stagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return out.split('\n').map((s) => s.trim()).filter(Boolean);
  } catch (e) {
    console.error('[scope-guard] git diff 실패:', e.message);
    process.exit(2);
  }
}

const staged = stagedFiles();
if (staged.length === 0) {
  console.log('[scope-guard] staged 파일 0개 — PASS (변경 없음)');
  process.exit(0);
}

const violations = [];
for (const f of staged) {
  for (const rule of FORBIDDEN) {
    if (rule.pat.test(f)) {
      violations.push({ file: f, why: rule.why });
    }
  }
}

if (violations.length === 0) {
  console.log(`[scope-guard] PASS — staged ${staged.length}개 파일 모두 허용 범위`);
  process.exit(0);
}

console.error(`[scope-guard] ❌ FAIL — 금지 경로 ${violations.length}건 staged:`);
for (const v of violations) {
  console.error(`   ✗ ${v.file}  (${v.why})`);
}
console.error('');
console.error('Ralph 회차는 unstage + revert 후 즉시 종료해야 합니다.');
process.exit(1);
