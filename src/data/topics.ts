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
  /**
   * data/economy/ecos-timeseries.json 의 series.id 와 매칭 — 토픽 페이지 상단에
   * 시계열 차트 자동 임베드. 미지정 시 차트 없음 (기존 토픽 구조 유지).
   */
  ecosSeriesId?: 'base-rate' | 'usd-krw' | 'cpi' | 'kospi' | 'household-debt';
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
  {
    slug: 'base-rate',
    title: '한국은행 기준금리',
    description:
      '한국은행 기준금리 추이 (월별 36개월) + 관련 펄스·인사이트. 통화정책 1차 출처 ECOS.',
    eyebrow: '주 제 · 기 준 금 리',
    lead: '한국은행 ECOS 1차 자료를 매일 자동 갱신한 기준금리 시계열. 동결·인상·인하 결정 시점과 시장 반응을 함께 추적. 1인사업자·신혼부부 대출 의사결정 보조.',
    match: {
      pulseCategory: ['market', 'tax-finance'],
      insightCategory: ['market', 'tax-finance'],
      titleIncludes: /기준금리|한국은행 금리|BOK\s*rate|통화정책/i,
    },
    ecosSeriesId: 'base-rate',
  },
  {
    slug: 'usd-krw',
    title: '원/달러 환율',
    description:
      '원/달러 환율 추이 (일별 180일) + 관련 펄스·인사이트. 한국은행 매매기준율 1차 출처.',
    eyebrow: '주 제 · 원 / 달 러 환 율',
    lead: '한국은행 매매기준율 일별 시계열을 매일 자동 갱신. FOMC·BOK 결정·중동 정세 등 외부 충격 시점과 환율 반응을 함께 추적. 해외 ETF·여행·수입 의사결정 보조.',
    match: {
      pulseCategory: ['market'],
      insightCategory: ['market'],
      titleIncludes: /환율|원달러|원\/달러|USD\/KRW|FOMC/i,
    },
    ecosSeriesId: 'usd-krw',
  },
  {
    slug: 'cpi',
    title: '소비자물가지수 (CPI)',
    description:
      '소비자물가지수 (CPI 총지수, 2020=100) 월별 36개월 추이 + 관련 펄스·인사이트. 한국은행 ECOS.',
    eyebrow: '주 제 · 소 비 자 물 가',
    lead: 'CPI (소비자물가지수) 총지수 월별 시계열. 인플레이션 추세와 가계 실질소득 변화 추적. 가이드북 1권 종합소득세 의사결정 + 신혼부부 가계 계획 + 1인사업자 비용 관리 보조.',
    match: {
      pulseCategory: ['stats', 'tax-finance'],
      insightCategory: ['stats', 'tax-finance'],
      titleIncludes: /물가|CPI|소비자물가|인플레/i,
    },
    ecosSeriesId: 'cpi',
  },
  {
    slug: 'kospi',
    title: 'KOSPI 종합지수',
    description:
      'KOSPI 종합지수 (1980.01.04=100) 일별 180일 추이 + 관련 펄스·인사이트. 한국은행 ECOS.',
    eyebrow: '주 제 · K O S P I',
    lead: 'KOSPI 종합지수 일별 시계열. 한국 주식시장 자금흐름·외국인 매매·ETF 자산군 결정의 기초 지표. 자매 사이트 iknowhowinfo (ETF·종목 분석) 와 가이드북 2권 ETF 지도 직접 연결.',
    match: {
      pulseCategory: ['market'],
      insightCategory: ['market'],
      guidebookSlug: ['etf-map-2026'],
      titleIncludes: /KOSPI|코스피|종합지수|주가지수/i,
    },
    ecosSeriesId: 'kospi',
  },
  {
    slug: 'household-debt',
    title: '가계신용 (가계부채)',
    description:
      '가계신용 (예금취급기관) 분기별 추이 + 관련 펄스·인사이트. 한국은행 ECOS 1차 자료.',
    eyebrow: '주 제 · 가 계 부 채',
    lead: '한국은행 ECOS 가계신용 (예금취급기관) 분기별 시계열. 주담대·신용대출 동향 + 가계 자산건전성 추적. 가이드북 1권 종합소득세 11장 (건강보험 지역가입자) 과 신혼부부·1인사업자 자금 의사결정 보조.',
    match: {
      pulseCategory: ['tax-finance', 'stats'],
      insightCategory: ['tax-finance', 'stats'],
      titleIncludes: /가계대출|가계부채|가계신용|주담대|신용대출/i,
    },
    ecosSeriesId: 'household-debt',
  },
];

export const TOPIC_SLUGS = TOPICS.map((t) => t.slug);
