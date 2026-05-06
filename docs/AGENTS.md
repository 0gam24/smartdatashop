# AGENTS.md — 자동화 에이전트 운영 모델

> 출처 패턴: book 19470 P5 (Hermes 멀티 에이전트). 사이트 콘텐츠 파이프라인을 사람이 1편/일 검수하지 않아도 굴러가게 만드는 7-에이전트(현 5 + 미래 2) 모델.
>
> **2026-05-06 갱신**: ADR 0005 로 desk-reviewer 폐기, fact-checker 자리 마련. 본 문서는 현 상태 + 가까운 미래 (Phase 7+) 에이전트 자리도 명시한다.

---

## 한 줄 모델

> Scout(시간) → Editor(일) → Writer(일) → [build/lighthouse/verify 게이트] → Human merge → Publisher(즉시) → fact-checker(사후) ↔ Network orchestrator(일/주)

**핵심 원칙**: Discover 발행 속도와 정확성 보장의 균형은 *사전 인간 게이트* 가 아니라 *사후 자동 감사 + 본문 가시 신뢰 신호 (Trust Bar)* 로 달성한다 (ADR 0005).

---

## 현재 활성 (M0 Stub) — 6 에이전트

각 에이전트는 `scripts/agents/<name>.mjs` 와 `.github/workflows/<name>.yml` 한 쌍. 현재는 stub (heartbeat 만 남기고 종료). M1+ 에서 본격 구현.

| # | 에이전트 | 트리거 | 입력 | 출력 | 상태 |
|---|---|---|---|---|---|
| 1 | **scout** | cron `0 * * * *` UTC (매시 정각) | 외부 API/RSS | `data-queue/<topic>-<ts>.json` | M0 stub |
| 2 | **editor** | cron `0 21 * * *` UTC (06:00 KST) | `data-queue/*.json` 누적 | `daily-queue/YYYY-MM-DD.json` | M0 stub |
| 3 | **writer** | push to `daily-queue/**` | `daily-queue/*.json` | PR 생성 (drafts/<run_id> 브랜치, `src/content/pulse/<slug>.mdx`) | M0 stub |
| 4 | **publisher** | push to `main` + `src/content/(pulse\|insight)/**` | git 이벤트 페이로드 | Google Indexing API + Naver SA + Stibee 푸시 | M0 stub (env 점검만) |
| 5 | **network-orchestrator** | cron `0 14 * * *` UTC (23:00 KST) | 자매 사이트 RSS / GH_TOKEN | Slack 알림 + 다음 날 트렌드 시드 | M0 stub |
| 6 | **fact-checker** (Layer 4) | cron `0 17 * * *` UTC (02:00 KST 다음날) | 14일 윈도우 글 + sources URL | `fact-check-queue/YYYY-MM-DD.json` + 정정 PR (M1+) | M0 stub |

각 stub 의 본격 구현 전제:
- `ANTHROPIC_API_KEY` 환경변수 (모든 에이전트 공통)
- 각 에이전트별 외부 API 키 (publisher: GOOGLE_INDEXING_KEY/NAVER_SA_KEY/STIBEE_API_KEY 등)
- `scripts/agents/shared/claude-client.mjs` 의 `callClaude()` 가 의도적으로 throw — 하나라도 호출 시 빌드 실패해 stub 실수 배포 방지

---

## 폐기 (ADR 0005)

