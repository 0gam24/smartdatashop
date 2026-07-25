/**
 * IndexNow ping — Bing/Yandex + 네이버 즉시 색인 알림 (Discover #3)
 *
 * 프로토콜: https://www.indexnow.org/documentation
 *   - 사이트가 자체 발급한 key 를 https://{host}/{key}.txt 에 호스팅
 *   - URL 변경 시 참여 엔진 엔드포인트에 POST
 *   - 별도 OAuth/API key 불필요 — 자기 검증 패턴
 *
 * 엔드포인트 2곳에 모두 전송 (2026-07-25, H-네이버-공식가이드/10-IndexNow 반영):
 *   - api.indexnow.org — 프로토콜 공용 (참여 엔진 간 공유)
 *   - searchadvisor.naver.com/indexnow — 네이버 공식 문서가 지정한 자체 엔드포인트.
 *     벌크 POST {host,key,keyLocation,urlList} 1회 최대 10,000 URL, 응답
 *     200 성공 / 202 수신·키 확인 중 / 403 키 무효 / 422 URL-키 불일치.
 *     공용 엔드포인트 공유에 의존하지 않고 직접 전송해 Yeti 수집 대기 없이
 *     네이버 색인 요청을 보장한다.
 *
 * 비용: 0 (무료, rate limit 관대)
 * 효과: Bing 색인 즉시 + 네이버 신규 글 반영 가속 + Google hint 보고 사례.
 */

const SITE = 'https://smartdatashop.kr';
const KEY = '13dec8276bdcd28efefae0bcf9f67879';
const ENDPOINTS = [
  'https://api.indexnow.org/IndexNow',
  'https://searchadvisor.naver.com/indexnow',
];

/**
 * @param {string[]} urlList — 절대 URL 배열 (최대 10,000)
 * @returns {Promise<{ok: boolean, status: number, error?: string, endpoints?: Array<{endpoint: string, ok: boolean, status: number, error?: string}>}>}
 *   ok — 엔드포인트 중 1곳 이상 성공 시 true (기존 호출부 호환).
 *   status — 첫 성공 엔드포인트의 HTTP status (전부 실패면 첫 실패 status).
 *   endpoints — 엔드포인트별 상세 결과.
 */
export async function pingIndexNow(urlList) {
  if (!Array.isArray(urlList) || urlList.length === 0) {
    return { ok: false, status: 0, error: 'empty url list' };
  }
  // host 검증 — IndexNow 는 같은 도메인 URL 만 허용
  const sameHost = urlList.every((u) => u.startsWith(SITE));
  if (!sameHost) {
    return { ok: false, status: 0, error: 'mixed-host urlList' };
  }
  // keyLocation 은 명시하지 않는다 — 키 파일이 사이트 루트에 있으면 프로토콜상
  // 불필요하고, 네이버 엔드포인트는 루트 keyLocation 포함 시 422 "Invalid urls" 로
  // 거부하는 것을 실측 확인 (2026-07-25, 제외 시 200 정상).
  const body = JSON.stringify({
    host: SITE.replace(/^https?:\/\//, ''),
    key: KEY,
    urlList,
  });

  const endpoints = [];
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'smartdatashop-publisher/1.0',
        },
        body,
      });
      // 네이버는 202(수신·키 확인 중)도 정상 접수 — res.ok(2xx) 로 커버
      endpoints.push({ endpoint, ok: res.ok, status: res.status });
    } catch (err) {
      endpoints.push({
        endpoint,
        ok: false,
        status: 0,
        error: err.message ?? String(err),
      });
    }
  }

  const firstOk = endpoints.find((e) => e.ok);
  return {
    ok: Boolean(firstOk),
    status: firstOk ? firstOk.status : endpoints[0]?.status ?? 0,
    ...(firstOk ? {} : { error: endpoints.map((e) => `${e.endpoint}:${e.error ?? e.status}`).join(' | ') }),
    endpoints,
  };
}
