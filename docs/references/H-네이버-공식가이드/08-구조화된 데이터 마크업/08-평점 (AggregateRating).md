---
title: "평점 (AggregateRating)"
category: "구조화된 데이터 마크업"
slug: "structured-data-rating"
source: "https://searchadvisor.naver.com/guide/structured-data-rating"
updated: "2026-04-30"
---

# 평점 (AggregateRating)

### 평점 (AggregateRating)

- 평가 점수 및 평가/리뷰 개수와 같은 평점 정보를 표기합니다.  
    ![image](https://searchadvisor-phinf.pstatic.net/MjAyMjA4MTFfMTEz/MDAxNjYwMjEyOTE4Mzcw.9M2EM3wCsbbwAUJJdmkVkpLjOow31D4HeKI7q-tgI9cg.SMHkv67ngoPcvO6fzG23ohadGWZxtHpvy76SRFHZYWog.PNG/sd_rating.png)

> 위 이미지는 검색결과에 표시 될수있는 예제 입니다. 실제 검색결과와 모습이 다를 수 있습니다.  
> 해당 정보는 다른 구조화된 마크업과 같이 웹문서 분석 등에 보조적으로 활용할 수 있으며, 해당 내용이나 형식으로 노출되는 것을 보장하지 않습니다.

### 평점 (AggregateRating)

#### 기본 가이드라인

- 평가가 여러 개 존재하는 페이지는 AggregateRating 1개에 최종 rating 값을 입력해주세요.
- 0보다 같거나 큰 수 (정수 또는 소수) 만 허용됩니다. 음수나 지수, 텍스트 등은 사용할 수 없습니다.

#### 타입 및 속성

schema.org에서 정의한 [AggregateRating](https://schema.org/AggregateRating) 을 사용하며 아래와 같은 속성값을 지정해야 합니다.

| 속성 | 필수여부 | 설명 |
| --- | --- | --- |
| ratingValue | **필수** | 평점을 나타내는 점수 값 입니다. |
| bestRating | 선택 | 평가 체계에서 가장 높은 값입니다. ratingValue 값보다 크거나 같아야 합니다. |
| ratingCount | \* \[주1\] | 위의 평점을 구성하게 된 개별 평점들의 총개수입니다. |
| reviewCount | \* \[주1\] | 평점과 함께 또는 평점이 없이 입력된 리뷰의 개수입니다 |

- \[주1\] 평점 표시시 ratingCount 또는 reviewCount의 둘중의 하나가 반드시 있어야 노출 가능합니다. 둘 다 있는 경우에는 ratingCount 값이 우선 표시됩니다.

#### 예제

- JSON-LD 형식으로 구현한 예제

```
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "bestRating": "5",
    "reviewCount": "10"
    "ratingCount": "10"
  }
}
</script>
```

- Microdata 형식으로 구현한 예제

```html
<div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
  <span itemprop="ratingValue">4.5</span>
  <span itemprop="bestRating">5</span>
  <span itemprop="reviewCount">11</span>
  <span itemprop="ratingCount">11</span>
</div>
```
