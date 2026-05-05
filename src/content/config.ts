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
