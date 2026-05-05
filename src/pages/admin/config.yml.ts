/**
 * Decap CMS 설정 — 빌드 시점에 환경에 맞게 생성한다.
 *
 * 정적 `public/admin/config.yml`을 그대로 배포하면 `local_backend: true`가
 * 프로덕션에 노출되어 운영 의도를 드러내고 저장소 경로를 그대로 알려준다.
 * 이 엔드포인트는 dev 모드에서만 `local_backend: true`를 포함시키고,
 * 프로덕션 빌드(`npm run build`)에서는 이 줄을 제거한다.
 *
 * 산출 경로: `/admin/config.yml` (정적 파일과 동일하므로 `public/admin/index.html`
 * 의 Decap 로더가 변경 없이 그대로 동작한다).
 */
import type { APIRoute } from 'astro';

const HEADER = `# Decap CMS 설정 — 스마트데이터샵
# 백엔드 연동(GitHub OAuth) 가이드: https://decapcms.org/docs/github-backend/`;

const BACKEND = `backend:
  name: github
  repo: 0gam24/smartdatashop
  branch: main`;

const REST = `site_url: https://smartdatashop.kr
display_url: https://smartdatashop.kr

media_folder: "public/uploads"
public_folder: "/uploads"

# 한국어 라벨 사용을 위해 i18n은 사용하지 않고 label만 한글로 둡니다.
collections:
  # ──────────────────────────────────────────────────────────
  # 8.1 펄스 (일일)  →  src/content/pulse  (type: 'content', mdx)
  # ──────────────────────────────────────────────────────────
  - name: "pulse"
    label: "펄스 (일일)"
    label_singular: "펄스"
    folder: "src/content/pulse"
    extension: "mdx"
    format: "frontmatter"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    summary: "{{title}} — {{publishedAt}}"
    fields:
      - { name: "title", label: "제목", widget: "string", required: true, hint: "최대 60자 (Zod max(60))" }
      - { name: "publishedAt", label: "발행일시", widget: "datetime", required: true }
      - { name: "updatedAt", label: "수정일시", widget: "datetime", required: false }
      - name: "category"
        label: "카테고리"
        widget: "select"
        required: true
        options:
          - { label: "정책", value: "policy" }
          - { label: "세금·금융", value: "tax-finance" }
          - { label: "시장", value: "market" }
          - { label: "통계", value: "stats" }
          - { label: "AI·기술", value: "ai-tech" }
      - { name: "tldr", label: "한 줄 요약 (TLDR)", widget: "text", required: true, hint: "최대 200자, 한 줄 요약" }
      - { name: "aiAssisted", label: "AI 보조 작성", widget: "boolean", default: false, required: false }
      - name: "sources"
        label: "1차 출처"
        label_singular: "출처"
        widget: "list"
        required: true
        min: 1
        hint: "1차 출처 1개 이상 필수"
        fields:
          - { name: "name", label: "출처명", widget: "string", required: true }
          - { name: "url", label: "URL", widget: "string", required: false }
          - { name: "date", label: "발표일", widget: "string", required: false }
          - { name: "accessedAt", label: "확인일", widget: "string", required: false }
          - { name: "note", label: "비고", widget: "string", required: false }
      - name: "tags"
        label: "태그"
        widget: "object"
        required: false
        fields:
          - name: "personas"
            label: "페르소나"
            widget: "select"
            multiple: true
            required: false
            default: []
            options: ["사회초년생", "신혼부부", "1인사업자", "4050은퇴", "투자자"]
          - name: "dataTypes"
            label: "데이터 유형"
            widget: "select"
            multiple: true
            required: false
            default: []
            options: ["정부발표", "분기지표", "월간지표", "실시간시장", "법안"]
          - name: "actions"
            label: "액션"
            widget: "select"
            multiple: true
            required: false
            default: []
            options: ["신청가능", "마감임박", "장기관점", "정성심화"]
      - { name: "body", label: "본문", widget: "markdown", required: true }

  # ──────────────────────────────────────────────────────────
  # 8.2 인사이트 (evergreen)  →  src/content/insight
  # ──────────────────────────────────────────────────────────
  - name: "insight"
    label: "인사이트"
    label_singular: "인사이트"
    folder: "src/content/insight"
    extension: "mdx"
    format: "frontmatter"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    summary: "{{title}} — {{publishedAt}}"
    fields:
      - { name: "title", label: "제목", widget: "string", required: true, hint: "최대 80자 (Zod max(80))" }
      - { name: "publishedAt", label: "발행일시", widget: "datetime", required: true }
      - { name: "updatedAt", label: "수정일시", widget: "datetime", required: false }
      - name: "category"
        label: "카테고리"
        widget: "select"
        required: true
        options:
          - { label: "정책", value: "policy" }
          - { label: "세금·금융", value: "tax-finance" }
          - { label: "시장", value: "market" }
          - { label: "통계", value: "stats" }
          - { label: "AI·기술", value: "ai-tech" }
      - { name: "tldr", label: "한 줄 요약 (TLDR)", widget: "text", required: true, hint: "최대 300자" }
      - { name: "estimatedReadingTime", label: "예상 독서 시간 (분)", widget: "number", required: true, value_type: "int", min: 1 }
      - { name: "aiAssisted", label: "AI 보조 작성", widget: "boolean", default: false, required: false }
      - name: "sources"
        label: "1차 출처"
        label_singular: "출처"
        widget: "list"
        required: true
        min: 2
        hint: "인사이트는 1차 출처 2개 이상"
        fields:
          - { name: "name", label: "출처명", widget: "string", required: true }
          - { name: "url", label: "URL", widget: "string", required: false }
          - { name: "date", label: "발표일", widget: "string", required: false }
          - { name: "accessedAt", label: "확인일", widget: "string", required: false }
          - { name: "note", label: "비고", widget: "string", required: false }
      - name: "tags"
        label: "태그"
        widget: "object"
        required: false
        fields:
          - name: "personas"
            label: "페르소나"
            widget: "select"
            multiple: true
            required: false
            default: []
            options: ["사회초년생", "신혼부부", "1인사업자", "4050은퇴", "투자자"]
          - name: "dataTypes"
            label: "데이터 유형"
            widget: "select"
            multiple: true
            required: false
            default: []
            options: ["정부발표", "분기지표", "월간지표", "실시간시장", "법안"]
          - name: "actions"
            label: "액션"
            widget: "select"
            multiple: true
            required: false
            default: []
            options: ["신청가능", "마감임박", "장기관점", "정성심화"]
      - { name: "body", label: "본문", widget: "markdown", required: true }

  # ──────────────────────────────────────────────────────────
  # 8.3 가이드북 (책)  →  src/content/guidebook  (type: 'data', json)
  # ──────────────────────────────────────────────────────────
  - name: "guidebook"
    label: "가이드북"
    label_singular: "가이드북"
    folder: "src/content/guidebook"
    extension: "json"
    format: "json"
    create: true
    slug: "{{slug}}"
    summary: "{{title}}"
    fields:
      - { name: "title", label: "제목", widget: "string", required: true }
      - { name: "description", label: "설명", widget: "text", required: true }
      - { name: "publishedAt", label: "발행일시", widget: "datetime", required: true }
      - { name: "totalChapters", label: "총 챕터 수", widget: "number", required: true, value_type: "int", min: 1 }
      - { name: "completedChapters", label: "완료된 챕터 수", widget: "number", required: false, value_type: "int", min: 0, default: 0 }
      - { name: "license", label: "라이선스", widget: "string", required: false, default: "CC BY-NC 4.0" }
      - { name: "coverImage", label: "표지 이미지", widget: "image", required: false }
      - { name: "pdfUrl", label: "PDF URL", widget: "string", required: false }

  # ──────────────────────────────────────────────────────────
  # 8.4 가이드북 챕터  →  src/content/guidebookChapter
  # ──────────────────────────────────────────────────────────
  - name: "guidebookChapter"
    label: "가이드북 챕터"
    label_singular: "챕터"
    folder: "src/content/guidebookChapter"
    extension: "mdx"
    format: "frontmatter"
    create: true
    slug: "{{fields.bookSlug}}-ch{{fields.chapterNumber}}-{{slug}}"
    summary: "{{bookSlug}} ch{{chapterNumber}} — {{title}}"
    fields:
      - { name: "bookSlug", label: "가이드북 슬러그", widget: "string", required: true, hint: "src/content/guidebook의 파일명(확장자 제외)과 일치해야 합니다." }
      - { name: "chapterNumber", label: "챕터 번호", widget: "number", required: true, value_type: "int", min: 1 }
      - { name: "title", label: "제목", widget: "string", required: true }
      - { name: "publishedAt", label: "발행일시", widget: "datetime", required: true }
      - name: "sources"
        label: "1차 출처"
        label_singular: "출처"
        widget: "list"
        required: false
        default: []
        fields:
          - { name: "name", label: "출처명", widget: "string", required: true }
          - { name: "url", label: "URL", widget: "string", required: false }
          - { name: "date", label: "발표일", widget: "string", required: false }
          - { name: "accessedAt", label: "확인일", widget: "string", required: false }
          - { name: "note", label: "비고", widget: "string", required: false }
      - { name: "aiAssisted", label: "AI 보조 작성", widget: "boolean", default: false, required: false }
      - { name: "body", label: "본문", widget: "markdown", required: true }

  # ──────────────────────────────────────────────────────────
  # 8.5 데이터 던전  →  src/content/dataPage
  # ──────────────────────────────────────────────────────────
  - name: "dataPage"
    label: "데이터 던전"
    label_singular: "데이터 페이지"
    folder: "src/content/dataPage"
    extension: "mdx"
    format: "frontmatter"
    create: true
    slug: "{{slug}}"
    summary: "{{title}}"
    fields:
      - { name: "title", label: "제목", widget: "string", required: true }
      - { name: "publishedAt", label: "발행일시", widget: "datetime", required: true }
      - { name: "updatedAt", label: "수정일시", widget: "datetime", required: false }
      - name: "dataSource"
        label: "데이터 출처"
        widget: "object"
        required: true
        fields:
          - { name: "name", label: "출처명", widget: "string", required: true }
          - { name: "url", label: "URL", widget: "string", required: false }
          - { name: "date", label: "발표일", widget: "string", required: false }
          - { name: "accessedAt", label: "확인일", widget: "string", required: false }
          - { name: "note", label: "비고", widget: "string", required: false }
      - { name: "chartConfig", label: "차트 설정 (JSON 등)", widget: "text", required: false }
      - { name: "description", label: "설명", widget: "text", required: true }
      - { name: "body", label: "본문", widget: "markdown", required: true }`;

export const GET: APIRoute = () => {
  // dev 모드에서만 local_backend를 활성화 — `npx decap-server`(8081)와 통신.
  // 프로덕션 빌드에서는 줄 자체를 제거해 저장소/포트 정보 노출을 줄인다.
  const isDev = import.meta.env.DEV;
  const localBackend = isDev ? '\nlocal_backend: true\n' : '\n';

  const yaml = `${HEADER}\n\n${BACKEND}\n${localBackend}\n${REST}\n`;

  return new Response(yaml, {
    headers: {
      'Content-Type': 'text/yaml; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
};
