# ADR 0007 — Sourced Content Writing 워크플로우

- 일자: 2026-05-07
- 상태: Accepted
- 관련: ADR 0005 (compensating controls), ADR 0006 (4 publication criteria)

## 배경

ADR 0005·0006 도입 후 콘텐츠 작성은 운영자가 직접 (또는 운영자 + AI 보조) 수행. Ralph 회차 1~22 운영을 통해 **콘텐츠 자동 생성 = 환각 위험 = 절대 금지** 라는 보수적 가드가 정착했다.

그러나 사이트의 정체성은 *1인 관리 + 공신력 자료 only*. 운영자가 1차 출처를 직접 발췌·정리하는 작업이 곧 제품. 이를 AI 보조 자동화 없이 수행하면 일일 cadence (Naver C-Rank 신호) 가 무너진다.

## 결정

콘텐츠 작성을 위한 별도 워크플로우 **SourceWriter** 를 정의·도입한다. Ralph (코드 refactor) 와 분리된 파이프라인이며, ADR 0006 의 4기준을 *입력 단계 강제* 로 만족시킨다.

## SourceWriter 5 단계

### Stage 1 — 운영자 (입력 정의)
- 주제 한 줄 + 후보 출처 URL 2~5 개
- 예: "5월 종소세 환급 일정 / nts.go.kr 보도자료 + hometax.go.kr 안내"

### Stage 2 — `scripts/agents/source-cache.mjs`
- 권위 호스트 화이트리스트 (`.go.kr` / `.or.kr` / `krx.co.kr` / `kosis.kr` / `law.go.kr` + `PUBLIC_TRUSTED_HOSTS` 추가) 검증
- WebFetch → `.cache/sources/{sha256-prefix}.txt` 저장
- 호스트 미일치 → reject (이 워크플로우 자체에서 차단)

### Stage 3 — SourceWriter (LLM)
- 입력: 캐시된 source text + 콘텐츠 스키마 + 톤 가이드
- 출력: `pulse` / `insight` / `guidebookChapter` MDX
- 절대 제약: cached source 외 발화 금지. 수치·인용·발표 일자 모두 source 에서 발췌.
- 현재 실행 주체: 운영자가 명시 지시한 Claude 세션 (이 conversation 류).
- 향후 자동화: `scripts/agents/source-writer.mjs` (Claude SDK 통합 — 운영자 결재 후).

### Stage 4 — `scripts/agents/source-verifier.mjs`
- draft MDX 의 모든 수치 토큰 (한국 단위 정규식) + 직접 인용을 `.cache/sources/*.txt` 에서 verbatim substring 매칭
- 미일치 1 건이라도 → exit 1 → 작성 reject
- Layer 3 (`extract-numerical-claims.mjs --strict`) + Layer 4 LITE (`fact-checker.mjs`) 사후 게이트도 통과 의무

### Stage 5 — 운영자 review
- PR diff + verifier report + ADR 0006 4기준 자가 점검
- Approve → merge → 빌드 → Cloudflare 배포
- Reject → operator 피드백 → Stage 3 재실행

## 안전 보장

### 환각 차단
- Stage 3 의 입력은 cached source 만 — 외부 지식 차단
- Stage 4 의 verbatim 매칭은 fabrication 즉시 검출
- 1 건이라도 mismatch → 작성 reject (lenient mode 도 substring 강제)

### Ralph 와의 분리
- Ralph 는 **코드 refactor** 워크플로우 — `scripts/ralph/PROMPT.md` 의 "절대 금지" 1번 (콘텐츠 컬렉션 수정 X) 그대로 유지
- SourceWriter 는 **콘텐츠 워크플로우** — 운영자가 명시 지시한 세션에서만 실행
- `scripts/ralph/scope-guard.mjs` 는 Ralph 무인 루프용 — SourceWriter 의 명시 commit 에는 적용되지 않음 (운영자 책임)

### CLAUDE.md 절대 금지 1번 ("본문 통계 새로 만들지 마라") 호환
- "**새로 만들지** 마라" = fabricate 하지 마라. SourceWriter 는 *발췌* 만 하므로 호환.
- Stage 4 의 verbatim 검증이 이 호환을 *기계적으로 강제* — 운영자가 검수 못 해도 차단.

## 즉시 도입 vs 후속

### 즉시 (이 ADR 발효 시점)
- Stage 1 + 5 = 운영자
- Stage 2 + 4 = 자동 (이 ADR 와 함께 도입된 source-cache / source-verifier 스크립트)
- Stage 3 = 운영자가 호출한 Claude 세션 — 이 conversation 류

### 후속 sprint (운영자 결재 필요)
- Stage 3 자동화 — `scripts/agents/source-writer.mjs` + Claude SDK npm install + ANTHROPIC_API_KEY env
- Stage 5 자동 PR — github CLI 로 자동 PR open
- 일일 scheduling — Cloudflare Cron Trigger 또는 GitHub Actions

## 결과

이 ADR 채택으로:
- 운영자가 매일 1~3 편 콘텐츠 발행 가능 (1차 출처 검증된 글만)
- ADR 0006 4기준이 사후 검수가 아니라 *워크플로우 입력* 으로 강제됨
- Layer 4 LITE 의 medium-risk 검출 → SourceWriter 의 verbatim 검증 으로 대체 (더 강력한 게이트)
- 1인 관리 + 공신력 자료 only 정체성을 유지하며 cadence 확보

## 폐기 / 개정 조건

- Stage 4 의 false negative 가 한 번이라도 발생 (검증 통과 → 후 fabrication 발견) → 워크플로우 즉시 중단 + ADR 개정
- Stage 3 가 cached source 외 지식을 활용한 흔적 발견 → 동일 조치
- 1차 출처 화이트리스트 호스트 변경 시 본 ADR 의 §Stage 2 갱신
