#!/usr/bin/env node
/**
 * verify-source-links.mjs — 1차 출처 URL 헬스 체크
 *
 * 모든 펄스/인사이트 MDX의 frontmatter `sources` 배열에서 url 필드를 추출해
 * HTTP HEAD 요청으로 200/3xx 응답 여부를 확인한다. 4xx/5xx 또는 타임아웃을
 * 보고서 형태로 출력해 운영자가 "기관 루트는 살아 있는데 deep link는 끊김"
 * 같은 상황을 발견할 수 있게 한다.
 *
 * 본 스크립트는 AI가 합법적으로 수행 가능한 영역의 검증이다 — 단순 링크
 * 가용성 체크일 뿐, 본문 수치·발표일을 1차 출처와 대조하지 않는다. 본문 검수는
 * 반드시 운영자(verifiedBy 등록자)가 직접 수행해야 한다. (docs/verification-queue.md 참조)
 *
 * 사용:
 *   node scripts/verify-source-links.mjs
 *   node scripts/verify-source-links.mjs --json    # JSON 출력
 *   node scripts/verify-source-links.mjs --strict  # 4xx/5xx/오류 시 exit 1
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'src/content');
const COLLECTIONS = ['pulse', 'insight'];
const TIMEOUT_MS = 10_000;

const args = new Set(process.argv.slice(2));
const asJson = args.has('--json');
const strict = args.has('--strict');

/** 단일 MDX 파일에서 frontmatter sources의 url + name 짝을 추출.
 *  YAML 파서를 쓰지 않고 단순 텍스트 매칭 — frontmatter 안의 url: 라인 위
 *  최근접 name: 라인을 짝지운다. (sources 블록 외부에는 url: 키가 없다고 가정) */
async function extractSources(filepath) {
  const text = await readFile(filepath, 'utf8');
  // CRLF / LF 양쪽 호환: 줄바꿈은 \r?\n
  const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return [];
  const fm = fmMatch[1];
  const lines = fm.split(/\r?\n/);

  const sources = [];
  let currentName = null;
  for (const line of lines) {
    const nameM = line.match(/^\s*-?\s*name:\s*["']?([^"'\n]+?)["']?\s*$/);
    if (nameM) {
      currentName = nameM[1].trim();
      continue;
    }
    const urlM = line.match(/^\s*url:\s*["']?(https?:\/\/[^"'\s]+?)["']?\s*$/);
    if (urlM) {
      sources.push({
        name: currentName ?? '(이름 없음)',
        url: urlM[1].trim(),
      });
      currentName = null; // 다음 항목으로 넘어감
    }
  }
  return sources;
}

/** 파일 한 개 점검 */
async function checkFile(collection, filename) {
  const filepath = join(ROOT, collection, filename);
  const sources = await extractSources(filepath);
  const results = [];
  for (const src of sources) {
    const result = await headCheck(src.url);
    results.push({ ...src, ...result });
  }
  return { collection, filename, results };
}

/** HTTP HEAD (실패 시 GET fallback) */
async function headCheck(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'smartdatashop-link-checker/1.0' },
    });
    // 일부 서버는 HEAD 405. GET으로 fallback (응답 본문은 무시)
    if (res.status === 405) {
      res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': 'smartdatashop-link-checker/1.0' },
      });
    }
    return {
      status: res.status,
      ok: res.ok,
      finalUrl: res.url,
      redirected: res.redirected,
    };
  } catch (err) {
    return {
      status: 0,
      ok: false,
      error: err.name === 'AbortError' ? 'timeout' : (err.message ?? String(err)),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const allResults = [];
  for (const c of COLLECTIONS) {
    let entries = [];
    try {
      entries = (await readdir(join(ROOT, c))).filter((f) => f.endsWith('.mdx'));
    } catch {
      continue;
    }
    for (const entry of entries) {
      allResults.push(await checkFile(c, entry));
    }
  }

  if (asJson) {
    console.log(JSON.stringify(allResults, null, 2));
    return;
  }

  // 사람이 읽는 표 출력
  let total = 0;
  let failed = 0;
  for (const file of allResults) {
    console.log(`\n📄 ${file.collection}/${file.filename}`);
    for (const r of file.results) {
      total += 1;
      const mark = r.ok ? '✅' : '❌';
      const status = r.error ? `error: ${r.error}` : `${r.status}${r.redirected ? ` → ${r.finalUrl}` : ''}`;
      if (!r.ok) failed += 1;
      console.log(`  ${mark} ${status}`);
      console.log(`     ${r.name}`);
      console.log(`     ${r.url}`);
    }
  }

  console.log(`\n총 ${total}개 링크 중 ${total - failed}개 정상, ${failed}개 실패.`);
  console.log('상세 검수는 docs/verification-queue.md 참조.');

  if (strict && failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
