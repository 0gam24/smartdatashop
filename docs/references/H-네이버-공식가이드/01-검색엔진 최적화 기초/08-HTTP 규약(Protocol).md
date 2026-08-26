---
title: "HTTP 규약(Protocol)"
category: "검색엔진 최적화 기초"
slug: "seo-basic-http"
source: "https://searchadvisor.naver.com/guide/seo-basic-http"
updated: "2025-03-12"
---

# HTTP 규약(Protocol)

#### HTTP 규약이란?

1. Browser (IE, Chrome, Safari, Firefox)가 web server와 통신하기 위한 규약
2. Browser에서 요청(Request)하면 응답(Response)하는 간단한 구조
3. W3C, IETF등에서 제정한 인터넷 표준 (RFC-2616)으로 국제적인 질서
4. 1991년 HTTP/0.9부터 20년 이상 전세계적으로 사용되는 안정된 표준
5. WWW와 관련된 모든 software가 따르고 있으나, 몇몇 부분은 site 관리자가 서비스 특성에 따라 설정해 주어야 함

![image](https://searchadvisor-phinf.pstatic.net/MjAxOTA5MjFfMjAz/MDAxNTY5MDM0NDU1MTI4.oW2RgBxUCCMOymzbePNv4IAtXooJAOD9vvJE3FJgZpkg.3BIQzX71k2H8u4M7E5yQ924OBk-bWlXujZ62PAWZVb8g.JPEG/http-protocol-1.jpg)

#### HTTP 응답코드

|  | 응답 코드 그룹 | 응답 코드 | 설명 |
| --- | --- | --- | --- |
| 1xx | Informational |  |  |
| 2xx | Successful | 200 OK | 가장 일반적인 경우, 요청된 웹 페이지를 돌려줄 경우 |
| 3xx | Redirection | 301 Moved Permanently | 요청된 URL이 (Location: header로 지정된) URL로 완전히 전환된 경우. client는 요청된 URL을 지우던가 새 URL로 바꿔치기 한다 |
|  |  | 302 Found | HTTP/1.0과 초기 HTTP/1.1과 호환성 유지를 위해 남겨진 코드. 원래는 요청된 URL이 301과는 달리 임시로 변경된 것을 나타내는 것이었으나, 실제 구현이 HTTP 규약의 의도를 벗어나서 303과 307로 분리하여 제정 |
|  |  | 303 See Other | 요청된 URL이 잠시 다른 URL로 바뀐 것을 알림. (Location: header로 지정된) 바뀐 URL은 GET method로 접근해야 함 |
|  |  | 307 Temporary Redirect | 요청된 URL이 잠시 다른 URL로 바뀐 것을 알림. (Location: header로 지정된) 바뀐 URL은 GET method로 접근해야 함 |
|  |  | 308 Permanent Redirect | 요청된 URL이 (Location: header로 지정된) URL로 완전히 전환된 경우. 301 Moved Permanently와 유사하지만, 요청 방식(POST, PUT, DELETE 등)이 유지된다는 점이 다름. |
| 4xx | Client Error | 400 Bad Request | HTTP 요청, 특히 문법이 잘못된 경우 |
|  |  | 401 Unauthorized | 웹 페이지 접근 시 필요한 인증 자격이 없거나 부족한 경우 |
|  |  | 403 Forbidden | 인증 정보는 있지만 권한이 없는 웹 페이지에 접근했을 경우 |
|  |  | 404 Not Found | 존재하지 않는 페이지에 접근했을 경우 |
| 5xx | Server Error | 500 Internal Server Error | 웹 서버 설정이 잘못 되었거나 서버 프로그램에 오류가 있을 때 |
|  |  | 503 Service Unavailable | 웹 서버에 너무 많은 요청이 몰리거나 웹 서버에 부하가 걸려 응답하지 못할 때 |
