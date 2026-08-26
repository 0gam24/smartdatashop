---
title: "수집요청 API 명세 및 연동"
category: "제휴 API"
slug: "crawl-request-api"
source: "https://searchadvisor.naver.com/guide/crawl-request-api"
updated: "2025-07-25"
---

# 수집요청 API 명세 및 연동

### API 를 사용하기 전 유의사항

#### 제휴제안을 신청해주세요.

[네이버 제휴제안](https://www.navercorp.com/naver/proposalRegister) 작성을 통해 신청해 주세요. 제휴제안 신청 이후 담당자를 통해 상세한 협의를 진행할 수 있습니다.

- 제휴 희망 사이트 : 네이버
- 제휴 구분 : 웹사이트-수집요청 API

![image](https://searchadvisor-phinf.pstatic.net/MjAyMzAzMjlfNTQg/MDAxNjgwMDc2MzQzMzU5.dOM8YOAYov-OtvNEfT2M-qitM3ubC4b6XLP7JJnqQq4g.9SmP73WFI1HBsSKbD6H6wcm0zzn1bYpxmnq2lf2kx2kg.PNG/request_crawl_form.png)

#### 사이트의 소유 확인을 먼저 진행해 주세요.

수집요청 API 를 사용하기 위해서는 웹마스터도구에서 사이트의 소유 확인이 먼저 진행되어야 합니다. [소유확인](<../12-FAQ/05-사이트 등록 및 소유확인.md>) FAQ를 참고하여 사이트 소유 확인을 진행해 주세요. 수집요청 API 사용 시 소유 미 확인된 사이트에 대하여 요청이 발생하는 경우 오류로 처리합니다. 또한, 사이트 소유확인 시 url scheme, www 유무, port 등이 다르면 별개의 사이트로 인식하니 소유 확인된 사이트와 수집요청 API에 명시된 사이트가 정확하게 일치해야 합니다.

#### robots.txt를 확인해 주세요.

수집요청 API를 통해서 수집할 URL은 반드시 네이버 검색 로봇이 수집할 수 있어야 합니다. [robots.txt 설정하기](<../01-검색엔진 최적화 기초/03-robots.txt 설정하기.md>) 가이드를 참고하여 대상 URL의 수집 허용 여부를 점검해 주세요.

#### 인증을 위한 accessToken 확인해 주세요.

제휴된 사용자에 대하여 서치어드바이저의 웹마스터도구에서 제공하는 도구 설정 화면을 보면 API 제휴 여부와 API accessToken이 노출됩니다.  
![image](https://searchadvisor-phinf.pstatic.net/MjAyMDA5MTRfMjkz/MDAxNjAwMDYwODA0ODI3.rfK1ueiY3joqxbwXeUXPjsTl6Rd1p3zWsR3THSjhIssg._FU_vZYnAmF-fY-nhP6JiYgLtko18GmGDM9bETjWewAg.PNG/tool-config.png)  
모든 API 호출 시 해당 accessToken을 http header 의 Authorization 필드에 Bearer 형태로 넣어주세요. (예: Authorization: Bearer AAAAO...\[ACCESS TOKEN 정보\]...) 아래 예제는 리눅스 환경에서 제공하는 curl 명령어를 사용한 예제입니다.

```
// 아래 accessToken 영역에 서치어드바이저에서 발급받은 토큰 정보를 넣어주세요.(예: Authorization: Bearer AAAAO...[ACCESS TOKEN 정보]...)
$ curl -v -H "Authorization: Bearer accessToken" -H "Content-Type: application/json" ...
```

#### 수집 요청할 URL은 랜딩 페이지의 URL로 요청해주세요.

일반 사용자들이 브라우저에서 볼수 있는 랜딩 페이지들로만 수집 요청 해주세요.  
브라우저에서 보여지는 URL과 요청 URL이 다르거나 요청 URL이 Redirect되면, 수집 지연이나 수집 실패가 발생할 수 있습니다. 이 경우, '업데이트 실패'로 분류되어 집계됩니다.

```
좋은 요청 예)
  수집 요청 URL : http://www.your-site.com/1
  수집 완료 URL : http://www.your-site.com/1
  
나쁜 요청 예)
  수집 요청 URL : http://www.your-site.com/1 -> http://www.redirect-site.com/1 (302 Redirect)
  수집 완료 URL : http://www.redirect-site.com/1
```

#### 대표 URL로 요청해주세요.

URL은 다르지만 문서 내용이 동일한 경우, 대표 URL을 선정해서 하나만 요청해주세요.  
여러 URL을 요청하는 경우 중복 문서가 수집되고, 사용자가 원치않는 URL이 대표로 선정될 수 있습니다.  
여러 URL이 존재한다면 대표 URL로 canonical meta를 추가하거나, 대표 URL로 redirect 처리,  
또는 URL 정리를 통해서 하나의 URL만 요청하는 것을 제안합니다.  
참고 : [가이드](https://searchadvisor.naver.com/guide/seo-basic-create)

```
대표 URL 선정 예)
1. http://www.your-site.com/dir?id=1
2. http://www.your-site.com/dir?id=1&type=
3. http://www.your-site.com/dir?id=1&type=&sort=
4. http://www.your-site.com/dir?id=1&type=&sort=&key=1
  
1 ~ 4번 URL이 모두 동일 문서라면, 불필요한 query가 정리된 1번 URL을 대표로 선정하여 요청한다.
```

#### URL endpoint

수집요청 API 는 아래 2가지를 제공하고 있습니다.

- url submit
    - 수집요청 및 삭제에 대한 url 목록을 제출하는 API이며 호출 URL 은 아래와 같습니다,
    - `https://apis.naver.com/searchadvisor/crawl-request/submit.json`
- url verify
    - 수집요청 및 삭제에 대한 url 목록의 문법에 문제가 있는지를 점검하는 API입니다. url submit 호출시 사용되는 요청 본문(payload)의 검증 용도로 제공합니다.
    - `https://apis.naver.com/searchadvisor/crawl-request/verify.json`

#### API 제약 및 주의사항

1. API 접근시 TLS v1.2 이상의 프로토콜을 사용하는지 확인해주세요. TLS 1.0/1.1 로는 접속할 수 없습니다.

2. 제휴처 별로 url submit API의 횟수는 일별로 제한되고 있습니다. url submit API의 payload 내 url 개수에 따라 차감되며 부여된 제한 값 이상 사용 시에는 오류 메시지가 전달됩니다.  
    [요청량 초과 메시지](#exceedingMsg)를 응답하면, 이후 요청된 URL들은 수집되지 않고 버려집니다. API 응답코드 항목을 참고하세요


> URL submit API의 경우 한 번에 많은 수의 url 목록을 담아서 호출하면 검색로봇의 방문이 일시적으로 증가할 수 있습니다. 이는 제휴 된 사이트의 트래픽에 영향을 주기 때문에 API 호출 시 url 목록 수와 호출 시점을 적절하게 분산하는 것을 권장합니다. 제휴 사용자는 `리포트 -> 제휴 API 현황` 메뉴가 활성화되고, `URL 업데이트 수` 그래프에서 submit API 결과를 볼 수 있습니다. 업데이트실패 수치가 증가하면 URL 이상이나 일시적 사이트 장애로 수집이 실패했음을 나타냅니다. 그래프를 보시고 적절하게 분산 요청하시기 바랍니다.

### URL submit API 사용하기

submit API의 요청 본문 (payload)은 아래와 같이 구성됩니다.

```json
{
  "urls": [
    {
      "url": "content-location",
      "type": "update"
    },
    {
      "url": "content_location",
      "type": "delete"
    }
  ]
}
```

- urls 속성
    - 하위에 수집 및 삭제 대상 url 목록을 포함하고 있는 리스트(list) 형태입니다.
    - 하위 url 은 **최대 1,000개** 까지 허용합니다.
- url 속성
    - 수집 및 삭제 대상인 웹사이트의 url 주소를 기입합니다.
- type 속성
    - update : 네이버 검색로봇이 직접 방문해서 해당 url 을 수집 처리합니다.
    - delete : 네이버 수집 저장소에 있는 url 정보를 삭제합니다. 삭제를 위해 검색로봇이 해당 url에 방문하지는 않습니다.
- 제약 사항
    - payload는 최대 2MB만 허용합니다.
    - update와 delete에 동일 url이 존재하는 경우, delete를 우선합니다.
    - 하위 url에서 제휴된 사이트만 처리합니다.

예)

```json
{
  "urls": [
    {
      "url": "http://www.your-site.com/article-1",
      "type": "update"
    },
    {
      "url": "http://www.your-site.com/article-2",
      "type": "update"
    },
    {
      "url": "http://www.your-site.com/article-3",
      "type": "delete"
    },
    {
      "url": "http://www.your-site.com/article-4",
      "type": "delete"
    }
  ]
}
```

예) 전송예제

```
$ curl -v -H "Authorization: Bearer AAAAO...[ACCESS TOKEN 정보]..."\
    -H "Content-Type: application/json"\
    -XPOST https://apis.naver.com/searchadvisor/crawl-request/submit.json\
    -d '{"urls":[{"url":"http://www.your-site.com/article-1","type":"update"},{"url":"http://www.your-site.com/article-4","type":"delete"}]}'
```

예) 전송예제 (python)

```
...

import requests

submit_api = 'https://apis.naver.com/searchadvisor/crawl-request/submit.json'
headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer AAAAO...[ACCESS TOKEN 정보]...'}
payload = '{"urls":[{"url":"http://www.your-site.com/1","type":"update"},{"url":"http://www.your-site.com/article-4","type":"delete"}]}'

response = requests.post(submit_api, data=payload, headers=headers)
print response.status_code
print response.text

...
```

예) 전송예제 (java)

```
...

URI apiUrl = new URI("https://apis.naver.com/searchadvisor/crawl-request/");
UriComponents submitUri = UriComponentsBuilder.newInstance().uri(apiUrl).path("submit.json").build();

HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_JSON_UTF8);
headers.add("Authorization", "Bearer AAAAO...[ACCESS TOKEN 정보]...");
String payload = "{\"urls\": [{\"url\": \"http://www.your-site.com/1\",\"type\": \"update\"}]}";
HttpEntity<String> request = new HttpEntity(payload, headers);

RestTemplate rest = new RestTemplate();
ResponseEntity<String> response = rest.exchange(
        submitUri.toUriString(),
        HttpMethod.POST,
        request,
        String.class);

System.out.println(response.getStatusCode());

...
```

예) 전송예제 (php)

