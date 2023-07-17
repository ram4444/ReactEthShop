#!/bin/bash

#Documentation
#https://docs.aws.amazon.com/cli/latest/reference/ecs/create-service.html

lb='[
  {
    "targetGroupArn": "arn:aws:elasticloadbalancing:eu-west-2:572216726135:targetgroup/ReactEthShopGrp/1e83a8bc341548d0",
    "containerName": "reactethshop",
    "containerPort": 3000
  }
]'
deploymentConf='{
  "deploymentCircuitBreaker": {
    "enable": true,
    "rollback": true
  },
  "maximumPercent": 200,
  "minimumHealthyPercent": 100,
  "alarms": {
    "alarmNames": ["LBAlarm"],
    "enable": false,
    "rollback": false
  }
}'
networkConf='{
  "awsvpcConfiguration": {
    "subnets": ["subnet-0c5773a6cccad0b26", "subnet-0963e27e7938f6e8d"],
    "securityGroups": ["sg-09a028dc22418eafd"],
    "assignPublicIp": "ENABLED"
  }
}'
lbtrim=`echo $lb | tr -d '[:blank:]\n'`
deploymentConftrim=`echo $deploymentConf | tr -d '[:blank:]\n'`
networkConftrim=`echo $networkConf | tr -d '[:blank:]\n'`

aws ecs create-service \
--cluster arn:aws:ecs:eu-west-2:572216726135:cluster/DionysEcsUK \
--service-name TestCliReactEthShopServiceWithLB \
--task-definition ReactEthShop:7 \
--load-balancers $lbtrim \
--desired-count 1 \
--launch-type FARGATE \
--platform-version LATEST \
--deployment-configuration $deploymentConftrim \
--network-configuration $networkConftrim \
--health-check-grace-period-seconds 600 \
--scheduling-strategy REPLICA \
--deployment-controller type=ECS \
--region eu-west-2

#UNUSED
#[--service-registries <value>]
#[--client-token <value>]
#[--capacity-provider-strategy <value>]
#[--placement-constraints <value>]
#[--placement-strategy <value>]
#[--tags <value>]
#[--enable-ecs-managed-tags | --no-enable-ecs-managed-tags]
#[--propagate-tags <value>]
#[--service-connect-configuration <value>]
#[--cli-input-json <value>]
#[--generate-cli-skeleton <value>]

#MISC
#[--debug]
#[--endpoint-url <value>]
#[--no-verify-ssl]
#[--no-paginate]
#[--output <value>]
#[--query <value>]
#[--profile <value>]
#[--version <value>]
#[--color <value>]
#[--no-sign-request]
#[--ca-bundle <value>]
#[--cli-read-timeout <value>]
#[--cli-connect-timeout <value>]

