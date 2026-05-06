/**
 * 플레이스홀더 / 미완성 토큰 검출 헬퍼.
 *
 * 라이터 에이전트(또는 사람 기고자)가 본문에 남긴 `[검수 후 입력]` 류
 * 미완성 토큰을 검출한다. 정책 페이지의 `[TODO: 운영자 작성]` 류 토큰도
 * 동일 패턴으로 검출한다.
 *
 * 검출된 글/페이지는 `noindex` prop 으로 robots `noindex,nofollow` 출력 →
 * Discover/SEO 에 미완성 콘텐츠가 노출되는 사고를 빌드 시점에 자동 차단.
 *
 * 룰 기준 (Layer 3 — 빌드 게이트, ADR 0005):
 *   - `[검수 후 입력]`, `[검수 후]`, `[검수 후 발표일]` 류 (콘텐츠 collection 글)
 *   - `[TODO: 운영자 작성]`, `[TODO: ...]` 류 (정책/저자 정적 페이지)
 *   - title / tldr / body / 페이지 본문 어디든 1회 등장 시 noindex
 */

const PLACEHOLDER_PATTERN = /\[\s*검수\s*후[^\]]*\]/;
const TODO_PATTERN = /\[\s*TODO\b[^\]]*\]/i;
const ANY_UNRESOLVED_PATTERN = new RegExp(
  `${PLACEHOLDER_PATTERN.source}|${TODO_PATTERN.source}`,
  'i',
);

/**
 * 단일 문자열에 `[검수 후 ...]` 류 placeholder 토큰이 존재하는지 검사.
 * 콘텐츠 collection 글(.mdx)의 미완성 검출용.
 */
export function containsPlaceholder(text: string | undefined | null): boolean {
  if (!text) return false;
  return PLACEHOLDER_PATTERN.test(text);
}

/**
 * 단일 문자열에 placeholder OR `[TODO: ...]` 류 미완성 토큰이 존재하는지 검사.
 * 정책 페이지(.astro slot 본문) 와 콘텐츠 collection 양쪽 모두에 사용.
 */
export function containsUnresolvedToken(text: string | undefined | null): boolean {
  if (!text) return false;
  return ANY_UNRESOLVED_PATTERN.test(text);
}

/**
 * 콘텐츠 엔트리(타이틀/요약/본문)를 한꺼번에 검사 (placeholder 만, TODO 는 콘텐츠에 부적합).
 */
export function entryHasPlaceholder(args: {
  title?: string;
  tldr?: string;
  body?: string;
}): boolean {
  return (
    containsPlaceholder(args.title) ||
    containsPlaceholder(args.tldr) ||
    containsPlaceholder(args.body)
  );
}
