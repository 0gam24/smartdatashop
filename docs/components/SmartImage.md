# SmartImage / Figure 사용 가이드

> Astro `astro:assets` 기반 반응형 이미지 컴포넌트. 1차 출처 데이터 저널의 차트/스크린샷/시각화 자료를 위한 표준 출력기.

## 언제 무엇을 쓰는가

| 케이스 | 컴포넌트 |
|---|---|
| 본문 차트/시각화 + 캡션 + 출처 | `Figure` |
| 본문 일반 이미지 (캡션 없음) | `SmartImage` |
| 외부 CDN URL / `public/` 절대경로 | `SmartImage` (자동 fallback `<img>`) |
| 정적 import한 자산 (src/assets/...) | `SmartImage` 또는 `Figure` (자동 srcset) |
| 헤더/푸터 로고처럼 raw control 필요 | 평문 `<img>` 직접 사용 |

## 정적 import = 자동 변환

`astro:assets`는 정적 import 한 이미지만 빌드 변환 대상으로 본다.

```astro
---
import chart from '../assets/charts/usdkrw-202604.png';
import SmartImage from '../components/SmartImage.astro';
---
<SmartImage src={chart} alt="원/달러 환율" width={1200} height={630} />
```

빌드 결과:
- AVIF + WebP 두 포맷 출력
- 1x, 2x retina 대응 `srcset` 자동 생성
- `width`/`height` 명시 → CLS 방지

문자열 경로 (예: `"/uploads/foo.jpg"`)는 변환되지 않는다 — 평문 `<img>`로 fallback.

## 차트 사이징 가이드

본문 폭 720px 기준 권장 사이즈:

| 용도 | width | height | sizes |
|---|---|---|---|
| 본문 차트 | 1440 | 810 (16:9) | `(max-width: 720px) 100vw, 720px` (default) |
| OG 카드 | 1200 | 630 | `1200px` |
| 사이드바 썸네일 | 480 | 270 | `(max-width: 720px) 100vw, 240px` |

원본은 `width` 값의 2배 권장 (retina 2x 지원).

## 예시

### 본문 차트 (Figure)

```astro
---
import chart from '../assets/charts/cpi-2026q1.png';
import Figure from '../components/Figure.astro';
---
<Figure
  src={chart}
  alt="2026년 1분기 소비자물가 상승률 2.3%"
  width={1440}
  height={810}
  caption="2026년 1분기 소비자물가지수 (전년동기비)"
  source="통계청 KOSIS"
  sourceUrl="https://kosis.kr/" />
```

### 히어로 이미지 (eager)

```astro
<SmartImage src={heroImg} alt="..." width={1600} height={900} eager
  sizes="100vw" />
```

### OG 카드 (외부 URL)

```astro
<SmartImage src="/og/pulse-202605.png" alt="" width={1200} height={630} />
```

## 주의

- `alt`는 필수. 장식용은 `alt=""` 명시.
- `eager`는 LCP 후보에만 (보통 페이지당 1개).
- `Figure`는 `hairline` 자동 적용.
