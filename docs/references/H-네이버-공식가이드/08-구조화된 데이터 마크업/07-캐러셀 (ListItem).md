---
title: "캐러셀 (ListItem)"
category: "구조화된 데이터 마크업"
slug: "structured-data-carousel"
source: "https://searchadvisor.naver.com/guide/structured-data-carousel"
updated: "2026-04-30"
---

# 캐러셀 (ListItem)

### 캐러셀 (ListItem)

- 목록형 데이터를 캐러셀 형태로 표기합니다.  
    ![image](https://searchadvisor-phinf.pstatic.net/MjAyMjA4MTFfMjMg/MDAxNjYwMjEyOTAyODc1.xOGj4VfVmY_B2Mdie7kR0EukQSPsRF8nEsnKrZj4sU4g.9byI1XAOXek1ttuZSRu5tslvyTAq-d0oH_ck6IQEan0g.PNG/sd_carousel_1.png)

> 위 이미지는 검색결과에 표시 될수있는 예제 입니다. 실제 검색결과와 모습이 다를 수 있습니다.  
> 해당 정보는 다른 구조화된 마크업과 같이 웹문서 분석 등에 보조적으로 활용할 수 있으며, 해당 내용이나 형식으로 노출되는 것을 보장하지 않습니다.

### 캐러셀 (ListItem) 마크업

#### 기본 가이드라인

- 예제 1과 같이 item 요소 하위에 {name, image, url}을 작성할 수도 있고, 예제 2와 같이 item 요소 없이 작성할 수도 있습니다.
- 1개 페이지에는 1개 listItem 사용을 권장합니다.
- 개수가 적은 listItem은 사용하지 않습니다.
- 요소 간 중복이 발생하지 않도록 주의해주세요.

#### 이미지 가이드라인

- 썸네일 등이 아닌 원본 이미지를 사용해주세요.
- 이미지 간 중복이 발생하지 않도록 해주세요.
- 해당 item을 잘 나타내는 이미지를 사용해주세요. 로고, 기본 이미지, 깨진 이미지를 사용하지 마세요.

#### 타입 및 속성

schema.org에서 정의한 [ListItem](https://schema.org/ListItem) 을 사용하며 아래와 같은 속성값을 지정해야 합니다.

| 속성 | 필수여부 | 설명 |
| --- | --- | --- |
| name | 필수아님 | 각 item의 이름을 입력해 주세요. |
| image | **필수** | 해당 item을 나타내는 이미지 입니다. [ImageObject](https://schema.org/ImageObject) 혹은 [URL](https://schema.org/URL) 포맷으로 사용합니다. |
| url | 필수아님 | 해당 item의 관련 url을 입력해주세요. [URL](https://schema.org/URL) 포맷으로 사용하고, 상대 경로나 단축 URL이 아닌 절대 경로로 입력해 주세요. |
| item | 필수아님 | item 요소 작성 시 image는 필수로, 이 외 요소들은 선택적으로 입력해 주세요. [Thing](https://schema.org/Thing) 하위에 있는 모든 타입으로 작성 가능합니다. |
| position | 필수아님 | 목록 번호 입니다. [Integer](https://schema.org/Integer) 포맷으로 작성해 주세요. |

- JSON-LD 형식으로 구현한 예제 1 ( item 요소 하위에 {name, image, url}을 작성)

```
<script type="application/ld+json">
{
  "@context": "http://schema.org",
  "@type": "ItemList",
  "itemListElement":[
    {
      "@type": "ListItem",
      "item": {
        "@type": "Organization",
        "name": "라인",
        "image": "https://example.com/photos/listitem-1.jpg",
        "url": "https://example.com/listitem-url-1"
      },
      "position": "1"
    },
    {
      "@type": "ListItem",
      "item": {
        "@type": "Organization",
        "name": "네이버 랩스",
        "image": "https://example.com/photos/listitem-2.jpg",
        "url": "https://example.com/listitem-url-2"
      },
      "position": "2"
    },
    {
      "@type": "ListItem",
      "item": {
        "@type": "Organization",
        "name": "네이버 클라우드",
        "image": "https://example.com/photos/listitem-3.jpg",
        "url": "https://example.com/listitem-url-3"
      },
      "position": "3"
    },
    {
      "@type": "ListItem",
      "item": {
        "@type": "Organization",
        "name": "네이버 웹툰",
        "image": "https://example.com/photos/listitem-4.jpg",
        "url": "https://example.com/listitem-url-4"
      },
      "position": "4"
    },
    {
      "@type": "ListItem",
      "item": {
        "@type": "Organization",
        "name": "스노우",
        "image": "https://example.com/photos/listitem-5.jpg",
        "url": "https://example.com/listitem-url-5"
      },
      "position": "5"
    },
    {
      "@type": "ListItem",
      "item": {
        "@type": "Organization",
        "name": "네이버 파이낸셜",
        "image": "https://example.com/photos/listitem-6.jpg",
        "url": "https://example.com/listitem-url-6"
      },
      "position": "6"
    }
  ]
}
</script>
```

- JSON-LD 형식으로 구현한 예제 2 (item 요소 없이 작성)

```
<script type="application/ld+json">
{
  "@context":"http://schema.org",
  "@type":"ItemList",
  "itemListElement":[
    {
      "@type": "ListItem",
      "name": "라인",
      "image": "https://example.com/photos/listitem-1.jpg",
      "url": "https://example.com/listitem-url-1",
      "position": "1"
    },
    {
      "@type": "ListItem",
      "name": "네이버 랩스",
      "image": "https://example.com/photos/listitem-2.jpg",
      "url": "https://example.com/listitem-url-2",
      "position": "2"
    },
    {
      "@type": "ListItem",
      "name": "네이버 클라우드",
      "image": "https://example.com/photos/listitem-3.jpg",
      "url": "https://example.com/listitem-url-3",
      "position": "3"
    },
    {
      "@type": "ListItem",
      "name": "네이버 웹툰",
      "image": "https://example.com/photos/listitem-4.jpg",
      "url": "https://example.com/listitem-url-4",
      "position": "4"
    },
    {
      "@type": "ListItem",
      "name": "스노우",
      "image": "https://example.com/photos/listitem-5.jpg",
      "url": "https://example.com/listitem-url-5",
      "position": "5"
    },
    {
      "@type": "ListItem",
      "name": "네이버 파이낸셜",
      "image": "https://example.com/photos/listitem-6.jpg",
      "url": "https://example.com/listitem-url-6",
      "position": "6"
    }
  ]
}
</script>
```

- Microdata 형식으로 구현한 예제 1 (item 요소 하위에 {name, image, url}을 작성)

```html
<ol itemscope itemtype="https://schema.org/ItemList">
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <span itemprop="item" itemscope itemtype="https://schema.org/Organization">
      <span itemprop="name">라인</span>
      <img itemprop="image" src="https://example.com/photos/listitem-1.jpg"/>
      <link itemprop="url" href="https://example.com/listitem-url-1" />
    </span>
    <meta itemprop="position" content="1" />
  </li>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <a itemprop="item" itemscope itemtype="https://schema.org/Organization">
      <span itemprop="name">네이버 랩스</span>
      <img itemprop="image" src="https://example.com/photos/listitem-2.jpg"/>
      <link itemprop="url" href="https://example.com/listitem-url-2" />
    </a>
    <meta itemprop="position" content="2" />
  </li>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <a itemprop="item" itemscope itemtype="https://schema.org/Organization">
      <span itemprop="name">네이버 클라우드</span>
      <img itemprop="image" src="https://example.com/photos/listitem-3.jpg"/>
      <link itemprop="url" href="https://example.com/listitem-url-3" />
    </a>
    <meta itemprop="position" content="3" />
  </li>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <a itemprop="item" itemscope itemtype="https://schema.org/Organization">
      <span itemprop="name">네이버 웹툰</span>
      <img itemprop="image" src="https://example.com/photos/listitem-4.jpg"/>
      <link itemprop="url" href="https://example.com/listitem-url-4" />
    </a>
    <meta itemprop="position" content="4" />
  </li>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <a itemprop="item" itemscope itemtype="https://schema.org/Organization">
      <span itemprop="name">스노우</span>
      <img itemprop="image" src="https://example.com/photos/listitem-5.jpg"/>
      <link itemprop="url" href="https://example.com/listitem-url-5" />
    </a>
    <meta itemprop="position" content="5" />
  </li>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <a itemprop="item" itemscope itemtype="https://schema.org/Organization">
      <span itemprop="name">네이버 파이낸셜</span>
      <img itemprop="image" src="https://example.com/photos/listitem-6.jpg"/>
      <link itemprop="url" href="https://example.com/listitem-url-6" />
    </a>
    <meta itemprop="position" content="6" />
  </li>
</ol>
```

- Microdata 형식으로 구현한 예제 2 (item 요소 없이 작성)

```html
<ol itemscope itemtype="https://schema.org/ItemList">
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <span itemprop="name">라인</span>
    <img itemprop="image" src="https://example.com/photos/listitem-1.jpg"/>
    <link itemprop="url" href="https://example.com/listitem-url-1" />
    <meta itemprop="position" content="1" />
  </li>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <span itemprop="name">네이버 랩스</span>
    <img itemprop="image" src="https://example.com/photos/listitem-2.jpg"/>
    <link itemprop="url" href="https://example.com/listitem-url-2" />
    <meta itemprop="position" content="2" />
  </li>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <span itemprop="name">네이버 클라우드</span>
    <img itemprop="image" src="https://example.com/photos/listitem-3.jpg"/>
    <link itemprop="url" href="https://example.com/listitem-url-3" />
    <meta itemprop="position" content="3" />
  </li>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <span itemprop="name">네이버 웹툰</span>
    <img itemprop="image" src="https://example.com/photos/listitem-4.jpg"/>
    <link itemprop="url" href="https://example.com/listitem-url-4" />
    <meta itemprop="position" content="4" />
  </li>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <span itemprop="name">스노우</span>
    <img itemprop="image" src="https://example.com/photos/listitem-5.jpg"/>
    <link itemprop="url" href="https://example.com/listitem-url-5" />
    <meta itemprop="position" content="5" />
  </li>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <span itemprop="name">네이버 파이낸셜</span>
    <img itemprop="image" src="https://example.com/photos/listitem-6.jpg"/>
    <link itemprop="url" href="https://example.com/listitem-url-6" />
    <meta itemprop="position" content="6" />
  </li>
</ol>
```
