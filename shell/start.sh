#!/bin/bash
#pm2 start --name ReactEthShop npm -- start
rm -rf node_modules
npm install
npm run build
pm2 serve --name ReactEthShop -s build -l 3000