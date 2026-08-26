/**
 * 리드 차트 생성기 — 본문 상단 데이터 차트 WebP (2026-08-26 운영자 지시).
 *
 * frontmatter `chart` 스펙 → Satori → SVG → Resvg PNG → sharp WebP.
 * 라우트 /charts/{pulse|insight}/{slug}.webp 가 빌드 타임에 글마다 정적 생성.
 *
 * 디자인 원칙 (AI 생성 티 제거 — FT/Reuters 데이터 그래픽 문법):
 *   - paper 배경(#faf7f0) + 단일 강조색(와인 #8b1538) + 웜 뉴트럴 막대
 *   - 그리드 최소화, 값 직접 표기(direct labeling), 축 헤어라인만
 *   - 이모지·그라데이션·그림자·라운드 금지 (DESIGN 토큰 정합)
 *   - 이미지 안에 제목·단위·자료 출처 포함 — 이미지 단독으로도 자기완결
 *     (이미지 검색·Discover 에서 낱장으로 노출돼도 맥락 유지)
 *
 * 데이터 무결성: series 값은 본문에서 footnote 페어링된 검증 수치만 사용한다
 * (src/content/CLAUDE.md §상단 차트, ADR 0006). 이 모듈은 렌더만 담당.
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { OG_FONTS } from './fonts';

export interface ChartSpec {
  type: 'bar' | 'line';
  title: string;
  unit?: string;
  source: string;
  alt: string;
  series: Array<{ label: string; value: number }>;
  highlight?: number;
}

export const CHART_WIDTH = 1200;
export const CHART_HEIGHT = 675;

const TOKENS = {
  paper: '#faf7f0',
  ink: '#1a1a1a',
  ink2: '#5a5a5a',
  ink3: '#8a8a8a',
  ink4: '#cccccc',
  accent: '#8b1538',
  barNeutral: '#d8d1c2', // paper 와 조화되는 웜 그레이 (강조 대비용)
};

const PAD = 64;

type Node = {
  type: string;
  props: Record<string, unknown> & { children?: Node[] | string | (Node | string)[] };
};
function el(
  type: string,
  props: Record<string, unknown>,
  children?: Node[] | string | (Node | string)[],
): Node {
  return { type, props: { ...props, children } };
}

/** 값 표기 — 정수는 천단위 콤마, 소수는 그대로 (최대 2자리). */
function formatValue(v: number): string {
  const rounded = Math.round(v * 100) / 100;
  return Number.isInteger(rounded)
    ? rounded.toLocaleString('ko-KR')
    : rounded.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

/** ── 가로 막대 (비교·한도·금액에 적합) ── */
function barRows(spec: ChartSpec): Node {
  const max = Math.max(...spec.series.map((s) => Math.abs(s.value))) || 1;
  const highlightIdx = spec.highlight ?? spec.series.length - 1;
  const barArea = 660; // label 230 + gap + value 영역 제외한 막대 최대 px
  const rowH = spec.series.length <= 3 ? 52 : spec.series.length <= 5 ? 44 : 36;

  const rows = spec.series.map((s, i) => {
    const isHi = i === highlightIdx;
    const w = Math.max(8, Math.round((Math.abs(s.value) / max) * barArea));
    return el(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          height: `${rowH}px`,
        },
      },
      [
        el(
          'div',
          {
            style: {
              width: '230px',
              fontSize: '22px',
              fontWeight: isHi ? 700 : 500,
              color: isHi ? TOKENS.ink : TOKENS.ink2,
              justifyContent: 'flex-end',
              display: 'flex',
              paddingRight: '20px',
            },
          },
          s.label,
        ),
        el('div', {
          style: {
            width: `${w}px`,
            height: `${Math.round(rowH * 0.62)}px`,
            backgroundColor: isHi ? TOKENS.accent : TOKENS.barNeutral,
            display: 'flex',
          },
        }),
        el(
          'div',
          {
            style: {
              fontSize: '24px',
              fontWeight: 700,
              color: isHi ? TOKENS.accent : TOKENS.ink,
              marginLeft: '14px',
              display: 'flex',
            },
          },
          formatValue(s.value),
        ),
      ],
    );
  });

  return el(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flexGrow: 1,
        gap: spec.series.length <= 3 ? '30px' : '18px',
      },
    },
    rows,
  );
}

