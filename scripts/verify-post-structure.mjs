#!/usr/bin/env node
/**
 * verify-post-structure.mjs — V4 포스팅 구조 엔진 자동 게이트
 *
 * 구글 scaled content(AI 대량 생성) 판정 회피를 위한 구조 린트 (2026-08-26,
 * src/content/CLAUDE.md "포스팅 구조 엔진 V4"). 문장 변주가 아니라 *문서 구조*
 * 차원의 템플릿 신호를 검사한다:
 *
 *   [FAIL — strict 시 빌드/머지 차단]
 *   - 체크리스트성 블록 2개 이상 (문서 전체 1개만 허용)
 *   - 산문 "→" 화살표 단계 표현 2회 이상 (글 전체 1회만 허용)
 *   - 산문·제목·tldr 전각 대시(—) 사용 (각주 서지·표·코드·인용 원문 예외)
 *   - FAQ 고정 정의 문형 ("Q. X는 무엇인가요?")
 *   - 템플릿 습관 문형 ("표에서 보듯" / "표를 풀어 보면" / "첫째,+둘째," 열거)
 *   - H2 헤딩 시퀀스가 기존 발행 글과 완전 동일 (구조 복제 백스톱)
 *   - 비종결 코드 펜스 (이후 검사가 무력화되므로 문서 자체 결함으로 취급)
 *   - 수치 글(수치 토큰 3+)인데 상단 리드 차트(chart frontmatter) 없음 (2026-08-26 지시)
 *
 *   [WARN — 참고 신호, 차단 안 함]
 *   - H2 슬롯(역할 버킷) 시퀀스가 다른 글과 동일 — 골격 유사 신호 (다양화는 작성자 책임)
 *   - FAQ Q&A 정확히 3개 (구 템플릿 신호) / "큰 그림" 재요약 헤딩
 *   - title 40자 초과 / tldr 목표 밴드(90~150자) 이탈
 *   - 습관 표현 ("결론적으로" / "정리하면," / "다시 말해" / "쉽게 말하면")
 *   - 본문 공백 제외 3,000자 미만 (미달 시 리서치 추가 또는 발행 보류 — 패딩 금지)
 *   - publishedAt frontmatter 파싱 실패 (게이트 침묵 우회 방지용 가시화)
 *
 * 검사 대상: publishedAt >= 2026-08-27 (KST) 발행분만.
 * 기발행 글은 소급 수정 금지(색인 보존) 원칙에 따라 검사 제외 —
 * 단 H2 시퀀스 비교의 "기준(비교 상대)"으로는 전체 글을 사용한다.
 * (V4 채택일 2026-08-26 당일 이미 발행된 3편이 있어 하드 게이트는 익일부터 —
 *  당일 이후 신규 작성분은 CLAUDE.md V4 룰 + writer.mjs 인라인 게이트가 커버)
 *
 * 사용:
 *   node scripts/verify-post-structure.mjs            # 사람이 읽는 표
 *   node scripts/verify-post-structure.mjs --json     # JSON
 *   node scripts/verify-post-structure.mjs --strict   # FAIL 1건이라도 있으면 exit 1
 *   node scripts/verify-post-structure.mjs --all      # 컷오프 무시, 전 글 진단 (소급 수정 금지 — 리포트 전용)
 *
 * writer.mjs 가 발행 직전 인라인 게이트로 analyzeStructure() 를 import 한다.
 *
 * 한계:
 *   - guidebookChapter 는 기존 verify 2종과 동일하게 미포함 (챕터는 writer-chapter 프롬프트가 담당)
 *   - 의미 차원 중복(FAQ가 본문 재서술인지)은 미검사 — 작성자·리뷰 책임
 *   - 골격 다양화의 실질 강제는 프롬프트·작성자 책임. 자동 검출은 완전 동일(fail)과
 *     슬롯 시퀀스 동일(warn)까지만 — 거짓 안전감 주의.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = join(process.cwd(), 'src/content');
const COLLECTIONS = ['pulse', 'insight'];
const CUTOFF = '2026-08-27'; // publishedAt (KST 날짜 문자열) 이 이 날짜 이상이면 검사

// ── 파싱 헬퍼 ────────────────────────────────────────────

/** frontmatter 블록과 body 분리 */
function splitDoc(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!fm) return { frontmatter: '', body: text };
  return { frontmatter: fm[1], body: text.slice(fm[0].length) };
}

