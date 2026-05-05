/**
 * Korean formatting helpers used by both index and article pages.
 * DESIGN.md §3.3 한국 디테일 — 날짜 포맷 / 카테고리 활자 라벨.
 */

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 2026-05-05 → "2026년 5월 5일 화"
 * (DESIGN.md §3.3 한국식 날짜 포맷, 마침표·점 없음)
 */
export function formatKoreanDate(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}`;
}

/**
 * 2026-05-05T07:32:00 → "07:32"
 */
export function formatKoreanTime(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * 2026-05-05T07:32:00 → "2026년 5월 5일 화 · 07:32 발행"
 */
export function formatKoreanDateTime(input: Date | string): string {
  return `${formatKoreanDate(input)} · ${formatKoreanTime(input)} 발행`;
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
 * 펄스 글 URL: /YYYY/MM/DD/slug/ (PLANNING.md §9.1)
 * 빌드시 publishedAt에서 날짜를 추출해 동적 라우트로 보낸다.
 */
export function pulseUrl(slug: string, publishedAt: Date | string): string {
  const d = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `/${yyyy}/${mm}/${dd}/${slug}/`;
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
