#!/usr/bin/env node
/**
 * auto-cover.mjs — 표지 이미지 자동 매핑 (D3, Solo Ops 합의 #5)
 *
 * 운영자 워크플로우:
 *   1. 1200×630 16:9 표지 이미지를 `public/uploads/covers/<slug>.{webp,jpg,png}` 에 업로드.
 *   2. `npm run build` (또는 prebuild) 실행 시 본 스크립트가 자동으로 매칭된 글의
 *      frontmatter `coverImage` 필드를 `/uploads/covers/<slug>.<ext>` 로 주입.
 *   3. coverImage 가 이미 명시된 글은 건드리지 않음 (운영자 명시 우선).
 *
 * 의도:
 *   운영자가 매 글마다 frontmatter `coverImage:` 필드를 수기 입력하는 부담 제거.
 *   파일을 폴더에 두기만 하면 자동 매핑 — Solo Ops 가장 큰 ROI.
 *
 * 안전장치:
 *   - 파일이 없으면 동적 OG v2 카드로 자동 폴백 (이미 BaseLayout/route 가 처리).
 *   - 1200px 미만 이미지 발견 시 console.warn (Discover 1관문 미달).
 *   - 이미 frontmatter 에 coverImage 가 있으면 무수정 (덮어쓰기 금지).
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const COVERS_DIR = join(ROOT, 'public', 'uploads', 'covers');
const CONTENT_ROOT = join(ROOT, 'src', 'content');
const COLLECTIONS = ['pulse', 'insight'];
const EXT_PRIORITY = ['webp', 'jpg', 'jpeg', 'png'];
const MIN_WIDTH_BYTES = 50_000; // 대략적 휴리스틱 — 1200×630 webp 가 ~30KB+, png 가 ~150KB+

if (!existsSync(COVERS_DIR)) {
  console.log(`[auto-cover] ${COVERS_DIR} 없음 — 스킵 (운영자가 표지 이미지 업로드하지 않음)`);
  process.exit(0);
}

let coversAvailable;
try {
  coversAvailable = readdirSync(COVERS_DIR);
} catch {
  console.log(`[auto-cover] covers 디렉토리 읽기 실패 — 스킵`);
  process.exit(0);
}

if (coversAvailable.length === 0) {
  console.log(`[auto-cover] covers 디렉토리 비어 있음 — 스킵`);
  process.exit(0);
}

/** slug 에 매칭되는 파일을 EXT_PRIORITY 순으로 검색 */
function findCoverForSlug(slug) {
  for (const ext of EXT_PRIORITY) {
    const filename = `${slug}.${ext}`;
    if (coversAvailable.includes(filename)) {
      return { filename, ext };
    }
  }
  return null;
}

/** mdx 파일에서 slug (파일명에서 .mdx 제외) 도출 */
function slugFromFilename(filename) {
  return filename.replace(/\.mdx$/, '');
}

/** frontmatter 에서 특정 필드를 텍스트 매칭으로 추출 (YAML 파서 미사용) */
function hasFrontmatterField(text, field) {
  const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return false;
  return new RegExp(`^${field}:\\s*`, 'm').test(fmMatch[1]);
}

/** frontmatter 끝(`\n---`) 직전에 새 필드 라인을 삽입 */
function injectFrontmatterField(text, field, value) {
  const fmMatch = text.match(/^---\r?\n([\s\S]*?\r?\n)---/);
  if (!fmMatch) return text;
  const fm = fmMatch[1];
  const newFm = fm + `${field}: "${value}"\n`;
  return text.replace(fmMatch[0], `---\n${newFm}---`);
}

let injected = 0;
let skipped = 0;
let warned = 0;

for (const collection of COLLECTIONS) {
  const dir = join(CONTENT_ROOT, collection);
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  } catch {
    continue;
  }
  for (const filename of files) {
    const slug = slugFromFilename(filename);
    const cover = findCoverForSlug(slug);
    if (!cover) continue; // 매칭 파일 없음 — 동적 OG 폴백 유지

    const filepath = join(dir, filename);
    const text = readFileSync(filepath, 'utf8');
    if (hasFrontmatterField(text, 'coverImage')) {
      skipped++; // 운영자 명시 우선
      continue;
    }

    // 파일 크기 휴리스틱 — 너무 작으면 1200×630 미달 의심
    const coverPath = join(COVERS_DIR, cover.filename);
    const size = statSync(coverPath).size;
    if (size < MIN_WIDTH_BYTES) {
      console.warn(
        `[auto-cover] ⚠ ${cover.filename} 가 ${(size / 1024).toFixed(0)}KB 로 작음 — 1200×630 미달 가능성. Discover 1관문 미달 위험.`,
      );
      warned++;
    }

    const coverUrl = `/uploads/covers/${cover.filename}`;
    const updated = injectFrontmatterField(text, 'coverImage', coverUrl);
    writeFileSync(filepath, updated, 'utf8');
    injected++;
    console.log(`[auto-cover] ✓ ${collection}/${filename} ← ${coverUrl}`);
  }
}

console.log(
  `[auto-cover] 완료 — 주입 ${injected} / 운영자 명시 우선 ${skipped} / 크기 경고 ${warned}`,
);
process.exit(0);
