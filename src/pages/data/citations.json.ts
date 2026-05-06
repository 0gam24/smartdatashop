/**
 * Citation dataset — /data/citations.json
 *
 * 본 사이트의 모든 발행 글에서 frontmatter sources[] 를 집계해 단일 JSON 으로
 * 공개. 1차 출처 인용 그래프 (학술/연구용) — Schema.org Dataset LD 의 distribution
 * 필드가 가리키는 실제 데이터 파일.
 *
 * 라이선스: CC BY-NC 4.0 (사이트 전체 정책 동일).
 * 갱신 주기: 매 빌드 (운영자 push 시점).
 */
import { getCollection } from 'astro:content';
import { pulseUrl, insightUrl } from '../../lib/korean';

interface CitationRow {
  article_url: string;
  article_title: string;
  collection: 'pulse' | 'insight' | 'guidebookChapter';
  source_index: number;
  source_name: string;
  source_url: string;
  source_date?: string;
  accessed_at?: string;
  source_note?: string;
}

export async function GET() {
  const [pulses, insights, chapters] = await Promise.all([
    getCollection('pulse'),
    getCollection('insight'),
    getCollection('guidebookChapter'),
  ]);

  const rows: CitationRow[] = [];

  for (const e of pulses) {
    const url = `https://smartdatashop.kr${pulseUrl(e.slug, e.data.publishedAt)}`;
    e.data.sources.forEach((s, i) => {
      rows.push({
        article_url: url,
        article_title: e.data.title,
        collection: 'pulse',
        source_index: i + 1,
        source_name: s.name,
        source_url: s.url,
        source_date: s.date,
        accessed_at: s.accessedAt,
        source_note: s.note,
      });
    });
  }
  for (const e of insights) {
    const url = `https://smartdatashop.kr${insightUrl(e.slug)}`;
    e.data.sources.forEach((s, i) => {
      rows.push({
        article_url: url,
        article_title: e.data.title,
        collection: 'insight',
        source_index: i + 1,
        source_name: s.name,
        source_url: s.url,
        source_date: s.date,
        accessed_at: s.accessedAt,
        source_note: s.note,
      });
    });
  }
  for (const e of chapters) {
    const url = `https://smartdatashop.kr/guidebook/${e.data.bookSlug}/${e.data.chapterNumber}/`;
    e.data.sources.forEach((s, i) => {
      rows.push({
        article_url: url,
        article_title: e.data.title,
        collection: 'guidebookChapter',
        source_index: i + 1,
        source_name: s.name,
        source_url: s.url,
        source_date: s.date,
        accessed_at: s.accessedAt,
        source_note: s.note,
      });
    });
  }

  const payload = {
    name: '스마트데이터샵 Citation Dataset',
    description: '본 사이트 모든 발행 글의 1차 출처 인용 그래프',
    version: new Date().toISOString().slice(0, 10),
    license: 'https://creativecommons.org/licenses/by-nc/4.0/',
    publisher: 'smartdatashop.kr',
    record_count: rows.length,
    article_count: pulses.length + insights.length + chapters.length,
    columns: [
      'article_url',
      'article_title',
      'collection',
      'source_index',
      'source_name',
      'source_url',
      'source_date',
      'accessed_at',
      'source_note',
    ],
    rows,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=600',
    },
  });
}
