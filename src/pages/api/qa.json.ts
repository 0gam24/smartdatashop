/**
 * /api/qa.json — AI 답변엔진(RAG)용 질문-답변 코퍼스.
 *
 * 전 pulse + insight 의 (핵심 요약 + 자동 추출 FAQ + 1차 출처)를 기계가독 JSON 으로
 * 제공한다. ChatGPT·Perplexity·Claude 등이 본 사이트를 인용할 때 구조를 빠르게
 * 파악하도록 돕는 GEO 신호. CORS 개방(*) 으로 외부 RAG 파이프라인에서 직접 fetch 가능.
 *
 * llms.txt(사람·LLM 색인) 과 별개로, 이 파일은 질문 단위 corpus 다.
 * 검수 미완(placeholder) 글은 제외한다.
 */
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { pulseUrl, insightUrl, categoryToKorean, type Category } from '../../lib/korean';
import { buildFaqLDFromMarkdown } from '../../lib/jsonld';
import { entryHasPlaceholder } from '../../lib/placeholder';

const SITE_URL = 'https://smartdatashop.kr';

export async function GET(_context: APIContext) {
  const [pulses, insights] = await Promise.all([
    getCollection('pulse'),
    getCollection('insight'),
  ]);

  function extractQa(body: string): Array<{ q: string; a: string }> {
    const ld = buildFaqLDFromMarkdown(body ?? '') as any;
    if (!ld || !Array.isArray(ld.mainEntity)) return [];
    return ld.mainEntity
      .map((m: any) => ({ q: String(m.name ?? ''), a: String(m.acceptedAnswer?.text ?? '') }))
      .filter((x: { q: string; a: string }) => x.q && x.a);
  }

  function toItem(entry: any, kind: 'pulse' | 'insight') {
    const url =
      kind === 'pulse'
        ? `${SITE_URL}${pulseUrl(entry.slug, entry.data.publishedAt, entry.data.category)}`
        : `${SITE_URL}${insightUrl(entry.slug, entry.data.publishedAt)}`;
    const sources = Array.isArray(entry.data.sources)
      ? entry.data.sources
          .map((s: any) => ({ name: s.name, url: s.url }))
          .filter((s: any) => s.url)
      : [];
    return {
      url,
      title: entry.data.title,
      type: kind,
      category: categoryToKorean(entry.data.category as Category).replace(/\s/g, ''),
      summary: entry.data.tldr,
      published: new Date(entry.data.publishedAt).toISOString(),
      updated: entry.data.updatedAt ? new Date(entry.data.updatedAt).toISOString() : undefined,
      sources,
      qa: extractQa(entry.body ?? ''),
    };
  }

  const items = [
    ...pulses
      .filter((e) => !entryHasPlaceholder({ title: e.data.title, tldr: e.data.tldr, body: e.body }))
      .map((e) => toItem(e, 'pulse')),
    ...insights
      .filter((e) => !entryHasPlaceholder({ title: e.data.title, tldr: e.data.tldr, body: e.body }))
      .map((e) => toItem(e, 'insight')),
  ].sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

  const corpus = {
    site: '스마트데이터샵',
    site_url: `${SITE_URL}/`,
    description:
      '한국 정책·세금·금융·부동산·연금 1차 출처 데이터 저널의 질문-답변 코퍼스. AI 답변엔진(RAG) 인용용.',
    license: 'CC BY-NC 4.0 — 출처(url) 표기 시 인용 허용',
    citation_guideline: '인용 시 각 항목의 url 을 함께 표기하고, 본문 sources(정부·공공기관 1차 출처)를 신뢰 근거로 삼으세요.',
    count: items.length,
    qa_pairs: items.reduce((n, it) => n + it.qa.length, 0),
    items,
  };

  return new Response(JSON.stringify(corpus, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=600',
    },
  });
}
