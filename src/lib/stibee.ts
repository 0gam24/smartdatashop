/**
 * Stibee 뉴스레터 구독 클라이언트 헬퍼
 *
 * 사용처: src/components/NewsletterCTA.astro
 *
 * 환경 변수:
 *   PUBLIC_STIBEE_LIST_ID — Stibee 리스트 고유 ID. .env 파일에 설정.
 *     e.g. PUBLIC_STIBEE_LIST_ID=abcd1234efgh
 *
 *   미설정 시 NewsletterCTA는 fallback 모드(로컬 성공 메시지만 표시)로 동작.
 *
 * Stibee Lite/Pro 모두 인증 없이 public subscribe 엔드포인트 사용 가능.
 *   POST https://lite.stibee.com/api/v1.0/lists/{LIST_ID}/public/subscribers
 */

export interface SubscribeResult {
  ok: boolean;
  message: string;
}

const STIBEE_ENDPOINT = (listId: string) =>
  `https://lite.stibee.com/api/v1.0/lists/${listId}/public/subscribers`;

/**
 * 이메일 구독 요청. CORS-safe POST as form-encoded body to mirror Stibee public form.
 *
 * @param email 구독 이메일
 * @param listId Stibee 리스트 ID. falsy면 fallback 성공 응답.
 * @param honeypot 봇 검출용 honeypot 필드 값 — 비어 있어야 함
 */
export async function subscribe(
  email: string,
  listId: string | undefined,
  honeypot: string = '',
): Promise<SubscribeResult> {
  // 봇 차단 (honeypot이 채워져 있으면 거부, 사용자에게는 성공처럼 표시)
  if (honeypot && honeypot.trim().length > 0) {
    return { ok: true, message: '구독 완료 ✓' };
  }

  // 이메일 형식 1차 검증 (서버 검증과 별개로 친절한 메시지)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: '올바른 이메일 주소를 입력해주세요.' };
  }

  // listId 미설정 시 fallback (개발/프리뷰 환경)
  if (!listId) {
    return { ok: true, message: '구독 완료 ✓' };
  }

  try {
    const body = JSON.stringify({
      subscriber: { email },
      groupIds: [],
      _subscribe_form_email: '',
    });

    const res = await fetch(STIBEE_ENDPOINT(listId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      mode: 'cors',
    });

    if (res.ok) {
      return { ok: true, message: '구독 완료 ✓' };
    }

    // Stibee는 4xx에서 한국어 메시지를 종종 포함
    let serverMessage = '';
    try {
      const data = await res.json();
      serverMessage = data?.message || data?.error || '';
    } catch {
      // JSON 파싱 실패 무시
    }

    return {
      ok: false,
      message: serverMessage || '구독 처리에 실패했습니다. 잠시 후 다시 시도해주세요.',
    };
  } catch (err) {
    return {
      ok: false,
      message: '네트워크 오류로 구독 요청을 보내지 못했습니다.',
    };
  }
}
