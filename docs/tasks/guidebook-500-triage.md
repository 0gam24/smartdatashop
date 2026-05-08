# static-page 500 triage — 다음 세션 task

> 큐잉 사유: 본 이슈는 PR #5~#7 (Phase B SisterDeepDive / awoo 정정 / triage 메모) 와 무관.
> 이전 commit 어딘가에서 시작된 별개 CF Pages deploy 이슈.
> 별도 task 로 분리해 본 세션 마무리.
>
> 발견 시점: 2026-05-08
>   - 1차: guidebook 500 (PR #6 머지 직후)
>   - 2차: 정적 페이지 14종 + 동적 일부 500 (PR #7 머지 직후 추가 보고)
> 큐잉 commit: `cc5b42a` (PR #7 merge)

## 증상 (2026-05-08 14:00 KST 기준 — PR #7 머지 후 전수 health check)

### 500 페이지 list (총 17개)

**정적 페이지 14종** (모두 PolicyLayout 또는 BaseLayout 직접 사용):
- `/about/`, `/contact/`, `/methodology/`, `/corrections/`
- `/editorial-policy/`, `/ai-policy/`, `/affiliate-disclosure/`, `/privacy/`, `/terms/`
- `/insight/`, `/tag/`, `/data/`, `/guidebook/` (4종 인덱스)
- `/authors/junhyuk-kim/`

**동적 일부 3종**:
- `/topic/jongseong/` (topic 동적 라우트)
- `/guidebook/jongseong-2026/`, `/guidebook/etf-map-2026/` (책 detail)
- `/guidebook/{book}/{number}/` (chapter number 라우트)

### 200 페이지 (정상)

- `/` (홈)
- `/{year}/{month}/{day}/{slug}/` (펄스 6편 — ArticleLayout)
- `/insight/{slug}/` (인사이트 detail — InsightLayout)
- `/category/{slug}/` (5 카테고리)
- `/tag/{group}/{slug}/` (태그 detail)
- `/guidebook/{book}/{chapter-slug}/` (chapter slug 라우트)
- 모든 API endpoints (feed.xml/json, sitemap, news-sitemap, image-sitemap, citations.csv)

### Production 응답 특징

- `cf-cache-status: DYNAMIC`
- response body 0 byte
- → static asset 매칭 실패 후 Functions fallback fail

### 사실 확인 (2026-05-08)

| 항목 | 결과 |
|---|---|
| Local `npm run build` dist | ✅ 모든 파일 정상 생성 (208 files / 6.3MB / about/index.html 25KB) |
| CF Pages 모든 deploy GitHub check | ✅ success / completed |
| CF Pages preview alias URL 동일 500 | ✅ — caching 아님, deploy 자체 누락 |
| dist 안 _worker.js / _routes.json / functions/ | ❌ 없음 — pure static |
| CF Pages free tier 한도 (20K files / 25MB per file) | ✅ 한참 안 됨 |
| 본 작업 (PR #2~#7) 정적 페이지 코드 변경 | ❌ 0 변경 |

## 원인 (확정 — 2026-05-08 14:30 KST 빌드 로그 분석)

**CF Pages 의 incremental upload cache 가 stale/corrupt** — 새 빌드 시 hash 동일 파일을 "already uploaded" 로 skip 하면서, 이전에 누락 또는 corrupt deploy 된 파일이 영구 stale 상태.

PR #7 (`cc5b42a`) deploy 빌드 로그 (운영자 paste, 2026-05-08T04:32:30Z):

```
Uploading... (203/208)
Uploading... (205/208)
Uploading... (206/208)
Uploading... (208/208)
✨ Success! Uploaded 5 files (203 already uploaded) (1.12 sec)
```

→ 208 파일 중 5개만 fresh upload (PR #7 의 docs/ 추가). 203개 "already uploaded" 로 cache 신뢰. 만약 이전 deploy (PR #5 또는 PR #6 직후) 에서 정적 페이지가 정상 업로드 안 됐고 그 (corrupt) hash 가 cache 에 박힌 상태라면, 이후 모든 deploy 가 그 stale cache 신뢰 → **영구 500**.

빌드 자체는 정상:
- `[build] 60 page(s) built in 6.71s`
- 모든 정적 페이지 ✓ (about/contact/insight/guidebook/tag/data/privacy/terms/...)
- chapter URL 패턴 = number ("1", "2", ..., "12") — 코드 정합
- chapter slug 라우트 (`ch1-shingo-daesang`) 는 코드에 없는데 production 에 살아있음 = **이전 deploy 의 stale cache**

결론: chapter slug 200 = stale cache 잔존 / 정적 페이지 500 = 같은 cache 가 corrupt.

## 작업 순서 (확정 진단 후 권장 fix)

### Fix 옵션

1. **CF Pages dashboard → "Retry deployment"** (운영자 직접) — 가장 안전. fresh full upload 시도.
2. **CF Pages dashboard → 프로젝트 설정 → "Purge cache"** (있다면) — Pages cache 강제 무효화.
3. **모든 정적 페이지의 hash 강제 변경** — BaseLayout 에 build timestamp 또는 1회 cache-bust 토큰 추가 → 모든 .html hash 변경 → CF Pages 강제 재업로드 → cache 정상화.
   - PR 분리 필수
   - 다음 PR 에서 cache-bust 토큰 제거 (선택)
4. **CF Pages 프로젝트 재생성** — 운영자 외부 작업 (삭제 + 재연결) — destructive 마지막 수단.

## 주의

⚠ **빈 commit 으로 무작정 재빌드 금지**.
- slug → number 전환 시 기존 production URL (`ch1-shingo-daesang` 등) 404 → 색인 손실 위험
- redirect 또는 코드 통일이 선행되어야 안전

## 현재 진행 상태 (2026-05-08 기준)

- ✅ 빌드 로그 확보 + 원인 확정 (위 §원인 — CF Pages incremental cache stale)
- ⏳ **옵션 1 (Retry deployment) 운영자 직접 진행 중** — CF Pages dashboard 에서 retry 버튼 클릭
- 본 세션 옵션 3 (cache-bust 코드 PR) **보류** — 옵션 1 결과 확인 후 fallback

## 결과 확인 URL (옵션 1 재배포 후 운영자 시각 검증)

운영자 retry 완료 후 다음 4개 URL 시각/HTTP 확인:

| URL | 옵션 1 후 기대 |
|---|---|
| https://smartdatashop.kr/about/ | ✅ 200 — 정적 페이지 (PolicyLayout) 대표 |
| https://smartdatashop.kr/insight/ | ✅ 200 — 인덱스 페이지 (PolicyLayout 류) 대표 |
| https://smartdatashop.kr/guidebook/jongseong-2026/ | ✅ 200 — 책 detail (`[slug].astro`) |
| https://smartdatashop.kr/guidebook/jongseong-2026/ch1-shingo-daesang/ | ❌ **404 expected** — 이전 stale cache 의 chapter slug 라우트. fresh deploy 시 코드에 없으므로 사라짐 (정상 정정) |

→ 4 URL 모두 기대대로면 **cache stale 정정 완료 + 양방향 funnel 정상 가동**.

## Fallback 순서 (옵션 1 실패 시)

| 순서 | 옵션 | 진행 주체 | 시간 |
|---|---|---|---|
| 1 | Retry deployment | 운영자 (CF dashboard) | 1분 |
| 2 | Purge build cache | 운영자 (CF dashboard) | 1분 |
| 3 | BaseLayout cache-bust 코드 (모든 페이지 hash 강제 변경) | 본 세션 (PR) | 5분 |
| 4 | Pages 프로젝트 재생성 | 운영자 외부 | 30분+ |

## 전제 — 옵션 1/2/3 실행 안전성 근거

본 시점 (2026-05-08) 다음 전제로 fresh deploy 시 stale URL (chapter slug 라우트 등) **404 수용 가능**:

- ✅ Search Console 미등록 — 색인 손실 0
- ✅ 자매 사이트 5개 신규 도메인 M3~M12 합류 예정 — 현재 외부 인입 0 (cross-link 의존 0)
- ✅ slug URL 색인/외부 링크 0건 → fresh deploy 후 404 수용 가능
- ⚠ 향후 (Search Console 등록 후 / 자매 합류 후) 동일 cache stale 발생 시 — 본 전제 깨짐. 그때는 옵션 3 (cache-bust 코드) 보다 옵션 2 (Purge cache) 우선, 옵션 4 (재생성) 는 색인 영향 평가 후.

본 전제는 재발 시 동일 판단 근거로 활용.

## 영향 범위

- guidebook 라우트만 (`/guidebook/**`)
- ArticleLayout / InsightLayout / category 라우트 무관
- SisterDeepDive / 자매 sync 메커니즘 무관
- sitemap-news / RSS / OG / lighthouse 영향 없음 (이미 정상)

## 참고 commit

- `9f4dfa9` feat(ralph): 회차 4~11 — sitemap·footnote·heading 가드 + /guidebook/ 인덱스
- `ca84a3e` feat(guidebook): 위키독스 비교 4-에이전트 진단 후속
- `057178c` feat(guidebook): clickable cards + /guidebook/{slug} 라우트 신설

## 관련 컴포넌트 / 파일

- `src/pages/guidebook/index.astro` — 인덱스
- `src/pages/guidebook/[slug].astro` — 책 detail
- `src/pages/guidebook/[book]/[chapter].astro` — chapter 본문 (params 변경 후보)
- `src/components/GuidebookCard.astro` — 카드
- `src/components/ChapterTOC.astro` — chapter 목차
- `src/content/guidebook/*.json` — 책 메타
- `src/content/guidebookChapter/*.mdx` — chapter 본문
