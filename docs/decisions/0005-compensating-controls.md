# 0005 — 검수 게이트 → 자동 안전장치 5계층 (Compensating Controls)

> **날짜**: 2026-05-06
> **상태**: 채택
> **결정자**: junhyuk-kim
> **대체 대상**: [0002-preview-mode-protocol.md](./0002-preview-mode-protocol.md)

## 컨텍스트

ADR 0002 의 수동 `previewMode` / `verifiedBy` 게이트는 1인 운영자에게 비현실적임이
드러났다 — 운영자 본인이 "혼자 모든 걸 검수할 수 없다" 고 명시. 동시에 사이트 전략은
Google News (30~50 정식 발행 + 신청 절차) 에서 **Google Discover (자동 적격, 별도
신청 없음)** 로 전환됐다. Discover 는 E-E-A-T / 이미지 / Dataset 스키마 / freshness 신호를
가중하는 알고리즘이라, "수동 검수 통과한 글 30편" 보다 "자동 안전장치로 보호된 빠른
발행 사이클" 이 더 적합하다.

단순 게이트 삭제는 위험하다 — `docs/error-log.md` 와 `docs/code-review-2026-05-05.md` 가
기록하듯 라이터 에이전트가 ⌜정부 통계 placeholder⌟ 를 본문에 박은 사고가 실재했다.
게이트의 빈자리는 자동화로 대체해야 한다.

## 결정

ADR 0002 의 수동 검수 게이트를 폐기하고, 4관점 에이전트 합의 (Risk/SEO/Eng/Ops) 로
도출한 **5계층 자동 안전장치 (Layer 1 ~ 5)** 로 대체한다. 게이트가 막던 실패 모드를
자동화로 일대일 대응시킨다.

| Layer | 위치 | 무엇을 막는가 | 구현 상태 |
|---|---|---|---|
| **L1** writer 프롬프트 룰 | `scripts/agents/writer.mjs` 시스템 프롬프트 | 수치 옆 출처 토큰 강제 / "충격" ban / 미래 일자 ban | M1+ writer 본격 가동 시 |
| **L2** Zod 스키마 | `src/content/config.ts` | sources `min(1)` (pulse) / `min(2)` (insight) / `chartData` 스키마 | ✅ Phase 1 완료 |
| **L3** 빌드 게이트 | `src/lib/placeholder.ts` + 동적 라우트 + `verify-source-links.mjs` | placeholder 색인 / 죽은 출처 URL | ✅ Phase 0 완료 (`entryHasPlaceholder` → noindex 자동), `--strict` 링크 검증은 Phase 4 |
| **L4** 사후 fact-check | (예정) `scripts/agents/fact-checker.mjs` cron 02:00 KST | placeholder 통과한 출처-vs-주장 불일치 | Phase 4 예정 |
| **L5** 독자 UX | `src/components/TrustBar.astro` + `/corrections/` + 정정 신고 버튼 | 시각적 신뢰 신호 부족 / 오류 보고 채널 | ✅ Phase 1 완료 (TrustBar) |

## 이유

- **솔로 운영자 현실**: 매일 5편 × 30일 × 검수 = 150 결정/월. 자동 게이트가 같은 일을
  사람보다 일관되게 수행
- **Discover 적합성**: 게이트로 늦어진 발행은 freshness 손실. Layer 들은 발행 속도
  유지하면서 placeholder/죽은 링크/AI 환각 등을 구조적으로 차단
- **회복 가능성**: 게이트 (실패 = 발행 중단) 보다 사후 fact-check + 정정 워크플로우 (실패 =
  24h 내 정정 PR) 가 솔로 운영자의 회복 능력에 더 부합
- **YMYL 법적 노출**: 정보통신망법 §44-2 / 형법 §307 / KFTC 표시광고법은 "검수했는지"
  가 아니라 "오류가 발견되면 24h 내 시정하는 가시 채널이 있는지" 를 핵심 기준으로 봄.
  Layer 5 의 가시 정정 워크플로우가 이 요구를 충족

## 대안

- **A. ADR 0002 유지** — 솔로 운영자 비현실성 + Discover freshness 손실로 기각
- **B. 게이트만 제거, 자동화 미도입** — 라이터 에이전트 출력의 placeholder 가 그대로
  Discover 노출되어 E-E-A-T 페널티. 4관점 합의에서 모두 반대
- **C. 자동 머지 (Writer auto-merge)** — Ops 에이전트만 찬성. 솔로의 "마지막 인적
  방어선" 보호를 위해 D2=ii 합의로 인간 머지 유지

## 결과

좋은 점:
- 운영자 일일 작업이 검수에서 발행으로 이동 — 페이스 안정
- placeholder 자동 noindex 로 Phase 0 즉시 적용 가능 (실제 6 pulse + 1 insight noindex 처리)
- TrustBar 가 본문 진입 즉시 신뢰 신호 노출 (E-E-A-T 가시성 강화)
- ADR 0002 의 80개 placeholder 작업 큐 가 Phase 0 noindex 로 무산기 진입 — 운영자가
  점진적으로 다시 쓰면 자동으로 색인 복귀

나쁜 점:
- 사후 fact-check (L4) 가 가동되기 전 (Phase 4) 까지는 라이터 에이전트의 placeholder
  통과 시 noindex 만으로 보호 — Discover 영향은 0이지만 사이트 내부 노출은 됨
- writer 프롬프트 룰 (L1) 도 M1+ 본격 가동 전까지는 효과 0 — 현재는 stub
- ADR 0002 의 데이터 ("정식 발행 N편") 카운터 가 폐기되어 Google News 신청 시점
  측정이 단순화 (Discover 전환으로 News 신청 자체가 우선순위에서 후순위)

## 재검토 트리거

- L4 fact-checker 가동 후 30일 무사고 → D2 (인간 머지) 자동화 검토
- placeholder 통과 색인 사고 1건이라도 발생 시 → L3 빌드 게이트 강화
- 자매 사이트 합류 시 → multi-author Person LD 구조 재설계

## 관련

- 폐기: `docs/decisions/0002-preview-mode-protocol.md` (Superseded)
- 삭제: `docs/verification-queue.md` (운영적 작업 큐, 게이트 폐기로 무용)
- 코드: `src/lib/placeholder.ts` (Layer 3 핵심), `src/components/TrustBar.astro` (Layer 5 핵심)
- 코드: `src/content/config.ts` (Layer 2 — `previewMode/verifiedBy` 필드 삭제, `chartData` 추가)
- 삭제: `src/components/{ArticlePreviewWarning,PreviewBanner,VerifiedBadge}.astro`
- 삭제: `.github/workflows/desk-review.yml`, `scripts/agents/desk-reviewer.mjs`
