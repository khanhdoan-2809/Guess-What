import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as apigw2 from "aws-cdk-lib/aws-apigatewayv2";
import { HttpAlbIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

export const PREFIX = "my-app";

export class GuessWhatStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create vpc
    // l2 construct => subnets, route tables, routes, IGW, NAT are automatically created
    const vpc = new ec2.Vpc(this, "Vpc", {
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
      maxAzs: 2, // 1 public + 1 private subnets
      vpcName: `${PREFIX}-vpc`,
      restrictDefaultSecurityGroup: false
    });

    // create cluster
    const cluster: ecs.Cluster = new ecs.Cluster(this, "Cluster", {
      vpc,
      clusterName: `${PREFIX}-cluster`
    })

    // create ecs fargate service and alb
    const service = new ApplicationLoadBalancedFargateService(this, "Service", {
      serviceName: `${PREFIX}-service`,
      loadBalancerName: `${PREFIX}-alb`,
      cluster,
      // each Fargate task
      memoryLimitMiB: 512,
      cpu: 256,
      // create task definition
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry("public.ecr.aws/ecs-sample-image/amazon-ecs-sample:latest"),
        // environment in a container
        environment: {
          ENV_VAR_1: "value1",
          ENV_VAR_2: "value2",
        },
        containerPort: 80 // port on which the container will listen 
      },
      desiredCount: 2, // desire 2 Fargate tasks
      // secure
      publicLoadBalancer: false
    })
    
    // health check endpoint
    service.targetGroup.configureHealthCheck({
      path: "/"
    })

    // create asg
    const scaling = service.service.autoScaleTaskCount({ maxCapacity: 5, minCapacity: 1 });
    // default cooldown of 5 min
    scaling.scaleOnCpuUtilization("CpuScaling", { targetUtilizationPercent: 70 });
    scaling.scaleOnMemoryUtilization("RamScaling", { targetUtilizationPercent: 70 });

    // create api gateway
    const httpApi = new apigw2.HttpApi(this, "HttpApi", { apiName: `${PREFIX}-api` });
    httpApi.addRoutes({
      path: "/",
      methods: [apigw2.HttpMethod.GET],
      integration: new HttpAlbIntegration("AlbIntegration", service.listener)
    })

  }
}
