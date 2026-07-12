#!/bin/bash
# Builds the frontend locally (the production VDS doesn't have enough RAM to
# build reliably — see git log for the stale-chunk saga) with the
# PRODUCTION API URL baked in, then ships the .next artifact to the server.
#
# Usage: ./deploy.sh
# Needs SSH key auth to the server (or run interactively for password
# prompts on ssh/scp) — password auth won't work non-interactively.
set -euo pipefail
cd "$(dirname "$0")"

PROD_API_URL="https://technics.kg/api"
SSH_HOST="195.38.165.141"
SSH_USER="technics_kg"
REMOTE_DIR="~/apps/technics/frontend"
PM2="/home/technics_kg/.nvm/versions/node/v20.20.2/bin/pm2"

echo "==> Building with NEXT_PUBLIC_API_URL=$PROD_API_URL (not .env.local)"
rm -rf .next
NEXT_PUBLIC_API_URL="$PROD_API_URL" npm run build

echo "==> Verifying no localhost refs leaked into the client bundle"
if grep -rl "localhost:3001" .next/static/ >/dev/null 2>&1; then
  echo "REFUSING TO DEPLOY: build still references localhost:3001" >&2
  exit 1
fi

echo "==> Packing build"
tar -czf /tmp/next-build.tar.gz .next

echo "==> Uploading"
scp -o StrictHostKeyChecking=accept-new /tmp/next-build.tar.gz "$SSH_USER@$SSH_HOST:~/next-build.tar.gz"

echo "==> Deploying on server"
ssh "$SSH_USER@$SSH_HOST" bash -s <<EOF
set -e
$PM2 stop frontend
rm -rf $REMOTE_DIR/.next && mkdir -p $REMOTE_DIR/.next
tar -xzf ~/next-build.tar.gz -C $REMOTE_DIR/
rm ~/next-build.tar.gz
$PM2 start frontend
EOF

rm /tmp/next-build.tar.gz
echo "==> Done"