| 에이전트 | 폐기 사유 |
|---|---|
| **desk-reviewer** (구 #5) | 수동 검수 게이트 모델 폐기. 그 역할은 Layer 3 (`verify:strict` 빌드 게이트) + Layer 4 (사후 fact-checker) + Layer 5 (TrustBar UX + 정정 워크플로우) 로 분산 대체 |

---

## 미래 자리 (M1+ 또는 보류)

| # | 에이전트 | 제안 트리거 | 제안 출력 | 상태 |
|---|---|---|---|---|
| 7 | **image-generator** (선택) | writer 성공 후 workflow_run | 글마다 1200×630 cover image (DALL-E 3 또는 Stable Diffusion) | 보류 — 현재 D3=c (Satori 차트) 로 충분 |

### fact-checker (#6) M1+ 활성 절차

stub 가 작성됐고 워크플로우/스크립트 골격이 모두 준비됨. 본격 활성은 다음 5단계:

1. `npm install @anthropic-ai/sdk` (운영자 명시 승인 필요 — CLAUDE.md 룰)
2. `scripts/agents/shared/claude-client.mjs` 의 `callClaude()` 의 throw 가드 제거 + Anthropic SDK 통합
3. `scripts/agents/fact-checker.mjs` 의 `STUB_MODE = true` → `false`
4. fuzzy match 로직 본격 구현 (TODO 마커 위치):
   - 글마다 numerical claims 추출 (Layer 3 정규식 재사용)
   - `sources[].url` 에서 본문 fetch (HTML/PDF — 공공기관 PDF 가 image-only OCR 필요할 수 있음)
   - `(claim, source_excerpt)` 쌍을 Claude 에 보내 yes/no/partial/cannot-verify 분류
   - 불일치 N개 누적되면 `peter-evans/create-pull-request@v6` 로 정정 PR 자동 오픈
5. Cloudflare Pages env 에 `ANTHROPIC_API_KEY` 등록 + (선택) Slack/Resend 알림 키

비용 추정: 글당 사용 토큰 ≈ 3 sources × (claim 1KB + source excerpt 4KB) × 200 token-output ≈ 1.5K input + 200 output / claim. 5편/일 × 5 claims/편 × 30일 = 750 calls/월. Claude Haiku 4.5 가격으로 월 $3~10. Sonnet 4.6 으로 격상 시 $15~30.

---

## 자동 안전장치 5계층 매핑

ADR 0005 의 5계층 중 에이전트가 담당할 부분:

| Layer | 담당 |
|---|---|
| L1 writer 프롬프트 룰 | **writer** 시스템 프롬프트 (M1+ 본격 가동 시 적용) |
| L2 Zod 스키마 | 빌드 시점 (`npm run build` 의 Zod 검증) — 에이전트 무관 |
| L3 빌드 게이트 | `npm run verify:strict` (CI 통합) — `scripts/verify-source-links.mjs` + `scripts/extract-numerical-claims.mjs`. **인간 머지 게이트의 자동화 대체** |
| L4 사후 fact-checker | **fact-checker (#6)** — M0 stub 완료 (heartbeat + 14일 윈도우 카운트). M1+ 활성은 위 5단계 절차 |
| L5 독자 UX | `<TrustBar>` + `/corrections/` + 정정 신고 버튼. 에이전트 무관, 코드 자산 |

---

## 에이전트 수정/추가 시 검토 사항

1. **의존성 추가 시** — 운영자 명시 승인 (CLAUDE.md root 룰)
2. **Anthropic API 키 사용** — `scripts/agents/shared/claude-client.mjs` 의 `callClaude()` 직접 호출. throws 가드 제거는 별도 ADR 발행
3. **외부 API 호출 timeout** — 3s 권장, fail-open (publisher 패턴)
4. **에이전트 commit author** — `<agent-name>-bot <noreply@github.com>` 패턴
5. **새 에이전트 워크플로우 시** — `concurrency.group` 명시, secrets 의 minimum surface

---

## 관련 문서

- ADR 0005 — Compensating Controls (desk-reviewer 폐기 결정 근거)
- `docs/architecture.md` — 폴더 맵 + 자동 안전장치 5계층 다이어그램
- `docs/operations.md` — 환경변수 운영자 액션 표
- `docs/error-log.md` — 사고 자산화

## 미작성 — 운영자 직접 작성 필요 (CLAUDE.md root 가 참조하지만 부재)

- `docs/PLANNING.md` — 12개월 KPI / 자매 사이트 합류 일정
- `docs/DESIGN.md` — 디자인 토큰 / 활자 시스템 / 컴포넌트 카탈로그
