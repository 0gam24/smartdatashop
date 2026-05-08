/**
 * Korean formatting helpers used by both index and article pages.
 * DESIGN.md §3.3 한국 디테일 — 날짜 포맷 / 카테고리 활자 라벨.
 *
 * 모든 날짜·시간 출력은 Asia/Seoul (KST = UTC+9) 기준이다.
 * 빌드 환경(Cloudflare Pages는 UTC)의 로컬 타임존에 의존하지 않도록
 * Intl.DateTimeFormat에 timeZone을 명시한다.
 */

const KST = 'Asia/Seoul';

/**
 * KST 기준 연/월/일/시/분/요일 인덱스를 동시에 반환한다.
 * Date.getFullYear() 등 로컬 타임존 의존 메서드를 직접 쓰지 않기 위한 헬퍼.
 */
function kstParts(input: Date | string): {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  weekday: string;
} {
  const d = typeof input === 'string' ? new Date(input) : input;
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  });
  const parts = fmt.formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  // weekday: 'Sun'..'Sat' (en-CA 'short') → WEEKDAYS_KO 인덱스로 변환
  const weekdayMap: Record<string, string> = {
    Sun: '일', Mon: '월', Tue: '화', Wed: '수', Thu: '목', Fri: '금', Sat: '토',
  };
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    weekday: weekdayMap[get('weekday')] ?? '',
  };
}

/**
 * 2026-05-05T07:32:00+09:00 → "2026년 5월 5일 화"
 * (DESIGN.md §3.3 한국식 날짜 포맷, 마침표·점 없음)
 */
export function formatKoreanDate(input: Date | string): string {
  const { year, month, day, weekday } = kstParts(input);
  // 월·일은 0 패딩 제거
  return `${year}년 ${Number(month)}월 ${Number(day)}일 ${weekday}`;
}

/**
 * 2026-05-05T07:32:00+09:00 → "07:32"
 */
export function formatKoreanTime(input: Date | string): string {
  const { hour, minute } = kstParts(input);
  return `${hour}:${minute}`;
}

/**
 * 2026-05-05T07:32:00+09:00 → "2026년 5월 5일 화 · 07:32 발행"
 */
export function formatKoreanDateTime(input: Date | string): string {
  return `${formatKoreanDate(input)} · ${formatKoreanTime(input)} 발행`;
}

/**
 * 빌드 시점의 KST 오늘 날짜 — "2026년 5월 7일 목" 류.
 * Header / Footer / PolicyLayout 의 *오늘 날짜* 표시에 사용. 빌드 환경
 * (Cloudflare Pages = UTC) 의 타임존과 무관하게 KST 기준.
 *
 * 사이트가 hourly scout bot 으로 매시간 rebuild 되므로 사용자가 보는 날짜는
 * 항상 *최근 1시간 이내* 빌드 시점의 KST 날짜. 자정 직후 ~1시간 전후로만
 * 어제 표시 가능.
 */
/**
 * Masthead 호 번호 자동 계산 — KST 기준 사이트 창간일 (2026-01-01) 부터 오늘까지 일수 + 1.
 *
 * 사용처: Masthead / Footer 의 `vol` / `no` 자동 갱신 (이전: 'I' / '89' 하드코딩으로 stale).
 * 매일 자정 KST 에 자연스럽게 +1. 매시간 scout cron 빌드로 즉시 반영.
 *
 * @returns { vol: 'I', no: string }  — vol 은 첫 해 'I' 고정, 다음 해 'II' 등 (간단 매핑)
 */
export function mastheadIssueNumber(now: Date = new Date()): { vol: string; no: string } {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const FOUNDING_KST = new Date(Date.UTC(2026, 0, 1, 0, 0, 0)); // 2026-01-01 00:00 KST
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
  const kstFounding = new Date(FOUNDING_KST.getTime() + KST_OFFSET_MS);
  // 일자 단위 (날짜만 비교)
  const dayMs = 24 * 60 * 60 * 1000;
  const dayDiff = Math.floor(
    (Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()) -
      Date.UTC(kstFounding.getUTCFullYear(), kstFounding.getUTCMonth(), kstFounding.getUTCDate())) /
      dayMs,
  );
  const no = String(Math.max(1, dayDiff + 1));
  // 첫 해는 'I', 다음 해 'II', ... (간단 로마자 매핑)
  const yearOffset = kstNow.getUTCFullYear() - kstFounding.getUTCFullYear();
  const VOL_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const vol = VOL_ROMAN[yearOffset] ?? `${yearOffset + 1}`;
  return { vol, no };
}

export function formatKoreanToday(): string {
  return formatKoreanDate(new Date());
}

/**
 * 빌드 시점의 KST 오늘 YYYY-MM-DD — pulse publishedAt 비교용 (오늘의 글 카운트).
 */
export function kstTodayIso(): string {
  const { year, month, day } = kstParts(new Date());
  return `${year}-${month}-${day}`;
}

export type Category = 'policy' | 'tax-finance' | 'market' | 'stats' | 'ai-tech';

/**
 * 카테고리 enum → 활자 라벨.
 * 자간 0.15em + 한 글자씩 띄어쓴 효과는 CSS letter-spacing으로 처리되지만,
 * 시안의 "정 책" / "세 금 · 금 융" 같은 글자 사이 공백은 디자인 시스템에서
 * 시안용으로 직접 공백을 넣은 것이므로 동일하게 유지한다.
 */
const CATEGORY_KO: Record<Category, string> = {
  policy: '정 책',
  'tax-finance': '세 금 · 금 융',
  market: '시 장',
  stats: '통 계',
  'ai-tech': 'A I · 기 술',
};

export function categoryToKorean(slug: Category): string {
  return CATEGORY_KO[slug];
}

/**
 * KST 기준 발행일에서 연/월/일 문자열을 추출한다 — 동적 라우트의
 * getStaticPaths에서 path params를 만들 때, 그리고 RelatedList의
 * "YYYY.MM.DD" 표기에서 사용한다.
 *
 * Date.getFullYear/getMonth/getDate는 빌드 환경의 로컬 타임존을 따르므로
 * Cloudflare Pages(UTC)와 로컬 KST에서 결과가 달라진다 — 그 버그를
 * 막기 위해 본 헬퍼만 사용한다.
 */
export function pulseDateParts(publishedAt: Date | string): {
  year: string;
  month: string;
  day: string;
} {
  const { year, month, day } = kstParts(publishedAt);
  return { year, month, day };
}

/**
 * 펄스 글 URL: /YYYY/MM/DD/slug/ (PLANNING.md §9.1)
 * KST 기준 발행일을 path에 사용한다.
 * 빌드 환경 타임존(Cloudflare Pages = UTC)과 무관하게 일관된 URL이 생성되어야 한다.
 */
export function pulseUrl(slug: string, publishedAt: Date | string): string {
  const { year, month, day } = pulseDateParts(publishedAt);
  return `/${year}/${month}/${day}/${slug}/`;
}

/**
 * 본문 5분 읽기 추정. 한국어 평균 350자/분.
 */
export function estimateReadingTime(text: string): number {
  const charCount = text.replace(/\s/g, '').length;
  return Math.max(1, Math.round(charCount / 350));
}

/**
 * 인사이트 글 URL: /insight/[slug]/ (PLANNING.md §9.2)
 * 펄스와 달리 날짜를 path에 포함하지 않는다 — evergreen 성격이라
 * 발행일이 URL 식별자로 의미 있지 않기 때문.
 */
export function insightUrl(slug: string): string {
  return `/insight/${slug}/`;
}
