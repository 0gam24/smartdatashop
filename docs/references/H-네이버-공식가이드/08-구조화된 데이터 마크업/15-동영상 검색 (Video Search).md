---
title: "동영상 검색 (Video Search)"
category: "구조화된 데이터 마크업"
slug: "structured-data-video"
source: "https://searchadvisor.naver.com/guide/structured-data-video"
updated: "2026-03-11"
---

# 동영상 검색 (Video Search)

### 동영상 검색 데이터 구조화 및 수집 안내

네이버 동영상 검색은 네이버의 동영상 서비스 뿐만 아니라 수집을 통해 외부 서비스의 동영상도 검색 결과로 제공합니다.

네이버 동영상 검색에 정보를 노출하기 원하신다면 아래의 절차에 따라 적용 및 제휴 제안을 신청해 주시기 바랍니다.

1. 동영상 데이터 개요

    - 대상 유형(컬렉션) : Video와 Channel 2가지 유형의 데이터가 필요합니다.
    - 데이터 형식 : JSON-LD 포맷으로 [schema.org](https://schema.org) 에 정의된 Schema에 맞춰 작성해 주시기 바랍니다.
        - Video 컬렉션 : [VideoObject](https://schema.org/VideoObject)
        - Channel 컬렉션 : [Person](https://schema.org/Person)
2. 문서 수집 신청 방법

    - 본 문서를 참고하시어 데이터를 작성하시고 [네이버 제휴제안](https://www.navercorp.com/company/partnerApply) 작성을 통해 신청해 주시기 바랍니다.
        - 제휴 희망 사이트 : 네이버
        - 제휴 구분 : 동영상콘텐츠 제휴
    - 수집 대상이 되는 URL을 Push하면 네이버 수집 로봇이 콘텐츠 데이터를 Pull하는 방식으로 데이터를 수집합니다.
    - 제출 URL은 아래 3가지 URL이 동일해야 합니다.
        1. 검색 결과에 노출되는 URL
        2. 브라우저로 렌더링되는 URL
        3. 구조화 데이터(schema.org)가 포함된 URL
    - 만약, 모든 사용자에게 구조화 데이터를 공개하고 싶지 않을 경우는 네이버 수집 로봇이 사용하는 User-Agenet 접근할 경우만 포함하여 반환하도록 설정하실 수 있습니다.
    - 수집요청 API를 사용하기 위해서는 서치어드바이저에 [사이트 소유확인](https://searchadvisor.naver.com/guide/faq-start-register)을 먼저 진행해야 합니다.  
        [수집요청 API 명세 및 연동](https://searchadvisor.naver.com/guide/crawl-request-api) 가이드를 참고하여 웹페이지의 수집요청 API 연동을 시작합니다.
3. 데이터 갱신

    - 데이터 갱신 주기는 가능한 빠를수록 좋습니다. 단, 전체 문서 규모와 운영 상황을 고려하여 갱신 주기를 조정할 수 있습니다.
4. 제휴 및 테스트 지원

    - Schema.org 마크업 개발이 완료 후, 제휴 신청을 하시면 제휴 검토 및 테스트 지원을 해드립니다.
5. 문서 수집 전환 시 고려사항

    - [robots.txt 설정하기](<../01-검색엔진 최적화 기초/03-robots.txt 설정하기.md>) 가이드를 참고하여 사이트의 robots.txt에 관련 문서 및 썸네일 등 부속 페이지에 대하여 네이버 로봇의 수집을 허용해 주세요.
    - 유료 영상 : 색인 필터링이 필요한 경우, offers 항목 추가가 필요합니다.
    - 로그인 필요 영상 : 색인이 필요할 경우, 사전에 협의가 필요합니다.
    - 검색 비허용 방법 : 검색 노출이 필요 없는 문서의 경우, [마크업 가이드(선호 URL 및 로봇 메타 태그)](<../04-HTML 마크업/01-선호 URL 및 로봇 메타 태그.md>)를 참고하시어, meta 태그에 noindex를 적용해주시고 재수집 Push 요청을 부탁드립니다.

## 데이터 포맷

### Meta

출처 단위 고정값으로 설명에 맞는 값을 지정하여 별도로 전달해 주세요.

| Key | 이름 | 설명 |
| --- | --- | --- |
| providerUrl | provider URL | 동영상 제공처 웹페이지 URL, 검색 결과에 '출처' 정보 노출 |
| providerName | provider 이름 | 동영상 제공처 이름. 검색 결과에 '출처' 정보 노출 |

### Video

#### 필수 정보

| Key | 대응 필드 | 이름 | 설명 |
| --- | --- | --- | --- |
| url | url | 영상을 감상 할 수 있는 페이지URL | PC |
| mobileUrl |  | 영상을 감상할 수 있는 모바일 페이지 URL | Mobile |
| createDate | uploadDate | 영상 생성일 | 영상을 제작한 시간으로, 검색결과에 노출 |
| description | description | 설명 | 영상에 대한 설명을 나열한 부분. (영상을 볼 수 있는 웹페이지에서 검색 사용자가 해당 내용 확인) |
| playtime | duration | 재생시간 | 동영상의 전체 재생시간 |
| thumbnail | thumbnailUrl | 대표썸네일 URL | 영상의 대표 썸네일 이미지가 저장된URL |
| title | name | 제목 | 동영상이 게시된 웹 페이지 글의 제목 |
| adultYn | contentRating | 성인콘텐츠 여부 (모두 성인 문서가 아니라면 네이버 동영상에서 constant로 지정) | 성인이면 1 , 아니면 0 |
| cid |  | 채널 ID | url에서 구분할 수 있는 unique한 id |
| channelUrl | creator > Person > url | 채널URL | 반드시 '채널' 을 보여줄수 있는 별도의 웹페이지 필요해당 값이 존재하면 검색결과에 '채널' 정보가  노출되며, 없으면 '채널' 정보 노출 불가 |
| mobileChannelUrl |  | 모바일 채널URL | 검색결과에 '채널' 정보 노출 |
| channelName | creator > Person > name | 채널이름 | 검색결과에 '채널' 정보 노출 |

#### 선택 정보

| Key | 대응 필드 | 이름 | 설명 |
| --- | --- | --- | --- |
| keyword | keywords (VideoObject) | 키워드 | 해당 동영상을 잘 설명하는 키워드를 중요도 순으로 기입 |
| viewCount | interactionStatistic > InteractionCounter \> userInderactionCount (interactionType : WatchAction) | 영상 재생수 | 영상 조회수 |
| likeCount | interactionStatistic > InteractionCounter  \> userInderactionCount (interactionType : LikeAction) | 영상 좋아요수 | 영상 좋아요수 |
| commentCount | interactionStatistic > InteractionCounter  \> userInderactionCount (interactionType : CommentAction) | 영상 댓글 수 | 영상 댓글수 |
| width | width | 영상 가로 크기 | 영상 가로 크기, 비율을 이용해 세로형 영상을 구별하기 위한 목적 (구별이 필요 없을 경우 생략 가능) |
| height | height | 영상 세로 크기 | 영상 세로 크기, 비율을 이용해 세로형 영상을 구별하기 위한 목적 (구별이 필요 없을 경우 생략 가능) |
| offers | offers | 유료 여부 | 유료 영상을 필터링하기 위한 정보 (유료 영상에 대한 필터링이 필요 없거나 유료영상이 없을 경우 생략 가능) |
| contentsCategory | additionalType | 카테고리 | 동영상을 분류하는 카테고리 (채널 분류 카테고리가 있을 경우) |

- mobileUrl 과 mobileChannelUrl 은 별도 생성 규칙이 있으면 전달해 주시기 바라며, 없을 경우는 PC와 동일하게 처리합니다.
- adultYn은 별도 의견이 없을 경우 동영상 정제에서 지정합니다.
- cid 는 channel의 고유한 Id값이기 때문에 channel 문서마다 고유한 값으로 사용 가능한 항목을 전달해야 됩니다.

#### 샘플

```
<script type="application/ld+json">
{
   "@context":"https://schema.org/",
   "@type":"VideoObject",
   "url":"https://weverse.io/bts/media/3-121461480",
   "name":"BTS (방탄소년단) 'Take Two' Live Clip (Jung Kook Focus) #2023BTSFESTA",
   "contentRating":"18+",
   "description":"'Take Two' Live Clip 에 대한 설명문",
   "keywords":"bts, take two, btsfesta",
   "thumbnailUrl":[
      "https://ssl.pstatic.net/static/wevweb/assets/seo/weverse_bi.png?type=w1414"
   ],
   "uploadDate":"2023-08-01T10:45:14.000Z",
   "duration":"PT13S",
   "width":576,
   "height":1024,
"additionalType":"singer"
   "offers":{
      "@type":"Offer",
      "availability":"https://schema.org/InStock",
      "price":"55.00",
      "priceCurrency":"USD"
   }
   "creator":{
      "@type":"Person",
      "name":"BTS",
      "url":"https://weverse.io/bts"
   },
   "interactionStatistic":[
      {
         "@type":"InteractionCounter",
         "interactionType":{
            "@type":"http://schema.org/WatchAction"
         },
         "userInteractionCount":1000
      },
      {
         "@type":"InteractionCounter",
         "interactionType":{
            "@type":"http://schema.org/LikeAction"
         },
         "userInteractionCount":1000
      },
      {
         "@type":"InteractionCounter",
         "interactionType":{
            "@type":"http://schema.org/CommentAction"
         },
         "userInteractionCount":1000
      }
   ]
}
</script>
```

### Channel

#### 필수 정보

| key | 대응 필드 | 이름 | 설명 |
| --- | --- | --- | --- |
| url | url | 채널URL | 반드시 '채널' 을 보여줄 수 있는 별도의 웹페이지. PC 기준 |
| adultYn | propertyValue > adultYn | 성인 채널여부 | 성인이면1, 아니면 0 |
| cid |  | 채널 ID | url에서 구분할 수 있는 unique한 id |
| title | name | 제목 | 채널이름 |
| description | description | 설명 | 채널에 대한 설명을 나열한 부분 |
| createDate | mainEntityOfPage > CreativeWork \> dateCreated | 채널 생성일 | 채널이 생성된 시간 |
| modifyDate | mainEntityOfPage > CreativeWork \> dateModified | 채널 정보 수정일 | 채널정보가 수정된 시간 |

#### 선택 정보

| key | 대응 필드 | 이름 | 설명 |
| --- | --- | --- | --- |
| keyword | keywords | 키워드 | 해당 채널을 잘 설명하는 키워드를 중요도 순으로 기입 |
| subscriptionCount | interactionStatistic > InteractionCounter  \> userInderactionCount (interactionType : FollowAction) | 구독자 수 | 채널 구독자 수 |
| channelCategory | additionalType | 카테고리 | 채널을 분류하는 카테고리 |
| isVerified | hasCredential | 인증계정여부 | 인증 계정 여부 |

- cid 는 channel의 고유한 Id값이기 때문에 channel 문서마다 고유한 값으로 사용 가능한 항목을 전달해 주시기 바랍니다.
- adultYn은 별도 의견이 없을 경우 동영상 정제에서 지정합니다.

#### 샘플

```
<script type="application/ld+json">
{
   "@context":"https://schema.org/",
   "@type":"Person",
   "name":"BTS",
   "description":"BTS 채널 설명 문구",
   "url":"https://weverse.io/bts",
   "interactionStatistic":[
      {
         "@type":"InteractionCounter",
         "interactionType":{
            "@type":"http://schema.org/FollowAction"
         },
         "userInteractionCount":1000
      }
   ],
   "mainEntityOfPage":{
      "dateCreated":"2023-08-01T10:45:14.000Z",
      "dateModified":"2023-08-01T10:45:14.000Z",
      "keywords":"bts, take two, btsfesta",
      "isFamilyFriendly":true
},
   "additionalType": "celebrity",
   "hasCredential":{
      "@type":"EducationalOccupationalCredential",
      "recognizedBy": {
         "@type":"EducationalOrganization",
         "name":"Weverse"
   }
},
"identifier":{
	"@type":"PropertyValue",
"propertyID":"adultYn",
"value":"Y"
}
</script>

```

- 작성한 마크업에 오류가 있는지는 [https://jsonformatter.curiousconcept.com/](https://jsonformatter.curiousconcept.com/) 에서 확인하실 수도 있습니다.
