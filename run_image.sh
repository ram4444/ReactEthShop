#!/bin/sh
## dependency git, npm, cargo, docker 

#prepare the log dir
#mkdir logs
#cd logs
#mkdir archived
#cd ..

## Git clone the repo
#apt-get update && apt-get -y install git
#git clone https://github.com/ram4444/ContainerLogsUploader.git
#cd ContainerLogsUploader
#./gradlew bootRun 2>&1 | tee ../ContainerLogsUploader.stdout
#./gradlew bootRun --args=--projName=PostManCollectionsEndPoint &
#cd ..
tar -xvf build.tar.gz
npm install
npm install -g serve
serve -s build