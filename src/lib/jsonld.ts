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
