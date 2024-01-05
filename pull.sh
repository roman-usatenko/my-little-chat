#!/bin/sh
echo "=============== Pulling changes ==============="
cd "$(dirname "$0")"
if git pull origin main; then
  npm install
  pm2 restart my-little-chat-app
else
  echo "No changes"
fi
