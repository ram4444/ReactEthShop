#!/bin/bash
#pm2 start --name ReactEthShop npm -- start
rm -rf node_modules
pm2 serve -s build -l 3000 --name ReactEthShop --spa