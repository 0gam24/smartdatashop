# 0003 — Toll-Gate Matrix (자매 사이트 라우팅 룰)

> **날짜**: 2026-05-05
> **상태**: 채택
> **결정자**: junhyuk-kim

## 컨텍스트

smartdatashop.kr은 "1 토픽 → N 페르소나 동시 발행" 모델로 설계되어 있고, M3~M12 동안 자매 5개(homedata / bizdata / familydata / retiredata / aidata)가 차례로 합류한다. 한 펄스 글이 어느 사이트에 우선 노출되고 어느 사이트에서는 캐노니컬 백링크만 표시할지 매번 즉흥 결정하면 SEO 중복 문제와 운영 일관성 문제가 동시에 발생한다.

## 결정

**자매 사이트 라우팅 룰을 `src/data/toll-gate-matrix.ts`에 명시적 매트릭스로 코드화한다. 토픽 × 페르소나 매핑, 캐노니컬 우선순위, 분리 트리거(페르소나 30편 + 3K 인상)를 한 파일에서 관리한다.**

## 이유

- 룰을 코드로 표현 → AI 에이전트(network-orchestrator stub)가 자동 라우팅 가능
- 12개월 로드맵에서 합류 시점마다 이 매트릭스만 업데이트하면 됨
- "왜 이 글이 homedata.kr에 가지 않고 smartdatashop에 남는가"가 데이터로 답해짐

## 대안

- **A. 매번 운영자 판단** — 자매 5개 합류 후 의사결정 비용이 폭증
- **B. 카테고리별 단순 1:1 매핑** — 한 토픽이 여러 페르소나에 가치 있을 때 유연성 부족
- **C. 외부 SaaS (Airtable 등)** — 코드와 분리되면 빌드 시점에 참조 불가

## 결과

좋은 점:
- 자매 사이트 합류 시 변경점이 `sister-sites.ts` + `toll-gate-matrix.ts` 두 파일로 한정
- network-orchestrator 에이전트의 자동 동기화 기준이 명확
- 캐노니컬 충돌이 빌드 타임에 검출 가능 (Zod refinement 추가 여지)

나쁜 점:
- 매트릭스 자체의 룰 설계가 잘못되면 다섯 사이트 모두 영향 받음 → 매분기 재검토 필수
- 새 페르소나 추가 시 매트릭스 마이그레이션 필요

## 재검토 트리거

- 자매 사이트 1개 합류 시점마다 (M3, M5, M7, M9, M11)
- 페르소나 30편 + 3K 인상 도달 시 (분리 트리거 발동)
- 매분기 콘텐츠 KPI 점검 (`operations.md` 분기 체크리스트)

## 관련

- 파일: `src/data/toll-gate-matrix.ts` / `src/data/sister-sites.ts`
- `docs/PLANNING.md` §12 — 분리 트리거 룰의 비즈니스 정의
- `docs/AGENTS.md` — network-orchestrator 에이전트 stub
- `docs/dashboard.md` — 자매 사이트 합류 일정
