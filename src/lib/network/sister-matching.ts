/**
 * 메인 카테고리 → 자매 매칭.
 *
 * 입력: data/network-index.json (sync-sister-mirrors workflow 가 매일 02:00 KST 갱신)
 * 위계: docs/CATEGORY_MAP.md §2 (메인 → 자매 매핑 매트릭스) — 본 파일이 그 코드 박힘.
 *
 * 자매별 mirror.json schema 가 다름 — 자매 ID 별로 필드 분기:
 *   - calculatorhost: post.category ∈ {tax, finance, work, real-estate, lifestyle, glossary}
 *   - iknowhowinfo:   post.category ∈ {pulse, surge, flow, income, breaking}
 *   - awoo:           post.category 는 한글 (복지·교육·취업 등) — persona 배열로 매칭
 *   - moneylook:      post.mainCategory ∈ {tax-finance, policy} — 메인 카테고리 직접 매핑
 *
 * CATEGORY_MAP §6: 메인 펄스 1편당 최대 분배 자매 = 3.
 * CATEGORY_MAP §4: 매칭 점수 ≥ 6 만 표시 (< 4 분배 제외 / 4-5 분배 보류).
 */

// repo-root/data/network-index.json — Astro/Vite 가 src/ 외부 .json import 허용.
// 매일 02:00 KST sync-sisters.yml 이 갱신 → import 자동 최신.
import networkIndexRaw from '../../../data/network-index.json';

// ─────────────────────────────────────────────────────────────
// 타입 정의 — network-index.json 의 실제 schema 반영
// ─────────────────────────────────────────────────────────────

export type MainCategory = 'policy' | 'tax-finance' | 'market' | 'stats' | 'ai-tech';

export interface AggregatePost {
  url: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  // 자매별 schema 차이 — optional 처리
  category?: string;        // calc / ikhi / awoo
  cluster?: string;         // moneylook
  mainCategory?: string;    // moneylook
  persona?: string | string[]; // awoo (배열) / moneylook (단일)
  // 통합 시 주입
  sisterId: string;
  sisterDomain: string;
}

export interface SisterMeta {
  id: string;
  siteName?: string;
  domain: string | null;
  persona: string;
  isCommercial: boolean;
  status: 'ok' | 'fail';
  totalPosts: number;
  categories: string[];
}

interface NetworkIndex {
  networkName: string;
  mainSite: string;
  lastSyncedAt: string;
  totalSisters: number;
  successfulSyncs: number;
  failedSyncs: number;
  sisters: SisterMeta[];
  aggregateTotalPosts: number;
  aggregatePosts: AggregatePost[];
}

const networkIndex = networkIndexRaw as unknown as NetworkIndex;

// ─────────────────────────────────────────────────────────────
// 매칭 결과
// ─────────────────────────────────────────────────────────────

export interface SisterMatch {
  sisterId: string;
  sisterName: string;
  sisterDomain: string;
  matchScore: number;
  matchedPosts: Array<{
    url: string;
    title: string;
    summary?: string;
  }>;
  /** 디버그/툴팁용 — 어느 자매 카테고리가 매칭됐는지 */
  matchReason: string;
}

// ─────────────────────────────────────────────────────────────
// 자매별 매칭 함수 — CATEGORY_MAP §2 정합
// ─────────────────────────────────────────────────────────────

/** calculatorhost 카테고리 → 메인 카테고리 매핑 (CATEGORY_MAP §2) */
const CALC_MATCH: Record<MainCategory, string[]> = {
  'tax-finance': ['tax', 'finance', 'work'],     // §2.2 calc tax/business (점수 10)
  'market': ['finance'],                          // §2.3 calc general 환율·금리 (7)
  'stats': ['finance', 'work'],                   // §2.4 calc general CPI·물가 (8)
  'policy': [],                                   // §2.1 분배 없음
  'ai-tech': [],                                  // §2.5 분배 없음
};

/** iknowhowinfo 카테고리 → 메인 카테고리 매핑 */
const IKHI_MATCH: Record<MainCategory, string[]> = {
  'tax-finance': ['flow', 'income'],              // §2.2 ikhi flow + 배당세 income (6)
  'market': ['pulse', 'surge', 'flow', 'income', 'breaking'], // §2.3 ikhi 전 (10)
  'stats': ['flow', 'breaking'],                  // §2.4 ikhi flow/breaking (6)
  'policy': ['breaking'],                         // §2.1 ikhi breaking (5)
  'ai-tech': ['breaking'],                        // §2.5 ikhi breaking (5)
};

/** moneylook mainCategory 직접 매칭 — clusterToMainCategory 가 mirror 에 박혀 있음 */
function matchMoneylook(post: AggregatePost, mainCat: MainCategory): boolean {
  return post.mainCategory === mainCat;
}

/** awoo — 모든 posts 가 정책/지원금 콘텐츠. 메인 카테고리별 좁힘:
 *   - policy: 모든 글 매칭 (지원금/정책 = policy 정합)
 *   - tax-finance: self-employed persona + 카테고리 '자산' (재정 관련) only.
 *     '창업/주거/복지/교육' 매칭 시 "조기재취업수당" 류 취업/구직 글이 tax-finance
 *     박스에 들어가는 부적절 매칭이 됨 (운영자 보고 사례, 2026-05-08).
 *   - ai-tech: 의미 있는 매칭 부족 — false (CATEGORY_MAP §2.5 6점 자체가 임계 미달)
 */
