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
