/**
 * 한국어 데이터 저널리즘 사이트 — 숫자/날짜/퍼센트/통화 포맷 라이브러리.
 *
 * 모든 함수는 순수 함수이며, SSR 안전(DOM 의존성 없음).
 * 모든 시간 계산은 Asia/Seoul 타임존에 고정 — src/lib/korean.ts와 정책 일치.
 *
 * 설계 원칙:
 * - 트리 셰이킹 가능 (named export, 모듈 최상위 부수효과 없음)
 * - Intl API만 사용 (외부 의존성 0)
 * - JSDoc로 엣지 케이스 문서화
 *
 * 참고: 마이너스 부호는 ASCII 하이픈(-)이 아닌 유니코드 minus(U+2212, "−")를
 * 사용한다 — 활자 조판 품질을 위해. delta 표시(formatDelta)에서 일관 적용.
 */

const KST = 'Asia/Seoul';
const MINUS = '−'; // U+2212 MINUS SIGN

/**
 * 숫자에 ko-KR 천 단위 구분 기호(,)를 적용한다.
 *
 * 1234 → "1,234"
 * 12345.67 → "12,345.67"
 * 0 → "0"
 * -1234 → "-1,234" (ASCII 하이픈; delta 표시는 formatDelta 사용)
 *
 * 엣지 케이스:
 * - NaN → "NaN" (Intl 기본 동작)
 * - Infinity → "∞"
 * - fractionDigits 미지정 시 정수만 천 단위 구분, 소수는 그대로 (소수점 반올림 없음)
 * - fractionDigits 지정 시 minimum=maximum으로 고정 → 항상 그 자릿수
 */
export function formatNumber(
  n: number,
  options?: { fractionDigits?: number },
): string {
  if (!Number.isFinite(n)) {
    return new Intl.NumberFormat('ko-KR').format(n);
  }
  const fd = options?.fractionDigits;
  if (typeof fd === 'number') {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: fd,
      maximumFractionDigits: fd,
    }).format(n);
  }
  return new Intl.NumberFormat('ko-KR').format(n);
}

/**
 * 큰 수를 한국어 단위(만/억/조/경) 경계로 분할 표기한다.
 *
 * 1234 → "1,234"
 * 10000 → "1만"
 * 12345 → "1만 2,345"
 * 100000 → "10만"
 * 12345678 → "1,234만 5,678"
 * 100000000 → "1억"
 * 123000000 → "1억 2,300만"
 * 1234567890123 → "1조 2,345억 6,789만 123"
 *
 * compact: true → 가장 큰 단위만 표시하고 나머지는 잘라냄.
 *   12345 → "1만+", 100000 → "10만", 12345678 → "1,234만+"
 *   ('+' 기호로 절단 사실을 표시; 정확히 단위 경계면 '+' 없음)
 *
 * 엣지 케이스:
 * - 음수 처리: 부호 분리 → "−1억 2,000만" (U+2212 사용)
 * - NaN/Infinity → formatNumber로 폴백
 * - 0 → "0"
 * - 소수: 절대값이 만 미만이면 formatNumber로 폴백 (단위 분할 의미 없음)
 *   만 이상이면 정수부만 분할 (저널리즘 표기상 만 단위 이상은 소수 의미 옅음)
 */
