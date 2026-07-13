/**
 * JSON-LD structured data helpers (PLANNING.md §13.5).
 * 모든 helper는 schema.org 호환 JSON 객체를 반환한다.
 * 사이트 전체에서 한 곳에서만 정의되도록 SITE / ORG / PERSON 상수를 관리한다.
 */

import type { CollectionEntry } from 'astro:content';
import { categoryToKorean, pulseUrl } from './korean';

// 사이트 상수 — astro.config.mjs의 site 와 동일하게 유지.
const SITE_URL = 'https://smartdatashop.kr';
const SITE_NAME = '스마트데이터샵';
const AUTHOR_NAME = '김준혁';
const AUTHOR_SLUG = 'junhyuk-kim';
const AUTHOR_EMAIL = 'smartdatashop@gmail.com';
const FOUNDING_DATE = '2026-01-01';
const LOGO_URL = `${SITE_URL}/og-default.png`;

/**
 * 동적 OG 라우트 (Phase 1 v2 라우트, D9=N 1개월 병행).
 * NewsArticle/Article 의 image fallback 으로 사용 — Discover/SNS 카드 품질 결정적.
 */
function dynamicOgUrl(type: 'pulse' | 'insight', slug: string): string {
  return `${SITE_URL}/og/v2/${type}/${slug}.png`;
}

/**
 * JSON-LD `image` 다중 비율 배열 (Eng #1, ADR 0005).
 *
 * Google 권고: NewsArticle.image 는 16:9, 4:3, 1:1 세 비율 모두 제공 시 Discover
 * 캐러셀 노출률 향상. 현재는 16:9 단일 동적 OG 만 자체 생성하므로 같은 URL 을
 * `ImageObject` 로 wrap 해 width/height 를 명시 — Google 이 다른 비율 자산이
 * 없음을 명시적으로 인지. 향후 1:1 / 4:3 자산 추가 시 본 헬퍼만 확장.
 */
function buildImageArray(primaryUrl: string): Array<Record<string, unknown>> {
  return [
    {
      '@type': 'ImageObject',
      url: primaryUrl,
      width: 1200,
      height: 630,
    },
  ];
}

/**
 * 운영자 외부 프로필 — sameAs 발행용. 비어 있으면 LD 의 sameAs 가 빈 배열로 발행.
 * 환경변수로 주입해 운영자가 새 프로필 추가 시 코드 변경 없이 반영.
 *
 * Cloudflare Pages env 예:
 *   PUBLIC_AUTHOR_SAMEAS="https://www.linkedin.com/in/junhyuk-kim,https://blog.naver.com/junhyuk"
 *   PUBLIC_ORG_SAMEAS="https://twitter.com/smartdatashop"
 */
const AUTHOR_SAMEAS: string[] = (
  (import.meta.env.PUBLIC_AUTHOR_SAMEAS as string | undefined) ?? ''
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const ORG_SAMEAS: string[] = (
  (import.meta.env.PUBLIC_ORG_SAMEAS as string | undefined) ?? ''
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/** 카테고리 라벨에서 디자인용 자간 공백을 제거 — JSON-LD 는 평문 사용. */
function plainCategoryLabel(category: Parameters<typeof categoryToKorean>[0]): string {
  return categoryToKorean(category).replace(/ /g, '');
}

/**
 * NewsMediaOrganization (홈/푸터에서 사용)
 *
 * sameAs 는 PUBLIC_ORG_SAMEAS 환경변수에서 콤마 구분 URL 목록을 읽는다 (E-E-A-T 신호).
 * 미설정 시 빈 배열 — 발행되긴 하지만 외부 코로보레이션 0.
 */
export function buildOrganizationLD(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
    },
    foundingDate: FOUNDING_DATE,
    founder: {
      '@type': 'Person',
      name: AUTHOR_NAME,
    },
    email: AUTHOR_EMAIL,
    inLanguage: 'ko',
    sameAs: ORG_SAMEAS,
    // Google News 평가 신호 — NewsMediaOrganization 의 정책 URL 메타데이터.
    // 운영자의 책임·투명성을 schema.org 표준으로 노출.
    ethicsPolicy: `${SITE_URL}/editorial-policy/`,
    correctionsPolicy: `${SITE_URL}/corrections/`,
    actionableFeedbackPolicy: `${SITE_URL}/contact/`,
    verificationFactCheckingPolicy: `${SITE_URL}/methodology/`,
    masthead: `${SITE_URL}/authors/${AUTHOR_SLUG}/`,
    diversityPolicy: `${SITE_URL}/about/`,
    knowsLanguage: ['ko', 'en'],
    publishingPrinciples: `${SITE_URL}/methodology/`,
    // 발행 영역 — Discover 의 topical authority 신호
    knowsAbout: AUTHOR_KNOWS_ABOUT,
    // 운영 지역 — Korean Discover 분배 신호
    areaServed: { '@type': 'Country', name: 'South Korea' },
  };
}

