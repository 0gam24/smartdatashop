---
title: "레시피 (Recipe)"
category: "구조화된 데이터 마크업"
slug: "structured-data-recipe"
source: "https://searchadvisor.naver.com/guide/structured-data-recipe"
updated: "2026-04-30"
---

# 레시피 (Recipe)

### 레시피 (Recipe)

- 레시피 정보를 표기합니다.  
    ![image](https://searchadvisor-phinf.pstatic.net/MjAyMjA4MTFfMjU5/MDAxNjYwMjEyOTI0NDEz.JadVlYSc0IuMGagYBKQ0eePD3Mm97spLqaY6dUxP_jYg.FCmlZcchw6iQi2T6xTgLgPy6aMmb5qYihzM5utg_mbwg.PNG/sd_recipe_1.png)

> 위 이미지는 검색결과에 표시 될수있는 예제 입니다. 실제 검색결과와 모습이 다를 수 있습니다.  
> 해당 정보는 다른 구조화된 마크업과 같이 웹문서 분석 등에 보조적으로 활용할 수 있으며, 해당 내용이나 형식으로 노출되는 것을 보장하지 않습니다.

### 레시피 (Recipe)

#### 기본 가이드라인

- HowTo property 하위에 작성하지 않도록 해주세요.

#### 이미지 가이드라인

- 해당 레시피를 잘 나타내는 완성된 요리 등의 이미지를 사용해주세요.
- 썸네일 등이 아닌 원본 이미지를 사용해주세요.
- 이미지 간 중복이 발생하지 않도록 해주세요.
- 로고, 기본 이미지, 깨진 이미지가 되지 않도록 해주세요.

#### 타입 및 속성

schema.org에서 정의한 [Recipe](https://schema.org/Recipe) 을 사용하며 아래와 같은 속성값을 지정해야 합니다.

| 속성 | 필수여부 | 설명 |
| --- | --- | --- |
| name | 필수아님 | 레시피 제목입니다. |
| image | 필수아님 | 레시피 이미지 입니다. |
| recipeYield | 필수아님 | 요리의 양입니다. 숫자 혹은 "숫자단위"를 입력해 주세요. (단위 예: 인분, serving) |
| totalTime | 필수아님 | 총 조리 시간 입니다. [ISO-8601 duration](https://schema.org/Duration) 형태로 작성해주세요. (예: PT30M) |
| recipeIngredient | 필수아님 | 레시피의 재료입니다. 하나씩 개별로 입력해 주세요. 순서 정보 등 메타 데이터는 입력하지 않도록 해주세요. |
| recipeInstruction | **필수** | 레시피 단계별 설명입니다. 하나씩 개별로 입력해 주세요. 순서 정보 등 메타 데이터는 입력하지 않도록 해주세요. |

- JSON-LD 형식으로 구현한 예제

```
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "김치찌개 레시피",
  "image": "https://example.com/photos/recipe_sample.jpg",
  "recipeYield": "2 servings",
  "totalTime": "PT30M",
  "recipeIngredient": [
    "신김치 1그릇",
    "식용유 2스푼",
    "대파 1뿌리",
    "참치 1캔",
    "물 500ml",
    "고추가루 1스푼"
  ],
  "recipeInstructions": [
    {"@type":"HowToStep","text":"냄비에 김치를 넣는다."},
    {"@type":"HowToStep","text":"김치 위에 식용유를 뿌리고 약불에서 볶는다."},
    {"@type":"HowToStep","text":"볶은 김치에 참치를 넣고 함께 볶는다."},
    {"@type":"HowToStep","text":"물을 넣고 끓인다."},
    {"@type":"HowToStep","text":"끓는 김치찌개에 대파를 넣고 추가로 끓인다."},
    {"@type":"HowToStep","text":"고추가루를 넣고 끓인 후 마무리한다."},
  ]
}
</script>
```

- Microdata 형식으로 구현한 예제

```html
<div itemscope itemtype="https://schema.org/Recipe">
  <span itemprop="name">김치찌개 레시피</span>
  <img itemprop="image" src="https://example.com/photos/recipe_sample.jpg" />
  <span itemprop="recipeYield">2 servings</span>
  <meta itemprop="totalTime" content="PT30M">
  <span itemprop="recipeIngredient">신김치 1그릇</span>
  <span itemprop="recipeIngredient">식용유 2스푼</span>
  <span itemprop="recipeIngredient">대파 1뿌리</span>
  <span itemprop="recipeIngredient">참치 1캔</span>
  <span itemprop="recipeIngredient">물 500ml</span>
  <span itemprop="recipeIngredient">고추가루 1스푼</span>
  <span itemprop="recipeInstructions">냄비에 김치를 넣는다.</span>
  <span itemprop="recipeInstructions">김치 위에 식용유를 뿌리고 약불에서 볶는다.</span>
  <span itemprop="recipeInstructions">볶은 김치에 참치를 넣고 함께 볶는다.</span>
  <span itemprop="recipeInstructions">물을 넣고 끓인다.</span>
  <span itemprop="recipeInstructions">끓는 김치찌개에 대파를 넣고 추가로 끓인다.</span>
  <span itemprop="recipeInstructions">고추가루를 넣고 끓인 후 마무리한다.</span>
</div>
```
