import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as aws_rds from 'aws-cdk-lib/aws-rds';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import { SERVICES } from '../../../config/constants';

interface OrdersDataProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  databaseSecurityGroup: ec2.SecurityGroup;
}

export class OrdersDataStack extends cdk.Stack {
  public readonly ordersDatabase: aws_rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: OrdersDataProps) {
    super(scope, id, props);

    this.ordersDatabase = new rds.DatabaseInstance(this, 'OrdersPostgresDB', {
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [props.databaseSecurityGroup],

      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),

      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),

      allocatedStorage: 20,
      maxAllocatedStorage: 20,

      databaseName: SERVICES.postgres.ordersdb,

      credentials: rds.Credentials.fromGeneratedSecret('postgres'),

      multiAz: false,
      publiclyAccessible: false,

      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
      deleteAutomatedBackups: true,

      backupRetention: cdk.Duration.days(0),
    });
  }
}