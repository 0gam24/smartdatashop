#!/usr/bin/env node
/**
 * verify-source-links.mjs — 1차 출처 URL 헬스 체크
 *
 * 모든 펄스/인사이트 MDX의 frontmatter `sources` 배열에서 url 필드를 추출해
 * HTTP HEAD 요청으로 200/3xx 응답 여부를 확인한다. 4xx/5xx 또는 타임아웃을
 * 보고서 형태로 출력해 운영자가 "기관 루트는 살아 있는데 deep link는 끊김"
 * 같은 상황을 발견할 수 있게 한다.
 *
 * 본 스크립트는 자동 안전장치 Layer 3 의 일부 (ADR 0005). 단순 링크 가용성
 * 체크일 뿐, 본문 수치·발표일을 1차 출처와 대조하지 않는다. 출처-vs-주장
 * 대조는 Layer 4 (사후 fact-checker, Phase 4+) 또는 운영자가 수행한다.
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
/** --strict-deep: root URL (1차 출처 deep link 미지정) 도 fail 처리. */
const strictDeep = args.has('--strict-deep');

/**
 * 1차 출처 deep link 깊이 판정 (06 §8 / ADR 0006 §2):
 *   ✅ deep    — 보도자료 PDF / 통계 DB 페이지 / 발표 ID 가 URL 에 박힘
 *   ⚠ shallow — 도메인 root 또는 /index.{do,html,jsp,php,asp}
 *   ⚠ landing — /portal, /main, /home 같은 진입점
 *
 * shallow / landing 은 ADR 0006 §2 "정확한 출처 URL = deep link 우선" 위반.
 * 본 스크립트는 기본 정보성 경고만 발행 — `--strict-deep` 시 fail 로 승격.
 */
function classifyDepth(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    const hasQuery = u.search.length > 1;
    // PDF / 통계 DB / 보도자료 ID — 무조건 deep
    if (path.endsWith('.pdf') || path.endsWith('.xlsx') || path.endsWith('.csv')) return 'deep';
    if (hasQuery && /(?:newsid|seq|idx|nttid|bbsid|mid|article|view)=/i.test(u.search)) return 'deep';
    // 명시적 root patterns
    if (path === '' || path === '/') return 'shallow';
    if (/^\/(index|main|home)(\.[a-z]+)?\/?$/.test(path)) return 'shallow';
    if (/^\/(portal|index)\/?$/.test(path)) return 'landing';
    // 그 외는 deep 가정 (path segment 1+ 보유)
    return 'deep';
  } catch {
    return 'deep'; // URL 파싱 실패 시 보수적으로 deep 가정 (fetch 단계에서 fail 검출)
  }
}

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
    const depth = classifyDepth(src.url);
    results.push({ ...src, ...result, depth });
  }
  return { collection, filename, results };
}

// 일부 한국 정부 사이트(nts.go.kr 등)는 HEAD 를 거부하고 400/403/405 를 반환한다.
// 일반 데스크톱 브라우저 UA 와 함께 GET 으로 fallback 해야 정상 응답을 받는다.
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 smartdatashop-link-checker/1.0';
const HEAD_FALLBACK_STATUSES = new Set([400, 401, 403, 405, 501]);

/** HTTP HEAD (실패 응답 코드/네트워크 에러 시 GET fallback) */
async function headCheck(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const baseHeaders = {
    'User-Agent': BROWSER_UA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ko,en;q=0.8',
  };
  async function tryRequest(method) {
    return fetch(url, {
      method,
      signal: controller.signal,
      redirect: 'follow',
      headers: baseHeaders,
    });
  }
  try {
    let res;
    try {
      res = await tryRequest('HEAD');
    } catch (e) {
      // HEAD 자체가 네트워크 단계에서 실패하는 경우(드물지만 fetch failed) GET 으로 재시도
      res = await tryRequest('GET');
      return {
        status: res.status,
        ok: res.ok,
        finalUrl: res.url,
        redirected: res.redirected,
        method: 'GET-after-HEAD-network-fail',
      };
    }
    // 일부 서버는 HEAD 를 거부하고 400/403/405 류 코드를 돌려준다 — GET 으로 재시도.
    if (HEAD_FALLBACK_STATUSES.has(res.status)) {
      res = await tryRequest('GET');
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
  let shallow = 0;
  for (const file of allResults) {
    console.log(`\n📄 ${file.collection}/${file.filename}`);
    for (const r of file.results) {
      total += 1;
      const mark = r.ok ? '✅' : '❌';
      const depthMark = r.depth === 'deep' ? '' : (r.depth === 'shallow' ? ' ⚠ root' : ' ⚠ landing');
      const status = r.error ? `error: ${r.error}` : `${r.status}${r.redirected ? ` → ${r.finalUrl}` : ''}`;
      if (!r.ok) failed += 1;
      if (r.depth !== 'deep') shallow += 1;
      console.log(`  ${mark} ${status}${depthMark}`);
      console.log(`     ${r.name}`);
      console.log(`     ${r.url}`);
    }
  }

  console.log(`\n총 ${total}개 링크 중 ${total - failed}개 정상, ${failed}개 실패.`);
  if (shallow > 0) {
    console.log(`⚠ root/landing URL ${shallow}건 — ADR 0006 §2 deep link 권장 (보도자료 PDF / 통계 DB 페이지).`);
    console.log('   --strict-deep 옵션으로 빌드 차단 가능.');
  }
  console.log('출처-vs-주장 대조는 Layer 4 fact-checker (Phase 4+) 또는 운영자가 수행.');

  if (strict && failed > 0) {
    process.exit(1);
  }
  if (strictDeep && shallow > 0) {
    console.error(`\n[verify-source-links] --strict-deep FAIL — root/landing URL ${shallow}건.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