export function formatKoreanNumber(
  n: number,
  options?: { compact?: boolean },
): string {
  if (!Number.isFinite(n)) return formatNumber(n);
  if (n === 0) return '0';

  const negative = n < 0;
  const abs = Math.abs(n);

  // 만 미만은 그대로 천 단위 구분
  if (abs < 10000) {
    return (negative ? MINUS : '') + formatNumber(abs);
  }

  const compact = options?.compact === true;

  // 단위: 작은 → 큰. 1만, 1억(만^2), 1조(만^3), 1경(만^4).
  // BigInt를 써서 큰 수에서도 정밀도 손실이 없도록.
  const intPart = Math.floor(abs);
  const big = BigInt(intPart);
  const M = 10000n;
  const units = ['', '만', '억', '조', '경'] as const;

  // 4자리(만 단위)씩 잘라서 chunks에 저장 (작은 단위부터)
  const chunks: bigint[] = [];
  let rest = big;
  while (rest > 0n) {
    chunks.push(rest % M);
    rest = rest / M;
  }
  // 경(units[4])보다 큰 단위는 표기하지 않는다 — chunks[4..] 가 있으면
  // 그 값을 chunks[4]에 합쳐 "X경"으로 남긴다.
  while (chunks.length > units.length) {
    const overflow = chunks.pop() as bigint;
    chunks[chunks.length - 1] += overflow * M;
  }

  if (compact) {
    // 가장 큰 비-제로 단위만 출력
    const topIdx = chunks.length - 1;
    const topVal = chunks[topIdx];
    const lowerNonZero = chunks.slice(0, topIdx).some((c) => c !== 0n);
    const head = formatNumber(Number(topVal)) + units[topIdx];
    const truncated = lowerNonZero ? '+' : '';
    return (negative ? MINUS : '') + head + truncated;
  }

  // 풀 표기: 큰 단위부터 0이 아닌 청크만 모아 공백으로 연결
  const parts: string[] = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    const v = chunks[i];
    if (v === 0n) continue;
    parts.push(formatNumber(Number(v)) + units[i]);
  }
  return (negative ? MINUS : '') + parts.join(' ');
}

/**
 * 비율(0..1)을 퍼센트 문자열로 변환한다.
 *
 * 0.123 → "12.3%"
 * 0.005 → "0.5%"
 * 1 → "100%"
 * 0 → "0%"
 * -0.05 → "-5%"
 *
 * 기본 fractionDigits 정책:
 * - 절대값이 0.1 미만(=10% 미만)이면 1자리, 그 이상이면 1자리 유지
 *   → 일관성을 위해 기본 1자리로 통일 (단, 정수로 떨어지면 소수 생략)
 * - fractionDigits를 명시하면 항상 그 자릿수
 *
 * 엣지 케이스:
 * - NaN → "NaN%"
 * - Intl 'percent' 스타일은 자동으로 100배 곱한 뒤 % 부착 (반올림 처리도 자동)
 */
export function formatPercent(
  ratio: number,
  options?: { fractionDigits?: number },
): string {
  if (!Number.isFinite(ratio)) {
    if (Number.isNaN(ratio)) return 'NaN%';
    return ratio > 0 ? '∞%' : `${MINUS}∞%`;
  }
  const fd = options?.fractionDigits;
  if (typeof fd === 'number') {
    return new Intl.NumberFormat('ko-KR', {
      style: 'percent',
      minimumFractionDigits: fd,
      maximumFractionDigits: fd,
    }).format(ratio);
  }
  // 기본: 정수 % 면 소수 생략, 아니면 최대 1자리 (단 5.21% 같은 경우 2자리까지)
  // 실제 명세 예: 0.0521 → "5.21%" → 2자리까지 허용.
  // 정책: maximumFractionDigits=2, minimumFractionDigits=0 (필요한 만큼만)
  return new Intl.NumberFormat('ko-KR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(ratio);
}

/**
 * 원화 통화 표기.
 *
 * compact: false (기본):
 *   1234 → "1,234원"
 *   12345 → "1만 2,345원"
 *   12345678 → "1,234만 5,678원"
 *
 * compact: true:
 *   1234 → "1,234원"
 *   12345 → "1.2만 원"
 *   123456789 → "1.2억 원"
 *   (소수 1자리, 단위와 '원' 사이 공백)
 *
 * 엣지 케이스:
 * - 음수: 부호 분리 → "−1,234원"
 * - NaN/Infinity → "NaN원" / "∞원"
 * - 0 → "0원"
 * - 소수: compact=false에서는 정수부만 사용 (원 단위는 소수 무의미)
 */
export function formatKRW(
  amount: number,
  options?: { compact?: boolean },
): string {
  if (!Number.isFinite(amount)) {
    return `${formatNumber(amount)}원`;
  }
  const negative = amount < 0;
  const abs = Math.abs(amount);
  const compact = options?.compact === true;

  if (compact && abs >= 10000) {
    // 가장 큰 단위만, 소수 1자리
    const M = 10000;
    const tiers: Array<{ value: number; label: string }> = [
      { value: M ** 4, label: '경' },
      { value: M ** 3, label: '조' },
      { value: M ** 2, label: '억' },
      { value: M, label: '만' },
    ];
    for (const tier of tiers) {
      if (abs >= tier.value) {
        const v = abs / tier.value;
        // 소수 1자리, 정수면 정수만
        const fixed = v >= 100 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, '');
        return (negative ? MINUS : '') + `${fixed}${tier.label} 원`;
      }
    }
  }

  // 풀 표기: 정수부만 한국어 단위 분할
  const intPart = Math.floor(abs);
  const head = formatKoreanNumber(intPart);
  return (negative ? MINUS : '') + `${head}원`;
}

