import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { SERVICES } from '../../config/constants';
import { AlbSecurityGroupConstruct, EcsSecurityGroupConstruct, RdsSecurityGroupConstruct, VpcConstruct } from '../constructs/networkStack';

export class NetworkStack extends cdk.Stack{

  public readonly vpc: ec2.Vpc;

  // Security Groups reutilizables en otros stacks
  public readonly albSecurityGroup: ec2.SecurityGroup;

  public readonly productsEcsSecurityGroup: ec2.SecurityGroup;
  public readonly ordersEcsSecurityGroup: ec2.SecurityGroup;
  
  public readonly productsRdsSecurityGroup: ec2.SecurityGroup;
  public readonly ordersRdsSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps){
    super(scope, id, props);

    const networkConstruct = new VpcConstruct(this, 'NetworkConstruct');
    this.vpc = networkConstruct.vpc;

    // SECURITY GROUPS
    const albSecurityGroupConstruct = new AlbSecurityGroupConstruct(this, 'AlbSecurityGroup', {
      vpc: this.vpc
    });
    this.albSecurityGroup = albSecurityGroupConstruct.albSecurityGroup;

    const productsEcsSecurityGroup = new EcsSecurityGroupConstruct(this, 'ProductsEcsSecurityGroup', {
      vpc: this.vpc,
      albSecurityGroup: this.albSecurityGroup,
      service: SERVICES.products.name,
      port: SERVICES.products.port
    });

    const ordersEcsSecurityGroup = new EcsSecurityGroupConstruct(this, 'OrdersEcsSecurityGroup', {
      vpc: this.vpc,
      albSecurityGroup: this.albSecurityGroup,
      service: SERVICES.orders.name,
      port: SERVICES.orders.port
    });

    this.productsEcsSecurityGroup = productsEcsSecurityGroup.ecsSecurityGroup;
    this.ordersEcsSecurityGroup = ordersEcsSecurityGroup.ecsSecurityGroup;

    this.productsEcsSecurityGroup.addIngressRule(
      this.ordersEcsSecurityGroup,
      ec2.Port.tcp(SERVICES.products.port),
      'Allow traffic from orders ECS service to products ECS service'
    );

    const endpointsSecurityGroup = new ec2.SecurityGroup(this, 'EndpointsSG', {
      vpc: this.vpc,
      allowAllOutbound: true,
    });

    endpointsSecurityGroup.addIngressRule(
      this.productsEcsSecurityGroup,
      ec2.Port.tcp(443),
      'Allow Products ECS to access endpoints'
    );

    endpointsSecurityGroup.addIngressRule(
      this.ordersEcsSecurityGroup,
      ec2.Port.tcp(443),
      'Allow Orders ECS to access endpoints'
    );
      
    // RDS SECURITY GROUPS
    const productsRdsSecurityGroup = new RdsSecurityGroupConstruct(this, 'ProductsRdsSecurityGroup',{
      vpc: this.vpc,
      ecsSecurityGroup: this.productsEcsSecurityGroup,
      service: SERVICES.products.name,
      databasePort: SERVICES.postgres.port
    });

    const ordersRdsSecurityGroup = new RdsSecurityGroupConstruct(this, 'OrdersRdsSecurityGroup',{
      vpc: this.vpc,
      ecsSecurityGroup: this.ordersEcsSecurityGroup,
      service: SERVICES.orders.name,
      databasePort: SERVICES.postgres.port
    });

    this.productsRdsSecurityGroup = productsRdsSecurityGroup.databaseSecurityGroup;
    this.ordersRdsSecurityGroup = ordersRdsSecurityGroup.databaseSecurityGroup;

    // CLOUDWATCH LOGS INTERFACE ENDPOINT
    this.vpc.addInterfaceEndpoint('CloudWatchLogsEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [endpointsSecurityGroup],
      privateDnsEnabled: true,
    });

    // ECR API Endpoint
    this.vpc.addInterfaceEndpoint('EcrApiEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [endpointsSecurityGroup],
      privateDnsEnabled: true,
    });

    // ECR Docker Endpoint
    this.vpc.addInterfaceEndpoint('EcrDockerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [endpointsSecurityGroup],
      privateDnsEnabled: true,
    });

    // Secrets Manager Endpoint
    this.vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [endpointsSecurityGroup],
      privateDnsEnabled: true,
    });

    this.vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });

    // Outputs útiles
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      exportName: 'VpcId',
    });

    new cdk.CfnOutput(this, 'AlbSecurityGroupId', {
      value: this.albSecurityGroup.securityGroupId,
      exportName: 'AlbSecurityGroupId',
    });

    new cdk.CfnOutput(this, 'ProductsEcsSecurityGroupId', {
      value: this.productsEcsSecurityGroup.securityGroupId,
      exportName: 'ProductsEcsSecurityGroupId',
    });

    new cdk.CfnOutput(this, 'OrdersEcsSecurityGroupId', {
      value: this.ordersEcsSecurityGroup.securityGroupId,
      exportName: 'OrdersEcsSecurityGroupId',
    });

    new cdk.CfnOutput(this, 'ProductsRdsSecurityGroupId', {
      value: this.productsRdsSecurityGroup.securityGroupId,
      exportName: 'ProductsRdsSecurityGroupId',
    });

    new cdk.CfnOutput(this, 'OrdersRdsSecurityGroupId', {
      value: this.ordersRdsSecurityGroup.securityGroupId,
      exportName: 'OrdersRdsSecurityGroupId',
    });

  }
}