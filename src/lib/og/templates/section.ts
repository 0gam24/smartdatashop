/**
 * section OG 템플릿 — home/category/tag/author 등 비-기사 페이지용 (1200×630).
 *
 * 한 템플릿으로 모든 섹션을 커버 — eyebrow + headline + subhead + 푸터 브랜드.
 * default(article) 템플릿과 시각 언어 통일 (paper 토큰 / 와인 액센트 / Noto Sans KR).
 *
 * 레이아웃:
 *   ┌─────────────────────────────────────────────────────────┐
 *   │ EYEBROW (mono, 자간 큰 라벨)                              │
 *   │                                                         │
 *   │ 헤드라인 (Bold)                                          │
 *   │                                                         │
 *   │ 서브헤드 (1~2줄 설명)                                    │
 *   │                                                         │
 *   │ ─────────────                                          │
 *   │                                                         │
 *   │ smartdatashop.kr · 1차 출처 데이터 저널                  │
 *   └─────────────────────────────────────────────────────────┘
 */

export interface SectionTemplateProps {
  /** 상단 라벨 — 예: "C A T E G O R Y" / "A U T H O R" / "H O M E" */
  eyebrow: string;
  /** 메인 헤드라인 — 60자 이하 권장 */
  headline: string;
  /** 1~2줄 서브헤드 (선택) */
  subhead?: string;
  /** 우측 하단 보조 정보 (예: "5편 발행 · 2026-05-05") (선택) */
  footnote?: string;
}

const TOKENS = {
  paper: '#faf7f0',
  ink: '#1a1a1a',
  ink2: '#5a5a5a',
  ink3: '#8a8a8a',
  ink4: '#cccccc',
  accent: '#8b1538',
};

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

export function sectionTemplate(p: SectionTemplateProps): Node {
  const headlineSize = p.headline.length > 28 ? 80 : 96;

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
      // ── eyebrow ──
      el(
        'div',
        {
          style: {
            display: 'flex',
            fontSize: '22px',
            color: TOKENS.accent,
            fontWeight: 700,
            letterSpacing: '0.18em',
            marginBottom: '36px',
          },
        },
        p.eyebrow,
      ),

      // ── headline ──
      el(
        'div',
        {
          style: {
            fontSize: `${headlineSize}px`,
            lineHeight: 1.2,
            fontWeight: 700,
            color: TOKENS.ink,
            letterSpacing: '-0.02em',
            marginBottom: '28px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          },
        },
        p.headline,
      ),

      // ── subhead (옵션) ──
      ...(p.subhead
        ? [
            el(
              'div',
              {
                style: {
                  display: 'flex',
                  fontSize: '24px',
                  lineHeight: 1.5,
                  color: TOKENS.ink2,
                  fontWeight: 500,
                  marginBottom: '28px',
                  maxWidth: '1000px',
                },
              },
              p.subhead,
            ),
          ]
        : []),

      // spacer
      el('div', { style: { display: 'flex', flexGrow: 1 } }, []),

      // ── 브랜드 푸터 ──
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
            { style: { display: 'flex' } },
            'smartdatashop.kr · 1차 출처 데이터 저널',
          ),
          ...(p.footnote
            ? [
                el(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      fontSize: '18px',
                      color: TOKENS.ink3,
                      letterSpacing: '0.02em',
                    },
                  },
                  p.footnote,
                ),
              ]
            : []),
        ],
      ),
    ],
  );
}
