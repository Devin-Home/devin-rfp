#!/bin/bash
# Pulls the latest code, installs deps, fixes ownership, restarts the service.
# Lives at /opt/trip/deploy.sh on the server, owned by root, mode 700.
# GitHub Actions runs this via: sudo /opt/trip/deploy.sh
set -euo pipefail

BRANCH="claude/travel-itinerary-3it5fs"

cd /opt/trip
git pull origin "$BRANCH"

cd /opt/trip/server
npm install --omit=dev

chown -R www-data:www-data /opt/trip
systemctl restart trip-was
systemctl --no-pager status trip-was
