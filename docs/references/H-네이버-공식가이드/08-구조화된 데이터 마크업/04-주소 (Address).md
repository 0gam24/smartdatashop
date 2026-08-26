---
title: "주소 (Address)"
category: "구조화된 데이터 마크업"
slug: "structured-data-address"
source: "https://searchadvisor.naver.com/guide/structured-data-address"
updated: "2026-04-30"
---

# 주소 (Address)

### 주소 (Address)

- 검색결과에 표시되는 주소 정보 입니다.  
    ![image](https://searchadvisor-phinf.pstatic.net/MjAyMjA4MTFfNzkg/MDAxNjYwMjEyODg5MDY5.y34F_5MeSDkqhfwZlAQXBEzIKGQVy8dJypO_mDKAE2Qg.KpGz0u4EFvtoQ3lEIRDrQkjuZB9Fcw-n6ntJLw_pWsYg.PNG/sd_address_2.png)

> 위 이미지는 검색결과에 표시 될수있는 예제 입니다. 실제 검색결과와 모습이 다를 수 있습니다.  
> 해당 정보는 다른 구조화된 마크업과 같이 웹문서 분석 등에 보조적으로 활용할 수 있으며, 해당 내용이나 형식으로 노출되는 것을 보장하지 않습니다.

### 주소 (Address) 마크업

- 기본 가이드라인
    - 사이트 공통 주소를 여러 페이지에 동일하게 사용되지 않도록 주의해 주세요.
    - 각 요소별 적합한 내용을 중복 없이 입력해 주세요.
    - 최대한 자세하고 명확하게 입력해 주세요.
- 타입 및 속성  
    schema.org에서 정의한 [PostalAdress](https://schema.org/PostalAddress) 을 사용하며 아래와 같은 속성값을 지정해야 합니다.

| 속성 | 필수여부 | 설명 |
| --- | --- | --- |
| postalCode | 필수아님 | 숫자 혹은 하이픈(-)으로 구성해 우편번호를 입력해 주세요. |
| addressRegion | 필수아님 | 주소 중 가장 큰 지역명을 입력해 주세요. |
| addressLocality | 필수아님 | Region 하위 지역을 입력해 주세요. |
| streetAddress | **필수** | 도로명 포함 상세 주소를 입력해 주세요. |

- JSON-LD 형식으로 구현한 예제

```
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "NAVER 1784",
  "address": {
    "@type": "PostalAddress",
    "postalCode": "13561",
    "addressRegion": "경기",
    "addressLocality": "성남시 분당구",
    "streetAddress": "정자일로 95"
  }
}
</script>
```

- Microdata 형식으로 구현한 예제

```html
<div itemscope itemtype="https://schema.org/Organization">
  <span itemprop="name">NAVER 1784</span>
  <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
    <span itemprop="postalCode">13561</span>
    <span itemprop="addressRegion">경기</span>
    <span itemprop="addressLocality">성남시 분당구</span>
    <span itemprop="streetAddress">정자일로 95</span>
  </div>
</div>
```
