import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface GithubActionsIamStackProps extends cdk.StackProps {
  githubOwner: string;
  githubRepo: string;
}

export class GithubActionsIamStack extends cdk.Stack {
  public readonly githubActionsRole: iam.Role;

  constructor(scope: Construct, id: string, props: GithubActionsIamStackProps) {
    super(scope, id, props);

    const githubOidcProvider = new iam.OpenIdConnectProvider(this, 'GitHubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    this.githubActionsRole = new iam.Role(this, 'GithubActionsEcrPushRole', {
      roleName: 'github-actions-ecr-push-role',
      assumedBy: new iam.WebIdentityPrincipal(
        githubOidcProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
            'token.actions.githubusercontent.com:sub': `repo:${props.githubOwner}/${props.githubRepo}:ref:refs/heads/main`,
          },
        }
      ),
      description: 'Role assumed by GitHub Actions via OIDC to push images to ECR',
    });

    this.githubActionsRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'ecr:GetAuthorizationToken',
          'ecr:BatchCheckLayerAvailability',
          'ecr:CompleteLayerUpload',
          'ecr:InitiateLayerUpload',
          'ecr:UploadLayerPart',
          'ecr:PutImage',
          'ecr:BatchGetImage',
        ],
        resources: ['*'],
      })
    );

    new cdk.CfnOutput(this, 'GithubActionsRoleArn', {
      value: this.githubActionsRole.roleArn,
    });
  }
}