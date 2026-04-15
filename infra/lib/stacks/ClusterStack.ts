import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as cloudmap from 'aws-cdk-lib/aws-servicediscovery';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

interface ClusterProps extends cdk.StackProps{
  vpc: ec2.Vpc;
}

export class ClusterStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;

  constructor(scope: Construct, id: string, props: ClusterProps) {
    super(scope, id, props);

    this.cluster = new ecs.Cluster(this, 'AppCluster', {
      vpc: props.vpc,
      clusterName: 'products-ms-cluster',
      containerInsights: true,
      defaultCloudMapNamespace: {
        name: 'internal',
      },
    });
  }
}