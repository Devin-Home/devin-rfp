# devin-rfp

## 방콕·파타야 가족여행 일정 (2027.01.26 ~ 02.03)

`index.html`을 브라우저로 열면 8박 9일 일정표(항공, 숙소, 관광, 맛집, 야시장, 지도 링크)를 정적 페이지로 확인할 수 있습니다.

## 일행 전용 웹앱 (일정 편집 + 가계부 + 사진)

`server/`는 브라우저에서 일정을 직접 수정하고, 가계부(지출)를 기록하고, 참고 사진을 업로드할 수 있는
작은 웹앱(Node/Express + SQLite)입니다. 비밀번호로 보호되어 일행끼리만 접근합니다.

로컬 실행:
```bash
cd server
npm install
cp .env.example .env
npm run hash-password -- "원하는비밀번호"   # 출력값을 .env의 SITE_PASSWORD_HASH에 붙여넣기
npm start
```
`http://localhost:3000` 접속 후 방금 정한 비밀번호로 로그인합니다.

우분투 서버 + nginx로 배포하는 방법은 [`DEPLOY.md`](./DEPLOY.md)를 참고하세요.
