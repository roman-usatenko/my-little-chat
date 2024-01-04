#!/bin/bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y nodejs npm
sudo npm install -g pm2
npm install
pm2 start pm2.config.js
pm2 startup
pm2 save