```
<?php
  /* Bearer 타입의 인증키 정보 및 json header 지정 */
  $auth_header = "Authorization: Bearer AAAAO...[ACCESS TOKEN 정보]...";
  $json_header = "Content-type: application/json";
  /* 수집대상 URL */
  $payload_str = '{
    "urls": [
      {
        "url": "http://www.your-site.com/",
        "type": "update"
      }
    ]
  }';
  $client_opt = array(
    CURLOPT_URL => "https://apis.naver.com/searchadvisor/crawl-request/submit.json", /* 수집요청 API 호출주소 */
    CURLOPT_POST => true, /* POST 방식 */
    CURLOPT_POSTFIELDS => $payload_str, /* 수집대상 URL payload 전달 */
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER =>
    /* 헤더에 인증키 정보 추가 */
    array("Host: apis.naver.com", "Pragma: no-cache", "Accept: */*", $auth_header, $json_header)
  );
  $crawl_api = curl_init();
  curl_setopt_array($crawl_api, $client_opt);
  $response = curl_exec($crawl_api);
  curl_close($crawl_api);
  var_dump($response)
 ?>
```

### URL Verify API 사용하기

verify API의 요청 본문 (payload)은 submit API와 동일하며 해당 본문의 문법에 문제가 있는지를 미리 검증할 수 있습니다.  
예) 전송예제

