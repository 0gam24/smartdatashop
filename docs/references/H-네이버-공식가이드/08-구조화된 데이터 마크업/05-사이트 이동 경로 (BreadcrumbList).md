---
title: "사이트 이동 경로 (BreadcrumbList)"
category: "구조화된 데이터 마크업"
slug: "structured-data-breadcrumb"
source: "https://searchadvisor.naver.com/guide/structured-data-breadcrumb"
updated: "2026-04-30"
---

# 사이트 이동 경로 (BreadcrumbList)

### 사이트 이동 경로 (BreadcrumbList)

- 검색결과에 [사이트 이동 경로](https://ko.wikipedia.org/wiki/%EC%82%AC%EC%9D%B4%ED%8A%B8_%EC%9D%B4%EB%8F%99_%EA%B2%BD%EB%A1%9C)를 나타 냅니다. 검색 사용자가 웹페이지의 위치를 이해하는데 도움이 될수있습니다.  
    ![image](https://searchadvisor-phinf.pstatic.net/MjAyMjA4MTFfMjMg/MDAxNjYwMjEyODk2NDE0.ypEvbg247HW59pT4MB-GXQtDkWHiZyHikQ86NU4XW3Yg.g8Dw-9_1G8Jy_2vty3z8WPSEuXibvMkugNQzl2czAaQg.PNG/sd_breadcrumb_3.png)

> 위 이미지는 검색결과에 표시 될수있는 예제 입니다. 실제 검색결과와 모습이 다를 수 있습니다.  
> 해당 정보는 다른 구조화된 마크업과 같이 웹문서 분석 등에 보조적으로 활용할 수 있으며, 해당 내용이나 형식으로 노출되는 것을 보장하지 않습니다.

### 사이트 이동 경로 (BreadcrumbList) 마크업

#### 기본 가이드라인

- 해당 페이지의 계층 구조를 키워드로 작성합니다.
- 너무 긴 텍스트나 숫자 혹은 특수 문자로만 구성되지 않도록 주의해주세요.
- 넓은 범위에서 부터 시작하여 점점 구체적인 내용이 되도록 순서대로 입력해주세요.  
    예) `뉴스 > 스포츠 > 축구`, `국내도서 > 소설 > 한국소설`, `회사소개 > 회사개요 > 핵심가치`

#### 타입 및 속성

schema.org에서 정의한 [BreadcrumbList](https://schema.org/BreadcrumbList) 을 사용하며 아래와 같은 속성값을 지정해야 합니다.

| 속성 | 필수여부 | 설명 |
| --- | --- | --- |
| name | **필수** | "top", "홈" 등 일반적인 단어가 아닌 페이지를 잘 설명하는 텍스트로 입력해 주세요. |
| position | 필수아님 | 계층 구조의 번호입니다. |

- JSON-LD 형식으로 구현한 예제

```html
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "BreadcrumbList",
 "itemListElement":
 [
  {
   "@type": "ListItem",
   "position": 1,
   "item":
   {
    "@id": "https://example.com/news.html",
    "name": "뉴스"
    }
  },
  {
   "@type": "ListItem",
  "position": 2,
  "item":
   {
     "@id": "https://example.com/news/sports.html",
     "name": "스포츠"
   }
  }
 ]
}
</script>
```

- Microdata 형식으로 구현한 예제

```html
<ol itemscope itemtype="https://schema.org/BreadcrumbList">
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <a itemprop="item" href="https://example.com/news.html">
    <span itemprop="name">뉴스</span></a>
    <meta itemprop="position" content="1" />
  </li>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <a itemprop="item" href="https://example.com/news/sports.html">
    <span itemprop="name">스포츠</span></a>
    <meta itemprop="position" content="2" />
  </li>
</ol>
```
