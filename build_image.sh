#!/bin/bash
# Need to be run in privileged mode
## dependency git, npm, cargo, docker

## Git clone the repo
git clone https://github.com/ram4444/ReactEthShop.git

cd ReactEthShop
npm install
npm run build
tar -czvf build.tar.gz build

# Copy the git credential from home directory to the project folder for COPY operation in dockerfile
cp ../../.git-credentials ./.git-credentials
cp ../../.gitconfig ./.gitconfig

dockerd &

IMAGETS=`date '+%Y%m%d%-H%M%S'`

## Build a docker image to local
DOCKER_BUILDKIT=1 docker build ./ -f runtime.dockerfile -t dionysbiz/reactethshop:locallatest
docker image tag dionysbiz/reactethshop:locallatest 572216726135.dkr.ecr.eu-west-2.amazonaws.com/reactethshop:latest
docker image tag dionysbiz/reactethshop:locallatest 572216726135.dkr.ecr.eu-west-2.amazonaws.com/reactethshop:${IMAGETS}

## Push the docker image to Any repo
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 572216726135.dkr.ecr.eu-west-2.amazonaws.com
aws ecr create-repository --region eu-west-2 --repository-name reactethshop
docker push 572216726135.dkr.ecr.eu-west-2.amazonaws.com/reactethshop:latest
docker push 572216726135.dkr.ecr.eu-west-2.amazonaws.com/reactethshop:${IMAGETS}