/**
 * 증감 표시용 sign + 절대값 + CSS 클래스 한 묶음.
 *
 * +5 → { sign: '+', value: '5', cls: 'delta-up' }
 * -5 → { sign: '−', value: '5', cls: 'delta-down' }   (U+2212)
 * 0 → { sign: '', value: '0', cls: 'delta-flat' }
 *
 * showZeroSign: true면 0에도 부호 부여(±)는 하지 않고 '+0' (요청 시 사용)
 *
 * 엣지 케이스:
 * - NaN → { sign: '', value: 'NaN', cls: 'delta-flat' }
 * - 소수: 절대값에 천 단위 구분 적용. -24.6 → "24.6"
 */
export function formatDelta(
  n: number,
  options?: { showZeroSign?: boolean },
): {
  sign: string;
  value: string;
  cls: 'delta-up' | 'delta-down' | 'delta-flat';
} {
  if (Number.isNaN(n)) {
    return { sign: '', value: 'NaN', cls: 'delta-flat' };
  }
  if (n === 0) {
    return {
      sign: options?.showZeroSign === true ? '+' : '',
      value: '0',
      cls: 'delta-flat',
    };
  }
  const abs = Math.abs(n);
  // 정수면 그대로, 아니면 소수 보존하여 천 단위 구분
  const value = Number.isInteger(abs) ? formatNumber(abs) : formatNumber(abs);
  if (n > 0) {
    return { sign: '+', value, cls: 'delta-up' };
  }
  return { sign: MINUS, value, cls: 'delta-down' };
}

/**
 * KST 기준 두 시점 사이 일 수 차이 (자연수, 항상 ≥ 0).
 * 같은 KST 날짜이면 0, 하루 차이면 1, …
 *
 * 시각/타임존 영향 없이 KST 자정 기준으로 잘라서 비교한다.
 *
 * 엣지 케이스:
 * - a, b의 순서 무관 (절대값)
 * - 잘못된 날짜 입력 → NaN
 */
export function daysBetweenKST(a: Date | string, b: Date | string): number {
  const ka = kstYMD(a);
  const kb = kstYMD(b);
  if (!ka || !kb) return NaN;
  // UTC 자정 기준 epoch days로 변환 — DST 없어 단순 차감.
  const ea = Date.UTC(ka.y, ka.m - 1, ka.d);
  const eb = Date.UTC(kb.y, kb.m - 1, kb.d);
  return Math.abs(Math.round((ea - eb) / 86400000));
}

/**
 * KST 기준 상대 시간 표기.
 *
 * - 60초 미만: "방금 전"
 * - 1분 ~ 59분: "N분 전" / "N분 후"
 * - 1시간 ~ 23시간: "N시간 전" / "N시간 후"
 * - 어제 / 오늘 / 내일: 자연어
 * - 2~6일 전/후: "N일 전" / "N일 후"
 * - 같은 주 내 다른 요일은 일 단위로 처리 (위의 규칙)
 * - 7일 이상: 절대 날짜 "M월 D일" (다른 해면 "YYYY년 M월 D일")
 *
 * 엣지 케이스:
 * - now 미지정 시 new Date()
 * - input이 미래(now보다 큼)면 "후" 사용
 * - 잘못된 입력 → ""
 */
