# 배포 가이드 — 우분투 서버 (nginx + Node WAS)

이 저장소의 `server/`는 일정·가계부·사진을 편집할 수 있는 작은 웹앱(Express + SQLite)입니다.
정적 페이지였던 루트의 `index.html`과는 별개로, `server/`가 실제 WAS입니다.

## 1. 서버에 코드 가져오기

```bash
cd /opt
sudo git clone -b claude/travel-itinerary-3it5fs https://github.com/Devin-Home/devin-rfp.git trip
cd trip/server
```

## 2. Node.js 설치 (없다면)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
```

## 3. 의존성 설치

```bash
npm install --omit=dev
```

## 4. 환경변수 설정

```bash
cp .env.example .env
node scripts/hash-password.js "일행끼리 쓸 비밀번호"
```
출력된 해시 값을 `.env`의 `SITE_PASSWORD_HASH`에 붙여넣고, `SESSION_SECRET`도 임의의 긴 문자열로 바꿔주세요.
HTTPS로 서비스할 예정이면(권장) `COOKIE_SECURE=true`로 설정합니다.

```bash
nano .env
```

## 5. 동작 확인

```bash
node server.js
# 다른 터미널에서
curl http://localhost:3000/api/auth/session
```
`{"authed":false}`가 나오면 정상입니다. `Ctrl+C`로 종료합니다.

## 6. systemd 서비스로 등록 (재부팅/장애 시 자동 재시작)

```bash
sudo tee /etc/systemd/system/trip-was.service > /dev/null <<'EOF'
[Unit]
Description=Bangkok/Pattaya Trip WAS
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/trip/server
ExecStart=/usr/bin/node server.js
Restart=on-failure
User=www-data
Group=www-data
EnvironmentFile=/opt/trip/server/.env

[Install]
WantedBy=multi-user.target
EOF

sudo chown -R www-data:www-data /opt/trip/server
sudo systemctl daemon-reload
sudo systemctl enable --now trip-was
sudo systemctl status trip-was
```

## 7. nginx 리버스 프록시

```bash
sudo tee /etc/nginx/sites-available/trip-was > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;   # 도메인이 있으면 예: trip.example.com 으로 교체

    client_max_body_size 10m;   # 사진 업로드 허용 용량

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cookie_path / "/; SameSite=Lax";
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/trip-was /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

`http://서버IP/` 로 접속하면 로그인 화면이 뜹니다. 4단계에서 만든 비밀번호로 입장하세요.

## 8. (권장) HTTPS 적용

도메인이 서버 IP를 가리키고 있다면:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d trip.example.com
```
발급 후 `.env`의 `COOKIE_SECURE=true`로 바꾸고 `sudo systemctl restart trip-was`.

## 9. 최신 커밋 반영하기

수동으로 갱신할 때:
```bash
cd /opt/trip
sudo -u www-data git pull origin claude/travel-itinerary-3it5fs
cd server && sudo -u www-data npm install --omit=dev
sudo systemctl restart trip-was
```

자동으로 반영하고 싶다면 이전에 안내드린 cron 방식이나 GitHub Actions 배포 방식을 그대로 적용하시되,
마지막 단계에 `npm install`과 `systemctl restart trip-was`를 추가하시면 됩니다.

## 데이터 백업

실 데이터는 서버에만 있습니다 (`server/data/trip.db`, `server/uploads/`). 저장소에는 커밋되지 않으니,
주기적으로 아래처럼 백업해두는 것을 권장합니다.

```bash
tar czf trip-backup-$(date +%F).tar.gz -C /opt/trip/server data uploads
```
