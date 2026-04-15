import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface EcsSecurityGroupProps{
  vpc: ec2.IVpc;
  albSecurityGroup: ec2.ISecurityGroup;
  service: string;
  port: number;
}

export class EcsSecurityGroupConstruct extends Construct{
  public readonly ecsSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: EcsSecurityGroupProps) {
    super(scope, id);

    this.ecsSecurityGroup = new ec2.SecurityGroup(this, 'EcsSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: `Security group for ${props.service} ECS service`,
      securityGroupName: `${props.service}-ecs-sg`,
    });

    this.ecsSecurityGroup.addIngressRule(
      props.albSecurityGroup,
      ec2.Port.tcp(props.port),
      `Allow traffic from ALB to ${props.service} service`
    );

  }
}