import { defineCollection, z } from 'astro:content';

const sourceSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
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
 * Editorial verification protocol — AGENTS.md §7
 *
 * 본 사이트의 펄스/인사이트 글은 두 단계로 분리된 발행 모델을 따른다.
 *
 *   1) `previewMode: true` (기본값)
 *      - 디자인·레이아웃 검수용 샘플로 간주된다.
 *      - 본문에 등장하는 수치·인용·기관 발표 일자 등은 운영자(편집·검증 책임자)
 *        손에 의해 1차 출처와 일대일 대조되기 전이다.
 *      - 사이트 상단에 "디자인 프리뷰" 배너가 노출되어, 독자가 정식 데이터
 *        저널리즘이 아님을 즉시 인지하도록 한다.
 *
 *   2) `previewMode: false` + `verifiedBy: ['<operator-id>', ...]`
 *      - 운영자가 1차 출처(원문 PDF·기관 통계 DB·공식 보도자료)와 본문을
 *        직접 대조해 검수를 끝냈음을 명시적으로 선언한다.
 *      - `verifiedBy` 배열에는 검수에 책임을 진 운영자 아이디가 1개 이상
 *        포함되어야 한다(예: 'junhyuk-kim'). 빈 배열 + previewMode:false 조합은
 *        규약 위반이며, 사이트는 안전을 위해 디자인 프리뷰 배너를 계속 노출한다.
 *
 * 즉 — 정식 발행으로 간주되는 글의 정의는 다음과 같다:
 *   `previewMode === false && verifiedBy.length >= 1`
 *
 * 이 규약은 "AI가 그럴듯하게 만들어낸 정부 통계 인용"이 운영자 검증 없이
 * 사이트의 권위로 발행되는 사고를 구조적으로 차단하기 위한 장치다.
 */

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
    aiAssisted: z.boolean().default(false),
    correctionLog: z.array(correctionSchema).default([]),
    tags: tagGroupsSchema.default({ personas: [], dataTypes: [], actions: [] }),
    /** 디자인 프리뷰 여부 — 기본 true (검수 전 안전망). 위 § "Editorial verification protocol" 참조. */
    previewMode: z.boolean().default(true),
    /** 검수 책임 운영자 아이디 목록. 빈 배열이면 미검수로 간주. */
    verifiedBy: z.array(z.string()).default([]),
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
    estimatedReadingTime: z.number().int().positive(),
    aiAssisted: z.boolean().default(false),
    correctionLog: z.array(correctionSchema).default([]),
    tags: tagGroupsSchema.default({ personas: [], dataTypes: [], actions: [] }),
    /** 디자인 프리뷰 여부 — 기본 true. 위 § "Editorial verification protocol" 참조. */
    previewMode: z.boolean().default(true),
    /** 검수 책임 운영자 아이디 목록. 빈 배열이면 미검수로 간주. */
    verifiedBy: z.array(z.string()).default([]),
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
    aiAssisted: z.boolean().default(false),
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