/**
 * Person — 김준혁 (대표/저자) JSON-LD.
 *
 * sameAs (외부 프로필 — LinkedIn/네이버 블로그/X 등) 는
 * PUBLIC_AUTHOR_SAMEAS 환경변수의 콤마 구분 URL 목록에서 가져온다.
 * YMYL 사이트의 E-E-A-T 평가에서 외부 프로필 cross-link 는 결정적.
 *
 * knowsAbout / hasOccupation 은 Phase 5 추가 — Discover/Search 의 author entity
 * 신호를 강화. 정부·공공기관 1차 출처 데이터 저널리즘 영역의 전문성을 명시.
 */
export const AUTHOR_KNOWS_ABOUT: ReadonlyArray<string> = [
  '한국 정부·공공기관 1차 출처 데이터',
  '국세청 종합소득세',
  '한국은행 ECOS 통계',
  '통계청 KOSIS',
  'KRX 시장 데이터',
  '1인사업자 정책·세금·금융',
  '데이터 시각화 및 비전문가용 해설',
];

export function buildPersonLD(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR_NAME,
    alternateName: 'Junhyuk Kim',
    jobTitle: '대표 · 편집장 · 데이터 검증 책임자',
    email: AUTHOR_EMAIL,
    url: `${SITE_URL}/authors/${AUTHOR_SLUG}/`,
    worksFor: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    hasOccupation: {
      '@type': 'Occupation',
      name: '데이터 저널리스트',
      occupationLocation: {
        '@type': 'Country',
        name: '대한민국',
      },
      occupationalCategory: 'Data Journalism / Editorial',
      skills: AUTHOR_KNOWS_ABOUT.join(', '),
    },
    knowsAbout: AUTHOR_KNOWS_ABOUT,
    knowsLanguage: ['ko', 'en'],
    sameAs: AUTHOR_SAMEAS,
  };
}

/**
 * 기사 본문(markdown)에서 wordCount·읽기시간(분) 추정.
 * GEO/AEO: Article/NewsArticle LD 의 wordCount·timeRequired 신호로
 * AI 답변엔진·Discover 가 문서 깊이를 판단하는 근거가 된다.
 * 각주 정의·코드블록·링크 문법을 제거한 순수 텍스트 기준.
 */
function articleStats(body: string | undefined): { wordCount: number; minutes: number } {
  const plain = (body ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\[\^[^\]]*\]:.*$/gm, ' ')
    .replace(/\[\^[^\]]*\]/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const chars = plain.replace(/\s/g, '').length;
  const wordCount = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  const minutes = Math.max(1, Math.round(chars / 350));
  return { wordCount, minutes };
}

/**
 * SpeakableSpecification — 음성 비서(Google Assistant 등)가 낭독할 핵심 영역.
 * 모든 기사에 H1(제목) selector 를 지정 (항상 존재해 유효).
 */
const SPEAKABLE_SPEC = {
  '@type': 'SpeakableSpecification',
  cssSelector: ['h1'],
} as const;