/** frontmatter 단일 라인 문자열 필드 추출 (따옴표 유무 모두 허용) */
function fmField(frontmatter, name) {
  const quoted = frontmatter.match(new RegExp(`^${name}:\\s*"([\\s\\S]*?)"\\s*$`, 'm'));
  if (quoted) return quoted[1];
  const plain = frontmatter.match(new RegExp(`^${name}:\\s*([^"\\s][^\\n\\r]*?)\\s*$`, 'm'));
  return plain ? plain[1] : '';
}

const FENCE_RE = /^\s*(?:```|~~~)/;

/**
 * 본문을 라인 배열로 순회하는 공통 워커. 코드 펜스(``` / ~~~) 내부는 스킵.
 * 반환: { lines: 펜스 밖 라인 배열, unterminatedFence: 파일 끝에서 펜스 미종결 여부 }
 */
function nonFenceLines(body) {
  const out = [];
  let inFence = false;
  for (const ln of body.split(/\r?\n/)) {
    if (FENCE_RE.test(ln)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    out.push(ln);
  }
  return { lines: out, unterminatedFence: inFence };
}

/**
 * "산문 라인"만 남긴 텍스트.
 * 제외: 코드 펜스 내부, 표 라인(|…), footnote 정의([^N]: …), 인용 원문(> …).
 * 헤딩·리스트는 산문으로 취급 (화살표·대시·문형 검사 대상).
 */
function proseText(body) {
  return nonFenceLines(body)
    .lines.filter(
      (ln) =>
        !/^\s*\|/.test(ln) && // 표
        !/^\[\^[A-Za-z0-9_-]+\]:/.test(ln) && // 각주 서지
        !/^\s*>/.test(ln), // 1차 출처 인용 원문 (verbatim)
    )
    .join('\n');
}

/** H2 헤딩 텍스트 목록 */
function h2Headings(body) {
  return nonFenceLines(body)
    .lines.map((ln) => ln.match(/^##\s+(.+?)\s*$/))
    .filter(Boolean)
    .map((m) => m[1]);
}

/** H2~H4 헤딩 텍스트 목록 */
function allHeadings(body) {
  return nonFenceLines(body)
    .lines.map((ln) => ln.match(/^#{2,4}\s+(.+?)\s*$/))
    .filter(Boolean)
    .map((m) => m[1]);
}

/** H2 시퀀스 정규화 지문 — 번호·기호·공백 제거 후 연결 (완전 동일 복제 백스톱) */
function h2Signature(body) {
  const h2 = h2Headings(body).map((h) =>
    h
      .replace(/^\d+[.)]?\s*/, '') // 선행 번호
      .replace(/[\s.,·:;!?~—\-()\[\]"'`*]/g, '')
      .toLowerCase(),
  );
  return { count: h2.length, sig: h2.join('|') };
}

/**
 * H2 를 역할 버킷으로 분류한 슬롯 시퀀스 지문 — 헤딩 문구가 달라도
 * [배경→대상→금액→체크리스트→FAQ] 같은 골격 반복을 잡는 warn 급 신호.
 */
const SLOT_BUCKETS = [
  ['CHECK', /체크리스트|체크\s*포인트|확인\s*포인트|확인사항|점검|핵심\s*정리|최종\s*확인/],
  ['FAQ', /자주\s*묻는|FAQ|질문/i],
  ['WRAP', /큰\s*그림|시사점|마무리|다음\s*(행동|단계|확인)/],
  ['WHY', /배경|왜|원인|이유|무엇이\s*(발표|일어나)/],
  ['WHO', /대상|누가|요건|자격|조건/],
  ['MONEY', /얼마|금액|계산|산식|세액|환급|지원금/],
  ['HOW', /신청|방법|절차|어떻게/],
  ['CHANGE', /달라|변경|개정|바뀌/],
  ['COMP', /비교|차이|대조|vs/i],
];

function slotOf(heading) {
  for (const [slot, re] of SLOT_BUCKETS) {
    if (re.test(heading)) return slot;
  }
  return 'ETC';
}

function slotSignature(body) {
  const slots = h2Headings(body).map(slotOf);
  return { count: slots.length, sig: slots.join('>') };
}

const CHECKLIST_HEADING_RE =
  /체크리스트|체크\s*포인트|확인\s*포인트|확인사항|핵심\s*정리|최종\s*확인|점검\s*(항목|목록|표)/;
const BOX_LINE_RE = /^\s*[-*]\s*(?:[☐□]|\[ \])/;
const LIST_LINE_RE = /^\s*(?:[-*]\s|\d+[.)]\s)/;

/**
 * 체크리스트성 블록 수 — 섹션(H2~H4 헤딩 단위) 기준으로 센다:
 *   - 헤딩이 체크리스트성이고 섹션 안에 리스트 항목이 실제 존재 → 1블록
 *     (체크박스 없는 서술형 "~ 점검 항목 발표" 헤딩 오탐 방지)
 *   - 헤딩이 체크리스트성 섹션의 하위(비매칭 H3/H4)면 상위 블록에 흡수
 *   - 그 외 섹션에 체크박스 라인(- ☐ / - [ ])이 있으면 섹션당 1블록
 *     (항목 사이 산문이 끼어도 분할 카운트하지 않음)
 */
function countChecklistBlocks(body) {
  const { lines } = nonFenceLines(body);
  // 섹션 분할: 헤딩 라인 인덱스 수집
  const sections = [];
  let current = { heading: '', level: 0, parentChecklist: false, lines: [] };
  let checklistLevel = 0; // 현재 활성 체크리스트성 헤딩의 레벨 (0 = 없음)
  for (const ln of lines) {
    const h = ln.match(/^(#{2,4})\s+(.+?)\s*$/);
    if (h) {
      sections.push(current);
      const level = h[1].length;
      const isChecklistHeading = CHECKLIST_HEADING_RE.test(h[2]);
      // 상위 체크리스트 섹션 하위의 비매칭 소제목이면 흡수
      const parentChecklist = checklistLevel > 0 && level > checklistLevel && !isChecklistHeading;
      if (isChecklistHeading) checklistLevel = level;
      else if (level <= checklistLevel) checklistLevel = 0;
      current = { heading: h[2], level, isChecklistHeading, parentChecklist, lines: [] };
    } else {
      current.lines.push(ln);
    }
  }
  sections.push(current);

  let count = 0;
  for (const s of sections) {
    if (s.parentChecklist) continue; // 상위 체크리스트 블록에 흡수
    const hasList = s.lines.some((ln) => LIST_LINE_RE.test(ln));
    const hasBox = s.lines.some((ln) => BOX_LINE_RE.test(ln));
    if (s.isChecklistHeading && hasList) count += 1;
    else if (!s.isChecklistHeading && hasBox) count += 1;
  }
  return count;
}

/** 공백·마크다운 기호 제외 대략적 본문 자수 */
function roughCharCount(body) {
  return nonFenceLines(body)
    .lines.filter((ln) => !/^\[\^[A-Za-z0-9_-]+\]:/.test(ln))
    .join('')
    .replace(/[\s|#>*`\-=_\[\]()!]/g, '').length;
}

// ── 파일별 분석 (writer.mjs 인라인 게이트에서도 사용) ──────

export function analyzeStructure(text, opts = {}) {
  const { frontmatter, body } = splitDoc(text);
  const title = fmField(frontmatter, 'title');
  const tldr = fmField(frontmatter, 'tldr');
  const publishedAt = fmField(frontmatter, 'publishedAt');

  const prose = proseText(body);
  const fails = [];
  const warns = [];

  // 0. 비종결 코드 펜스 — 이후 검사 전체가 무력화되므로 문서 결함으로 fail
  if (nonFenceLines(body).unterminatedFence) {
    fails.push('비종결 코드 펜스(``` / ~~~) — 문서 결함, 이후 구조 검사 신뢰 불가');
  }

  // 1. 체크리스트성 블록 1개 초과
  const checklistBlocks = countChecklistBlocks(body);
  if (checklistBlocks >= 2) {
    fails.push(`체크리스트성 블록 ${checklistBlocks}개 — 문서 전체 최대 1개 (V4-4)`);
  }

  // 2. 산문 화살표 2회 이상
  const arrowCount = (prose.match(/→/g) ?? []).length;
  if (arrowCount >= 2) {
    fails.push(`산문 "→" ${arrowCount}회 — 글 전체 최대 1회 (V4-5)`);
  }

  // 3. 전각 대시 — 산문·제목·tldr 금지 (AI 문체 룰)
  const dashInProse = (prose.match(/—/g) ?? []).length;
  const dashInMeta = ((title + tldr).match(/—/g) ?? []).length;
  if (dashInProse + dashInMeta > 0) {
    fails.push(
      `전각 대시(—) ${dashInProse + dashInMeta}회 (산문 ${dashInProse} / 제목·tldr ${dashInMeta}) — 금지 (AI 문체 룰)`,
    );
  }

  // 4. FAQ 고정 정의 문형
  if (/\*\*\s*Q\d*[.．)]?\s*[^*\n]*(무엇인가요|무엇일까요|뭔가요)\s*\?/.test(body)) {
    fails.push('FAQ 고정 정의 문형 ("X는 무엇인가요?") — 정의는 tldr·도입 담당 (V4-4)');
  }

  // 5. 템플릿 습관 문형 (fail 급)
  for (const phrase of ['표에서 보듯', '표를 풀어 보면', '표를 풀어보면']) {
    if (prose.includes(phrase)) {
      fails.push(`표 재서술 개시 문형 "${phrase}" — 표 직후 해설은 표에 없는 함의만 (V4-4)`);
    }
  }
  if (prose.includes('첫째,') && prose.includes('둘째,')) {
    fails.push('"첫째,/둘째," 열거 문형 — 금지 습관 표현 (V4-5)');
  }

  // 6. 습관 표현 (warn 급)
  for (const phrase of ['결론적으로', '정리하면,', '다시 말해', '쉽게 말하면']) {
    if (prose.includes(phrase)) {
      warns.push(`습관 표현 "${phrase}" — 꼭 필요한 단발 사용인지 확인 (V4-5)`);
    }
  }

  // 7. FAQ 개수·재요약 헤딩 (warn 급)
  const faqQCount = (body.match(/^\*\*\s*Q\d+[.．)]/gm) ?? []).length;
  if (faqQCount === 3) {
    warns.push('FAQ Q&A 정확히 3개 — 구 템플릿 고정 개수 신호. 실제 후속 질문 수인지 확인 (V4-4)');
  }
  if (allHeadings(body).some((h) => h.includes('큰 그림'))) {
    warns.push('"큰 그림" 헤딩 — 구 재요약 슬롯 신호. 마무리는 다음 행동 제시로 (V4-4)');
  }

  // 8. 메타 밴드 (warn 급 — Zod 상한은 빌드가 검사)
  if (title.length > 40) warns.push(`title ${title.length}자 — 목표 30~40자 (V4)`);
  if (tldr && (tldr.length > 150 || tldr.length < 90)) {
    warns.push(`tldr ${tldr.length}자 — 목표 90~150자 밴드 이탈 (V4)`);
  }

  // 9. 대략 자수 (warn 급)
  const chars = roughCharCount(body);
  if (chars < 3000) {
    warns.push(
      `본문 약 ${chars}자(공백·MD 제외) — 3,000자 미만이면 리서치 추가 또는 발행 보류 (V4-6, 패딩 금지)`,
    );
  }

  // 10. 상단 리드 차트 (2026-08-26 운영자 지시 — 매 글 상단 1개)
  //     수치가 실린 글(대략 3개+ 수치 토큰)인데 chart frontmatter 가 없으면 fail,
  //     수치가 거의 없는 글은 warn (억지 차트 = AI 티 — 차트화할 수치가 없으면 예외 허용).
  //     연도("2026년")·나이는 ADR 0006 이 발표일 명시를 의무화해 모든 글에 등장하므로
  //     차트화 가능 수치로 세지 않는다 (년·세 접미사 제외).
  //     chart.alt 필수·형식은 Zod(빌드)가 검사한다.
  //     opts.skipChartCheck: writer.mjs 자동 발행 인라인 게이트용 — 자동 파이프라인은
  //     아직 chart frontmatter 를 생성할 수 없어 이 검사만 제외한다 (CI 게이트는 유지).
  if (!opts.skipChartCheck) {
    const hasChart = /^chart:/m.test(frontmatter);
    if (!hasChart) {
      const numericTokens = (
        prose.match(/\d+(?:[.,]\d+)?\s*(?:%|원|명|건|개|억|조|만\s*원|포인트|배)/g) ?? []
      ).length;
      if (numericTokens >= 3) {
        fails.push(
          `상단 리드 차트 없음 (수치 토큰 ${numericTokens}개) — 수치 글은 chart frontmatter 의무 (§상단 차트)`,
        );
      } else {
        warns.push('상단 리드 차트 없음 — 차트화할 수치가 정말 없는 글인지 확인 (§상단 차트)');
      }
    }
  }

  return {
    title,
    publishedAt,
    fails,
    warns,
    h2: h2Signature(body),
    slots: slotSignature(body),
  };
}

// ── 메인 ────────────────────────────────────────────────

async function main() {
  const args = new Set(process.argv.slice(2));
  const asJson = args.has('--json');
  const strict = args.has('--strict');
  const checkAll = args.has('--all');

  const isChecked = (publishedAt) => {
    if (checkAll) return true;
    if (!publishedAt) return false; // publishedAt 없는 파일은 빌드(Zod)가 잡는다 — 아래에서 warn 가시화
    return publishedAt.slice(0, 10) >= CUTOFF;
  };

  // 1 pass: 전체 파일 로드 (시퀀스 비교 기준 확보)
  const files = [];
  const parseFailures = [];
  for (const c of COLLECTIONS) {
    let entries = [];
    try {
      entries = (await readdir(join(ROOT, c))).filter((f) => f.endsWith('.mdx'));
    } catch {
      continue;
    }
    for (const filename of entries) {
      const text = await readFile(join(ROOT, c, filename), 'utf8');
      const analyzed = analyzeStructure(text);
      if (!analyzed.publishedAt) parseFailures.push(`${c}/${filename}`);
      files.push({ collection: c, filename, ...analyzed });
    }
  }

  // 2 pass: 시퀀스 비교 — 검사 대상 파일만 판정
  for (const f of files) {
    if (!isChecked(f.publishedAt)) continue;
    if (f.h2.count >= 3) {
      const dup = files.find(
        (o) => o !== f && o.collection === f.collection && o.h2.sig === f.h2.sig,
      );
      if (dup) {
        f.fails.push(
          `H2 헤딩 시퀀스가 ${dup.filename} 과 완전 동일 — 구조 복제 금지, 골격 재구성 (V4-1)`,
        );
      }
    }
    if (f.slots.count >= 4) {
      const similar = files.filter(
        (o) => o !== f && o.collection === f.collection && o.slots.sig === f.slots.sig,
      );
      if (similar.length > 0) {
        f.warns.push(
          `H2 슬롯 시퀀스 [${f.slots.sig}] 가 ${similar.length}편과 동일 (예: ${similar[0].filename}) — 골격 유사 신호, 다양화 검토 (V4-1)`,
        );
      }
    }
  }

  const checked = files.filter((f) => isChecked(f.publishedAt));
  const result = checked.map(({ collection, filename, publishedAt, fails, warns }) => ({
    collection,
    filename,
    publishedAt,
    fails,
    warns,
  }));

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (checked.length === 0) {
      console.log(`[verify-structure] 검사 대상 0건 (publishedAt >= ${CUTOFF} 발행분 없음)`);
    }
    for (const f of result) {
      const mark = f.fails.length > 0 ? '❌' : f.warns.length > 0 ? '⚠' : '✅';
      console.log(`\n${mark} ${f.collection}/${f.filename}`);
      for (const v of f.fails) console.log(`  ❌ ${v}`);
      for (const w of f.warns) console.log(`  ⚠ ${w}`);
      if (f.fails.length === 0 && f.warns.length === 0) console.log('  구조 위반 없음');
    }
    if (parseFailures.length > 0) {
      console.log(
        `\n⚠ publishedAt 파싱 실패 ${parseFailures.length}건 (게이트 판정 불가 — frontmatter 확인): ${parseFailures.join(', ')}`,
      );
    }
  }

  const totalFails = result.reduce((n, f) => n + f.fails.length, 0);
  const totalWarns = result.reduce((n, f) => n + f.warns.length, 0);
  if (!asJson) {
    console.log(
      `\n[verify-structure] 검사 ${checked.length}편 — FAIL ${totalFails}건 / WARN ${totalWarns}건 (컷오프 ${checkAll ? '무시(--all)' : CUTOFF})`,
    );
  }

  if (strict && totalFails > 0) {
    process.exit(1);
  }
}

// 직접 실행 시에만 main 구동 (writer.mjs 가 analyzeStructure 를 import 할 때는 미실행)
const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(2);
  });
}
