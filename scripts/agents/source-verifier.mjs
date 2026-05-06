#!/usr/bin/env node
/**
 * source-verifier.mjs — SourceWriter 워크플로우 Stage 4.
 *
 * draft MDX 파일의 모든 수치 토큰 + 직접 인용을 .cache/sources/*.txt 에서
 * verbatim substring 매칭으로 검증. 미일치 1건이라도 → exit 1 → SourceWriter
 * 가 draft 를 reject 해야 함.
 *
 * 사용:
 *   node scripts/agents/source-verifier.mjs <draft.mdx> [--lenient]
 *
 * --lenient: 한국어 단위 공백 변형 허용 (예: "1,333만 명" ↔ "1,333만명")
 *
 * 종료 코드:
 *   0 — 모든 수치/인용 verbatim 검증 통과
 *   1 — 하나 이상 미검증 (운영자 또는 SourceWriter 가 fix 필요)
 *   2 — 인자/캐시 부족
 *
 * 한계:
 *   - HTML 태그 제거 단순 — 깨진 마크업 fall-through 가능 (false negative)
 *   - 한글 풀어쓰기 ("삼백만 명") 미지원 (Layer 4 FULL 단계 향후 추가)
 *   - 직접 인용 매칭은 따옴표 안 substring (정확도 낮음 — partial 매칭만)
 *
 * 통과 후에도 운영자 review 필수 — 본 스크립트는 *fabrication 차단* 만 보장.
 * 의미·맥락·해석은 운영자가 검증.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const lenient = args.includes('--lenient');
const draftPath = args.find((a) => !a.startsWith('--'));

if (!draftPath) {
  console.error('사용: node scripts/agents/source-verifier.mjs <draft.mdx> [--lenient]');
  process.exit(2);
}

let text;
try {
  text = readFileSync(draftPath, 'utf8');
} catch (e) {
  console.error(`[verifier] draft 읽기 실패: ${e.message}`);
  process.exit(2);
}

// frontmatter 분리 — body 만 검증
const fm = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
const body = fm ? text.slice(fm[0].length) : text;

// 캐시 모두 읽기
const cacheDir = resolve(process.cwd(), '.cache/sources');
let cacheRaw = '';
let cacheFiles = [];
try {
  cacheFiles = readdirSync(cacheDir).filter((f) => f.endsWith('.txt'));
  for (const f of cacheFiles) {
    cacheRaw += '\n' + readFileSync(resolve(cacheDir, f), 'utf8');
  }
} catch {
  console.error('[verifier] .cache/sources/ 없음 — source-cache 먼저 실행');
  process.exit(2);
}
if (cacheFiles.length === 0) {
  console.error('[verifier] cache 비어 있음 — source-cache 먼저 실행');
  process.exit(2);
}

// HTML 태그 + entity 단순 제거
function stripHtml(s) {
  return s
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ');
}
const cacheText = stripHtml(cacheRaw);

// MDX body 의 footnote 정의 라인 (`[^1]: ...`) 도 검증 대상에서 제외
// (정의 본문은 출처 이름이지 수치 주장 아님)
const bodyForCheck = body
  .split(/\r?\n/)
  .filter((ln) => !/^\[\^[A-Za-z0-9_-]+\]:\s/.test(ln))
  .join('\n');

// 1. 수치 + 단위 토큰 추출
//    한국 데이터 저널 단위 — extract-numerical-claims.mjs 와 동일
const NUMBER_UNIT_RE =
  /(\d+(?:[.,]\d+)?)\s*(%|명|조|억|만\s*원|만\s*명|만\s*좌|배|초|포인트|종|좌|:1|편|개|건|일|개월|년|회|위|개사|배럴|kg|km|t)/g;

const failures = [];
const passes = [];
const claims = [...bodyForCheck.matchAll(NUMBER_UNIT_RE)];

for (const m of claims) {
  const numStr = m[1];
  const unit = m[2];

  // verbatim variants — 단위 공백 0~2 자 변형 허용
  const compactUnit = unit.replace(/\s+/g, '');
  const variants = new Set([
    `${numStr}${unit}`,
    `${numStr} ${unit}`,
    `${numStr}${compactUnit}`,
    `${numStr} ${compactUnit}`,
  ]);
  if (lenient) {
    // 콤마/점 표기 변형 (1,333 ↔ 1333)
    const numNoComma = numStr.replace(/,/g, '');
    if (numNoComma !== numStr) {
      variants.add(`${numNoComma}${unit}`);
      variants.add(`${numNoComma}${compactUnit}`);
    }
  }

  const found = [...variants].some((v) => cacheText.includes(v));
  const claimStr = `${numStr}${unit}`;
  if (found) passes.push(claimStr);
  else failures.push(claimStr);
}

console.log(`[verifier] draft: ${draftPath}`);
console.log(`[verifier] cache files: ${cacheFiles.length}, total ${cacheText.length} chars (cleaned)`);
console.log(`[verifier] 수치 주장 ${claims.length} 건`);

if (failures.length === 0) {
  console.log(`[verifier] ✅ PASS — 모든 수치 verbatim 검증 통과 (${passes.length} 건)`);
  process.exit(0);
}

console.error(`[verifier] ❌ FAIL — ${failures.length} 미검증 수치:`);
const seen = new Set();
for (const f of failures) {
  if (seen.has(f)) continue;
  seen.add(f);
  console.error(`   ✗ ${f}`);
}
console.error('');
console.error('  → 미검증 수치는 다음 중 하나로 해결:');
console.error('    (a) fetched source 에 verbatim 으로 등장하는 토큰으로 교체');
console.error('    (b) 본문에서 제거 + "발표 후 갱신 예정" 류 명시');
console.error('    (c) source-cache 에 추가 1차 출처 등록 후 verifier 재실행');
process.exit(1);
