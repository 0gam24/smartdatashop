/**
 * Tag taxonomy helpers — PLANNING.md §17.
 *
 * Single source of truth for the 14 tag values mirrored from
 * src/content/config.ts (tagGroupsSchema). Keep this file in lockstep
 * with the zod enums there: any change to the enum lists must be
 * reflected here so the dynamic /tag/ routes stay exhaustive.
 *
 * The tag values are Korean strings used directly as URL segments.
 * Browsers percent-encode multi-byte chars on the wire (e.g.
 * /tag/persona/사회초년생/ → /tag/persona/%EC%82%AC%ED%9A%8C%EC%B4%88%EB%85%84%EC%83%9D/),
 * but Astro's static path matching and href rendering treat them
 * uniformly — the address bar typically shows the readable Korean form.
 * We deliberately avoid romanization slugs to keep URLs intuitive for
 * Korean readers.
 */

import type { CollectionEntry } from 'astro:content';

// ── Tag value union types (mirror src/content/config.ts enums) ────────
export type PersonaTag =
  | '사회초년생'
  | '신혼부부'
  | '1인사업자'
  | '4050은퇴'
  | '투자자';

export type DataTypeTag =
  | '정부발표'
  | '분기지표'
  | '월간지표'
  | '실시간시장'
  | '법안';

export type ActionTag =
  | '신청가능'
  | '마감임박'
  | '장기관점'
  | '정성심화';

export type TagValue = PersonaTag | DataTypeTag | ActionTag;

/** URL group segment for /tag/{group}/{value}/ routes. */
export type TagGroup = 'persona' | 'data-type' | 'action';

// ── Canonical lists (the 14 distinct values) ──────────────────────────
export const PERSONA_TAGS: readonly PersonaTag[] = [
  '사회초년생',
  '신혼부부',
  '1인사업자',
  '4050은퇴',
  '투자자',
] as const;

export const DATA_TYPE_TAGS: readonly DataTypeTag[] = [
  '정부발표',
  '분기지표',
  '월간지표',
  '실시간시장',
  '법안',
] as const;

export const ACTION_TAGS: readonly ActionTag[] = [
  '신청가능',
  '마감임박',
  '장기관점',
  '정성심화',
] as const;

/** Korean label shown above each tag group. */
export const GROUP_LABEL: Record<TagGroup, string> = {
  persona: '페르소나',
  'data-type': '데이터 유형',
  action: '액션',
};

/** Group → ordered tag values (for index page + 관련 태그 strip). */
export const GROUP_VALUES: Record<TagGroup, readonly TagValue[]> = {
  persona: PERSONA_TAGS,
  'data-type': DATA_TYPE_TAGS,
  action: ACTION_TAGS,
};

/** Reverse lookup: tag value → group. */
const VALUE_TO_GROUP = new Map<TagValue, TagGroup>([
  ...PERSONA_TAGS.map((v) => [v, 'persona'] as const),
  ...DATA_TYPE_TAGS.map((v) => [v, 'data-type'] as const),
  ...ACTION_TAGS.map((v) => [v, 'action'] as const),
]);

export function groupOf(value: TagValue): TagGroup {
  const g = VALUE_TO_GROUP.get(value);
  if (!g) throw new Error(`Unknown tag value: ${value}`);
  return g;
}

/**
 * Build the URL for a tag page. Uses the raw Korean string as the
 * slug — Astro generates the static path file with the real Korean
 * dirname, browsers/runtime fetch it via percent-encoding transparently.
 */
export function tagUrl(group: TagGroup, value: TagValue): string {
  return `/tag/${group}/${value}/`;
}

// ── Entry filtering / counting ───────────────────────────────────────
type TaggedEntry =
  | CollectionEntry<'pulse'>
  | CollectionEntry<'insight'>;

/** Does this entry carry the given (group, value) tag? */
export function entryHasTag(
  entry: TaggedEntry,
  group: TagGroup,
  value: TagValue,
): boolean {
  const tags = entry.data.tags;
  if (group === 'persona') {
    return (tags.personas as readonly string[]).includes(value);
  }
  if (group === 'data-type') {
    return (tags.dataTypes as readonly string[]).includes(value);
  }
  return (tags.actions as readonly string[]).includes(value);
}

/** Count how many entries from the input array carry (group, value). */
export function countEntries(
  group: TagGroup,
  value: TagValue,
  entries: readonly TaggedEntry[],
): number {
  let n = 0;
  for (const e of entries) if (entryHasTag(e, group, value)) n++;
  return n;
}
