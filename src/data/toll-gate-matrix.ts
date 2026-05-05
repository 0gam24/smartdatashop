/**
 * ToollGate 라우팅 매트릭스 (PLANNING.md §12).
 *
 * 한 글의 (category, personas[]) 를 받아서, 글 하단에 노출할 자매 사이트 라우팅을 결정한다.
 *
 * 인코딩된 규칙 (우선순위 순):
 *   policy / 사회초년생   → 머니룩 + calculatorhost
 *   policy / 신혼부부     → 머니룩 + awoo
 *   policy / 1인사업자    → 메인 종결 (secondary 머니룩은 종결 모드라 사용 안함)
 *   policy / 4050은퇴     → 메인 종결
 *   tax-finance / 사회초년생 → 머니룩 + calculatorhost
 *   tax-finance / 1인사업자  → 메인 종결
 *   market / 투자자       → iknowhowinfo + 머니룩
 *   ai-tech / 1인사업자   → 메인 종결
 *
 * 우선순위: 사회초년생 > 신혼부부 > 1인사업자 > 4050은퇴 > 투자자.
 * stats 카테고리는 (모든 페르소나) "글 주제별"이므로 매칭하지 않고 catch-all로 떨어진다.
 * "(지원금)" / "(부동산)" 행은 personas enum 에 존재하지 않는 키워드이므로 인코딩 대상에서 제외했다 —
 * 이런 분류가 필요하면 dataTypes/actions 태그로 별도 처리한다.
 *
 * Catch-all 기본값: { kind: 'route', primary: 'calculatorhost', primaryHint: '관련 계산기 — calculatorhost.com →' }
 */

import type { Category } from '../lib/korean';
import { SISTER_SITES, type SisterSiteKey } from './sister-sites';

export type Persona = '사회초년생' | '신혼부부' | '1인사업자' | '4050은퇴' | '투자자';

export type ToollGateDecision =
  | {
      kind: 'route';
      primary: SisterSiteKey;
      secondary?: SisterSiteKey;
      primaryHint: string;
    }
  | {
      kind: 'main-terminal';
      message: string;
    };

const MAIN_TERMINAL_MESSAGE =
  '이 주제의 더 깊은 자료는 곧 별도 사이트로 — 뉴스레터 구독 시 알림';

/**
 * 페르소나 우선순위 — 한 글이 다중 페르소나를 태깅했을 때 어떤 규칙을 먼저 매칭할지.
 * 인덱스가 작을수록 우선.
 */
const PERSONA_PRIORITY: Persona[] = [
  '사회초년생',
  '신혼부부',
  '1인사업자',
  '4050은퇴',
  '투자자',
];

interface MatrixRule {
  category: Category;
  persona: Persona;
  decision: ToollGateDecision;
}

/**
 * 매트릭스 규칙 — (category, persona) 단일 매칭으로 결정.
 * 다중 페르소나는 PERSONA_PRIORITY 순으로 첫 매치를 채택.
 */
const RULES: MatrixRule[] = [
  // policy
  {
    category: 'policy',
    persona: '사회초년생',
    decision: {
      kind: 'route',
      primary: 'moneylook',
      secondary: 'calculatorhost',
      primaryHint: '청년 정책 핵심을 5분 안에 — asiatop.co.kr →',
    },
  },
  {
    category: 'policy',
    persona: '신혼부부',
    decision: {
      kind: 'route',
      primary: 'moneylook',
      secondary: 'awoo',
      primaryHint: '신혼부부 정책 가이드 — asiatop.co.kr →',
    },
  },
  {
    category: 'policy',
    persona: '1인사업자',
    decision: { kind: 'main-terminal', message: MAIN_TERMINAL_MESSAGE },
  },
  {
    category: 'policy',
    persona: '4050은퇴',
    decision: { kind: 'main-terminal', message: MAIN_TERMINAL_MESSAGE },
  },

  // tax-finance
  {
    category: 'tax-finance',
    persona: '사회초년생',
    decision: {
      kind: 'route',
      primary: 'moneylook',
      secondary: 'calculatorhost',
      primaryHint: '직장인 세금·금융 핵심 — asiatop.co.kr →',
    },
  },
  {
    category: 'tax-finance',
    persona: '1인사업자',
    decision: { kind: 'main-terminal', message: MAIN_TERMINAL_MESSAGE },
  },

  // market
  {
    category: 'market',
    persona: '투자자',
    decision: {
      kind: 'route',
      primary: 'iknowhowinfo',
      secondary: 'moneylook',
      primaryHint: '투자자라면 이 ETF 분석 — iknowhowinfo.com →',
    },
  },

  // ai-tech
  {
    category: 'ai-tech',
    persona: '1인사업자',
    decision: { kind: 'main-terminal', message: MAIN_TERMINAL_MESSAGE },
  },
];

const FALLBACK: ToollGateDecision = {
  kind: 'route',
  primary: 'calculatorhost',
  primaryHint: '관련 계산기 — calculatorhost.com →',
};

/**
 * (category, personas[]) → ToollGateDecision.
 *
 * 동작 순서:
 *  1. personas 를 PERSONA_PRIORITY 순으로 정렬.
 *  2. 정렬된 페르소나 각각에 대해, RULES 에서 (category, persona) 가 매치되는 첫 번째 규칙을 채택.
 *  3. 매치되는 규칙이 없으면 catch-all FALLBACK 반환.
 *
 * stats 카테고리(모든 페르소나에 대해 "글 주제별") 는 RULES 에 없으므로 자연스럽게 FALLBACK 으로 떨어진다.
 */
export function resolveToollGate(
  category: Category,
  personas: readonly Persona[],
): ToollGateDecision {
  const ordered = PERSONA_PRIORITY.filter((p) => personas.includes(p));

  for (const persona of ordered) {
    const rule = RULES.find((r) => r.category === category && r.persona === persona);
    if (rule) return rule.decision;
  }

  return FALLBACK;
}

/**
 * 라우트 결정에서 자매 사이트 메타를 가져오는 헬퍼 — 컴포넌트에서 baseUrl/도메인을 조립할 때 사용.
 */
export function getSisterSite(key: SisterSiteKey) {
  return SISTER_SITES[key];
}
