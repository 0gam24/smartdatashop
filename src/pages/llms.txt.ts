/**
 * /llms.txt — LLM(답변엔진)용 콘텐츠 색인 (llmstxt.org 제안 표준).
 *
 * 매 빌드 시 자동 생성된다. pulse + insight 컬렉션을 카테고리별로 묶어
 * `- [제목](절대 URL): tldr` 형태로 출력한다. 검수 미완(placeholder) 글은 제외한다.
 *
 * 목적: ChatGPT·Perplexity·Claude 등 LLM 이 본 사이트의 1차 출처 기반
 * 정책·복지·세금·금융 콘텐츠를 빠르게 파악·인용하도록 돕는 GEO 신호.
 * sitemap(검색엔진용)과 별개로, 사람·LLM 이 읽기 좋은 마크다운 색인이다.
 */
import { getCollection } from 'astro:content';
import {
  pulseUrl,
  insightUrl,
  pulseDateParts,
  type Category,
} from '../lib/korean';
import { entryHasPlaceholder } from '../lib/placeholder';

const SITE = 'https://smartdatashop.kr';

/** pulse 카테고리 출력 순서 */
const CATEGORY_ORDER: Category[] = ['policy', 'tax-finance', 'market', 'stats', 'ai-tech'];

/**
 * llms.txt 전용 카테고리 라벨 — 공백 없는 깔끔한 한국어.
 * korean.ts의 categoryToKorean은 디자인용 자간('정 책')이라 LLM 색인엔 부적합.
 */
const CATEGORY_LABEL: Record<Category, string> = {
  policy: '정책',
  'tax-finance': '세금·금융',
  market: '시장',
  stats: '통계',
  'ai-tech': 'AI·기술',
};

type Row = { title: string; url: string; tldr: string; publishedAt: string };

export async function GET() {
  const [pulses, insights] = await Promise.all([
    getCollection('pulse'),
    getCollection('insight'),
  ]);

  // 검수 미완(placeholder/noindex) 글은 LLM 색인에서 제외 — 검증된 글만 노출.
  const keep = (data: any, body?: string) =>
    !entryHasPlaceholder({ title: data.title, tldr: data.tldr, body });

  const byCategory = new Map<Category, Row[]>();
  for (const c of CATEGORY_ORDER) byCategory.set(c, []);

  for (const entry of pulses) {
    if (!keep(entry.data, entry.body)) continue;
    const cat = entry.data.category as Category;
    const list = byCategory.get(cat);
    if (!list) continue;
    list.push({
      title: entry.data.title,
      url: SITE + pulseUrl(entry.slug, entry.data.publishedAt, entry.data.category),
      tldr: entry.data.tldr,
      publishedAt: String(entry.data.publishedAt),
    });
  }

  const insightRows: Row[] = insights
    .filter((entry) => keep(entry.data, entry.body))
    .map((entry) => ({
      title: entry.data.title,
      url: SITE + insightUrl(entry.slug, entry.data.publishedAt),
      tldr: entry.data.tldr,
      publishedAt: String(entry.data.publishedAt),
    }));

  // 각 그룹 publishedAt 내림차순 정렬
  const byDateDesc = (a: Row, b: Row) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  for (const list of byCategory.values()) list.sort(byDateDesc);
  insightRows.sort(byDateDesc);

  // 마지막 갱신일 = 가장 최근 발행분 (KST). 빌드 환경 타임존 차이를 피해 publishedAt 사용.
  const allDates = [
    ...pulses.map((e) => String(e.data.publishedAt)),
    ...insights.map((e) => String(e.data.publishedAt)),
  ];
  const latest = allDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  const { year, month, day } = pulseDateParts(latest ?? new Date().toISOString());
  const totalCount =
    [...byCategory.values()].reduce((n, l) => n + l.length, 0) + insightRows.length;

  const lines: string[] = [];
  lines.push('# 스마트데이터샵 (smartdatashop.kr)');
  lines.push('');
  lines.push(
    '> 한국의 정책·세금·금융·시장·통계·AI 1차 출처 데이터를 매일 정리하는 단일 독립 데이터 저널. ' +
      '모든 글은 정부·공공기관(.go.kr/.or.kr) 등 1차 출처를 각주로 페어링하고, ' +
      'NewsArticle·FAQPage·Dataset 구조화 데이터를 발행한다.',
  );
  lines.push('');
  lines.push(
    `이 파일은 매 빌드 시 자동 생성된다. 마지막 갱신: ${year}-${month}-${day} · 색인 글 ${totalCount}건. ` +
      '각 항목은 "제목 — 핵심 요약(정의 문장 포함)" 형식이며, 링크는 1차 출처를 각주로 단 원문이다.',
  );
  lines.push('');

  // 카테고리별 섹션
  for (const cat of CATEGORY_ORDER) {
    const rows = byCategory.get(cat) ?? [];
    if (rows.length === 0) continue;
    lines.push(`## ${CATEGORY_LABEL[cat]} (${cat})`);
    lines.push('');
    for (const r of rows) lines.push(`- [${r.title}](${r.url}): ${r.tldr}`);
    lines.push('');
  }

  // 인사이트(심층 교차종합)
  if (insightRows.length > 0) {
    lines.push('## 인사이트 (insight)');
    lines.push('');
    for (const r of insightRows) lines.push(`- [${r.title}](${r.url}): ${r.tldr}`);
    lines.push('');
  }

  // 사이트 신뢰·정책 문서 (E-E-A-T / GEO 신호)
  lines.push('## 사이트 정책');
  lines.push('');
  lines.push(`- [편집 정책](${SITE}/editorial-policy/): 1차 출처 검증·환각 방지 원칙`);
  lines.push(`- [방법론](${SITE}/methodology/): 데이터 수집·검증 방법`);
  lines.push(`- [정정 정책](${SITE}/corrections/): 오류 정정 절차와 기록`);
  lines.push(`- [AI 활용 정책](${SITE}/ai-policy/): AI 보조 작성과 사람 검수 기준`);
  lines.push('');

  const body = lines.join('\n');
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
