/**
 * scripts/agents/shared/claude-client.mjs
 *
 * Claude API 호출을 감싸는 공용 헬퍼 (M0 단계: 스텁).
 *
 * 입력 (callClaude 인자):
 *   - model:         string  사용할 Claude 모델 ID (예: "claude-opus-4-7")
 *   - systemPrompt:  string  시스템 프롬프트
 *   - userPrompt:    string  사용자 프롬프트
 *
 * 출력 (callClaude 반환):
 *   - Promise<string>        모델의 텍스트 응답 — M1+에서 실제 SDK로 구현 예정
 *
 * 본 파일은 의존성 추가(@anthropic-ai/sdk) 전 단계의 자리표시자이며,
 * 호출 시 의도적으로 throw 하여 실제 호출이 누락된 채 배포되는 것을 방지한다.
 */

/**
 * @param {{ model: string, systemPrompt: string, userPrompt: string }} _args
 * @returns {Promise<string>}
 */
export async function callClaude(_args) {
  throw new Error('아직 구현되지 않은 스텁: scripts/agents/shared/claude-client.mjs (M1+에서 구현 예정)');
}

export default { callClaude };
