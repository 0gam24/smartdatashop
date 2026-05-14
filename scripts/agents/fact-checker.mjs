/**
 * scripts/agents/fact-checker.mjs — 에이전트 #6 Fact-Checker (Layer 4, ADR 0005)
 *
 * 모드:
 *   FACT_CHECKER_MODE=stub : 글 카운트만 (네트워크 X)
 *   FACT_CHECKER_MODE=lite : 로컬 정적 audit — 수치/footnote/sources 비율 (기본값)
 *   FACT_CHECKER_MODE=full : Claude API + 1차 출처 fetch → 불일치 자동 진단
 *                            ANTHROPIC_API_KEY 필수
 *
 * I/O:
 *   입력: src/content/{pulse,insight,guidebookChapter}/*.mdx (14일 윈도우)
 *   출력: fact-check-queue/YYYY-MM-DD.json
 *   FULL: high-risk 글에 대해 Claude Sonnet 4.6 fact-check 호출 (max FACT_CHECKER_MAX_AUDITS)
 *
 * 비용 가드 (FULL):
 *   FACT_CHECKER_MAX_AUDITS (기본 5) — 1회 실행 호출 상한
 *   high-risk 우선 (수치 있는데 footnote 0 또는 비율 ≤ 1/3)
 */

import { mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const MODE = (process.env.FACT_CHECKER_MODE || 'lite').toLowerCase();
const STUB_MODE = MODE === 'stub';
const LITE_MODE = MODE === 'lite';
const FULL_MODE = MODE === 'full';
const WINDOW_DAYS = 14;
const MAX_AUDITS = Math.max(1, Math.min(20, parseInt(process.env.FACT_CHECKER_MAX_AUDITS || '5', 10)));
const FULL_MODEL = process.env.FACT_CHECKER_MODEL || 'claude-sonnet-4-6';
const API_KEY = process.env.ANTHROPIC_API_KEY;

const repoRoot = resolve(process.cwd());
const contentRoot = resolve(repoRoot, 'src/content');
const outDir = resolve(repoRoot, 'fact-check-queue');
const ranAt = new Date().toISOString();
const ranAtKstDate = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

const modeLabel = STUB_MODE ? 'STUB' : LITE_MODE ? 'LITE — 로컬 정적 audit' : 'FULL — Claude + 1차 출처 fetch';
console.log(`[fact-checker] ${ranAt} Layer 4 사후 감사 (${modeLabel})`);

if (FULL_MODE && !API_KEY) {
  console.log('[fact-checker] FULL_MODE 요청됐으나 ANTHROPIC_API_KEY 미설정 → LITE 로 폴백');
}
const effectiveFull = FULL_MODE && Boolean(API_KEY);

function extractPublishedAt(text) {
  const m = text.match(/^publishedAt:\s*["']?([^"'\n]+)["']?\s*$/m);
  return m ? m[1].trim() : null;
}

const NUMBER_UNIT_RE =
  /(\d+(?:[.,]\d+)?)\s*(%|명|조|억|만\s*원|만\s*명|만\s*좌|배|초|포인트|종|좌|:1|편|개|건)/g;
const FOOTNOTE_REF_RE = /\[\^[A-Za-z0-9_-]+\]/g;

function bodyOnly(text) {
  const fm = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return fm ? text.slice(fm[0].length) : text;
}

function countSourceUrls(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fmText = fm ? fm[1] : '';
  return (fmText.match(/^\s+url:\s*/gm) || []).length;
}

function extractSourceUrls(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fmText = fm ? fm[1] : '';
  const urls = [];
  const re = /^\s+url:\s*["']?(https?:\/\/[^"'\s]+)["']?\s*$/gm;
  let m;
  while ((m = re.exec(fmText)) !== null) urls.push(m[1]);
  return urls;
}

function liteAudit(filepath, text) {
  const body = bodyOnly(text);
  const claims = [...body.matchAll(NUMBER_UNIT_RE)];
  const footnoteMarkers = [...body.matchAll(FOOTNOTE_REF_RE)];
  const sourceUrlCount = countSourceUrls(text);

  const claimsCount = claims.length;
  const footnoteCount = footnoteMarkers.length;
  const claimsPerSource = sourceUrlCount > 0 ? claimsCount / sourceUrlCount : Infinity;

  let riskLevel;
  if (claimsCount === 0) riskLevel = 'low';
  else if (footnoteCount === 0) riskLevel = 'high';
  else if (footnoteCount * 3 >= claimsCount) riskLevel = 'low';
  else riskLevel = 'medium';

  return {
    claimsCount,
    footnoteCount,
    sourceUrlCount,
    claimsPerSource: claimsPerSource === Infinity ? null : Number(claimsPerSource.toFixed(2)),
    riskLevel,
  };
}

function recentArticles() {
  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const collections = STUB_MODE
    ? ['pulse', 'insight']
    : ['pulse', 'insight', 'guidebookChapter'];
  const audited = [];

  for (const collection of collections) {
    let entries;
    try {
      entries = readdirSync(join(contentRoot, collection)).filter((f) => f.endsWith('.mdx'));
    } catch {
      continue;
    }
    for (const filename of entries) {
      const filepath = join(contentRoot, collection, filename);
      const text = readFileSync(filepath, 'utf8');
      const publishedAt = extractPublishedAt(text);
      if (!publishedAt) continue;
      if (new Date(publishedAt).getTime() < cutoff) continue;
      const entry = { collection, filename, publishedAt, filepath };
      if (!STUB_MODE) Object.assign(entry, liteAudit(filepath, text));
      audited.push(entry);
    }
  }
  return audited;
}

// ── FULL_MODE: Claude + 1차 출처 fetch ─────────────────────────────────

const FACT_CHECK_SYSTEM_PROMPT = `당신은 데이터 저널 "스마트데이터샵" 의 Layer 4 fact-checker 다.
주어진 글 본문의 수치·일자·인용을 1차 출처 URL 본문과 대조해 불일치 항목만 보고한다.

엄격한 룰:
1. 수치 (X%, N억, M명 등) / 일자 (YYYY-MM-DD) / 직접 인용 ("...") 만 검증 대상
2. 본문에 등장한 항목이 1차 출처 본문에 존재하지 않으면 → 불일치
3. 수치 ± 1% 오차는 일치로 간주 (반올림 허용)
4. 1차 출처에 명시되지 않은 새 수치·일자 = 환각 → "fabricated" 표시
5. 추측·의견은 검증 대상 X — 객관적 사실만

출력 형식 (JSON only, 코드 펜스 없이):
{
  "verdict": "ok" | "mismatch" | "fabricated",
  "issues": [{ "claim": "본문에 등장한 수치/일자/인용 원문", "issue": "한 문장 설명", "severity": "low|medium|high" }],
  "summary": "1-2 문장 종합 의견"
}

issues 가 비어 있으면 verdict 는 "ok". verdict 가 "ok" 이면 summary 는 생략 가능.`;

async function fetchSourceText(url, timeoutMs = 10_000) {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'smartdatashop-fact-checker/1.0 (+https://smartdatashop.kr)' },
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const html = await res.text();
    // 간단 텍스트 추출 (HTML 태그 제거) — 환각 방지용 원문 노출만 목적
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000); // Claude context 절약
  } catch {
    return null;
  }
}

