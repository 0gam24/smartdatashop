import { defineCollection, z } from 'astro:content';

/**
 * 1차 출처 (Source).
 *
 * Risk #3 (ADR 0005): `url` 은 *원래* optional 이었으나 표시광고법 §3 "기만적 표시"
 * 위험 회피 + Layer 4 fact-checker 본격 가동 시 fuzzy match 의 입력 보장을 위해
 * **required** 로 승격. 정부/기관 발표를 인용하는데 URL 없이 "비공개 자료" 로만
 * 박는 패턴은 sources[] 에 넣지 말고 본문 footnote 로만 표시할 것.
 */
const sourceSchema = z.object({
  name: z.string(),
  url: z.string().url('1차 출처는 검증 가능한 URL 이 필수'),
  accessedAt: z.string().optional(),
  date: z.string().optional(),
  note: z.string().optional(),
});

const correctionSchema = z.object({
  date: z.string(),
  description: z.string(),
});

const tagGroupsSchema = z.object({
  personas: z
    .array(z.enum(['사회초년생', '신혼부부', '1인사업자', '4050은퇴', '투자자']))
    .default([]),
  dataTypes: z
    .array(z.enum(['정부발표', '분기지표', '월간지표', '실시간시장', '법안']))
    .default([]),
  actions: z
    .array(z.enum(['신청가능', '마감임박', '장기관점', '정성심화']))
    .default([]),
});

/**
 * chartData — Discover OG 카드 차트 오버레이용 (Reuters/Bloomberg 스타일).
 *
 * frontmatter 에 chartData 가 있으면 OG 생성기가 sparkline/막대차트를
 * 1200×630 카드에 함께 베이크한다. values 길이는 5~30 권장.
 * 모든 필드 optional — 운영자 검증 후 작성한 데이터만 표시.
 */
const chartDataSchema = z.object({
  type: z.enum(['line', 'bar', 'sparkline']).default('sparkline'),
  values: z.array(z.number()).min(2, '차트는 데이터 포인트 2개 이상 필요'),
  label: z.string().max(80),
  unit: z.string().max(10).optional(),
});

/**
 * aiAssisted — AI 활용 등급 (4관점 합의 Decision #9, 2026-05-06).
 *
 *   - false  : 운영자 단독 작성, AI 미사용
 *   - 'edit' : 운영자 초안 + AI 가 문법/표현 보조 (사실 입력은 운영자)
 *   - 'draft': AI 가 초안 + 운영자가 1차 출처 대조하여 사실 확인
 *   - 'fact-check': AI 가 1차 출처 fuzzy match (Layer 4 fact-checker 사후 감사 결과)
 *
 * 하위 호환 — `true` 입력 시 'draft' 로 normalize. `false` 는 그대로 유지.
 * Trust Bar / OG 카드 / Person LD 가 등급별로 다른 표기 가능 (향후 확장).
 */
const aiAssistedSchema = z
  .union([z.boolean(), z.enum(['edit', 'draft', 'fact-check'])])
  .default(false)
  .transform((v) => (v === true ? 'draft' : v === false ? false : v));

// 8.1 펄스 (일일)
const pulse = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(60),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    category: z.enum(['policy', 'tax-finance', 'market', 'stats', 'ai-tech']),
    tldr: z.string().max(200),
    sources: z.array(sourceSchema).min(1, '1차 출처 1개 이상 필수'),
    chartUrl: z.string().optional(),
    coverImage: z.string().optional(),
    chartData: chartDataSchema.optional(),
    aiAssisted: aiAssistedSchema,
    correctionLog: z.array(correctionSchema).default([]),
    tags: tagGroupsSchema.default({ personas: [], dataTypes: [], actions: [] }),
  }),
});

// 8.2 인사이트 (evergreen)
const insight = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(80),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    category: z.enum(['policy', 'tax-finance', 'market', 'stats', 'ai-tech']),
    tldr: z.string().max(300),
    sources: z.array(sourceSchema).min(2, '인사이트는 1차 출처 2개 이상'),
    coverImage: z.string().optional(),
    chartData: chartDataSchema.optional(),
    estimatedReadingTime: z.number().int().positive(),
    aiAssisted: aiAssistedSchema,
    correctionLog: z.array(correctionSchema).default([]),
    tags: tagGroupsSchema.default({ personas: [], dataTypes: [], actions: [] }),
  }),
});

// 8.3 가이드북 (책)
const guidebook = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    totalChapters: z.number().int().positive(),
    completedChapters: z.number().int().nonnegative().default(0),
    license: z.string().default('CC BY-NC 4.0'),
    coverImage: z.string().optional(),
    pdfUrl: z.string().optional(),
  }),
});

// 8.4 가이드북 챕터
const guidebookChapter = defineCollection({
  type: 'content',
  schema: z.object({
    bookSlug: z.string(),
    chapterNumber: z.number().int().positive(),
    title: z.string(),
    publishedAt: z.string(),
    sources: z.array(sourceSchema).default([]),
    aiAssisted: aiAssistedSchema,
  }),
});

// 8.5 데이터 던전
const dataPage = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    dataSource: sourceSchema,
    chartConfig: z.string().optional(),
    description: z.string(),
  }),
});

export const collections = { pulse, insight, guidebook, guidebookChapter, dataPage };
