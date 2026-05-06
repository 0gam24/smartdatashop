/**
 * IndexNow ping — Bing/Yandex/Naver(검토 중) 즉시 색인 알림 (Discover #3)
 *
 * 프로토콜: https://www.indexnow.org/documentation
 *   - 사이트가 자체 발급한 key 를 https://{host}/{key}.txt 에 호스팅
 *   - URL 변경 시 https://api.indexnow.org/IndexNow 에 POST
 *   - 별도 OAuth/API key 불필요 — 자기 검증 패턴
 *
 * 비용: 0 (무료, rate limit 관대)
 * 효과: Bing 색인 즉시 + Google 도 IndexNow URL 을 hint 로 쓰는 것으로 보고됨.
 *       신규 펄스 발행 → Discover 후보군 진입 lag 수시간 → 분 단위 단축 가능.
 */

const SITE = 'https://smartdatashop.kr';
const KEY = '13dec8276bdcd28efefae0bcf9f67879';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

/**
 * @param {string[]} urlList — 절대 URL 배열 (최대 10,000)
 * @returns {Promise<{ok: boolean, status: number, error?: string}>}
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
  const body = {
    host: SITE.replace(/^https?:\/\//, ''),
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'smartdatashop-publisher/1.0',
      },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err.message ?? String(err),
    };
  }
}
