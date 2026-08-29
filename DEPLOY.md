# 배포 가이드 — 우분투 서버 (nginx + Node WAS)

이 저장소의 `server/`는 일정·가계부·사진을 편집할 수 있는 작은 웹앱(Express + JSON 파일 저장소)입니다.
네이티브 컴파일이 필요한 DB 모듈을 쓰지 않아 별도 빌드 도구 없이도 설치됩니다.
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

## 9. 실시간 자동 배포 (GitHub Actions)

지금까지는 파일을 압축해서 수동으로 올리는 방식이었는데, 이 저장소가 GitHub에 push될 때마다
서버가 자동으로 최신 코드를 받아서 재시작하도록 연결할 수 있습니다. `push` 후 보통 몇 초~1분 안에 반영됩니다.

### 9-1. `/opt/trip`을 진짜 git 저장소로 바꾸기 (최초 1회)

지금까지는 tar 파일을 풀어놓은 일반 폴더라, git으로 관리되지 않습니다. 새로 clone해서 기존 데이터만 옮깁니다.

먼저 GitHub에서 **읽기 전용 Personal Access Token**을 하나 만드세요 (github.com → Settings →
Developer settings → Personal access tokens → Fine-grained tokens, 이 저장소만 Contents: Read 권한).
서버가 `git pull`할 때 인증용으로만 씁니다.

```bash
cd /opt
git clone -b claude/travel-itinerary-3it5fs https://<TOKEN>@github.com/Devin-Home/devin-rfp.git trip-new

# 기존 데이터(DB, 업로드 사진, .env) 새 clone으로 복사
cp /opt/trip/server/.env /opt/trip-new/server/.env
cp -r /opt/trip/server/data /opt/trip-new/server/
cp -r /opt/trip/server/uploads /opt/trip-new/server/

cd /opt/trip-new/server
npm install --omit=dev

systemctl stop trip-was
mv /opt/trip /opt/trip-backup-$(date +%F)
mv /opt/trip-new /opt/trip
chown -R www-data:www-data /opt/trip
systemctl start trip-was
systemctl status trip-was
```

`active (running)`이고 브라우저에서 정상 접속되면 `/opt/trip-backup-*`는 며칠 뒤 지워도 됩니다.

### 9-2. 배포 스크립트 설치

저장소 루트의 `deploy.sh`를 서버의 `/opt/trip/deploy.sh`로 복사합니다 (이미 `/opt/trip`이 git 저장소이므로
`git pull` 한 번이면 자동으로 최신 `deploy.sh`가 그 자리에 있습니다. 최초 1회만 권한 설정):

```bash
chmod 700 /opt/trip/deploy.sh
chown root:root /opt/trip/deploy.sh
```

### 9-3. GitHub Actions가 비밀번호 없이 이 스크립트를 실행할 수 있게 sudo 권한 부여

```bash
echo 'azureadmin ALL=(root) NOPASSWD: /opt/trip/deploy.sh' | sudo tee /etc/sudoers.d/trip-deploy
sudo visudo -c   # 문법 검증, "parsed OK" 나오면 정상
```

### 9-4. GitHub Actions가 서버에 SSH로 접속할 키 생성

**로컬 노트북 터미널**에서 (서버 접속용 키와는 별개로 새로 만드는 걸 권장):
```bash
ssh-keygen -t ed25519 -f deploy_key -N ""
```
`deploy_key.pub` 내용을 서버의 `azureadmin` 계정에 등록:
```bash
cat deploy_key.pub | ssh azureadmin@52.141.56.131 "cat >> ~/.ssh/authorized_keys"
```

### 9-5. GitHub 저장소에 시크릿 등록

GitHub → `Devin-Home/devin-rfp` 저장소 → **Settings → Secrets and variables → Actions → New repository secret**
3개를 등록합니다.

| 이름 | 값 |
|---|---|
| `SSH_HOST` | `52.141.56.131` |
| `SSH_USER` | `azureadmin` |
| `SSH_PRIVATE_KEY` | `deploy_key` 파일 내용 전체 (`-----BEGIN OPENSSH PRIVATE KEY-----`부터 끝까지) |

### 9-6. 완료 — 이제 push하면 자동 배포됩니다

`server/` 폴더 안의 파일이 바뀐 채로 `claude/travel-itinerary-3it5fs` 브랜치에 push되면
`.github/workflows/deploy.yml`이 자동으로 실행되어 서버에서 `sudo /opt/trip/deploy.sh`를 실행합니다
(git pull → npm install → 권한 복구 → 서비스 재시작). GitHub 저장소의 **Actions** 탭에서 실행 로그를
확인할 수 있습니다.

### 수동으로 한 번만 반영하고 싶을 때

```bash
sudo /opt/trip/deploy.sh
```

### 더 간단한 대안: cron으로 주기적 반영 (Actions 설정이 부담스러우면)

Actions/SSH 키 설정 없이, 서버가 스스로 몇 분마다 확인하게 할 수도 있습니다 (완전 실시간은 아니고 지연 있음):
```bash
sudo crontab -e
```
```
*/5 * * * * /opt/trip/deploy.sh >> /var/log/trip-deploy.log 2>&1
```

## 데이터 백업

실 데이터는 서버에만 있습니다 (`server/data/trip.json`, `server/uploads/`). 저장소에는 커밋되지 않으니,
주기적으로 아래처럼 백업해두는 것을 권장합니다.

```bash
tar czf trip-backup-$(date +%F).tar.gz -C /opt/trip/server data uploads
```
