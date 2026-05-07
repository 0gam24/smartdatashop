# 운영자 작업 목록 — smartdatashop.kr

> 운영자(김준혁)가 직접 해야 할 일 (코드 외 작업) 통합 관리.
>
> **사용법**:
> - 완료한 작업은 `- [ ]` → `- [x]` 로 체크 → 자동으로 비활성 표시.
> - 새 작업은 *§추가 작업* 섹션 마지막 줄에 한 줄씩 append.
> - 매월 점검 시 본 파일 갱신 (CLAUDE.md §운영 사이클).
>
> 마지막 갱신: 2026-05-07

---

## 1. 환경변수 (Cloudflare Pages → Settings → Environment variables)

각 항목은 코드에 *없어도 빌드 통과* — 미설정 시 해당 기능만 비활성. 운영자가 키 발급 받는 즉시 입력.

- [ ] `PUBLIC_NAVER_SITE_VERIFICATION` — 네이버 서치어드바이저 인증 토큰 (searchadvisor.naver.com 발급)
- [ ] `PUBLIC_GOOGLE_SITE_VERIFICATION` — 구글 서치 콘솔 인증 토큰 (search.google.com/search-console 발급)
- [ ] `PUBLIC_CF_ANALYTICS_TOKEN` — Cloudflare Web Analytics 토큰 (Cloudflare 대시보드 → Web Analytics)
- [ ] `PUBLIC_STIBEE_LIST_ID` — Stibee 뉴스레터 구독 리스트 ID (stibee.com 가입 후)
- [ ] `PUBLIC_AUTHOR_SAMEAS` — 운영자 외부 프로필 URL (콤마 구분 — LinkedIn / 네이버 블로그 / X / Brunch)
- [ ] `PUBLIC_ORG_SAMEAS` — 사이트 외부 프로필 URL (콤마 구분)
- [ ] `PUBLIC_TRUSTED_HOSTS` — SourceWriter 추가 권위 호스트 (콤마 구분, 선택)

## 2. 검색엔진 등록

서비스 출범 게이트. 위 환경변수 인증 토큰 입력 후 진행.

- [ ] **네이버 서치어드바이저** — searchadvisor.naver.com → 사이트 등록 → sitemap-index.xml 제출 → news-sitemap.xml 별도 제출
- [ ] **구글 서치 콘솔** — search.google.com/search-console → 도메인 또는 URL 등록 → sitemap-index.xml 제출
- [ ] **빙 웹마스터** — bing.com/webmasters → 사이트 등록 → sitemap 제출
- [ ] **다음 검색** — 다음 카카오 검색등록 (수동 신청)
- [ ] **Google News Publisher Center** — publishercenter.google.com → 발행처 등록 → 카테고리·언어·국가 설정 (Discover 진입 게이트)

## 3. 외부 서비스 가입·연동

- [ ] **Stibee** 가입 + 발송 리스트 생성 → ID 를 `PUBLIC_STIBEE_LIST_ID` 에 설정
- [ ] **LinkedIn** 운영자 프로필 → `PUBLIC_AUTHOR_SAMEAS` 에 추가
- [ ] **네이버 블로그 / X / Brunch** 등 외부 채널 → `PUBLIC_AUTHOR_SAMEAS` 에 추가
- [ ] **Cloudflare Web Analytics** 활성화 → 토큰을 `PUBLIC_CF_ANALYTICS_TOKEN` 에 설정

## 4. 콘텐츠 검수 (Layer 4 LITE 산출물)

매주 Cron 또는 수동으로 `node scripts/agents/fact-checker.mjs` 실행 후 `fact-check-queue/{date}.json` 의 medium/high-risk 항목 검토.

- [ ] **medium-risk 5편 footnote 보강** — 본문의 수치 옆 `[^N]` 마커 수 ≥ claims/3 가 되도록 보강 → 다음 audit 시 low 강하
   - 대상은 fact-check-queue 의 최신 JSON 의 `audited[].riskLevel === 'medium'` 항목 참조