async function claudeCheck(articleBody, sourceTexts, articleTitle) {
  const userMsg = `## 검증할 글 제목
${articleTitle}

## 글 본문 (수치·일자·인용 포함)
${articleBody.slice(0, 4000)}

## 1차 출처 본문 (각 URL fetch 결과)
${sourceTexts.map((s, i) => `### 출처 ${i + 1} — ${s.url}\n${s.text || '(fetch 실패)'}`).join('\n\n')}

## 작업
글 본문의 수치/일자/인용을 1차 출처 본문과 대조해 불일치 또는 환각 항목을 JSON 으로 보고하라.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: FULL_MODEL,
      max_tokens: 1500,
      system: FACT_CHECK_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (typeof text !== 'string') throw new Error('Empty response');

  // JSON 파싱 — 코드 펜스 제거 후
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return { verdict: 'parse-error', raw: cleaned.slice(0, 500) };
  }
}

async function fullAudit(entry) {
  const text = readFileSync(entry.filepath, 'utf8');
  const body = bodyOnly(text);
  const urls = extractSourceUrls(text);
  if (urls.length === 0) return { verdict: 'no-sources', issues: [] };

  const sourceTexts = await Promise.all(
    urls.slice(0, 3).map(async (url) => ({ url, text: await fetchSourceText(url) })),
  );

  const titleMatch = text.match(/^title:\s*["']([^"']+)["']/m);
  const title = titleMatch?.[1] ?? entry.filename;

  return await claudeCheck(body, sourceTexts, title);
}

