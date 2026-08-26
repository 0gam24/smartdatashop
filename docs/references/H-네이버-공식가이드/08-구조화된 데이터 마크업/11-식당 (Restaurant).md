---
title: "식당 (Restaurant)"
category: "구조화된 데이터 마크업"
slug: "structured-data-restaurant"
source: "https://searchadvisor.naver.com/guide/structured-data-restaurant"
updated: "2026-04-30"
---

# 식당 (Restaurant)

### Restaurant

- 식당 정보를 표기합니다.  
    ![image](https://beta-searchadvisor.ssl.phinf.net/MjAyMjEyMDJfMzQg/MDAxNjY5OTYxMjk2MDEw.TTvYbRWfZba5rd4Zd1CrrwMiuwn68WBbhemBTdlPingg.JFA78WDphfvna-r6l2eIkNS40ZYuxPOSwjd9VCtBxLwg.PNG/restaurant_ds.png)

> 위 이미지는 검색결과에 표시 될수있는 예제 입니다. 실제 검색결과와 모습이 다를 수 있습니다.  
> 해당 정보는 다른 구조화된 마크업과 같이 웹문서 분석 등에 보조적으로 활용할 수 있으며, 해당 내용이나 형식으로 노출되는 것을 보장하지 않습니다.

### Restaurant 마크업

#### 기본 가이드라인

- 설명 글 대신 숫자 위주로 간결하게 입력해 주세요.

#### 타입 및 속성

Schema.org에서 정의한 [Restaurant](https://schema.org/Restaurant) 을 사용하며 아래와 같은 속성값을 지정해야 합니다.

| 속성 | 필수여부 | 설명 |
| --- | --- | --- |
| name | **필수** | 식당의 이름을 입력해 주세요. |
| openingHours | **필수** | 요일/시간 등 영업 시간 정보를 입력해 주세요. 여러 개로 나누어 입력할 수 있습니다. |
| telephone | 필수아님 | 지역 번호를 포함한 전체 전화 번호를 입력해 주세요. |
| image | 필수아님 | 식당의 대표 이미지를 입력해 주세요. ImageObject 혹은 URL 포맷으로 사용합니다. |
| url | 필수아님 | 식당 웹 페이지 주소를 입력해 주세요. URL 포맷으로 사용하고, 상대 경로나 단축 URL이 아닌 절대 경로로 입력해주세요. |
| servesCuisine | 필수아님 | 식당의 메뉴를 입력해 주세요. 여러 개인 경우 하나씩 개별로 입력해 주세요. |
| priceRange | 필수아님 | 가격대 정보를 입력해 주세요. 원/달러 같은 통화 정보가 있다면 같이 입력해 주세요. |
| description | 필수아님 | 식당의 설명입니다. 너무 길어지지 않게 내용 중심으로 작성해 주세요. |

- JSON-LD 형식으로 구현한 예제

```
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "네이버 식당",
  "openingHours": [
    "평일 11:00am - 19:00pm",
    "주말 12:00pm - 19:00pm"
  ],
  "telephone": "(031) 784-1000",
  "image": {
    "@type": "ImageObject",
    "url": "https://example.com/photos/restaurant.jpg",
    "width": "700",
    "height": "500"
  },
  "url": "https://www.navercorp.com",
  "servesCuisine": [
    "김치찌개",
    "된장찌개",
    "고등어 구이"
  ],
  "priceRange": "6,000원 ~ 8,000원",
  "description": "한식 전문점입니다."
}
</script>
```

- Microdata 형식으로 구현한 예제

```html
<div itemscope itemtype="https://schema.org/Restaurant">
  <span itemprop="name">네이버 식당</span>
  <meta itemprop="openingHours" content="평일 11:00am - 19:00pm" />
  <meta itemprop="openingHours" content="주말 12:00pm - 19:00pm" />
  <span itemprop="telephone">(031) 784-1000</span>
  <img itemprop="image" src="https://example.com/photos/restaurant.jpg" />
  <a itemprop="url" href="https://www.navercorp.com">https://www.navercorp.com</a>
  <span itemprop="servesCuisine">김치찌개</span>
  <span itemprop="servesCuisine">된장찌개</span>
  <span itemprop="servesCuisine">고등어 구이</span>
  <span itemprop="priceRange">6,000원 ~ 8,000원</span>
 <span itemprop="description">한식 전문점입니다.</span>
</div>
```