/**
 * 펄스(일일 뉴스) 기사용 NewsArticle JSON-LD.
 *
 * image 폴백은 동적 OG v2 라우트 — 사이트 로고 카드(LOGO_URL)가 아니라
 * 글마다 고유한 1200×630 시그니처 카드. Discover 가 LD image 를 강한 신호로
 * 사용하므로 글당 고유 이미지가 결정적 (G10).
 *
 * image 는 단일 string 이 아닌 array — Google 권고대로 다중 비율 슬롯에 16:9
 * 단일 자산을 등록 (1:1, 4:3 변형은 향후 이미지 에이전트에서 추가).
 */
export function buildNewsArticleLD(entry: CollectionEntry<'pulse'>): Record<string, unknown> {
  const url = `${SITE_URL}${pulseUrl(entry.slug, entry.data.publishedAt, entry.data.category)}`;
  const primaryImage = entry.data.coverImage
    ? entry.data.coverImage.startsWith('http')
      ? entry.data.coverImage
      : `${SITE_URL}${entry.data.coverImage}`
    : dynamicOgUrl('pulse', entry.slug);
  const stats = articleStats(entry.body);

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
    headline: entry.data.title,
    description: entry.data.tldr,
    datePublished: entry.data.publishedAt,
    dateModified: entry.data.updatedAt ?? entry.data.publishedAt,
    articleSection: plainCategoryLabel(entry.data.category),
    inLanguage: 'ko',
    wordCount: stats.wordCount,
    timeRequired: `PT${stats.minutes}M`,
    speakable: SPEAKABLE_SPEC,
    image: buildImageArray(primaryImage),
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: `${SITE_URL}/authors/${AUTHOR_SLUG}/`,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
  };
}

/**
 * 인사이트(에버그린) 기사용 Article JSON-LD.
 * 동적 OG v2 폴백 + image array + 평문 articleSection (NewsArticle 와 동일 정책).
 */
export function buildArticleLD(entry: CollectionEntry<'insight'>): Record<string, unknown> {
  const url = `${SITE_URL}/insight/${entry.slug}/`;
  const primaryImage = entry.data.coverImage
    ? entry.data.coverImage.startsWith('http')
      ? entry.data.coverImage
      : `${SITE_URL}${entry.data.coverImage}`
    : dynamicOgUrl('insight', entry.slug);
  const stats = articleStats(entry.body);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
    headline: entry.data.title,
    description: entry.data.tldr,
    datePublished: entry.data.publishedAt,
    dateModified: entry.data.updatedAt ?? entry.data.publishedAt,
    articleSection: plainCategoryLabel(entry.data.category),
    inLanguage: 'ko',
    wordCount: stats.wordCount,
    timeRequired: `PT${stats.minutes}M`,
    speakable: SPEAKABLE_SPEC,
    image: buildImageArray(primaryImage),
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: `${SITE_URL}/authors/${AUTHOR_SLUG}/`,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
  };
}

/**
 * 정적 정책/소개 페이지용 WebPage JSON-LD
 */
export function buildWebPageLD(title: string, description: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    inLanguage: 'ko',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * BreadcrumbList JSON-LD — 기사·인사이트 등 깊이 있는 페이지의 위치 단서.
 *
 * @param items 순서대로 패스 1단계부터 마지막(현재) 페이지까지의 (name, url).
 *              마지막 항목은 보통 현재 페이지 자체이며, schema.org의 권고에 따라
 *              ListItem.item을 그대로 절대 URL로 채운다.
 */
export function buildBreadcrumbLD(
  items: ReadonlyArray<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
    })),
  };
}

/**
 * ItemList JSON-LD — 카테고리/태그/인사이트 인덱스의 게시물 모음을
 * 명시적으로 표현해 검색엔진의 캐러셀/리치 결과 후보로 노출되게 한다.
 *
 * @param items 순서가 의미를 갖는 (위에서 아래로) 게시물 (name, url) 배열.
 *              schema.org는 itemListOrder를 ItemListOrderDescending 등으로
 *              명시할 수 있으나, 본 사이트는 모두 최신순(내림차순)이므로
 *              해당 값으로 통일해 둔다.
 */