// ── 메인 실행 ─────────────────────────────────────────────────────────

const audited = recentArticles();
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `${ranAtKstDate}.json`);

let summary = null;
const discrepancies = [];

if (!STUB_MODE && audited.length > 0) {
  const risk = { low: 0, medium: 0, high: 0 };
  let totalClaims = 0, totalFootnotes = 0, totalSources = 0;
  for (const a of audited) {
    risk[a.riskLevel ?? 'low']++;
    totalClaims += a.claimsCount ?? 0;
    totalFootnotes += a.footnoteCount ?? 0;
    totalSources += a.sourceUrlCount ?? 0;
  }
  summary = {
    risk,
    avgClaimsPerArticle: Number((totalClaims / audited.length).toFixed(2)),
    avgFootnotesPerArticle: Number((totalFootnotes / audited.length).toFixed(2)),
    avgSourcesPerArticle: Number((totalSources / audited.length).toFixed(2)),
    totalClaims, totalFootnotes, totalSources,
  };
}

if (effectiveFull) {
  // high-risk 우선 + medium 일부 — 비용 상한 MAX_AUDITS
  const candidates = audited
    .filter((a) => a.riskLevel === 'high' || a.riskLevel === 'medium')
    .sort((a, b) => (a.riskLevel === 'high' ? -1 : 1) - (b.riskLevel === 'high' ? -1 : 1))
    .slice(0, MAX_AUDITS);

  console.log(`[fact-checker] FULL 감사 대상 ${candidates.length}건 (max ${MAX_AUDITS})`);

  for (const entry of candidates) {
    try {
      console.log(`[fact-checker] 감사 중: ${entry.collection}/${entry.filename}`);
      const result = await fullAudit(entry);
      if (result.verdict !== 'ok' && result.verdict !== 'no-sources') {
        discrepancies.push({
          collection: entry.collection,
          filename: entry.filename,
          ...result,
        });
        console.log(`  ⚠ ${result.verdict} — issues: ${(result.issues || []).length}`);
      } else {
        console.log(`  ✓ ${result.verdict}`);
      }
    } catch (err) {
      console.error(`  ✗ ${entry.filename}: ${err.message}`);
      discrepancies.push({
        collection: entry.collection,
        filename: entry.filename,
        verdict: 'error',
        error: err.message,
      });
    }
  }
}

// audited 출력 시 filepath 제거 (상대 경로만)
const auditedOut = audited.map(({ filepath: _f, ...rest }) => rest);

const payload = {
  agent: 'fact-checker',
  ranAt,
  windowDays: WINDOW_DAYS,
  mode: STUB_MODE ? 'stub' : effectiveFull ? 'full' : 'lite',
  auditedCount: audited.length,
  ...(STUB_MODE
    ? { audited: audited.map((a) => `${a.collection}/${a.filename}`), discrepancies: [] }
    : effectiveFull
      ? { summary, audited: auditedOut, fullAuditedCount: Math.min(MAX_AUDITS, audited.filter(a => a.riskLevel !== 'low').length), discrepancies }
      : { summary, audited: auditedOut }),
  note: STUB_MODE
    ? 'STUB: 글 카운트만'
    : effectiveFull
      ? `FULL: ${FULL_MODEL} + 1차 출처 fetch. 불일치 ${discrepancies.length}건.`
      : 'LITE: 로컬 정적 audit. FACT_CHECKER_MODE=full + ANTHROPIC_API_KEY 시 Claude 검증.',
};

writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

console.log(`[fact-checker] 감사 대상 ${audited.length}건 → ${outPath}`);
if (summary) {
  console.log(`[fact-checker] 위험: low ${summary.risk.low} / medium ${summary.risk.medium} / high ${summary.risk.high}`);
}
if (effectiveFull) {
  console.log(`[fact-checker] FULL 불일치 ${discrepancies.length}건`);
}

process.exit(0);
