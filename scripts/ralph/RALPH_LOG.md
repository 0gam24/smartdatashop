# Ralph 회차 로그 — smartdatashop.kr

> [PROMPT.md](./PROMPT.md) 기반 constrained Ralph 의 회차별 audit trail.
> append-only. 운영자가 한 번에 audit 할 수 있도록 시간 역순 (최신 위).

## 시작 메모 (2026-05-07)

- 운영 모델: in-session demonstrative iterations (외부 무한 루프 X)
- 초기 표적: smoke-test.mjs 의 가이드북 라우트 미커버 영역
- 가드: scope-guard.mjs + npm build/smoke/check 3중 게이트
- 종료 후보: 가이드북 smoke 검증 10개 추가 시 자가 종료

---

---

## 2026-05-07T07:50Z — 회차 1: 가이드북 책 detail 검증 추가

**작업**: smoke-test.mjs 에 가이드북 라우트 검증 §11 신설.
**파일**: scripts/smoke-test.mjs (+25 line).
**검증 추가**: (a) 책 ≥1권 존재, (b) 모든 책 detail HTML 빌드, (c) Book LD, (d) Breadcrumb LD.
**결과**: smoke 25 → 29 통과. 회귀 0.
**scope-guard**: PASS.

---

## 2026-05-07T07:55Z — 회차 2: 챕터 라우트 reading aids 검증

**작업**: 챕터 detail HTML 에서 (a) ReadingProgress 마운트, (b) ChapterTOC 마운트,
(c) 읽기시간 메타("분 읽기"), (d) TrustBar, (e) footnote 섹션 노출 — 5종 검증.
**파일**: scripts/smoke-test.mjs (+30 line).
**결과**: smoke 29 → 35 통과 (챕터 13편 모두 5/5 통과). 회귀 0.
**scope-guard**: PASS.

---

## 2026-05-07T08:00Z — 회차 3: 챕터 정합성 + LD + 라이선스

**작업**: 챕터 (a) robots ↔ placeholder 정합 (펄스와 동일 패턴),
(b) Breadcrumb LD, (c) CC license link.
**파일**: scripts/smoke-test.mjs (+22 line).
**결과**: smoke 35 → 38 통과. 회귀 0.
**scope-guard**: PASS.

---

## 다음 후보 (post-회차 3)

1. 챕터 prev/next 네비게이션 양방향성 검증 (첫 챕터는 prev 없음, 마지막은 "목록으로")
2. 책 detail 의 ItemList LD 챕터 수 ↔ guidebook 컬렉션 totalChapters 정합
3. 챕터 sources[] 수 ↔ TrustBar 표기 "1차 출처 N건" 정합
4. heading id (h2/h3) 자동 부여 회귀 가드 — Astro MDX 의존
5. /guidebook/ 인덱스 페이지 (현재 미존재) — 별도 라우트 신설 필요 시 추가 작업

