import { aws_rds } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { SERVICES } from '../../../config/constants';

interface ProductDataProps extends cdk.StackProps{
  vpc: ec2.Vpc;
  databaseSecurityGroup: ec2.SecurityGroup;
}

export class ProductDataStack extends cdk.Stack {
  public readonly productDatabase: aws_rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: ProductDataProps) {
    super(scope, id, props);

    this.productDatabase = new rds.DatabaseInstance(this, 'ProductsPostgresDB', {
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

      databaseName: SERVICES.postgres.productsdb,

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