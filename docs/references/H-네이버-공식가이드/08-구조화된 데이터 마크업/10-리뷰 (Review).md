---
title: "리뷰 (Review)"
category: "구조화된 데이터 마크업"
slug: "structured-data-review"
source: "https://searchadvisor.naver.com/guide/structured-data-review"
updated: "2026-04-30"
---

# 리뷰 (Review)

### 리뷰 (Review)

- 리뷰를 텍스트 및 점수로 표기합니다.  
    ![image](https://searchadvisor-phinf.pstatic.net/MjAyMjA4MTFfMjQ5/MDAxNjYwMjEyOTMxMjQz.NvfNN2KmfMTXTACPCk6HvvD4l-Brs6oWJkwI2SZCY4Ug.1F7q5txGACtfDSBMYvm5ndI4rK0L9CldaSznPNQru2Yg.PNG/sd_review.png)

> 위 이미지는 검색결과에 표시 될수있는 예제 입니다. 실제 검색결과와 모습이 다를 수 있습니다.  
> 해당 정보는 다른 구조화된 마크업과 같이 웹문서 분석 등에 보조적으로 활용할 수 있으며, 해당 내용이나 형식으로 노출되는 것을 보장하지 않습니다.

### 리뷰 (Review)

#### 기본 가이드라인

- 리뷰 대상인 Product 등의 property 하위에 개별 리뷰들을 Review property로 작성합니다.
- 1개 페이지에는 리뷰 대상이 1개가 되도록 해주세요.
- ratingValue와 bestRating에 음수나 지수 표기법은 허용하지 않습니다.

#### 타입 및 속성

schema.org에서 정의한 [Review](https://schema.org/Review) 을 사용하며 아래와 같은 속성값을 지정해야 합니다.

| 속성 | 필수여부 | 설명 |
| --- | --- | --- |
| reviewBody | **필수** | 리뷰 내용입니다. 숫자나 특수 문자로만 구성된 의미없는 리뷰 문구는 제외해 주세요. |
| ratingValue | 필수아님 | 평가 점수입니다. 0~5가 기본 값입니다. |
| bestRating | 필수아님 | 평가 체계에서 가장 높은 값입니다. 값이 없는 경우 5를 기본 값으로 사용합니다. ratingValue 값보다 큰 값이어야 합니다. |

- JSON-LD 형식으로 구현한 예제

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "review": [
    {
      "@type": "Review",
      "reviewBody": "마음에 드는 제품입니다.",
      "reviewRating": {
        "@type": "Rating",
        "bestRating": "5",
        "ratingValue": "4"
      }
    },
    {
      "@type": "Review",
      "reviewBody": "판매자분이 매우 친절합니다.",
      "reviewRating": {
        "@type": "Rating",
        "bestRating": "5",
        "ratingValue": "5"
      }
    },
    {
      "@type": "Review",
      "reviewBody": "생각했던 그대로입니다.",
      "reviewRating": {
        "@type": "Rating",
        "bestRating": "5",
        "ratingValue": "3"
      }
    }
  ]
}
</script>
```

- Microdata 형식으로 구현한 예제

```html
<div itemscope itemtype="https://schema.org/Product">
  <div itemprop="review" itemscope itemtype="https://schema.org/Review">
      <span itemprop="reviewBody">마음에 드는 제품입니다.</span>
      <div itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
        <span itemprop="bestRating">5</span>
        <span itemprop="ratingValue">4</span>
      </div>
  </div>
  <div itemprop="review" itemscope itemtype="https://schema.org/Review">
      <span itemprop="reviewBody">판매자분이 매우 친절합니다.</span>
      <div itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
        <span itemprop="bestRating">5</span>
        <span itemprop="ratingValue">5</span>
      </div>
  </div>
  <div itemprop="review" itemscope itemtype="https://schema.org/Review">
      <span itemprop="reviewBody">생각했던 그대로입니다.</span>
      <div itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
        <span itemprop="bestRating">5</span>
        <span itemprop="ratingValue">3</span>
      </div>
  </div>
</div>
```