/** ── 라인 (시계열·추이에 적합) ── */
function lineChart(spec: ChartSpec): Node {
  const w = CHART_WIDTH - PAD * 2; // 1072
  const h = 330;
  const values = spec.series.map((s) => s.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padY = h * 0.14;
  const padX = 14; // 양 끝 점·스트로크가 캔버스에 잘리지 않도록 플롯 인셋
  const stepX = (w - padX * 2) / (values.length - 1);
  const pt = (v: number, i: number) => ({
    x: padX + i * stepX,
    y: h - padY - ((v - min) / range) * (h - padY * 2),
  });
  const points = values.map(pt);
  const path = `M${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')}`;

  const first = points[0];
  const last = points[points.length - 1];

  // 값 라벨: 첫 점·끝 점만 직접 표기 (FT 문법 — 과밀 방지)
  const valueLabel = (p: { x: number; y: number }, v: number, isEnd: boolean) =>
    el(
      'div',
      {
        style: {
          position: 'absolute',
          left: `${Math.min(Math.max(p.x - 60, 0), w - 120)}px`,
          top: `${Math.max(p.y - 40, 0)}px`,
          width: '120px',
          display: 'flex',
          justifyContent: isEnd ? 'flex-end' : 'flex-start',
          fontSize: '23px',
          fontWeight: 700,
          color: isEnd ? TOKENS.accent : TOKENS.ink,
        },
      },
      formatValue(v),
    );

  // x축 라벨: 첫·끝은 항상, 중간은 6개 이하일 때만
  const showAll = spec.series.length <= 6;
  const xLabels = spec.series.map((s, i) => {
    if (!showAll && i !== 0 && i !== spec.series.length - 1) return null;
    const p = points[i];
    return el(
      'div',
      {
        style: {
          position: 'absolute',
          left: `${Math.min(Math.max(p.x - 70, 0), w - 140)}px`,
          top: `${h + 10}px`,
          width: '140px',
          display: 'flex',
          justifyContent: i === 0 ? 'flex-start' : i === spec.series.length - 1 ? 'flex-end' : 'center',
          fontSize: '20px',
          fontWeight: 500,
          color: TOKENS.ink3,
        },
      },
      s.label,
    );
  });

  return el(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flexGrow: 1,
      },
    },
    [
      el(
        'div',
        { style: { position: 'relative', width: `${w}px`, height: `${h + 44}px`, display: 'flex' } },
        [
          el(
            'svg',
            { width: w, height: h, viewBox: `0 0 ${w} ${h}` },
            [
              // 베이스라인 헤어라인
              el('line', { x1: 0, y1: h - 1, x2: w, y2: h - 1, stroke: TOKENS.ink4, strokeWidth: 1 }, []),
              el('path', { d: path, stroke: TOKENS.accent, strokeWidth: 3.5, fill: 'none' }, []),
              // 시작점 (뉴트럴) · 끝점 (강조)
              el('circle', { cx: first.x, cy: first.y, r: 6, fill: TOKENS.paper, stroke: TOKENS.ink2, strokeWidth: 2.5 }, []),
              el('circle', { cx: last.x, cy: last.y, r: 7, fill: TOKENS.accent }, []),
            ],
          ),
          valueLabel(first, values[0], false),
          valueLabel(last, values[values.length - 1], true),
          ...(xLabels.filter(Boolean) as Node[]),
        ],
      ),
    ],
  );
}

function chartTemplate(spec: ChartSpec): Node {
  return el(
    'div',
    {
      style: {
        width: `${CHART_WIDTH}px`,
        height: `${CHART_HEIGHT}px`,
        display: 'flex',
        flexDirection: 'column',
        padding: `${PAD}px`,
        backgroundColor: TOKENS.paper,
        fontFamily: 'Noto Sans KR',
      },
    },
    [
      // ── 헤더: 제목 + 단위 ──
      el(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: '8px',
          },
        },
        [
          el(
            'div',
            {
              style: {
                fontSize: '31px',
                fontWeight: 700,
                color: TOKENS.ink,
                letterSpacing: '-0.01em',
                display: 'flex',
              },
            },
            spec.title,
          ),
          ...(spec.unit
            ? [
                el(
                  'div',
                  { style: { fontSize: '20px', fontWeight: 500, color: TOKENS.ink3, display: 'flex' } },
                  `단위: ${spec.unit}`,
                ),
              ]
            : []),
        ],
      ),
      // 제목 아래 강조 헤어라인 (짧은 액센트 바 — 저널 그래픽 관습)
      el('div', {
        style: {
          width: '46px',
          height: '4px',
          backgroundColor: TOKENS.accent,
          marginBottom: '20px',
          display: 'flex',
        },
      }),

      // ── 차트 본체 ──
      spec.type === 'bar' ? barRows(spec) : lineChart(spec),

      // ── 푸터: 자료 출처 + 브랜드 ──
      el(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '18px',
            borderTop: `1px solid ${TOKENS.ink4}`,
            fontSize: '19px',
            fontWeight: 500,
            color: TOKENS.ink3,
          },
        },
        [
          el('div', { style: { display: 'flex' } }, `자료: ${spec.source}`),
          el(
            'div',
            { style: { display: 'flex', letterSpacing: '0.04em' } },
            'smartdatashop.kr',
          ),
        ],
      ),
    ],
  );
}

/**
 * 차트 스펙 → WebP 버퍼 (1200×675, 16:9).
 * sharp 는 Astro 이미지 서비스가 이미 의존하는 패키지 — 신규 설치 없음.
 */
export async function generateLeadChartWebp(spec: ChartSpec): Promise<Buffer> {
  const svg = await satori(chartTemplate(spec) as Parameters<typeof satori>[0], {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    fonts: OG_FONTS,
  });
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: CHART_WIDTH },
    background: TOKENS.paper,
  })
    .render()
    .asPng();
  return sharp(Buffer.from(png)).webp({ quality: 82, effort: 5 }).toBuffer();
}
