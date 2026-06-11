# 스미스가좋아하는 테라스 · 메뉴 선택

여러 명이 함께 메뉴를 고르고 최종 금액을 집계하는 웹 앱입니다.

## 온라인 배포 (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/bokkyun/menu)

1. 위 버튼 클릭 → GitHub 계정으로 Render 로그인
2. **Deploy Web Service** 클릭
3. 배포 완료 후 `https://menu-xxxx.onrender.com` 주소로 접속
4. 링크를 공유하면 어디서든 함께 메뉴 선택 가능

> 무료 플랜은 15분 미사용 시 슬립 모드로 전환됩니다. 첫 접속 시 30초~1분 정도 걸릴 수 있습니다.

### 공유 링크 예시

```
https://menu-xxxx.onrender.com?room=terrace
```

## 로컬 실행

1. [Python 3](https://www.python.org/) 설치
2. `start.bat` 더블클릭 (또는 `python server.py`)
3. 브라우저에서 http://localhost:8080 접속
4. 이름 저장 후 메뉴 선택

### 같은 Wi‑Fi에서 공유

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
| `render.yaml` | Render 배포 설정 |
| `start.bat` | 로컬 서버 실행 (Windows) |