```
$ curl -v -H "Authorization: Bearer AAAAO...[ACCESS TOKEN 정보]..."\
    -H "Content-Type: application/json"\
    -XPOST https://apis.naver.com/searchadvisor/crawl-request/verify.json\
    -d '{"urls":[{"url":"http://www.your-site.com/article-1","type":"update"},{"url":"http://www.your-site.com/article-4","type":"delete"}]}'
```

예) 전송예제 (python)

```
...

import requests

verify_api = 'https://apis.naver.com/searchadvisor/crawl-request/verify.json'
headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer AAAAO...[ACCESS TOKEN 정보]...'}
payload = '{"urls":[{"url":"http://www.your-site.com/1","type":"update"},{"url":"http://www.your-site.com/article-4","type":"delete"}]}'

response = requests.post(verify_api, data=payload, headers=headers)
print response.status_code
print response.text

...
```

예) 전송예제 (java)

```
...

URI apiUrl = new URI("https://apis.naver.com/searchadvisor/crawl-request/");
UriComponents verifyUri = UriComponentsBuilder.newInstance().uri(apiUrl).path("verify.json").build();

HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_JSON_UTF8);
headers.add("Authorization", "Bearer AAAAO...[ACCESS TOKEN 정보]...");
String payload = "{\"urls\": [{\"url\": \"http://www.your-site.com/1\",\"type\": \"update\"}]}";
HttpEntity<String> request = new HttpEntity(payload, headers);

RestTemplate rest = new RestTemplate();
ResponseEntity<String> response = rest.exchange(
        verifyUri.toUriString(),
        HttpMethod.POST,
        request,
        String.class);

System.out.println(response.getStatusCode());

...
```

