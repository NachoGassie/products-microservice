import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

interface ServiceEcrStackProps extends cdk.StackProps {
  serviceName: string;
}

export class ServiceEcrStack extends cdk.Stack {
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props: ServiceEcrStackProps) {
    super(scope, id, props);

    this.repository = new ecr.Repository(this, `${props.serviceName}Repository`, {
      repositoryName: `${props.serviceName}-service`,
      imageScanOnPush: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    new cdk.CfnOutput(this, `${props.serviceName}RepositoryName`, {
      value: this.repository.repositoryName,
    });

    new cdk.CfnOutput(this, `${props.serviceName}RepositoryUri`, {
      value: this.repository.repositoryUri,
    });
  }
}