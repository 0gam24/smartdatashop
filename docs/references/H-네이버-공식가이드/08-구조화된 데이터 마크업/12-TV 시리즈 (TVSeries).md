---
title: "TV 시리즈 (TVSeries)"
category: "구조화된 데이터 마크업"
slug: "structured-data-tvseries"
source: "https://searchadvisor.naver.com/guide/structured-data-tvseries"
updated: "2026-04-30"
---

# TV 시리즈 (TVSeries)

### TV Series

- TV 시리즈 프로그램의 정보를 표기합니다.  
    ![image](https://beta-searchadvisor.ssl.phinf.net/MjAyMjEyMDJfNTIg/MDAxNjY5OTYxNTM5NTE5.u9fEkDY07Jvq6XZok-Qvu4_1YOwTw6dgFnfZBfw4H-sg.vNJIMw_RPqXOdvSWPSvDii2_8AlbsWCiEG3nU51b13gg.PNG/tvseries_ds.png)

> 위 이미지는 검색결과에 표시 될수있는 예제 입니다. 실제 검색결과와 모습이 다를 수 있습니다.  
> 해당 정보는 다른 구조화된 마크업과 같이 웹문서 분석 등에 보조적으로 활용할 수 있으며, 해당 내용이나 형식으로 노출되는 것을 보장하지 않습니다.

### TV Series 마크업

#### 기본 가이드라인

- actor/creator 등에서 입력할 요소가 많은 경우 노출하고 싶은 요소를 먼저 입력해 주세요.

#### 타입 및 속성

Schema.org에서 정의한 [TV Series](https://schema.org/TVSeries) 을 사용하며 아래와 같은 속성값을 지정해야 합니다.

| 속성 | 필수여부 | 설명 |
| --- | --- | --- |
| name | **필수** | 프로그램 이름을 입력해 주세요. |
| actor | **필수** | 출연자 이름을 입력해 주세요. 한 명씩 개별로 입력해 주세요. |
| creator | 필수아님 | 연출자 이름을 입력해 주세요. 한 명씩 개별로 입력해 주세요. |
| genre | 필수아님 | 프로그램의 장르를 입력해 주세요. 예: 코미디, 호러, 드라마 |
| image | 필수아님 | 프로그램의 대표 이미지입니다. ImageObject 혹은 URL 포맷으로 사용합니다. |
| description | 필수아님 | 프로그램의 설명입니다. 너무 길어지지 않게 내용 중심으로 작성해 주세요. |

- JSON-LD 형식으로 구현한 예제

```
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TVSeries",
  "name": "네이버 드라마",
  "actor": [
    {
      "@type": "Person",
      "name": "김배우"
    },
    {
      "@type": "Person",
      "name": "최배우"
    }
  ],
  "creator": {
    "@type": "Person",
    "name": "김감독"
  },
  "genre": "드라마",
  "image": {
    "@type": "ImageObject",
    "url": "https://example.com/photos/tvseries.jpg",
     "width": "700",
    "height": "500"
  },
  "description": "네이버 생활을 그린 드라마입니다."
}
</script>
```

- Microdata 형식으로 구현한 예제

```html
<div itemscope itemtype="https://schema.org/TVSeries">
 <span itemprop="name">네이버 드라마</span>
 <div itemprop="actor" itemscope itemtype="https://schema.org/Person">
   <span itemprop="name">김배우</span>
 </div>
 <div itemprop="actor" itemscope itemtype="https://schema.org/Person">
   <span itemprop="name">최배우</span>
 </div>
 <div  itemprop="creator" itemscope itemtype="https://schema.org/Person">
   <span itemprop="name">김감독</span>
 </div>
 <span itemprop="genre">드라마</span>
 <img itemprop="image" src="https://example.com/photos/tvseries.jpg"/>
 <span itemprop="description">네이버 생활을 그린 드라마입니다.</span>
</div>
```