function matchAwoo(post: AggregatePost, mainCat: MainCategory): boolean {
  if (mainCat === 'policy') return true;          // §2.1 awoo gov-support 페르소나별 (10)
  if (mainCat === 'tax-finance') {
    const personas = Array.isArray(post.persona)
      ? post.persona
      : post.persona ? [post.persona] : [];
    return personas.includes('self-employed') && post.category === '자산'; // §2.2 awoo (7), 자산만
  }
  return false;
}

function matchPost(sisterId: string, mainCat: MainCategory, post: AggregatePost): boolean {
  if (sisterId === 'calculatorhost') {
    return CALC_MATCH[mainCat].includes(post.category ?? '');
  }
  if (sisterId === 'iknowhowinfo') {
    return IKHI_MATCH[mainCat].includes(post.category ?? '');
  }
  if (sisterId === 'awoo') {
    return matchAwoo(post, mainCat);
  }
  if (sisterId === 'moneylook') {
    return matchMoneylook(post, mainCat);
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// 매칭 점수 — CATEGORY_MAP §2 표 그대로 박힘 (자매×카테고리별 base 점수)
// CATEGORY_MAP §4 임계: ≥8 강력 분배 / 6-7 표준 분배 / <4 제외
// 본 컴포넌트 임계 = 8 (강력 매칭만 표시) — UI 압박 회피 + 운영자 의도
// ─────────────────────────────────────────────────────────────

const BASE_SCORES: Record<MainCategory, Record<string, number>> = {
  'policy':      { calculatorhost: 0,  awoo: 10, moneylook: 9, iknowhowinfo: 5 },
  'tax-finance': { calculatorhost: 10, awoo: 7,  moneylook: 9, iknowhowinfo: 6 },
  'market':      { calculatorhost: 7,  awoo: 0,  moneylook: 6, iknowhowinfo: 10 },
  'stats':       { calculatorhost: 8,  awoo: 5,  moneylook: 7, iknowhowinfo: 6 },
  'ai-tech':     { calculatorhost: 0,  awoo: 6,  moneylook: 6, iknowhowinfo: 5 },
};

function scoreMatch(
  sisterId: string,
  mainCat: MainCategory,
  matchedCount: number,
  personaHint?: string,
  sisterPersona?: string,
): number {
  if (matchedCount === 0) return 0;
  let score = BASE_SCORES[mainCat]?.[sisterId] ?? 0;
  if (matchedCount >= 5) score += 1;              // 강력 신호 보너스
  if (personaHint && sisterPersona === personaHint) score += 1;
  return score;
}

// ─────────────────────────────────────────────────────────────
// public API
// ─────────────────────────────────────────────────────────────

export interface FindOptions {
  /** 페르소나 hint — 자매 persona 와 일치 시 매칭 점수 +1 */
  persona?: string;
  /** CATEGORY_MAP §6: 메인 펄스 1편당 최대 분배 자매 = 3 */
  maxResults?: number;
  /** 자매당 표시 글 수 (기본 2) */
  postsPerSister?: number;
}

/**
 * 메인 카테고리 → 매칭 자매 N (≤ 3) + 각 자매당 최대 글 K.
 *
 * - 매칭 점수 ≥ 6 만 반환 (CATEGORY_MAP §4)
 * - 매칭 자매 수 ≤ maxResults (기본 3, CATEGORY_MAP §6)
 * - status='fail' 자매 자동 제외
 */
export function findMatchingSisters(
  mainCategory: MainCategory,
  options?: FindOptions,
): SisterMatch[] {
  const maxResults = options?.maxResults ?? 3;
  const postsPerSister = options?.postsPerSister ?? 2;

  const matches: SisterMatch[] = [];

  for (const sister of networkIndex.sisters) {
    if (sister.status !== 'ok') continue;          // fail 자매 제외

    const matchedPosts = networkIndex.aggregatePosts
      .filter(p => p.sisterId === sister.id && matchPost(sister.id, mainCategory, p));

    if (matchedPosts.length === 0) continue;

    const score = scoreMatch(sister.id, mainCategory, matchedPosts.length, options?.persona, sister.persona);
    if (score < 8) continue;                       // §4 강력 매칭만 표시 (UI 압박 회피)

    matches.push({
      sisterId: sister.id,
      sisterName: sister.siteName ?? sister.id,
      sisterDomain: sister.domain ?? '',
      matchScore: score,
      matchedPosts: matchedPosts
        .slice(0, postsPerSister)
        .map(p => ({ url: p.url, title: p.title, summary: p.summary })),
      matchReason: `${mainCategory} → ${sister.id}`,
    });
  }

  return matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, maxResults);
}

/** 네트워크 마지막 sync 시각 (디버그/표시용) */
export function getLastSyncedAt(): string {
  return networkIndex.lastSyncedAt;
}
