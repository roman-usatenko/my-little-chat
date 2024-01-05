#!/bin/sh
echo "=============== Pulling changes ==============="
cd "$(dirname "$0")"
if git pull origin main; then
  echo "No changes"
else
  npm install
  /usr/local/bin/pm2 restart my-little-chat-app
fi
