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
const AUTHOR_EMAIL = 'editor@smartdatashop.kr';
const FOUNDING_DATE = '2026-01-01';
const LOGO_URL = `${SITE_URL}/og-default.png`;

/**
 * NewsMediaOrganization (홈/푸터에서 사용)
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
    sameAs: [],
  };
}

/**
 * Person — 김준혁 (대표/저자) JSON-LD
 */
export function buildPersonLD(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR_NAME,
    jobTitle: '대표 · 데이터 저널리스트',
    email: AUTHOR_EMAIL,
    url: `${SITE_URL}/authors/${AUTHOR_SLUG}/`,
    worksFor: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * 펄스(일일 뉴스) 기사용 NewsArticle JSON-LD
 */
export function buildNewsArticleLD(entry: CollectionEntry<'pulse'>): Record<string, unknown> {
  const url = `${SITE_URL}${pulseUrl(entry.slug, entry.data.publishedAt)}`;
  const image = entry.data.coverImage
    ? entry.data.coverImage.startsWith('http')
      ? entry.data.coverImage
      : `${SITE_URL}${entry.data.coverImage}`
    : LOGO_URL;

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
    articleSection: categoryToKorean(entry.data.category),
    inLanguage: 'ko',
    image,
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
 * 인사이트(에버그린) 기사용 Article JSON-LD
 */
export function buildArticleLD(entry: CollectionEntry<'insight'>): Record<string, unknown> {
  const url = `${SITE_URL}/insight/${entry.slug}/`;
  const image = entry.data.coverImage
    ? entry.data.coverImage.startsWith('http')
      ? entry.data.coverImage
      : `${SITE_URL}${entry.data.coverImage}`
    : LOGO_URL;

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
    articleSection: categoryToKorean(entry.data.category),
    inLanguage: 'ko',
    image,
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
