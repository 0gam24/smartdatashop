/**
 * scripts/agents/telegram-digest.mjs — 매일 자동화 결과 텔레그램 알림
 *
 * 매일 KST 09:30 cron 가동 — 직전 24시간의:
 *   1. workflow runs 상태 (성공/실패/skip 카운트)
 *   2. 신규 펄스 / 인사이트 발행 카운트
 *   3. fact-check-queue 위험 신호 (high-risk 건수)
 *   4. AdSense / GA4 / 네이버 분석 가동 상태 (선택)
 *
 * 입력 (환경변수):
 *   TELEGRAM_BOT_TOKEN  : Telegram Bot API 토큰 (필수)
 *   TELEGRAM_CHAT_ID    : 운영자 chat ID (필수)
 *   GITHUB_TOKEN        : workflow runs 조회 (필수, Actions 자동 주입)
 *   GITHUB_REPOSITORY   : owner/repo 형식 (Actions 자동 주입)
 *
 * 출력: 텔레그램 메시지 1개 + heartbeat JSON
 *
 * 운영자 봇 설정 절차 (외부):
 *   1. Telegram → @BotFather → /newbot → 봇 토큰 발급
 *   2. Telegram → @userinfobot → /start → 본인 chat ID 확인
 *   3. GitHub Secrets:
 *      - TELEGRAM_BOT_TOKEN
 *      - TELEGRAM_CHAT_ID
 *
 * 미설정 시: 알림 skip (graceful — workflow 실패 X)
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';

const REPO_ROOT = process.cwd();
const HEARTBEAT_PATH = resolve(REPO_ROOT, 'tmp/telegram-digest-heartbeat.json');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GH_TOKEN = process.env.GITHUB_TOKEN;
const GH_REPO = process.env.GITHUB_REPOSITORY || '0gam24/smartdatashop';

const ranAt = new Date().toISOString();
const ranAtKst = new Date(Date.now() + 9 * 60 * 60 * 1000);
const cutoffMs = Date.now() - 24 * 60 * 60 * 1000;

function writeHeartbeat(payload) {
  mkdirSync(dirname(HEARTBEAT_PATH), { recursive: true });
  writeFileSync(
    HEARTBEAT_PATH,
    JSON.stringify({ agent: 'telegram-digest', ranAt, ...payload }, null, 2) + '\n',
    'utf8',
  );
}

if (!BOT_TOKEN || !CHAT_ID) {
  console.log('[telegram-digest] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID 미설정 → skip');
  writeHeartbeat({ status: 'skip-no-credentials' });
  process.exit(0);
}

// ── 1. GitHub workflow runs 조회 (24h) ──────────────────────────────

async function fetchWorkflowRuns() {
  const url = `https://api.github.com/repos/${GH_REPO}/actions/runs?per_page=100&created=>${new Date(cutoffMs).toISOString().slice(0, 19)}Z`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${GH_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.workflow_runs || [];
}

// ── 2. 콘텐츠 발행 카운트 (24h 신규 펄스 / 인사이트) ────────────────

function countRecentContent() {
  const result = { pulse: 0, insight: 0, drafts: 0, recentPulses: [] };
  const cutoff = cutoffMs;

  // 펄스
  const pulseDir = resolve(REPO_ROOT, 'src/content/pulse');
  if (existsSync(pulseDir)) {
    for (const f of readdirSync(pulseDir).filter((x) => x.endsWith('.mdx'))) {
      const text = readFileSync(join(pulseDir, f), 'utf8');
      const m = text.match(/^publishedAt:\s*["']?([^"'\n]+)["']?\s*$/m);
      if (m && new Date(m[1]).getTime() >= cutoff) {
        result.pulse++;
        const tm = text.match(/^title:\s*["']([^"']+)["']/m);
        result.recentPulses.push(tm?.[1] || f.replace('.mdx', ''));
      }
    }
  }

  // 인사이트
  const insightDir = resolve(REPO_ROOT, 'src/content/insight');
  if (existsSync(insightDir)) {
    for (const f of readdirSync(insightDir).filter((x) => x.endsWith('.mdx'))) {
      const text = readFileSync(join(insightDir, f), 'utf8');
      const m = text.match(/^publishedAt:\s*["']?([^"'\n]+)["']?\s*$/m);
      if (m && new Date(m[1]).getTime() >= cutoff) result.insight++;
    }
  }

  // draft 대기
  const draftsDir = resolve(REPO_ROOT, 'daily-queue/drafts');
  if (existsSync(draftsDir)) {
    result.drafts = readdirSync(draftsDir).filter((x) => x.endsWith('.mdx')).length;
  }

  return result;
}

// ── 3. fact-check-queue 위험 신호 ──────────────────────────────────

function readFactCheckRisk() {
  const dir = resolve(REPO_ROOT, 'fact-check-queue');
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  if (files.length === 0) return null;
  const latest = files[files.length - 1];
  try {
    const data = JSON.parse(readFileSync(join(dir, latest), 'utf8'));
    return {
      date: latest.replace('.json', ''),
      mode: data.mode,
      audited: data.auditedCount,
      risk: data.summary?.risk,
      discrepancies: data.discrepancies?.length || 0,
    };
  } catch {
    return null;
  }
}

// ── 4. 텔레그램 메시지 조립 ────────────────────────────────────────

function buildMessage(runs, content, fc) {
  const kstDateStr = ranAtKst.toISOString().slice(0, 10);
  const kstTimeStr = ranAtKst.toTimeString().slice(0, 5);

  // 핵심 7 직원 — 키포인트만 짧게
  const STAFF = [
    { id: 'fetch-data', role: '정부 발표 수집' },
    { id: 'agent-writer', role: '펄스 본문 작성' },
    { id: 'agent-writer-insight', role: '주간 인사이트' },
    { id: 'agent-fact-check', role: '사실 점검' },
    { id: 'agent-publisher', role: '검색엔진 알림' },
    { id: 'sync-sister-mirrors', role: '자매 사이트 동기화' },
    { id: 'agent-scout', role: '시장 데이터 수집' },
  ];
  const STAFF_IDS = new Set(STAFF.map((s) => s.id));

  // 모든 run 집계
  const byName = {};
  for (const r of runs) {
    const name = r.name || 'unknown';
    byName[name] = byName[name] || { ok: 0, fail: 0, cancel: 0 };
    if (r.conclusion === 'success') byName[name].ok++;
    else if (r.conclusion === 'failure') byName[name].fail++;
    else if (r.conclusion === 'cancelled') byName[name].cancel++;
  }

  // 핵심 7 직원만 종합 카운트 (Lighthouse·build-check 등 부가 검증 제외)
  let totalOk = 0;
  let totalFail = 0;
  for (const st of STAFF) {
    const s = byName[st.id];
    if (s) {
      totalOk += s.ok;
      totalFail += s.fail;
    }
  }

  const lines = [];

  // 인사말
  lines.push(`*사장님, 좋은 아침이에요*`);
  lines.push(`${kstDateStr} ${kstTimeStr}`);
  lines.push(``);

  // 핵심 상태 한 줄
  if (totalFail === 0) {
    lines.push(`*모두 정상*`);
  } else {
    lines.push(`*${totalFail}건 실패 — 아래 확인*`);
  }
  lines.push(``);

  // 직원별 짧은 출근부
  const dayOfWeek = ranAtKst.getDay();
  for (const st of STAFF) {
    const s = byName[st.id];
    if (!s) {
      const isInsight = st.id === 'agent-writer-insight';
      if (isInsight && dayOfWeek !== 0) continue;
      lines.push(`- ${st.role} 0번`);
    } else {
      const failNote = s.fail > 0 ? ` (실패 ${s.fail})` : '';
      lines.push(`- ${st.role} ${s.ok}번${failNote}`);
    }
  }
  lines.push(``);

  // 운영 결과
  lines.push(`새 글 *${content.pulse}건* 발행`);
  if (content.insight > 0) {
    lines.push(`인사이트 *${content.insight}건* 발행`);
  }
  if (content.drafts > 0) {
    lines.push(`검수 대기 *${content.drafts}건*`);
  }

  // 신규 펄스 제목
  if (content.recentPulses.length > 0 && content.recentPulses.length <= 8) {
    lines.push(``);
    for (const t of content.recentPulses) {
      lines.push(`- ${t.slice(0, 55)}${t.length > 55 ? '…' : ''}`);
    }
  }

  // 위험 신호만 표시
  if (fc && fc.risk && (fc.risk.high || 0) > 0) {
    lines.push(``);
    lines.push(`*환각 위험 ${fc.risk.high}건 — 출처 보강 필요*`);
  }
  if (fc && fc.discrepancies > 0) {
    lines.push(``);
    lines.push(`*환각 의심 ${fc.discrepancies}건 — 즉시 확인*`);
  }

  // 실패 상세
  if (totalFail > 0) {
    lines.push(``);
    const failed = runs
      .filter((r) => r.conclusion === 'failure' && STAFF_IDS.has(r.name))
      .slice(0, 5);
    for (const r of failed) {
      const st = STAFF.find((s) => s.id === r.name);
      const label = st ? st.role : r.name;
      lines.push(`- ${label} — [확인](${r.html_url})`);
    }
  }

  // 푸터
  lines.push(``);
  lines.push(`[smartdatashop.kr](https://smartdatashop.kr)`);

  return lines.join('\n');
}

// ── 5. 텔레그램 sendMessage ────────────────────────────────────────

async function sendTelegram(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

// ── 메인 ───────────────────────────────────────────────────────────

async function main() {
  console.log(`[telegram-digest] ${ranAt} 시작`);

  let runs = [];
  try {
    runs = await fetchWorkflowRuns();
    console.log(`[telegram-digest] workflow runs ${runs.length}건 수집`);
  } catch (err) {
    console.error(`[telegram-digest] GitHub API 오류: ${err.message}`);
  }

  const content = countRecentContent();
  console.log(`[telegram-digest] 콘텐츠 — 펄스 +${content.pulse} / 인사이트 +${content.insight}`);

  const fc = readFactCheckRisk();
  if (fc) console.log(`[telegram-digest] fact-check ${fc.mode} ${fc.audited}건`);

  const message = buildMessage(runs, content, fc);

  try {
    const result = await sendTelegram(message);
    console.log(`[telegram-digest] ✓ 메시지 전송 — message_id ${result.result?.message_id}`);
    writeHeartbeat({
      status: 'ok',
      runs: runs.length,
      content,
      factCheck: fc,
      messageId: result.result?.message_id,
    });
  } catch (err) {
    console.error(`[telegram-digest] ✗ ${err.message}`);
    writeHeartbeat({ status: 'fail', error: err.message });
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[telegram-digest] FATAL:', err);
  writeHeartbeat({ status: 'fatal', error: String(err?.message ?? err) });
  process.exit(0); // graceful — workflow 후속 단계 보존
});