- [ ] **high-risk 항목 발견 시** — 즉시 수정 또는 글 자체 unpublish (frontmatter 에 placeholder 토큰 추가 → 자동 noindex)

## 5. SourceWriter 워크플로우 활용 (ADR 0007)

매일 1~3 편 발행 cadence 유지 (Naver C-Rank 신호).

- [ ] 주제 + 후보 출처 URL 2~5개 결정
- [ ] `node scripts/agents/source-cache.mjs <URL...>` 실행 (자동 화이트리스트 검증)
- [ ] 운영자가 본 사이트 Claude 세션에 "주제 + 캐시된 출처" 전달 → draft 작성 위임
- [ ] `node scripts/agents/source-verifier.mjs <draft.mdx>` 실행 → 미검증 수치 0 확인
- [ ] PR 생성·검토·머지 → 빌드 자동 배포

## 6. 정기 점검 (월간)

- [ ] **매주** — `fact-check-queue/` 의 최신 audit JSON 검토 (medium/high-risk 보강)
- [ ] **매주** — `OPERATOR_INBOX.md` 자동 생성 메시지 확인 (Stibee 미설정 알림 등)
- [ ] **매월** — `docs/error-log.md` 점검 (CLAUDE.md §운영 사이클)
- [ ] **매월** — 하네스 정기 리뷰 (CLAUDE.md / ADR 0005~0007 갱신 필요 여부)
- [ ] **매월** — `/data/citations.json` 의 `host_distribution` 검토 (권위 호스트 비중 ≥ 50% 유지)
- [ ] **매월** — `/authors/junhyuk-kim/` KPI 자동 집계 결과 검토 (발행 활동 추세)

## 7. 디자인·콘텐츠 운영

- [ ] 새 가이드북 추가 시 `src/content/guidebook/{slug}.json` 생성 (totalChapters / completedChapters / publishedAt)
- [ ] 가이드북 챕터 추가 시 `src/content/guidebookChapter/{book}-ch{N}-{slug}.mdx` 생성
- [ ] 새 토픽 큐레이션 추가 시 `src/data/topics.ts` 의 `TOPICS` 배열에 항목 push
- [ ] 자매 사이트 변경 시 `src/data/sister-sites.ts` 갱신

## 8. 인프라 변경

- [ ] **Cloudflare Pages 배포 도메인** — Apex (smartdatashop.kr) + www CNAME 정상 작동 확인
- [ ] **DNS** — A·AAAA·MX (Gmail) 확인
- [ ] **SSL 인증서** — Cloudflare 자동 갱신 동작 확인 (분기 1회)
- [ ] **백업** — GitHub repo 가 1차 백업, 추가 외부 백업 검토 (선택)

---

## 9. 완료한 작업 (참고용 — 자동으로 비활성 표시)

운영자가 이미 처리한 항목. 새 항목 추가 시 §1~8 에 [ ] 로, 완료 후 [x] 처리.

- [x] **2026-05-07** — 운영자 이메일 변경 (`editor@smartdatashop.kr` → `smartdatashop@gmail.com`) — 15 파일 전 사이트 일괄 교체
- [x] **2026-05-07** — ADR 0007 SourceWriter 워크플로우 채택
- [x] **2026-05-07** — Layer 4 fact-checker LITE 가동 (STUB → 정적 audit)
- [x] **2026-05-07** — NewsMediaOrganization LD 16 필드 강화
- [x] **2026-05-07** — JSON Feed (/feed.json) 신설 + RSS 강화
- [x] **2026-05-06** — 가이드북 1권 (5월 종합소득세) 12 챕터 발행
- [x] **2026-05-06** — ADR 0005 (Compensating Controls) + ADR 0006 (4 publication criteria) 채택

---

## 10. 추가 작업 (운영자가 발생 시 append)

새로운 운영자 작업이 생기면 아래 줄에 `- [ ] {YYYY-MM-DD} — {작업 내용}` 형식으로 한 줄씩 추가.

<!-- 여기 아래로 새 작업 append -->
- [ ]
