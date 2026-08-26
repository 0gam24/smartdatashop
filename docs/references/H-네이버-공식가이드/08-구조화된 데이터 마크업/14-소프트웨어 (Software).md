---
title: "소프트웨어 (Software)"
category: "구조화된 데이터 마크업"
slug: "structured-data-software"
source: "https://searchadvisor.naver.com/guide/structured-data-software"
updated: "2026-04-30"
---

# 소프트웨어 (Software)

### Software

- 소프트웨어 정보를 표기합니다.  
    ![image](https://beta-searchadvisor.ssl.phinf.net/MjAyMjEyMDJfMjE2/MDAxNjY5OTYzMzA3NTI1.DTFdGGK17N9AVvbSeTBlGDcxGNRURei24Yrr932QYD8g.E64j_ZQ9yWvoHop4wab2YYEySizpy-5kyqDfc1c5to4g.PNG/software_sd.png)

> 위 이미지는 검색결과에 표시 될수있는 예제 입니다. 실제 검색결과와 모습이 다를 수 있습니다.  
> 해당 정보는 다른 구조화된 마크업과 같이 웹문서 분석 등에 보조적으로 활용할 수 있으며, 해당 내용이나 형식으로 노출되는 것을 보장하지 않습니다.

### Software 마크업

#### 기본 가이드라인

- PC/모바일/태블릿 등에서 실행하는 소프트웨어의 정보입니다.

#### 타입 및 속성

Schema.org에서 정의한 [Software Application](https://schema.org/SoftwareApplication) 을 사용하며 아래와 같은 속성값을 지정해야 합니다.

| 속성 | 필수여부 | 설명 |
| --- | --- | --- |
| name | **필수** | 소프트웨어 이름을 입력해 주세요. |
| applicationCategory | **필수** | 소프트웨어 카테고리를 입력해 주세요. |
| operatingSystem | 필수아님 | 지원하는 운영 체제를 입력해 주세요. (예: Android, iOS) 하나씩 개별로 입력해 주세요. 버전 정보가 있으면 함께 입력해 주세요. |
| url | 필수아님 | 소프트웨어 웹페이지 혹은 다운로드 URL을 입력해 주세요. URL 포맷으로 사용하고, 상대 경로나 단축 URL이 아닌 절대 경로로 입력해주세요. |
| screenshot | 필수아님 | 스크린샷입니다. ImageObject 혹은 URL 포맷으로 사용합니다. |
| description | 필수아님 | 소프트웨어에 대한 설명입니다. 너무 길어지지 않게 내용 중심으로 작성해 주세요. |

- JSON-LD 형식으로 구현한 예제

```
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "네이버 유틸리티",
  "applicationCategory": "유틸리티",
  "operatingSystem": [
    "iOS",
    "Android"
  ],
  "url": "https://example.com/software_url",
  "screenshot": [
    {
      "@type": "ImageObject",
      "url": "https://example.com/photos/software_1.jpg",
       "width": "700",
      "height": "500"
    },
    {
      "@type": "ImageObject",
      "url": "https://example.com/photos/software_2.jpg",
       "width": "700",
      "height": "500"
    }
  ],
  "description": "네이버 유틸리티 애플리케이션입니다."
}
</script>

```

- Microdata 형식으로 구현한 예제

```html
<div itemscope itemtype="https://schema.org/Movie">
 <span itemprop="name">네이버 유틸리티</span>
 <span itemprop="applicationCategory">유틸리티</span>
 <span itemprop="operatingSystem">iOS</span>
 <span itemprop="operatingSystem">Android</span>
 <link itemprop="url" href="https://example.com/software_url" />
 <img itemprop="screenshot" src="https://example.com/photos/software_1.jpg"/>
 <img itemprop="screenshot" src="https://example.com/photos/software_2.jpg"/>
 <span itemprop="description">네이버 유틸리티 애플리케이션입니다.</span>
</div>
```