### API 응답 코드

수집요청 API 호출시 서버의 응답 메시지입니다.

| StatusCode | 응답 코드 | 응답 메시지 | 설명 |
| --- | --- | --- | --- |
| 200 | 000 | Success | 전송이 성공하였습니다. |
| 401 | 024 | Authentication failed | 인증 실패하였습니다. |
| 401 | 028 | Authentication header not exists | OAuth Header가 없습니다. |
| 401 | 029 | Auth Authentication failed | 요청한 Authorization 값을 확인할 수 없습니다. |
| 403 | 030 | Https protocol is required | https 프로토콜로 요청해 주세요. |
| 404 | 051 | Api not exists | 존재하지 않는 API입니다. |
| 404 | 052 | Partner does not exists | 등록된 파트너가 없습니다. |
| 400 | 061 | Malformed url | 잘못된 형식의 호출 URL입니다. |
| 400 | 063 | Malformed encoding | 잘못된 형식의 인코딩 문자입니다. |
| 413 | 064 | Max post size limit 2MB exceeded. | 최대 Post 사이즈 2MB를 초과했습니다. |
| 403 | 071 | Unsupported return format | 지원하지 않는 리턴 포맷입니다. |
| 406 | 1000 | Not found requestable URL in payload | 요청이 실패하였습니다. |
| 400 | 1001 | Invalid parameter exists in header | 요청 파라미터가 유효하지 않습니다. |
| 400 | 1002 | Invalid payload. It could not be parsed | payload 데이터 형식이 유효하지 않습니다. |
| 401 | 1003 | Unowned site. Verify site owner at searchadvisor.naver.com | 소유 확인이 안 된 사이트입니다. |
| 401 | 1004 | Invalid alliance. Apply for alliance user at searchadvisor.naver.com | 제휴된 사이트가 아닙니다. |
| 402 | 1005 | Exceeding request. The number of requests has been exhausted. | 하루 요청량을 초과하였습니다. |
| 500 | 1030 | Server error | API 서버 에러입니다. |
| 500 | 1031 | Back-end Server error | 내부 연동 서버 에러 입니다. |

###### 전송에 성공한 경우, 아래와 같은 응답 메시지를 받습니다.

- 예) submit.json API

```json
{
	"errorCode": 0,
	"message": "Success",
	"result": {
		"totalDeleteCount": 0,
		"totalUpdateCount": 1,
		"requestDeleteCount": 0,
		"requestUpdateCount": 1
	}
}
```

- 예) verify.json API

```
{
	"errorCode": 0,
	"message": "Success",
	"result": "valid"
}
```

- 예) 하루 요청량을 초과한 경우

```
{
	"errorCode": 1005,
	"message": "Exceeding request. The number of requests has been exhausted.",
	"result": ""
}
```

###### 유효하지 않은 인증키로 API 호출 시, 아래와 같은 응답 메시지를 받습니다.

- 예) submit.json API

```json
{
  "message": "Authentication failed. (인증에 실패했습니다.)",
  "errorCode": "024"
}
```

- 예) verify.json API (제휴 사용자가 아닌 경우)

```
{
	"errorCode": 1004,
	"message": "Invalid alliance. Apply for alliance user at searchadvisor.naver.com",
	"result": ""
}
```

### 제휴 API 현황 리포트 확인하기

제휴로 진행되는 수집 요청 API는 네이버 검색로봇이 수집해야 되는 전체 url 목록 중 우선순위가 상대적으로 높게 책정됩니다. 웹마스터도구의 리포트 > 제휴 API 현황을 참고하여 API로 수집 요청한 URL 목록에 대하여 수집에 문제가 없는지 확인해 주세요.

제휴 API 현황은 24시간 단위로 업데이트됩니다. 자세한 내용은 웹마스터 공식 블로그의 [제휴 API 현황 리포트를 소개합니다](https://blog.naver.com/naver_webmaster/222115472900) 포스트를 참고하세요.
