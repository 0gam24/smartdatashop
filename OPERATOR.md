# 운영자 외부 작업 — smartdatashop.kr

> **이 파일은 코드 외부 작업만 다룬다.** 바이브 코딩으로 가능한 작업은 본 파일에
> 절대 등재하지 않는다 — 그건 AI 협업 세션에서 즉시 처리.
>
> 여기 등재되는 것: 외부 서비스 가입·로그인, 외부 토큰 발급, 외부 대시보드
> 설정, 도메인·DNS·SSL 설정, 운영자 명의 등록·인증 — *사람이 외부 GUI 에서
> 직접 해야 하는 것만*.
>
> **사용법**:
> - 완료한 작업은 `- [ ]` → `- [x]` 체크 (자동 비활성 표시).
> - 새 *외부* 작업은 §10 마지막 줄에 한 줄씩 append.
>
> 마지막 갱신: 2026-05-07

---

## 1. 외부 토큰·키 발급 → 환경변수 입력

각 토큰은 외부 서비스에서 운영자가 로그인 후 발급받아야 한다. 발급받은 후
**Cloudflare Pages → Settings → Environment variables** 에 키 이름으로 입력.
입력만 하면 코드는 자동 인식.

- [ ] **PUBLIC_NAVER_SITE_VERIFICATION** — searchadvisor.naver.com 로그인 →
      사이트 등록 → meta 태그 토큰 발급
- [ ] **PUBLIC_GOOGLE_SITE_VERIFICATION** — search.google.com/search-console 로그인 →
      사이트 등록 → HTML 태그 방식 토큰 발급
- [ ] **PUBLIC_CF_ANALYTICS_TOKEN** — Cloudflare 대시보드 → Web Analytics →
      Manage Site → 사이트 토큰 복사
- [ ] **PUBLIC_STIBEE_LIST_ID** — stibee.com 가입 → 발송 리스트 생성 → 리스트 ID 복사
- [ ] **PUBLIC_AUTHOR_SAMEAS** — 운영자가 LinkedIn / 네이버 블로그 / X / Brunch
      등 외부 프로필을 보유한 후, 그 URL 들을 콤마 구분으로 입력
- [ ] **PUBLIC_ORG_SAMEAS** — 사이트 자체의 외부 프로필 URL 콤마 구분
- [ ] **PUBLIC_TRUSTED_HOSTS** — SourceWriter 가 fetch 허용할 추가 권위 호스트
      (콤마 구분, 도메인만 — 예: `taxtimes.co.kr,herald.com`)

## 2. 검색엔진 사이트 등록

위 §1 의 인증 토큰 입력 후 검증 통과 → 정식 등록. 모두 외부 GUI 작업.

- [ ] **네이버 서치어드바이저** — searchadvisor.naver.com → 사이트 등록 →
      sitemap-index.xml 제출 → news-sitemap.xml 별도 제출
- [ ] **구글 서치 콘솔** — search.google.com/search-console → 도메인/URL
      등록 → sitemap-index.xml 제출
- [ ] **빙 웹마스터** — bing.com/webmasters → 사이트 등록 → sitemap 제출
- [ ] **다음 검색** — 다음 카카오 검색등록 페이지 (수동 신청)
- [ ] **Google News Publisher Center** — publishercenter.google.com →
      발행처 등록 → 카테고리·언어·국가 설정 (Google Discover 진입 게이트)
- [ ] **Naver 뉴스스탠드 / 뉴스 검색 등록** — 일정 기간 발행 누적 후 신청

## 3. 외부 서비스 가입

- [ ] **Stibee** 가입 + 발송 리스트 생성 (운영자 명의 가입 필요)
- [ ] **LinkedIn** 운영자 프로필 생성 (없을 경우)
- [ ] **네이버 블로그 / X / Brunch** 운영자 외부 채널 생성 (없을 경우)
- [ ] **Cloudflare Web Analytics** 활성화 (Cloudflare 대시보드 토글)

## 4. 도메인·DNS·SSL

운영자만 접근 가능한 등록 기관·DNS·인증서 콘솔.

- [ ] **smartdatashop.kr 도메인 등록** 갱신 — 만료 6개월 전 알림 → 갱신
- [ ] **DNS 레코드** — A/AAAA (Cloudflare Pages) + MX (Gmail 수신용 — Google
      Workspace 또는 Gmail Forwarding) 정상 작동 확인
- [ ] **SSL 인증서** — Cloudflare 자동 갱신 동작 분기 1회 확인
- [ ] **smartdatashop@gmail.com** Gmail 계정 보안 설정 (2FA 활성화) +
      smartdatashop.kr 도메인 메일 forwarding 설정 (선택)

## 5. 비즈니스·법적 등록

- [ ] **사업자등록 정보 갱신** (필요 시) — 국세청 홈택스
- [ ] **개인정보처리방침 신고** (방통위 — 일정 기준 초과 시)
- [ ] **저작권 등록** (선택) — 한국저작권위원회 (콘텐츠 보호 강화)

## 6. SourceWriter 워크플로우의 *외부* 단계

SourceWriter 5단계 중 운영자가 직접 해야 하는 부분만. 나머지(캐싱·작성·검증)는
바이브 코딩 세션에서 처리.

- [ ] 매일 주제 + 후보 출처 URL 2~5개 결정 (주제·각도 판단은 운영자 영역)
- [ ] PR 머지 결정 (review·approve — 운영자 책임)

## 7. 외부 자매 사이트 운영

본 사이트 아닌 자매 사이트 자체의 운영. 본 repo 와 무관.

- [ ] calculatorhost.com 운영
- [ ] awoo.or.kr 운영
- [ ] asiatop.co.kr 운영
- [ ] iknowhowinfo.com 운영

---

## 8. 완료한 외부 작업 (참고용)

운영자가 이미 처리한 외부 작업 항목.

- [x] **2026-05-07** — smartdatashop@gmail.com Gmail 계정 생성 및 사이트 전반 이메일 변경 결정
- [x] **2026-05-06** — 사업자등록 정보 확정 (406-06-34485 / 인천 계양 새벌로 88, 302동 1007호)

---

## 9. 추가 외부 작업 (운영자가 발생 시 append)

새로운 *외부* 작업이 생기면 아래 줄에 `- [ ] {YYYY-MM-DD} — {작업 내용}` 형식으로
한 줄씩 추가. **코드/디자인/콘텐츠 작업은 여기 절대 추가 X — 그건 AI 세션 즉시 처리.**

<!-- 여기 아래로 새 외부 작업만 append -->
- [ ]
