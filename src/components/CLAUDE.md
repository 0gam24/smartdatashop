# src/components/ 영역 규칙

> 상위 CLAUDE.md (repo root) 자동 상속됨. 본 파일은 컴포넌트 작성 시 추가 규칙.

## 컴포넌트 1줄 정의
재사용 가능한 UI 단위. 한 가지 일을 잘 한다.

## 작성 규칙

### CSS
<!-- DESIGN.md v1.0 일관성 -->
- 모든 컴포넌트는 scoped <style> 사용 (Astro 기본)
- 글로벌 토큰 (var(--color-paper) 등) 참조만, 정의는 src/styles/global.css에서
- :global() 사용은 자식 컴포넌트나 MDX-rendered 요소에 한정 (왜 사용하는지 주석)

### Props
- 모든 props는 TypeScript interface로 명시
- optional props는 default value 명시 (...= '...')
- href / url 같은 string은 type-narrow하게 정의 (`'persona' | 'data-type' | 'action'` 등)

### 접근성
<!-- 2026-05-05 a11y pass 결과 -->
- 클릭 가능한 카드 = `<a>` wrapper (data-href + cursor:pointer만으로는 부족)
- SVG는 aria-hidden="true" 또는 aria-label / role="img"
- form input은 aria-label 또는 <label>

### 콘텐츠 컬렉션 데이터 받을 때
- `CollectionEntry<'pulse'>` 타입 사용
- previewMode 표시 시 ArticlePreviewWarning 컴포넌트 활용

## 새 컴포넌트 추가 체크리스트
- [ ] 단일 책임? (한 가지 일만)
- [ ] Props interface 명시?
- [ ] Scoped <style>?
- [ ] 디자인 토큰만 사용?
- [ ] 키보드 접근성 OK?
- [ ] 프로토타입 (도구 19303의 P2: "이 기능만 따로 테스트할 수 있는가?")

## 절대 금지
- 컴포넌트 안에서 src/styles/global.css 수정
- 카테고리별 컬러 코딩 (활자 라벨로만 구분 — DESIGN.md v1.0)
- inline JavaScript event handler (예: `onclick="..."`); 대신 `<script is:inline>` 블록
- 다른 컴포넌트의 scoped 클래스를 직접 참조 (강결합)
