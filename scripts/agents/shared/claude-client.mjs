/**
 * scripts/agents/shared/claude-client.mjs
 *
 * Anthropic Messages API 호출 헬퍼 (native fetch 사용 — SDK 의존성 없음).
 *
 * 입력:
 *   - model:        Claude 모델 ID (예: 'claude-sonnet-4-6')
 *   - systemPrompt: 시스템 프롬프트
 *   - userPrompt:   사용자 프롬프트
 *   - maxTokens:    응답 토큰 상한 (기본 2000)
 *   - apiKey:       Anthropic API 키 (미지정 시 ANTHROPIC_API_KEY 환경변수)
 *
 * 출력:
 *   - { text, usage, model } — 모델 응답 텍스트 + 토큰 사용량
 *
 * 에러:
 *   - API 키 없음 → throw
 *   - HTTP 오류 → throw (status + 본문 일부)
 *   - 빈 응답 → throw
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';

/**
 * @param {{
 *   model: string,
 *   systemPrompt: string,
 *   userPrompt: string,
 *   maxTokens?: number,
 *   apiKey?: string,
 * }} args
 * @returns {Promise<{ text: string, usage: object, model: string }>}
 */
export async function callClaude({ model, systemPrompt, userPrompt, maxTokens = 2000, apiKey }) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY 미설정 — claude-client.callClaude() 호출 불가');
  }
  if (!model) throw new Error('model 필수');
  if (!userPrompt) throw new Error('userPrompt 필수');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': API_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error(`Empty response: ${JSON.stringify(data).slice(0, 200)}`);
  }

  return {
    text: text.trim(),
    usage: data.usage || {},
    model: data.model || model,
  };
}

export default { callClaude };
