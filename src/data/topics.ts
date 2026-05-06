/**
 * 주제 큐레이션 — /topic/{slug}/
 *
 * 펄스·인사이트·가이드북 챕터를 *주제* 단위로 묶어 한 페이지에 합성.
 * 각 토픽은 카테고리·가이드북 슬러그·제목 매칭의 OR 합으로 항목을 수집.
 *
 * 운영자가 새 토픽 추가 시: 본 파일에 객체 1개 push, slug 충돌 X 확인. 끝.
 */
export type Category = 'policy' | 'tax-finance' | 'market' | 'stats' | 'ai-tech';

export interface TopicMatch {
  pulseCategory?: Category[];
  insightCategory?: Category[];
  /** guidebook 컬렉션의 entry.id (.json 제거) — 정확 매칭 */
  guidebookSlug?: string[];
  /** 추가 매칭 — 제목에 포함되면 카테고리 무관 합산 */
  titleIncludes?: RegExp;
}

export interface TopicConfig {
  slug: string;
  title: string;
  description: string;
  /** 헤더 eyebrow — "주 제 · X X X" 권장 */
  eyebrow: string;
  match: TopicMatch;
  /** 페이지 lead 단락 — 1~2 문단 */
  lead?: string;
}

export const TOPICS: TopicConfig[] = [
  {
    slug: 'jongseong',
    title: '5월 종합소득세 — 신고부터 환급까지',
    description:
      '5월 종합소득세 시즌의 신고·납부·정정·가산세 등 모든 절차와 1차 출처. 가이드북 12 챕터 + 펄스·인사이트 통합 큐레이션.',
    eyebrow: '주 제 · 종 합 소 득 세',
    lead: '국세청 5월 시즌의 모든 의사결정을 1차 출처 기준으로 정리. 신고 대상 판단부터 모두채움·홈택스 단계, 1인사업자 절세, 가산세 회피, 환급 일정, 정정·경정청구까지 — 가이드북 12 챕터와 펄스·인사이트가 한 페이지에.',
    match: {
      pulseCategory: ['tax-finance'],
      insightCategory: ['tax-finance'],
      guidebookSlug: ['jongseong-2026'],
      titleIncludes: /종합소득세|종소세|환급|모두채움/i,
    },
  },
  {
    slug: 'etf',
    title: 'ETF 시장 — 자산군 × 전략 × 과세',
    description:
      '한국 ETF 시장 (KRX 상장 1,000+ 종) 의 자산군 매핑·전략 분류·과세체계. 가이드북 ETF 지도 + 시장 펄스·인사이트.',
    eyebrow: '주 제 · E T F',
    lead: '한국거래소 (KRX) 상장 ETF 와 시장 자금흐름. 자산군 6 × 전략 4 × 과세체계 3 의 72 셀 매트릭스 정리 (가이드북 ETF 지도) + 일일 시장 펄스 + 자매 사이트 iknowhowinfo 의 종목 단위 분석 연결.',
    match: {
      pulseCategory: ['market'],
      insightCategory: ['market'],
      guidebookSlug: ['etf-map-2026'],
      titleIncludes: /ETF|KOSPI|코스피|코스닥/i,
    },
  },
  {
    slug: 'ai-support',
    title: 'AI 정책·지원사업',
    description:
      '정부 AI 정책·바우처·지원사업 소식과 신청 자격 정리. NIPA·과기정통부 1차 출처.',
    eyebrow: '주 제 · A I 지 원',
    lead: '정부 AI 정책과 1인사업자·중소기업 대상 바우처·지원사업. 과학기술정보통신부·NIPA·KISA 등 1차 출처 보도자료를 정리. 신청 자격·기간·예산 회차별 갱신.',
    match: {
      pulseCategory: ['ai-tech', 'policy'],
      insightCategory: ['ai-tech', 'policy'],
      titleIncludes: /AI|인공지능|NIPA|바우처|디지털/i,
    },
  },
];

export const TOPIC_SLUGS = TOPICS.map((t) => t.slug);
