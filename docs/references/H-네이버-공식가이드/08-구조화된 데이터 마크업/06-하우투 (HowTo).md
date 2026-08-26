---
title: "하우투 (HowTo)"
category: "구조화된 데이터 마크업"
slug: "structured-data-howto"
source: "https://searchadvisor.naver.com/guide/structured-data-howto"
updated: "2026-04-30"
---

# 하우투 (HowTo)

### 하우투 (HowTo)

- 단계가 있는 방법을 담고 있는 정보를 표기합니다.  
    ![image](https://searchadvisor-phinf.pstatic.net/MjAyMjA4MTFfMjg0/MDAxNjYwMjEyOTUwMjc3.uZk2hVAn4mrEILZsoap655cW5RA26zkUnAacghkphAcg.PXkp7w5-CiaCUz1ZeloMTvFtiC3cYHMS3aNJv7YsbpQg.PNG/sd_howto_1.png)

> 위 이미지는 검색결과에 표시 될수있는 예제 입니다. 실제 검색결과와 모습이 다를 수 있습니다.  
> 해당 정보는 다른 구조화된 마크업과 같이 웹문서 분석 등에 보조적으로 활용할 수 있으며, 해당 내용이나 형식으로 노출되는 것을 보장하지 않습니다.

### 하우투 (HowTo) 마크업

#### 기본 가이드라인

- 단계가 너무 적은 HowTo는 사용하지 않습니다.
- 각 단계는 HowToStep property에 아래 요소를 포함하여 작성합니다.
- Recipe (레시피) 하위에 howTo를 작성하지 않도록 해주세요.

#### 이미지 가이드라인

- 썸네일 등이 아닌 원본 이미지를 사용해 주세요.
- 이미지 간 중복이 발생하지 않도록 해주세요.
- 해당 How To 단계를 잘 나타내는 이미지를 사용해 주세요. 로고, 기본 이미지, 깨진 이미지를 사용하지 마세요.

#### 타입 및 속성

schema.org에서 정의한 [HowTo](https://schema.org/HowTo) 을 사용하며 아래와 같은 속성값을 지정해야 합니다.

| 속성 | 필수여부 | 설명 |
| --- | --- | --- |
| image | 필수아님 | 해당 howTo 단계를 나타내는 이미지 입니다. [ImageObject](https://schema.org/ImageObject) 혹은 [URL](https://schema.org/URL) 포맷으로 사용합니다. |
| url | 필수아님 | 해당 단계에 관련된 URL 입니다. [URL](https://schema.org/URL) 포맷으로 사용하고, 상대 경로나 단축 URL이 아닌 절대 경로로 입력해주세요. |
| text | **필수** | 해당 단계를 잘 설명할 수 있도록 자세히 작성해주세요. |

- JSON-LD 형식으로 구현한 예제

```
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "",
  "step": [
    {
      "@type": "HowToStep",
      "url": "https://example.com/howto#step1",
      "image": {
        "@type": "ImageObject",
        "url": "https://example.com/photos/howto-step1.jpg",
        "width": "700",
        "height": "500"
      },
      "text": "신분당선 정자역에 하차한다."
    },
    {
      "@type": "HowToStep",
      "url": "https://example.com/howto#step2",
      "image": {
        "@type": "ImageObject",
        "url": "https://example.com/photos/howto-step2.jpg",
        "width": "700",
        "height": "500"
      },
      "text": "3번 출구로 나온다."
    },
    {
      "@type": "HowToStep",
      "url": "https://example.com/howto#step3",
      "image": {
        "@type": "ImageObject",
        "url": "https://example.com/photos/howto-step3.jpg",
        "width": "700",
        "height": "500"
      },
      "text": "2번 마을 버스 탑승 후 '네이버 미켈란쉐르빌' 정류장에 하차한다."
    }
  ]
}
</script>
```

- Microdata 형식으로 구현한 예제

```html
<div itemscope itemtype="https://schema.org/HowTo">
  <div itemprop="step" itemscope itemtype="https://schema.org/HowToStep">
    <link itemprop="url" href="https://example.com/howto#step1" />
    <img itemprop="image" src="https://example.com/photos/howto-step1.jpg"/>
    <div itemprop="text">신분당선 정자역에 하차한다.</div>
  </div>
  <div itemprop="step" itemscope itemtype="https://schema.org/HowToStep">
    <link itemprop="url" href="https://example.com/howto#step2" />
    <img itemprop="image" src="https://example.com/photos/howto-step2.jpg"/>
    <div itemprop="text">3번 출구로 나온다.</div>
  </div>
  <div itemprop="step" itemscope itemtype="https://schema.org/HowToStep">
    <link itemprop="url" href="https://example.com/howto#step3" />
    <img itemprop="image" src="https://example.com/photos/howto-step3.jpg"/>
    <div itemprop="text">2번 마을 버스 탑승 후 '네이버 미켈란쉐르빌' 정류장에 하차한다.</div>
  </div>
</div>
```
