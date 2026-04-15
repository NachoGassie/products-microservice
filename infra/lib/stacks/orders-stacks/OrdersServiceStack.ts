import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { SERVICES } from '../../../config/constants';

interface OrdersServiceProps extends cdk.StackProps {
  cluster: ecs.Cluster;
  repository: ecr.IRepository;
  ordersSecurityGroup: ec2.SecurityGroup;
  databaseEndpoint: string;
  databaseSecret: secretsmanager.ISecret;
  imageTag: string;
}

export class OrdersServiceStack extends cdk.Stack {
  public readonly service: ecs.FargateService;

  constructor(scope: Construct, id: string, props: OrdersServiceProps) {
    super(scope, id, props);

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'OrdersTaskDef', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    const logGroup = new logs.LogGroup(this, 'OrdersLogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const container = taskDefinition.addContainer('OrdersContainer', {
      image: ecs.ContainerImage.fromEcrRepository(props.repository, props.imageTag),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: SERVICES.orders.name,
        logGroup,
      }),
      environment: {
        SPRING_PROFILES_ACTIVE: 'dev',
        SERVER_PORT: SERVICES.orders.port.toString(),

        DB_URL: `jdbc:postgresql://${props.databaseEndpoint}:${SERVICES.postgres.port}/${SERVICES.postgres.ordersdb}`,

        PRODUCTS_SERVICE_URL: `http://${SERVICES.products.name}:${SERVICES.products.port}`,
      },
      secrets: {
        DB_USERNAME: ecs.Secret.fromSecretsManager(props.databaseSecret, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(props.databaseSecret, 'password'),
      },
    });

    container.addPortMappings({
      containerPort: SERVICES.orders.port,
      name: 'http',
      protocol: ecs.Protocol.TCP,
    });

    this.service = new ecs.FargateService(this, 'OrdersService', {
      cluster: props.cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: false,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [props.ordersSecurityGroup],
      healthCheckGracePeriod: cdk.Duration.seconds(120),
      serviceConnectConfiguration: {
        services: [
          {
            portMappingName: 'http',
            discoveryName: SERVICES.orders.name,
            dnsName: SERVICES.orders.name,
            port: SERVICES.orders.port,
          },
        ],
      },
    });

    const scaling = this.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 3,
    });
    
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });
    
  }
}