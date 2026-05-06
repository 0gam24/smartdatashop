#!/usr/bin/env node
/**
 * extract-numerical-claims.mjs — 본문 수치 주장 추출 + 출처 페어링 감사
 *
 * Layer 3 빌드 게이트 (ADR 0005). 라이터 에이전트가 본문에 박는 모든 한국식
 * 수치 토큰(312만 명 / 2.1% / 800개 사 / KOSPI 3.4조 등)을 추출하고, 같은
 * 단락에 `[^N]` footnote 마커가 있는지 검사한다. 마커가 있다는 것은 정확한
 * 검증은 아니지만 "이 수치는 어딘가의 출처에 매핑되어 있다" 는 구조적 신호.
 *
 * 사용:
 *   node scripts/extract-numerical-claims.mjs           # 사람이 읽는 표
 *   node scripts/extract-numerical-claims.mjs --json    # JSON
 *   node scripts/extract-numerical-claims.mjs --strict  # 미페어링 1건이라도 있으면 exit 1
 *
 * 한계:
 *   - 한글 풀어쓰기 수치 ("삼백만 명") 는 미감지 — TODO future
 *   - 수치 옆 footnote 가 있어도 그 footnote 가 사실인지는 검증하지 않음
 *     (Layer 4 fact-checker 가 해당 검증 담당)
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'src/content');
const COLLECTIONS = ['pulse', 'insight'];

const args = new Set(process.argv.slice(2));
const asJson = args.has('--json');
const strict = args.has('--strict');

// 한국 데이터 저널이 자주 다루는 수치 단위. 각 토큰은 \d 류 와 인접해야 매칭.
// 단어 경계가 한글에 적용되지 않으므로 lookahead 로 단위 종료를 명시 필요 X —
// 단순 캡처 후 호출측에서 검증.
const NUMBER_UNIT_RE =
  /(\d+(?:[.,]\d+)?)\s*(%|명|조|억|만\s*원|만\s*명|만\s*좌|배|초|포인트|종|좌|:1|편|개|건)/g;

const FOOTNOTE_RE = /\[\^[A-Za-z0-9_-]+\]/;

/** frontmatter 와 footnote 정의 라인을 제거한 body 만 리턴 */
function bodyOnly(text) {
  // frontmatter 블록 제거
  const fm = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  let body = fm ? text.slice(fm[0].length) : text;
  // footnote 정의 라인 제거 (`[^1]: ...`) — 본문에 박힌 inline marker 만 남김
  body = body
    .split(/\r?\n/)
    .filter((ln) => !/^\[\^[A-Za-z0-9_-]+\]:/.test(ln))
    .join('\n');
  return body;
}

/** 단락(blank-line 으로 구분) 단위로 분할 */
function splitParagraphs(body) {
  return body.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
}

async function analyzeFile(filepath) {
  const text = await readFile(filepath, 'utf8');
  const body = bodyOnly(text);
  const paragraphs = splitParagraphs(body);
  const claims = [];
  for (const para of paragraphs) {
    const hasFootnote = FOOTNOTE_RE.test(para);
    const matches = [...para.matchAll(NUMBER_UNIT_RE)];
    for (const m of matches) {
      claims.push({
        claim: `${m[1]}${m[2]}`.replace(/\s+/g, ''),
        paired: hasFootnote,
        paragraphPreview: para.slice(0, 80) + (para.length > 80 ? '…' : ''),
      });
    }
  }
  return claims;
}

async function main() {
  const fileResults = [];
  for (const c of COLLECTIONS) {
    let entries = [];
    try {
      entries = (await readdir(join(ROOT, c))).filter((f) => f.endsWith('.mdx'));
    } catch {
      continue;
    }
    for (const filename of entries) {
      const filepath = join(ROOT, c, filename);
      const claims = await analyzeFile(filepath);
      fileResults.push({ collection: c, filename, claims });
    }
  }

  if (asJson) {
    console.log(JSON.stringify(fileResults, null, 2));
    return;
  }

  let totalClaims = 0;
  let totalUnpaired = 0;
  for (const f of fileResults) {
    if (f.claims.length === 0) {
      console.log(`\n📄 ${f.collection}/${f.filename} — 수치 주장 0건`);
      continue;
    }
    console.log(`\n📄 ${f.collection}/${f.filename} — ${f.claims.length}건`);
    for (const c of f.claims) {
      totalClaims += 1;
      const mark = c.paired ? '✅' : '⚠';
      if (!c.paired) totalUnpaired += 1;
      console.log(`  ${mark} ${c.claim.padEnd(10)} | ${c.paragraphPreview}`);
    }
  }

  console.log(
    `\n총 ${totalClaims}건의 수치 주장 — ${totalClaims - totalUnpaired}건 페어링 ✓ / ${totalUnpaired}건 미페어링 ⚠`,
  );
  console.log(
    '⚠ 미페어링 = 수치 옆 단락에 [^N] footnote 마커 부재. Layer 1(writer 프롬프트) 또는 운영자 직접 추가 필요.',
  );

  if (strict && totalUnpaired > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