export function formatRelativeTime(input: Date | string, now?: Date): string {
  const target = typeof input === 'string' ? new Date(input) : input;
  const reference = now ?? new Date();
  if (!(target instanceof Date) || Number.isNaN(target.getTime())) return '';
  if (Number.isNaN(reference.getTime())) return '';

  const diffMs = target.getTime() - reference.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  const rtf = new Intl.RelativeTimeFormat('ko-KR', { numeric: 'auto' });

  if (absSec < 60) {
    // numeric:'auto' 가 0초를 "지금"으로 처리할 수 있어 자체 문구 사용
    if (diffSec === 0) return '방금 전';
    // 1~59초도 사이트 정책상 "방금 전"으로 통일
    return diffSec < 0 ? '방금 전' : '잠시 후';
  }

  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) {
    return rtf.format(diffMin, 'minute');
  }

  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) {
    return rtf.format(diffHour, 'hour');
  }

  // 일 단위 — KST 자정 기준 차이를 사용 (시각이 아닌 날짜 차)
  const dayDiff = kstDayDiff(target, reference);
  if (Math.abs(dayDiff) < 7) {
    // numeric:'auto' → 1=어제/내일, 0=오늘
    return rtf.format(dayDiff, 'day');
  }

  // 7일 이상 — 절대 날짜 폴백
  const t = kstYMD(target);
  const r = kstYMD(reference);
  if (!t || !r) return '';
  if (t.y !== r.y) {
    return `${t.y}년 ${t.m}월 ${t.d}일`;
  }
  return `${t.m}월 ${t.d}일`;
}

/**
 * KST 기준 한국식 12시간제 시각 표기.
 *
 * "2026-05-05T07:32:00+09:00" → "오전 7시 32분"
 * "2026-05-05T19:05:00+09:00" → "오후 7시 5분"
 *
 * 엣지 케이스:
 * - 0시 (자정) → "오전 12시 0분"
 * - 12시 (정오) → "오후 12시 0분"
 * - 잘못된 입력 → ""
 */
export function formatKoreanClock(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '';

  // KST의 시/분과 오전/오후 판정
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: KST,
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  const parts = fmt.formatToParts(d);
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '';
  const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value ?? '';

  const period = dayPeriod.toUpperCase().includes('AM') ? '오전' : '오후';
  const h = Number(hour);
  const m = Number(minute);
  return `${period} ${h}시 ${m}분`;
}

/**
 * 한국어 단위가 섞인 문자열에서 비교 가능한 숫자를 추출한다.
 * 표 셀 정렬용.
 *
 * "1만 2,345" → 12345
 * "1억 2,300만" → 123000000
 * "1조" → 1000000000000
 * "1,234" → 1234
 * "−1만" → -10000
 * "abc" → NaN
 *
 * 엣지 케이스:
 * - 빈 문자열, 공백만 → NaN
 * - U+2212 마이너스 부호도 인식
 * - "원" 등 접미 통화기호는 무시
 * - 단위가 없으면 천 단위 구분만 제거하고 숫자 변환
 */
