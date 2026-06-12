# 운영 체크리스트

> 출처 패턴: book 19307 P4 (시간 예산) + P7 (세션 종료 의식) + book 19470 P7 (정기 리뷰).
> 시간 예산은 **상한선**. 초과하면 구조 문제 신호.

---

## 매 작업 세션 시작 (5분)

- [ ] `docs/dashboard.md` 확인 (30초)
- [ ] 직전 인셉션로그 / 지난 commit 메시지 (1분)
- [ ] 30분 단위 작업 단위 정의 (20초)
- [ ] `docs/AGENTS.md` / 관련 디렉토리 `CLAUDE.md` 확인
- [ ] (큰 작업이면) SDD 명세 1~2페이지 작성 (book 19303 P4)

## 매 작업 세션 종료 (3분)

- [ ] 한 일 (1줄)
- [ ] 막힌 곳 (없으면 "없음")
- [ ] 다음 시작점 (1줄)
- [ ] 변경 파일 / commit
- [ ] `docs/dashboard.md` 갱신 (마지막 작업 일시 + 다음 할 일)

## 매주 (15분)

- [ ] `docs/error-log.md`에 새 에러 자산화 (5분 이상 디버깅한 것)
- [ ] **`npm run verify`** — 1차 출처 링크 헬스 + 수치 주장 페어링 감사 (Layer 3)
- [ ] **Search Console Discover 보고서** — Discover 노출 / 클릭 / 페이지별 인사이트 확인
- [ ] **GSC URL 제거 요청 큐** — `[검수 후 입력]` 토큰 잔존 글이 색인 시도된 흔적 있으면 제거
- [ ] 자매 사이트 4개 최신 글 RSS 점검
- [ ] 펄스 발행 빈도 확인 (운영자 작성 대기 카운트)
- [ ] dashboard.md "운영 메트릭" 수동 갱신

## 매월 (30분) — 하네스 정기 리뷰 (book 19470 P7)

- [ ] `docs/AGENTS.md` 무효 규칙 제거
- [ ] 무시되는 규칙 원인 분석 (왜 AI가 이 규칙을 따르지 않는가)
- [ ] 신 패턴 추가 (지난 한 달 반복 교정 → 룰화)
- [ ] Hook 효과 측정 (PostToolUse / SubagentStop / Stop)
- [ ] `docs/decisions/` 폴더 ADR 정리
- [ ] `docs/error-log.md` 같은 에러 반복 시 → CLAUDE.md/Hook으로 영구 차단

## 매분기 (1시간) — 콘텐츠 KPI 점검

- [ ] `PLANNING.md` §4 12개월 KPI 대비 진행률
- [ ] 사이트 분리 트리거 점검 (페르소나 30편 + 3K 인상 룰 → ADR 0003)
- [ ] 자매 사이트 합류 일정 재조정
- [ ] 참고서적 5권 (`docs/references/`) 패턴 중 새로 적용할 것 검토

---

## 시간 예산 (book 19307 + 19303 통합)

| 작업 | 예산 | 초과 시 신호 |
|---|---|---|
| 대시보드 확인 | 30초 | 너무 많은 정보 → 압축 |
| 인셉션로그 작성 | 3분 | 작업 단위가 너무 큼 |
| 컨텍스트 전환 (사이트/모듈 갈아탐) | 5분 | `architecture.md` 보강 필요 |
| 작업 단위 1개 | 30분 | 모듈 분리 잘못됨 (book 19303 P2) |
| SDD 명세 작성 | 1시간 | 큰 작업 가치 있음 — 정상 |
| ADR 발자국 | 30초 | 복잡하면 별도 문서로 분리 |
| 새 자매 사이트 시작 | 1주 (5단계 × 8시간) | book 19303 P1 로드맵 |
| 하네스 정기 리뷰 | 30분/월 | book 19470 P7 |

---

## 환경변수 운영자 액션 (1회 입력)

ADR 0005 의 자동 안전장치는 일부 동적 신호를 환경변수로 받는다. Cloudflare Pages
Settings → Environment variables 에 한 번 입력하면 코드 변경 없이 즉시 LD/UI 반영.

| 변수 | 용도 | 형식 |
|---|---|---|
| `PUBLIC_AUTHOR_SAMEAS` | 김준혁 외부 프로필 (Person LD `sameAs` + 저자 페이지) | 콤마 구분 URL — `https://linkedin.com/in/...,https://blog.naver.com/...` |
| `PUBLIC_ORG_SAMEAS` | 사이트 SNS (Organization LD `sameAs`) | 동상 |
| `PUBLIC_NAVER_SITE_VERIFICATION` | 네이버 서치어드바이저 토큰 | 토큰 문자열 |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | 구글 서치 콘솔 토큰 (HTML 태그 인증용) | **불필요** — 2026-05-10 GSC 도메인 속성(DNS)으로 소유권 인증 완료. 도메인 속성은 HTML 태그 인증을 쓰지 않음 |
| `PUBLIC_CF_ANALYTICS_TOKEN` | Cloudflare Web Analytics | 토큰 (미설정 시 beacon 미발행) |
| `PUBLIC_STIBEE_LIST_ID` | Stibee 뉴스레터 폼 | 리스트 ID (미설정 시 fallback 모드) — 뉴스레터 개시 결정 시에만 |

---

## 안티패턴 빠른 점검

세션 시작 전 1초 자문 (book 19307 + 19303 통합):

- [ ] "Accept All" 무한 루프 아닌가? (검토 없이 승인 X)
- [ ] 노트 없이 코드부터 시작하지 않았는가?
- [ ] 30분 안 끝나는 작업을 분할했는가?
- [ ] 변경 사항 commit 단위가 원자적인가?
- [ ] 같은 실수가 반복되고 있다면 룰 파일에 반영했는가?

---

## 관련 문서

- `docs/dashboard.md` — 30초 스캔용 현재 상태
- `docs/error-log.md` — 디버깅 자산
- `docs/AGENTS.md` — 룰 파일
- `docs/decisions/` — ADR
- `docs/references/01-바이브코딩-왜-실패하는가.md` — 시간 예산 / 안티패턴 출처
- `docs/references/03-함께해요-하네스-엔지니어링.md` — 정기 리뷰 출처
