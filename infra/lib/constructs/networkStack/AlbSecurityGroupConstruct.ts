import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from "constructs";

interface AlbSecurityGroupProps{
  vpc: ec2.Vpc;
}

export class AlbSecurityGroupConstruct extends Construct{
  public readonly albSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: AlbSecurityGroupProps) {
    super(scope, id);

    this.albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: 'Security group for Application Load Balancer',
      securityGroupName: 'alb-sg',
    });

    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP from anywhere'
    );

    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS from anywhere'
    );

  }
}