# 0002 — previewMode / verifiedBy 편집 프로토콜

> **날짜**: 2026-05-05
> **상태**: **Superseded by [0005-compensating-controls.md](./0005-compensating-controls.md) (2026-05-06)**
> **결정자**: junhyuk-kim
>
> ⚠ 이 ADR 은 폐기되었다. 1인 운영자 검수 게이트가 2026-05-06 에 자동 안전장치
> (build-time placeholder noindex / Trust Bar UX / writer 프롬프트 룰 / Layer 3 빌드 게이트)
> 로 대체되었다. 하위 호환을 위해 본 문서는 보존하되, 모든 신규 작업은 ADR 0005 를 참조한다.

## 컨텍스트

데이터 저널리즘은 사실 검증을 거치지 않은 글을 정식 발행으로 취급하면 신뢰가 즉시 무너진다. 동시에 운영자 1인이 펄스 5편/일 흐름을 유지해야 하므로, 검증 전 작업물도 사이트 빌드 / 자매 사이트 동기화 / 검색엔진 접근 측면에서 어떻게 다룰지 명확한 정책이 필요했다. 또 Google News 신청은 정식 발행 30~50편이 전제 조건이라 "정식 발행"의 정의가 명시적이어야 한다.

## 결정

**모든 펄스/인사이트 frontmatter에 `previewMode: boolean` + `verifiedBy: string | null` 두 필드를 필수화한다. `previewMode: true`인 글은 사이트 내 표시되지만 정식 발행으로 카운트하지 않으며, `verifiedBy`가 채워질 때만 정식 발행 후보가 된다.**

## 이유

- "발행됨 = 검증됨"이라는 단순 가정을 깨고 **세 단계 상태(초안 / 미검증 발행 / 검증 발행)**를 데이터로 표현
- Google News 신청 시 정식 발행 카운트를 운영자가 1초에 산출 가능 (`previewMode: false && verifiedBy != null`)
- desk-reviewer 에이전트(stub)가 향후 `verifiedBy` 자동 기재 흐름과 직결

## 대안

- **A. `draft: boolean` 단일 필드** — 발행/미발행 이분법은 "검증 전이지만 사이트엔 노출하고 싶다"를 표현 못 함
- **B. 별도 컬렉션 `pulse-draft` 분리** — collection 2배화 / 라우팅 복잡도 / 운영자 혼란
- **C. CMS Workflow 기능에만 의존** — Decap CMS Workflow는 git 기반 PR 흐름이라 1인 운영에 과중

## 결과

좋은 점:
- 현재 발행된 펄스 6편 + 인사이트 1편 모두 `previewMode: true`로 명시 → 정식 발행 0건이 데이터로 정직하게 드러남
- Google News 신청 시점이 명확히 측정됨 (`verifiedBy != null` 카운트가 30~50)
- desk-reviewer 에이전트 자동화 인터페이스가 설계됨

나쁜 점:
- 운영자가 frontmatter 두 필드를 매번 채워야 함 → Decap CMS UI에서 default 설정으로 부담 완화
- "preview"와 "draft" 단어가 헷갈릴 수 있음 → AGENTS.md에 명시

## 재검토 트리거

- 정식 발행 펄스 30편 도달 시 (Google News 신청 직전)
- 자매 사이트 합류로 multi-author 환경이 되면 (`verifiedBy`가 string 1개로 부족할 가능성)
- desk-reviewer 에이전트가 본격 가동되어 자동 verifiedBy 기재 시작 시

## 관련

- 파일: `src/content/config.ts` (Zod 스키마)
- 파일: `src/content/pulse/*.mdx` 6편 / `src/content/insight/*.mdx` 1편 (전부 previewMode: true)
- `docs/PLANNING.md` Google News 섹션
- `docs/dashboard.md` "운영 메트릭" 항목
