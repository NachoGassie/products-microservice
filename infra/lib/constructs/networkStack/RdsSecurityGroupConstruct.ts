import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface RdsSecurityGroupProps{
  vpc: ec2.IVpc;
  ecsSecurityGroup: ec2.ISecurityGroup;
  service: string;
  databasePort: number;
}

export class RdsSecurityGroupConstruct extends Construct{
  public readonly databaseSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: RdsSecurityGroupProps) {
    super(scope, id);

    this.databaseSecurityGroup = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: false,
      description: `Security group for ${props.service} RDS`,
      securityGroupName: `${props.service}-rds-sg`,
    });

    this.databaseSecurityGroup.addIngressRule(
      props.ecsSecurityGroup,
      ec2.Port.tcp(props.databasePort),
      `Allow PostgreSQL access only from ${props.service} ECS`
    );

  }
}