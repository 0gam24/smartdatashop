/**
 * Citation dataset (CSV) — /data/citations.csv
 *
 * citations.json 과 동일한 데이터를 CSV 로. 학술 연구·데이터 저널리즘 도구
 * (R / pandas / Excel) 직접 import 용.
 */
import { getCollection } from 'astro:content';
import { pulseUrl, insightUrl } from '../../lib/korean';

function csvEscape(v: string | undefined): string {
  if (v == null) return '';
  const needs = /[",\n\r]/.test(v);
  const esc = v.replace(/"/g, '""');
  return needs ? `"${esc}"` : esc;
}

export async function GET() {
  const [pulses, insights, chapters] = await Promise.all([
    getCollection('pulse'),
    getCollection('insight'),
    getCollection('guidebookChapter'),
  ]);

  const lines: string[] = [];
  // Header — citations.json columns 와 동일 순서
  lines.push(
    'article_url,article_title,collection,source_index,source_name,source_url,source_date,accessed_at,source_note',
  );

  function pushRow(o: {
    article_url: string;
    article_title: string;
    collection: string;
    source_index: number;
    source_name: string;
    source_url: string;
    source_date?: string;
    accessed_at?: string;
    source_note?: string;
  }) {
    lines.push(
      [
        csvEscape(o.article_url),
        csvEscape(o.article_title),
        csvEscape(o.collection),
        String(o.source_index),
        csvEscape(o.source_name),
        csvEscape(o.source_url),
        csvEscape(o.source_date),
        csvEscape(o.accessed_at),
        csvEscape(o.source_note),
      ].join(','),
    );
  }

  for (const e of pulses) {
    const url = `https://smartdatashop.kr${pulseUrl(e.slug, e.data.publishedAt, e.data.category)}`;
    e.data.sources.forEach((s, i) => {
      pushRow({
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
      pushRow({
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
      pushRow({
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

  const csv = lines.join('\n') + '\n';
  return new Response(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'cache-control': 'public, max-age=600',
      'content-disposition': 'inline; filename="citations.csv"',
    },
  });
}
