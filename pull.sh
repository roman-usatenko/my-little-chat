#!/bin/sh
if git pull origin main; then
  npm install
  pm2 restart my-little-chat-app
fi
