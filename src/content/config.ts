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
 * chart — 본문 상단 리드 차트 (2026-08-26 운영자 지시).
 *
 * frontmatter 에 chart 가 있으면 빌드가 /charts/{type}/{slug}.webp 를 생성하고
 * ArticleLayout/InsightLayout 이 본문 최상단에 <img> 로 자동 삽입한다.
 * 하우스 스타일(FT/Reuters 미니멀 — paper 배경·헤어라인·단일 강조색·값 직접 표기)로
 * 렌더되며 이미지 안에 제목·단위·자료 출처가 포함된다 (자기완결 이미지).
 *
 * 규칙 (src/content/CLAUDE.md §상단 차트):
 *   - series 값은 본문에서 footnote 페어링된 검증 수치만 (fabrication 0)
 *   - alt 는 대표 키워드 포함 필수 (이미지 검색·접근성)
 *   - source 는 "기관명 (YYYY-MM-DD)" 형식 권장
 */
const chartSpecSchema = z
  .object({
    type: z.enum(['bar', 'line']),
    title: z.string().min(4).max(32, '리드 차트 제목 32자 이내 — 캔버스 1줄 한도'),
    unit: z.string().max(20).optional(),
    source: z.string().min(2).max(80),
    alt: z.string().min(8, 'alt 는 대표 키워드를 포함해 8자 이상').max(120),
    series: z
      .array(
        z.object({
          label: z.string().max(12, '차트 라벨 12자 이내 — 라벨 칸 1줄 한도'),
          value: z.number(),
        }),
      )
      .min(2, '차트는 데이터 포인트 2개 이상 필요')
      .max(6, '리드 차트는 6개 이하 — 캔버스 세로 한도·시인성'),
    /** accent 강조 대상 인덱스 (bar 전용, 기본: 마지막 항목. line 은 항상 끝점 강조) */
    highlight: z.number().int().min(0).optional(),
  })
  .superRefine((c, ctx) => {
    if (c.highlight !== undefined && c.highlight >= c.series.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `highlight(${c.highlight}) 가 series 범위(0~${c.series.length - 1}) 밖 — 강조 없는 차트가 조용히 나간다`,
      });
    }
    for (const [i, s] of c.series.entries()) {
      // bar 는 절대값 스케일 — 음수를 넣으면 방향이 사라져 데이터 왜곡 (증감률은 line 사용)
      if (c.type === 'bar' && s.value < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `bar 차트에 음수(series[${i}]=${s.value}) 금지 — 증감·마이너스 시계열은 line 사용`,
        });
      }
      // 렌더러가 소수 둘째 자리로 표기 — 그 이상 정밀도는 본문 검증 수치와 어긋난 이미지가 된다
      if (Math.round(s.value * 100) / 100 !== s.value) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `series[${i}]=${s.value} — 차트 값은 소수 둘째 자리까지 (본문 표기와 동일하게 반올림해 기입)`,
        });
      }
    }
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
    chartData: chartDataSchema.optional(),
    chart: chartSpecSchema.optional(),
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
    chart: chartSpecSchema.optional(),
    estimatedReadingTime: z.number().int().positive(),
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
