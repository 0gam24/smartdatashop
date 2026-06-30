import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';

export default defineConfig({
  site: 'https://smartdatashop.kr',
  // 마크다운: GFM 유지하되 홑물결(~) 취소선은 끈다.
  // 본문 범위 표기("10~25만 원", "19~34세")가 단일 ~ 두 개 사이를
  // 취소선(<del>)으로 잘못 렌더되던 버그 차단 — 이중물결(~~)만 취소선.
  // gfm:false 로 Astro 내장 gfm(singleTilde:true 기본)을 끄고
  // remark-gfm 을 singleTilde:false 로 직접 주입. MDX 는 markdown 설정 상속.
  markdown: {
    gfm: false,
    remarkPlugins: [[remarkGfm, { singleTilde: false }]],
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    sitemap({
      // 한국어 단일 로케일 기준 — 추후 다국어 확장 시 i18n 옵션을 켠다.
      // PLANNING.md §13 — 9개 정적 정책 페이지 라우트는 customPages로 명시.
      // (해당 페이지들이 빌드되기 전에도 sitemap에 노출하기 위함)
      // /article은 최신 펄스로의 meta-refresh 리디렉트 셸이라 색인 가치가 없다 —
      // 중복 콘텐츠로 잡히지 않도록 sitemap에서 제외한다.
      // /admin/config.yml(엔드포인트)도 CMS 전용이라 색인 대상이 아니다.
      // page는 'https://smartdatashop.kr/path/' 형식의 절대 URL.
      filter: (page) => {
        const path = page.replace(/^https?:\/\/[^/]+/, '');
        return path !== '/article/' && path !== '/article' && !path.startsWith('/admin');
      },
      customPages: [
        'https://smartdatashop.kr/about/',
        'https://smartdatashop.kr/editorial-policy/',
        'https://smartdatashop.kr/ai-policy/',
        'https://smartdatashop.kr/corrections/',
        'https://smartdatashop.kr/contact/',
        'https://smartdatashop.kr/privacy/',
        'https://smartdatashop.kr/terms/',
        'https://smartdatashop.kr/affiliate-disclosure/',
        'https://smartdatashop.kr/authors/junhyuk-kim/',
      ],
    }),
  ],
});
