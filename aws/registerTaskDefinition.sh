#!/bin/bash

#Documentation
#https://docs.aws.amazon.com/cli/latest/reference/ecs/register-task-definition.html
taskdef='
{
    "family": "ReactEthShop",
    "containerDefinitions": [
        {
            "name": "reactethshop",
            "image": "572216726135.dkr.ecr.eu-west-2.amazonaws.com/reactethshop:latest",
            "cpu": 0,
            "portMappings": [
                {
                    "name": "node_default",
                    "containerPort": 3000,
                    "hostPort": 3000,
                    "protocol": "tcp",
                    "appProtocol": "http"
                }
            ],
            "essential": true,
            "environment": [],
            "environmentFiles": [],
            "mountPoints": [],
            "volumesFrom": [],
            "ulimits": []
        }
    ],
    "taskRoleArn": "arn:aws:iam::572216726135:role/ecsTaskExecutionRole",
    "executionRoleArn": "arn:aws:iam::572216726135:role/ecsTaskExecutionRole",
    "networkMode": "awsvpc",
    "requiresCompatibilities": [
        "FARGATE"
    ],
    "cpu": "512",
    "memory": "2048",
    "runtimePlatform": {
        "cpuArchitecture": "X86_64",
        "operatingSystemFamily": "LINUX"
    }
}'

taskdeftrim=`echo $taskdef | tr -d '[:blank:]\n'`
aws ecs register-task-definition \
--family ReactEthShop \
--cli-input-json $taskdeftrim \
--region eu-west-2

