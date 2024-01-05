#!/bin/sh
echo "=============== Pulling changes ==============="
cd "$(dirname "$0")"
current_commit=$(git rev-parse HEAD)
git pull origin main
new_commit=$(git rev-parse HEAD)
if [ "$current_commit" != "$new_commit" ]; then
  echo "Changes pulled successfully. Updating dependencies and restarting PM2..."
  npm install
  /usr/local/bin/pm2 restart my-little-chat-app
else
  echo "No changes"
fi
