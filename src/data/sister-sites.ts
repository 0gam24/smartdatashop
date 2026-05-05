/**
 * 자매 사이트 도메인 맵 (PLANNING.md §12 ToollGate 매트릭스).
 *
 * 현재 활성화된 4개 사이트만 포함한다.
 * 나머지 5개(homedata, bizdata, familydata, retiredata, aidata)는
 * M3 ~ M12 사이 순차 런칭 예정이며, 런칭 시점에 활성화한다.
 *
 * 주의: 머니룩 브랜드의 도메인은 asiatop.co.kr 이다 — 도메인과 브랜드명이 다른 유일한 케이스.
 */

export const SISTER_SITES = {
  calculatorhost: {
    domain: 'calculatorhost.com',
    name: '계산기 호스트',
    persona: '즉답형 · 전 카테고리 횡단',
    baseUrl: 'https://calculatorhost.com',
  },
  awoo: {
    domain: 'awoo.or.kr',
    name: '아우',
    persona: '지원금 수령자',
    baseUrl: 'https://awoo.or.kr',
  },
  moneylook: {
    domain: 'asiatop.co.kr',
    name: '머니룩',
    persona: '사회초년생 · 직장인',
    baseUrl: 'https://asiatop.co.kr',
  },
  iknowhowinfo: {
    domain: 'iknowhowinfo.com',
    name: '아이노하우',
    persona: '투자자',
    baseUrl: 'https://iknowhowinfo.com',
  },
} as const;

export type SisterSiteKey = keyof typeof SISTER_SITES;

// TODO(M3-M12): 5개 미런칭 자매 사이트 — 런칭 마일스톤 도달 시 위 SISTER_SITES에 합치고
// toll-gate-matrix.ts 의 규칙도 함께 갱신한다.
//
// export const FUTURE_SISTER_SITES = {
//   homedata: {
//     domain: 'homedata.kr',
//     name: '홈데이터',
//     persona: '주거 · 부동산 (M3 런칭)',
//     baseUrl: 'https://homedata.kr',
//   },
//   bizdata: {
//     domain: 'bizdata.kr',
//     name: '비즈데이터',
//     persona: '1인사업자 · 자영업 (M5 런칭)',
//     baseUrl: 'https://bizdata.kr',
//   },
//   familydata: {
//     domain: 'familydata.kr',
//     name: '패밀리데이터',
//     persona: '신혼부부 · 자녀양육 (M7 런칭)',
//     baseUrl: 'https://familydata.kr',
//   },
//   retiredata: {
//     domain: 'retiredata.kr',
//     name: '리타이어데이터',
//     persona: '4050 은퇴 (M9 런칭)',
//     baseUrl: 'https://retiredata.kr',
//   },
//   aidata: {
//     domain: 'aidata.kr',
//     name: '에이아이데이터',
//     persona: 'AI · 기술 (M12 런칭)',
//     baseUrl: 'https://aidata.kr',
//   },
// } as const;
