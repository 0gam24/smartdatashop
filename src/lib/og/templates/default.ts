/**
 * default OG 템플릿 — Reuters/Bloomberg 스타일 데이터 카드 (1200×630).
 *
 * 레이아웃:
 *   ┌────────────────────────────────────────────────────────────┐
 *   │ 카테고리 라벨 · 발행일                                       │  meta
 *   │                                                            │
 *   │ 헤드라인 (Bold 56px, 한글 친화 line-height 1.25)            │  title
 *   │                                                            │
 *   │ ───────────────────────────────────────                    │  divider
 *   │                                                            │
 *   │ [선택] sparkline (chartData 있을 때) + 차트 라벨            │  chart
 *   │                                                            │
 *   │ 📊 1차 출처 N건                    smartdatashop.kr        │  trust + brand
 *   └────────────────────────────────────────────────────────────┘
 *
 * 디자인 토큰 (DESIGN.md v1.0 정합):
 *   - background: #faf7f0 (paper)
 *   - ink primary: #1a1a1a, secondary: #5a5a5a, tertiary: #8a8a8a, quat: #cccccc
 *   - accent: #8b1538 (와인) — divider/배지 용
 *   - 폰트: Noto Sans KR 500 (본문) / 700 (헤드라인) — Pretendard CDN 차단으로 대체
 *   - border-radius ≥ 12px / box-shadow / linear-gradient 금지
 *
 * Satori 트리는 React-like JSX 객체. type/props/children 구조.
 * JSX 미사용 (tsx 트랜스파일 의존성 회피) — React.createElement 호환 객체로 직접 작성.
 */

export interface ChartData {
  type: 'line' | 'bar' | 'sparkline';
  values: number[];
  label: string;
  unit?: string;
}

export interface DefaultTemplateProps {
  /** 글 제목 — 60자 이하 권장 */
  title: string;
  /** 카테고리 한글 라벨 (자간 미적용 — JSON-LD 와 동일하게 평문) */
  category: string;
  /** 발행일 한글 (예: "2026년 5월 5일") */
  publishedDate: string;
  /** 1차 출처 수 — D8 배지 텍스트의 N */
  sourceCount: number;
  /** 옵셔널 — 있으면 차트 영역 렌더 */
  chartData?: ChartData;
}

const TOKENS = {
  paper: '#faf7f0',
  ink: '#1a1a1a',
  ink2: '#5a5a5a',
  ink3: '#8a8a8a',
  ink4: '#cccccc',
  accent: '#8b1538',
};

// 가벼운 React.createElement 호환 노드 빌더 (JSX 미사용)
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

/**
 * sparkline path — values 를 0..1 범위 정규화 후 1200px width × 100px height
 * 스트로크 폴리라인을 SVG path 명령어로 생성. Satori 가 path 를 그대로 SVG 로 보존.
 */
function sparklinePath(values: number[], width: number, height: number): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M${points[0]} L${points.slice(1).join(' L')}`;
}

export function defaultTemplate(p: DefaultTemplateProps): Node {
  // 헤드라인 길이 기반 폰트 사이즈 — 50자 초과 시 50px, 아니면 56px
  const titleSize = p.title.length > 50 ? 50 : 56;

  // sparkline SVG (option) — chartData 있을 때만
  const chartHeight = 80;
  const chartWidth = 1080; // 좌우 패딩 60px 가정
  const path = p.chartData ? sparklinePath(p.chartData.values, chartWidth, chartHeight) : '';

  return el(
    'div',
    {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px',
        backgroundColor: TOKENS.paper,
        fontFamily: 'Noto Sans KR',
      },
    },
    [
      // ── 1. 메타 라인 (카테고리 · 발행일) ──
      el(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'baseline',
            gap: '14px',
            fontSize: '20px',
            color: TOKENS.ink2,
            fontWeight: 500,
            letterSpacing: '0.05em',
            marginBottom: '32px',
          },
        },
        [
          el('span', { style: { color: TOKENS.accent, fontWeight: 700 } }, p.category),
          el('span', { style: { color: TOKENS.ink4 } }, '·'),
          el('span', {}, p.publishedDate),
        ],
      ),

      // ── 2. 헤드라인 ──
      el(
        'div',
        {
          style: {
            fontSize: `${titleSize}px`,
            lineHeight: 1.25,
            fontWeight: 700,
            color: TOKENS.ink,
            letterSpacing: '-0.015em',
            marginBottom: p.chartData ? '32px' : '0',
            // 4줄 초과 방지
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          },
        },
        p.title,
      ),

      // ── 3. spacer (차트 없을 때 헤드라인 ↔ 트러스트 띄우기) ──
      el(
        'div',
        { style: { display: 'flex', flexGrow: 1 } },
        // 의도적으로 빈 자식 — flexGrow 만 사용
        [],
      ),

      // ── 4. 차트 (옵션) ──
      ...(p.chartData
        ? [
            el(
              'div',
              {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '24px',
                },
              },
              [
                el(
                  'svg',
                  {
                    width: chartWidth,
                    height: chartHeight,
                    viewBox: `0 0 ${chartWidth} ${chartHeight}`,
                  },
                  [
                    el(
                      'path',
                      {
                        d: path,
                        stroke: TOKENS.accent,
                        strokeWidth: 2,
                        fill: 'none',
                      },
                      [],
                    ),
                  ],
                ),
                el(
                  'div',
                  {
                    style: {
                      fontSize: '16px',
                      color: TOKENS.ink3,
                      marginTop: '10px',
                      letterSpacing: '0.02em',
                    },
                  },
                  `${p.chartData.label}${p.chartData.unit ? ` (${p.chartData.unit})` : ''}`,
                ),
              ],
            ),
          ]
        : []),

      // ── 5. 트러스트 + 브랜드 푸터 ──
      el(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '20px',
            borderTop: `1px solid ${TOKENS.ink4}`,
            fontSize: '20px',
            color: TOKENS.ink2,
            fontWeight: 500,
          },
        },
        [
          el(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: '20px' } },
            [
              el('span', {}, `📊 1차 출처 ${p.sourceCount}건`),
            ],
          ),
          el(
            'div',
            {
              style: {
                fontSize: '18px',
                color: TOKENS.ink3,
                letterSpacing: '0.05em',
              },
            },
            'smartdatashop.kr',
          ),
        ],
      ),
    ],
  );
}