export function parseKoreanNumber(s: string): number {
  if (typeof s !== 'string') return NaN;
  const trimmed = s.trim();
  if (trimmed === '') return NaN;

  // 부호 감지 (ASCII '-' 와 U+2212 둘 다)
  let negative = false;
  let body = trimmed;
  if (body.startsWith('-') || body.startsWith(MINUS)) {
    negative = true;
    body = body.slice(1).trim();
  }

  // '원'·'+' 제거 (compact 표기의 '1,234만+' 같은 형태 대응)
  body = body.replace(/원|\+|\s원/g, '').trim();

  const unitMap: Record<string, bigint> = {
    만: 10000n,
    억: 100000000n,
    조: 1000000000000n,
    경: 10000000000000000n,
  };

  // "X단위 Y단위 ... Z" 형태로 토큰화: 숫자(쉼표/소수점) + 선택적 단위
  // 단위 없는 마지막 잔여 숫자는 1의 자리.
  const tokenRe = /([0-9][0-9,]*(?:\.[0-9]+)?)\s*([만억조경])?/g;
  let total = 0n;
  let matched = false;
  let lastIndex = 0;

  for (;;) {
    const m = tokenRe.exec(body);
    if (!m) break;
    matched = true;
    // 토큰 사이 공백 외 다른 문자가 끼면 invalid
    const between = body.slice(lastIndex, m.index);
    if (between.replace(/\s/g, '') !== '') return NaN;
    lastIndex = m.index + m[0].length;

    const numStr = m[1].replace(/,/g, '');
    const numVal = Number(numStr);
    if (!Number.isFinite(numVal)) return NaN;

    const unit = m[2];
    if (unit) {
      const factor = unitMap[unit];
      // 소수 가능성 → BigInt 곱 시 손실 방지 위해 number 곱 후 BigInt 변환
      const product = Math.round(numVal * Number(factor));
      total += BigInt(product);
    } else {
      total += BigInt(Math.round(numVal));
    }
  }

  // 남은 꼬리 문자 검증
  if (!matched) return NaN;
  if (body.slice(lastIndex).replace(/\s/g, '') !== '') return NaN;

  const out = Number(total);
  return negative ? -out : out;
}

// =====================================================================
// 내부 헬퍼 — KST 날짜 추출
// =====================================================================

interface KSTYMD {
  y: number;
  m: number;
  d: number;
}

function kstYMD(input: Date | string): KSTYMD | null {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.formatToParts(d);
  const y = Number(parts.find((p) => p.type === 'year')?.value);
  const m = Number(parts.find((p) => p.type === 'month')?.value);
  const day = Number(parts.find((p) => p.type === 'day')?.value);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) return null;
  return { y, m, d: day };
}

/**
 * KST 자정 기준 일 수 차이(target - reference). 부호 보존.
 */
function kstDayDiff(target: Date, reference: Date): number {
  const t = kstYMD(target);
  const r = kstYMD(reference);
  if (!t || !r) return NaN;
  const et = Date.UTC(t.y, t.m - 1, t.d);
  const er = Date.UTC(r.y, r.m - 1, r.d);
  return Math.round((et - er) / 86400000);
}

// =====================================================================
// @internal — DEV 모드 sanity check (트리 셰이킹으로 prod 번들에서 제거됨)
// =====================================================================

/**
 * @internal — 빌드에 영향 없는 self-test. 회귀 시 콘솔 에러 발생.
 * import.meta.env.DEV 가 true 인 Astro/Vite 개발 서버에서만 동작.
 * 본 모듈을 import하는 곳이 없으면 dead code로 tree-shake.
 */
if (
  typeof import.meta !== 'undefined' &&
  import.meta.env !== undefined &&
  import.meta.env.DEV === true &&
  typeof console !== 'undefined'
) {
  const checks: Array<[string, unknown, unknown]> = [
    ['formatNumber(1234)', formatNumber(1234), '1,234'],
    ['formatKoreanNumber(12345)', formatKoreanNumber(12345), '1만 2,345'],
    ['formatKoreanNumber(100000000)', formatKoreanNumber(100000000), '1억'],
    ['formatPercent(0.0521)', formatPercent(0.0521), '5.21%'],
    ['formatDelta(-5).sign', formatDelta(-5).sign, MINUS],
  ];
  for (const [label, actual, expected] of checks) {
    if (actual !== expected) {
      console.error(
        `[format.ts self-test] ${label} → ${String(actual)} (expected ${String(expected)})`,
      );
    }
  }
}
