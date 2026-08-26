---
title: "API Key 생성하기"
category: "IndexNow"
slug: "indexnow-api-key"
source: "https://searchadvisor.naver.com/guide/indexnow-api-key"
updated: "2023-07-25"
---

# API Key 생성하기

웹사이트 관리자가 IndexNow API를 이용하기 위해서는, 웹사이트의 소유자임을 알리는 고유의 key를 사용해야 합니다.  
key 파일을 생성해서 웹사이트에 올리면, 검색엔진은 해당 key의 내용을 확인하고, 웹사이트의 API 사용이 적법한지 판단합니다.

주의할 점은 웹사이트가 여러 개의 도메인으로 이루어져 있다면, 각 도메인마다 별개의 key를 이용해야 합니다.

### Key 생성 규칙

- [UTF-8](https://ko.wikipedia.org/wiki/UTF-8) 인코딩을 사용해야 합니다.
- key는 16진수에 사용되는 문자, 숫자, - 만을 이용해서 만들어야 합니다.
    - a-f, A-F, 0-9, -
- key의 길이는 최소 8자, 최대 128자입니다.
- 다음은 key의 예시입니다.
    - fc1e3ad82010475381daf9846e627fdd
    - eda4094d82454ab0ad8601e3b7405a69

### Key를 웹사이트에 올려두기

#### ◆ 사이트의 루트 디렉터리에 올려두기 (추천)

key 값의 내용을 담은 파일을 'key와 동일한 이름'.txt 로 저장하여 웹사이트의 루트 디렉터리에 업로드합니다.

예를 들어 다음과 같이 key 파일을 위치시킵니다.  
https://www.example.com/aa2451c6c6c64105be9aeb2ae7e541b8.txt  
txt 파일 안에는 aa2451c6c6c64105be9aeb2ae7e541b8 문자열이 들어 있습니다.

#### ◆ 원하는 디렉터리에 올려두기

이 경우에는 API 요청 시에 keyLocation 정보를 명시해 주어야 합니다.  
주의할 점은 특정 디렉터리에 올린 key 정보는 같은 디렉터리에 있는 웹페이지의 갱신을 알릴 때만 유효합니다.

예를 들어 http://example.com/catalog/key12457EDd.txt 에 있는 키 파일은  
http://example.com/catalog/ 로 시작하는 웹페이지의 갱신만 API를 통해서 알릴 수 있고,  
다른 디렉터리의 웹페이지에 대한 요청은 무효합니다.

### 다음 단계

Key를 웹사이트에 올바르게 올려두었다면, API를 통해서 웹페이지가 갱신되었음을 알릴 수 있습니다.  
이어서 [페이지 갱신 요청하기](<../10-IndexNow/03-페이지 갱신 요청하기.md>) 안내를 참고하시기 바랍니다.
