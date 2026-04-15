import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { SERVICES } from '../../config/constants';

interface AlbStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  albSecurityGroup: ec2.SecurityGroup;
  productService: ecs.FargateService;
  ordersService: ecs.FargateService;
}

export class AlbStack extends cdk.Stack {

  public readonly alb: elbv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: AlbStackProps) {
    super(scope, id, props);

    this.alb = new elbv2.ApplicationLoadBalancer(this, 'AppALB', {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: props.albSecurityGroup,
    });

    const listener = this.alb.addListener('HttpListener', {
      port: 80,
      open: true,
      defaultAction: elbv2.ListenerAction.fixedResponse(404, {
        contentType: 'text/plain',
        messageBody: 'Not Found',
      }),
    });

    // PRODUCT SERVICE
    listener.addTargets('ProductsTarget', {
      priority: 1,
      conditions: [elbv2.ListenerCondition.pathPatterns([`${SERVICES.products.basePath}*`])],
      port: SERVICES.products.port,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [props.productService],
      healthCheck: {
        path: SERVICES.products.healthCheckPath,
      },
    });

    // ORDERS SERVICE
    listener.addTargets('OrdersTarget', {
      priority: 2,
      conditions: [elbv2.ListenerCondition.pathPatterns([`${SERVICES.orders.basePath}*`])],
      port: SERVICES.orders.port,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [props.ordersService],
      healthCheck: {
        path: SERVICES.orders.healthCheckPath,
      },
    });

    new cdk.CfnOutput(this, 'AlbUrl', {
      value: `http://${this.alb.loadBalancerDnsName}`,
    });
  }
}