export function buildItemListLD(
  items: ReadonlyArray<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
      name: it.name,
    })),
  };
}

/**
 * FAQPage JSON-LD — 본문의 "## 자주 묻는 질문" 섹션 자동 추출.
 *
 * 패턴: `**Q1. ...?**\nA. ...` 또는 `### Q1. ...\n... A. ...`
 * 매칭된 Q&A 가 2개 이상일 때만 LD 발행 (SERP rich snippet 조건).
 *
 * Google Q&A rich snippet 정책 (2024+): 일반 FAQ 페이지는 더 이상 자동 노출되지 X,
 * 그러나 LLM (ChatGPT/Perplexity/Gemini) 인용 시 FAQ LD 가 구조 추출에 결정적.
 *
 * 본 함수는 markdown body 를 받아 Q&A 추출 → LD 반환. Q&A < 2 면 null.
 */
export function buildFaqLDFromMarkdown(body: string): Record<string, unknown> | null {
  // 패턴 1: **Q1. ...?** A. ... 또는 **Q. ...?** A. ...
  const pattern1 = /\*\*Q\d*\.?\s*(.+?)\*\*\s*\n+(?:A[.:]?\s*)?(.+?)(?=\n+\*\*Q|\n+##|\n+\[|$)/gs;
  // 패턴 2: ### Q1. ...?  A. ...
  const pattern2 = /###\s+Q\d*\.?\s*(.+?)\n+(?:A[.:]?\s*)?(.+?)(?=\n+###|\n+##|$)/gs;

  const qa: Array<{ q: string; a: string }> = [];
  for (const pat of [pattern1, pattern2]) {
    let m: RegExpExecArray | null;
    while ((m = pat.exec(body)) !== null) {
      const q = m[1].trim().replace(/[?？]+$/, '').trim();
      const a = m[2].trim().replace(/\s+/g, ' ').slice(0, 500);
      if (q.length > 0 && a.length > 0) {
        qa.push({ q, a });
      }
    }
    if (qa.length > 0) break; // 첫 패턴 매칭 후 종료
  }

  if (qa.length < 2) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map((it) => ({
      '@type': 'Question',
      name: it.q.endsWith('?') ? it.q : `${it.q}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.a,
      },
    })),
  };
}

/**
 * HowTo JSON-LD — 본문의 "본인 액션 N 가지" / "체크리스트" 섹션 자동 추출.
 *
 * 패턴: 번호 매김 리스트 (`1. ... / 2. ... / 3. ...`) 가 3개 이상 연속.
 * 매칭 시 HowTo LD 발행 — LLM 인용 시 단계 구조 보존 + Google Discover 친화.
 *
 * 본 함수는 (제목, 마크다운 body) 를 받아 첫 번호 리스트 추출 → LD 반환.
 * 리스트 < 3 단계 또는 미발견 시 null.
 */
export function buildHowToLDFromMarkdown(
  title: string,
  body: string,
): Record<string, unknown> | null {
  // 번호 리스트 (3개 이상 연속) 매칭 — "본인 액션" 또는 "체크리스트" 섹션 직후
  const sectionMatch = body.match(
    /##\s+[^\n]*(?:본인 액션|액션|체크리스트|단계|절차)[^\n]*\n+([\s\S]+?)(?=\n+##|\n+\[\^|$)/,
  );
  if (!sectionMatch) return null;

  const sectionBody = sectionMatch[1];
  const stepRe = /^\s*(\d+)\.\s+(.+?)(?=\n\s*\d+\.|$)/gms;
  const steps: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = stepRe.exec(sectionBody)) !== null) {
    const text = m[2].trim().replace(/\*\*/g, '').replace(/\s+/g, ' ').slice(0, 300);
    if (text.length > 0) steps.push(text);
  }

  if (steps.length < 3) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    step: steps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: text.slice(0, 80),
      text,
    })),
  };
}

/**
 * CollectionPage JSON-LD — 카테고리/태그/인사이트 인덱스 페이지의
 * "이 페이지는 모음 페이지이다" 신호. ItemList와 함께 발행하면 좋다.
 */
export function buildCollectionPageLD(
  name: string,
  description: string,
  url: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
    inLanguage: 'ko',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * Dataset JSON-LD — 향후 /data/ 페이지가 추가되면 1차 출처 데이터셋의
 * 메타데이터를 명시적으로 발행하기 위한 helper. 현재는 사용처가 없지만
 * 구조 규약을 미리 고정해 둔다 (Google Dataset Search 적격성).
 *
 * 라이선스 기본값은 사이트 전체 정책(CC BY-NC 4.0)과 동일.
 * isBasedOn을 통해 1차 출처 URL을 표시 — schema.org/Dataset의 isBasedOn은
 * 데이터셋이 도출된 원본 자료를 연결하는 표준 속성이다.
 */
export interface DatasetInput {
  name: string;
  description: string;
  url: string;
  sourceUrl?: string;
  sourceName?: string;
  license?: string;
  temporalCoverage?: string;
  spatialCoverage?: string;
  /** 발행 기관 — 미지정 시 SITE_NAME 으로 자동 설정 */
  publisher?: string;
  /** ISO 발행 일자 — Discover/Dataset 색인 신호 */
  datePublished?: string;
  /**
   * 다운로드 가능한 분포 (CSV/JSON 등) — schema.org DataDownload 배열.
   * /data/ 인덱스 같이 실제 파일 URL 을 노출하는 페이지에서 사용.
   */
  distribution?: Array<{ contentUrl: string; encodingFormat: string }>;
}

export function buildDatasetLD(input: DatasetInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: input.name,
    description: input.description,
    url: input.url.startsWith('http') ? input.url : `${SITE_URL}${input.url}`,
    creator: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: input.publisher ?? SITE_NAME },
    license: input.license ?? 'https://creativecommons.org/licenses/by-nc/4.0/',
    ...(input.datePublished && { datePublished: input.datePublished }),
    ...(input.sourceUrl && { isBasedOn: input.sourceUrl }),
    ...(input.temporalCoverage && { temporalCoverage: input.temporalCoverage }),
    ...(input.spatialCoverage && { spatialCoverage: input.spatialCoverage }),
    ...(input.distribution && input.distribution.length > 0 && {
      distribution: input.distribution.map((d) => ({
        '@type': 'DataDownload',
        contentUrl: d.contentUrl,
        encodingFormat: d.encodingFormat,
      })),
    }),
  };
}

/**
 * pulse/insight 의 frontmatter sources 배열로부터 Dataset LD 를 자동 생성.
 *
 * **데이터 저널 차별화의 핵심 무기** (사용자 명시 우선순위):
 *   일반 매체는 거의 사용하지 않는 schema.org/Dataset 을 1차 출처 글마다 발행해
 *   Google 의 "데이터 발행처" 색인 풀에 진입한다. Discover/Search 양쪽에서
 *   일반 NewsArticle 과 분리된 가중치를 받음.
 *
 * isBasedOn 에 sources[].url 을 array 로 노출 — 데이터셋이 어떤 1차 자료에서
 * 도출되었는지 명시. url 이 없는 source 는 자동 제외.
 *
 * @returns Dataset LD 객체. sources 가 url 없이 비어 있으면 null (호출측에서 필터).
 */
export function buildDatasetLDFromArticle(
  entry: CollectionEntry<'pulse'> | CollectionEntry<'insight'>,
  type: 'pulse' | 'insight',
): Record<string, unknown> | null {
  const sourceUrls = entry.data.sources
    .map((s: { url?: string }) => s.url)
    .filter((u: string | undefined): u is string => !!u);
  if (sourceUrls.length === 0) return null;

  const articleUrl =
    type === 'pulse'
      ? `${SITE_URL}${pulseUrl(entry.slug, entry.data.publishedAt, entry.data.category)}`
      : `${SITE_URL}/insight/${entry.slug}/`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: entry.data.title,
    description: entry.data.tldr,
    url: articleUrl,
    creator: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    license: 'https://creativecommons.org/licenses/by-nc/4.0/',
    isBasedOn: sourceUrls,
    inLanguage: 'ko',
    datePublished: entry.data.publishedAt,
    dateModified: entry.data.updatedAt ?? entry.data.publishedAt,
    keywords: plainCategoryLabel(entry.data.category),
  };
}

/**
 * ClaimReview LD — 정부 발표/통계 검증 글에 사용 (Layer 4 fact-checker 자동 흐름과 결합).
 *
 * 운영자가 명시적으로 검증한 주장(예: "정부 X% 발표가 실제 데이터에 부합?")에만
 * 사용. 자동 생성 금지 — 검증 없이 ClaimReview 발행은 Google 가이드라인 위반.
 *
 * 사용:
 *   const ld = buildClaimReviewLD({
 *     claimReviewed: '정부 발표 청년월세 잔여 예산 38%',
 *     itemReviewedAuthor: '국토교통부',
 *     ratingValue: 4,         // 1=거짓, 5=참
 *     ratingExplanation: '...',
 *     articleUrl: '...'
 *   });
 */
export interface ClaimReviewInput {
  claimReviewed: string;
  itemReviewedAuthor: string;
  ratingValue: 1 | 2 | 3 | 4 | 5;
  ratingExplanation: string;
  articleUrl: string;
}

export function buildClaimReviewLD(input: ClaimReviewInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ClaimReview',
    url: input.articleUrl,
    claimReviewed: input.claimReviewed,
    itemReviewed: {
      '@type': 'Claim',
      author: { '@type': 'Organization', name: input.itemReviewedAuthor },
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: input.ratingValue,
      bestRating: 5,
      worstRating: 1,
      alternateName: input.ratingExplanation,
    },
    author: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * HowTo LD — 단계형 가이드북 챕터에 사용 (예: "5월 종소세 신고 7단계").
 * 호출자가 steps 를 명시 전달.
 */
export interface HowToInput {
  name: string;
  description: string;
  url: string;
  totalTime?: string; // ISO 8601 duration (예: "PT15M")
  steps: { name: string; text: string }[];
}

export function buildHowToLD(input: HowToInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: 'ko',
    ...(input.totalTime && { totalTime: input.totalTime }),
    step: input.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/**
 * Book LD — 가이드북 시리즈 메타데이터 (guidebook 컬렉션).
 * Discover 의 BookCarousel 후보 + 데이터 저널 차별화.
 */
export interface BookInput {
  name: string;
  description: string;
  url: string;
  numberOfPages?: number;
  inLanguage?: string;
  license?: string;
  datePublished?: string;
}

export function buildBookLD(input: BookInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: input.inLanguage ?? 'ko',
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: `${SITE_URL}/authors/${AUTHOR_SLUG}/`,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    license: input.license ?? 'https://creativecommons.org/licenses/by-nc/4.0/',
    ...(input.numberOfPages && { numberOfPages: input.numberOfPages }),
    ...(input.datePublished && { datePublished: input.datePublished }),
  };
}

/**
 * WebSite + SearchAction (sitelinks search box) JSON-LD.
 *
 * 구글 sitelinks search box 사양은 target에 `?q=` 쿼리 패턴이 있는
 * EntryPoint URL을 요구한다. 본 사이트의 검색은 현재 모달 형태지만
 * 홈에서 `?q=` 파라미터를 받을 수 있도록 LD 차원에서만 미리 등록해
 * 검색 결과 위 sitelinks 노출 가능성을 확보한다.
 */
export function buildSearchActionLD(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'ko',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
