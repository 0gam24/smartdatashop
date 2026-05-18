/**
 * notify-publish-success.mjs — PR auto-merge 성공 후 Telegram "발행 완료" 발송.
 *
 * Bug A fix (2026-05-17): 이전엔 writer.mjs 가 fact-check ok 시점에 직접
 * Telegram 발송했으나, 이후 verify:strict / build / PR 단계가 실패하면 workspace
 * 폐기로 실제 발행 안 되는데 메시지만 송신되는 가짜 신호 문제.
 *
 * 본 스크립트는 writer.yml 의 마지막 step 으로 호출 — auto-merge 가 실제 성공한
 * 경우에만 실행. tmp/writer-publish-marker.json 에서 발행 목록 읽어서 알림.
 *
 * marker 가 없으면 (writer 가 발행 0건 + auto-publish off 등) silent skip.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const MARKER_PATH = resolve(process.cwd(), 'tmp/writer-publish-marker.json');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PR_NUMBER = process.env.PR_NUMBER ?? '';

if (!existsSync(MARKER_PATH)) {
  console.log('[notify-publish] marker 없음 — 발행 0건, skip');
  process.exit(0);
}

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.log('[notify-publish] Telegram secret 미설정 — skip');
  process.exit(0);
}

const marker = JSON.parse(readFileSync(MARKER_PATH, 'utf8'));
const published = Array.isArray(marker.published) ? marker.published : [];

if (published.length === 0) {
  console.log('[notify-publish] marker.published 비어있음 — skip');
  process.exit(0);
}

const lines = [`*자동 발행 ${published.length}건 완료*`, ''];
for (const p of published.slice(0, 8)) {
  const name = (p.to ?? p.from ?? '').slice(0, 60);
  lines.push(`- ${name}`);
}
lines.push('');
if (PR_NUMBER) lines.push(`PR #${PR_NUMBER} 머지 완료`);
lines.push('[smartdatashop.kr](https://smartdatashop.kr)');

const message = lines.join('\n');

try {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[notify-publish] Telegram API ${res.status}: ${body.slice(0, 200)}`);
    process.exit(0); // 알림 실패가 빌드 실패로 이어지지 않도록
  }
  console.log(`[notify-publish] ✓ ${published.length}건 알림 송신`);
} catch (err) {
  console.error(`[notify-publish] ${err.message}`);
  process.exit(0);
}
