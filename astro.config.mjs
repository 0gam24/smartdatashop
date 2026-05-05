import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://smartdatashop.kr',
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
