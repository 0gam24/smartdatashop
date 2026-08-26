---
title: "파비콘 (Favicon)"
category: "HTML 마크업"
slug: "markup-favicon"
source: "https://searchadvisor.naver.com/guide/markup-favicon"
updated: "2025-06-24"
---

# 파비콘 (Favicon)

[파비콘(Favicon)](https://terms.naver.com/entry.nhn?docId=864878&cid=50371&categoryId=50371)은 인터넷 웹 브라우저의 주소창에 표시되는 웹사이트나 웹페이지를 대표하는 아이콘입니다.

![favicon](https://searchadvisor-phinf.pstatic.net/MjAyMzExMDlfMTg2/MDAxNjk5NDk0OTYyMDk4.s59buOP_I8Cw_P4ZfuQTj9uJVpsvgp9xPabv_3G0OJUg.4S2mFnQ0XPqGx_LHqAkYHN06kcULuIuKDcv8VHZnjwIg.PNG/favicon.png)

아래 가이드라인을 준수 한다면 네이버 검색 결과에 파비콘이 표시될 수 있습니다.

### STEP 1. 파비콘 사이즈, 파일 포맷 및 기본 수칙 확인

#### 기본 수칙

1. 네이버 검색 로봇이 파비콘을 수집할 수 있어야 합니다. [robots.txt 설정하기](<../01-검색엔진 최적화 기초/03-robots.txt 설정하기.md>) 가이드 참고
2. 파비콘 URL를 자주 변경하지 않습니다.  
    파비콘 URL과 이미지가 변경될 경우 업데이트 지연 및 검색 결과 내 파비콘 이미지가 일정하지 않을 수 있습니다.  
    같은 주소에 이미지 교체시에도 재수집이 필요하여 상황에 따라 반영에 시간이 걸리는 경우가 있습니다.
3. 웹사이트를 표현할 수 있는 고유의 이미지를 사용합니다.
4. 음란물이나 사용자로 하여금 혐오감을 느끼게 하는 이미지를 사용하지 않습니다.

#### 파비콘 사이즈

- 너비와 높이가 동일한 정사각형이고 최소 16px 이상이어야 합니다. (예: 30 x 30px, 48 x 48px)
- 검색 결과에 노출될 때에는 파비콘의 사이즈를 15 x 15px 로 조정하여 사용합니다. 해당 해상도에서 파비콘이 잘 노출 될수 있는지 확인해보시길 권장합니다.

#### 파비콘 파일 포맷

아래와 같은 [파일 포맷](https://en.wikipedia.org/wiki/Favicon#File_format_support) 을 지원합니다.

| ICO | PNG | GIF | animated GIFs | JPEG | APNG | SVG |
| --- | --- | --- | --- | --- | --- | --- |
| O | O | O | O | O | O | O |

- 배경색을 투명으로 지정할 수 있습니다.

### STEP 2. 파비콘 마크업

HTML 문서의 `<head>` 태그 내에 있는 `<link>` 태그를 활용합니다.

파비콘이 위치하는 href 에는 상대 경로가 아닌 **절대 경로를 사용**해야 합니다.

```
<head>
<link rel="shortcut icon" href="http://www.mysite.com/favicon.ico">
</head>
```

rel 속성은 아래 중 하나를 사용하시면 됩니다.

```
* shortcut icon
* icon
* apple-touch-icon
* apple-touch-icon-precomposed
```

### Q. 페이지 내에 여러개의 파비콘 마크업이 있는 경우 어떤 것이 반영되나요?

웹 페이지 내에 파비콘 마크업이 여러 개가 존재한다면 검색 노출에 사용되는 파비콘은 아래 규칙을 기준으로 우선순위를 결정하여 처리합니다.

- 마크업에 기재된 rel 속성 및 사이트의 기본 파비콘 중 아래 순서를 기준으로 처리합니다.

1. shortcut icon
2. icon
3. default icon (host url + /favicon.ico)
4. apple-touch-icon
5. apple-touch-icon-precomposed

- 동일한 rel 속성값은 한개만 존재하도록 부탁드립니다. 여러개 있을 경우 반영이 되지 않는 원인이 될 수 있습니다.
