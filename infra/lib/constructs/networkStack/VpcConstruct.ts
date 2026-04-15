import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from "constructs";

export class VpcConstruct extends Construct{
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.vpc = new ec2.Vpc(this, 'AppVpc', {
      maxAzs: 2,
      natGateways: 0,

      subnetConfiguration: [
        {
          name: 'public-subnet', // Internet Gateway - ALB
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'private-egress-subnet', // Nat Gateway - Fargate
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'private-isolated-subnet', // No internet connection - Rds
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

  }
}