import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { SERVICES } from '../../../config/constants';

interface ProductServiceProps extends cdk.StackProps{
  cluster: ecs.Cluster;
  repository: ecr.IRepository;
  productsSecurityGroup: ec2.SecurityGroup;
  databaseEndpoint: string;
  databaseSecret: secretsmanager.ISecret;
  imageTag: string;
}

export class ProductServiceStack extends cdk.Stack {
  public readonly service: ecs.FargateService;

  constructor(scope: Construct, id: string, props: ProductServiceProps) {
    super(scope, id, props);

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'ProductsTaskDef', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    const logGroup = new logs.LogGroup(this, 'ProductsLogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const container = taskDefinition.addContainer('ProductsContainer', {
      image: ecs.ContainerImage.fromEcrRepository(props.repository, props.imageTag),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: SERVICES.products.name,
        logGroup,
      }),
      environment: {
        SPRING_PROFILES_ACTIVE: 'dev',
        SERVER_PORT: SERVICES.products.port.toString(),

        DB_URL: `jdbc:postgresql://${props.databaseEndpoint}:${SERVICES.postgres.port}/${SERVICES.postgres.productsdb}`,
      },
      secrets: {
        DB_USERNAME: ecs.Secret.fromSecretsManager(props.databaseSecret, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(props.databaseSecret, 'password'),
      },
    });

    container.addPortMappings({
      containerPort: SERVICES.products.port,
      name: 'http',
      protocol: ecs.Protocol.TCP,
    });

    this.service = new ecs.FargateService(this, 'ProductsService', {
      cluster: props.cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: false,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [props.productsSecurityGroup],
      healthCheckGracePeriod: cdk.Duration.seconds(120),
      circuitBreaker: {
        rollback: true,
      },
      serviceConnectConfiguration: {
        services: [
          {
            portMappingName: 'http',
            discoveryName: SERVICES.products.name,
            dnsName: SERVICES.products.name,
            port: SERVICES.products.port,
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