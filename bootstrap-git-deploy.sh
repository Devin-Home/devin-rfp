#!/bin/bash
# One-shot, idempotent script: recovers /opt/trip if a previous attempt left it
# renamed to a backup, then migrates it to a real git clone if it isn't one yet,
# or just does a normal deploy (git pull + npm install + restart) if it already is.
# Run as root: bash bootstrap-git-deploy.sh
set -euo pipefail

BRANCH="claude/travel-itinerary-3it5fs"
REPO_URL="https://github.com/Devin-Home/devin-rfp.git"

echo "== Step 1: recover /opt/trip if a previous attempt left it renamed =="
if [ ! -d /opt/trip/server ]; then
  LATEST_BACKUP=$(ls -dt /opt/trip-backup-* 2>/dev/null | head -1 || true)
  if [ -n "${LATEST_BACKUP:-}" ]; then
    echo "  /opt/trip/server missing, restoring from $LATEST_BACKUP"
    mv "$LATEST_BACKUP" /opt/trip
  else
    echo "  ERROR: /opt/trip/server is missing and no /opt/trip-backup-* exists to restore from."
    echo "  Stopping here so nothing else gets touched - tell Claude what you see."
    exit 1
  fi
else
  echo "  /opt/trip/server already present, nothing to recover."
fi

echo "== Step 2: is /opt/trip already a git clone? =="
if [ -d /opt/trip/.git ]; then
  echo "  Yes - doing a normal deploy (git pull + npm install + restart)."
  cd /opt/trip
  git pull origin "$BRANCH"
  cd /opt/trip/server
  npm install --omit=dev
  chown -R www-data:www-data /opt/trip
  systemctl restart trip-was
  systemctl --no-pager status trip-was
  echo "== Done (deploy path) =="
  exit 0
fi

echo "  No - migrating to a real git clone now."
echo "== Step 3: clone into a temp dir =="
rm -rf /opt/trip-new
git clone -b "$BRANCH" "$REPO_URL" /opt/trip-new

echo "== Step 4: copy over existing .env / data / uploads =="
cp /opt/trip/server/.env /opt/trip-new/server/.env
[ -d /opt/trip/server/data ] && cp -r /opt/trip/server/data /opt/trip-new/server/ || true
[ -d /opt/trip/server/uploads ] && cp -r /opt/trip/server/uploads /opt/trip-new/server/ || true

echo "== Step 5: install deps in the new clone =="
cd /opt/trip-new/server
npm install --omit=dev

echo "== Step 6: swap directories (old one kept as a dated backup) =="
systemctl stop trip-was
mv /opt/trip "/opt/trip-backup-$(date +%F-%H%M%S)"
mv /opt/trip-new /opt/trip

echo "== Step 7: fix ownership, install deploy.sh, start service =="
chown -R www-data:www-data /opt/trip
chmod 700 /opt/trip/deploy.sh
chown root:root /opt/trip/deploy.sh
systemctl start trip-was
systemctl --no-pager status trip-was

echo "== Done (migration path) - /opt/trip is now a git clone =="
