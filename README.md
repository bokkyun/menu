# 스미스가좋아하는 테라스 · 메뉴 선택

여러 명이 함께 메뉴를 고르고 최종 금액을 집계하는 웹 앱입니다.

## 실행 방법

1. [Python 3](https://www.python.org/) 설치
2. `start.bat` 더블클릭 (또는 `python server.py`)
3. 브라우저에서 http://localhost:8080 접속
4. 이름 저장 후 메뉴 선택

## 여러 명이 함께 쓸 때

같은 Wi‑Fi에서 아래 링크를 공유하세요.

```
http://[내 컴퓨터 IP]:8080?room=terrace
```

`ipconfig`로 IPv4 주소를 확인할 수 있습니다.

## 파일 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 메인 페이지 |
| `menu-data.js` | 메뉴 데이터 |
| `app.js` | 선택·집계 로직 |
| `styles.css` | 스타일 |
| `server.py` | 다중 사용자 동기화 서버 |
| `start.bat` | 서버 실행 (Windows) |
