import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  // v1.0 의 의도는 light-only — 다크 모드는 v1.2 예정 (DESIGN.md). 'media' 는
  // OS 다크 모드 자동 감지로 토큰 없이 활성될 위험이 있어 'class' 로 명시.
  // 'class' = `<html class="dark">` 가 명시될 때만 다크 적용. v1.2 도입 시 토글 컴포넌트 추가.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: 'var(--color-paper)',
        'paper-soft': 'var(--color-paper-soft)',
        'paper-deep': 'var(--color-paper-deep)',
        ink: 'var(--color-ink)',
        'ink-2': 'var(--color-ink-secondary)',
        'ink-3': 'var(--color-ink-tertiary)',
        'ink-4': 'var(--color-ink-quat)',
        accent: 'var(--color-accent)',
        'accent-soft': 'var(--color-accent-soft)',
        link: 'var(--color-link)',
      },
      fontFamily: {
        serif: ['Noto Serif KR', 'Source Serif Pro', 'serif'],
        sans: ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      maxWidth: {
        prose: '680px',
        page: '1180px',
      },
      letterSpacing: {
        cat: '0.15em',
        lbl: '0.1em',
        'tight-h': '-0.01em',
        'tight-hero': '-0.02em',
      },
      lineHeight: {
        body: '1.85',
        tldr: '1.65',
        h1: '1.35',
      },
    },
  },
  plugins: [],
} satisfies Config;
