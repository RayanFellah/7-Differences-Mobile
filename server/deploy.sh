#!/bin/bash

# run this script detached :
# setsid bash ~/deploy.sh > ~/polydiff.log 2>&1 &

cd ~/LOG3900-209
git pull
cd server
npm ci
npm run build
node out/server/app/index.js