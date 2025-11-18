import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import * as path from 'path';

export class RemixLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function for Remix app
    const remixFunction = new lambda.Function(this, 'RemixFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'server.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../'), {
        exclude: [
          'infrastructure',
          '.git',
          '.github',
          '.cache',
          'app',  // Exclude source files - we use the built version
          'test-*.js',
          'test-*.sh',
          'get-account-id.js',
          '*.md',
        ],
      }),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_ENV: 'production',
      },
    });

    // HTTP API Gateway (v2) - more cost-effective and simpler for Lambda proxy
    const httpApi = new apigateway.HttpApi(this, 'RemixHttpApi', {
      description: 'HTTP API for Remix Lambda function',
      defaultIntegration: new HttpLambdaIntegration(
        'RemixIntegration',
        remixFunction
      ),
    });

    // CRITICAL FIX: Grant API Gateway permission to invoke the Lambda function
    // HttpLambdaIntegration doesn't always automatically create this permission
    remixFunction.addPermission('ApiGatewayInvokePermission', {
      principal: new cdk.aws_iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: httpApi.arnForExecuteApi('*'),
      action: 'lambda:InvokeFunction',
    });

    // CloudFront distribution pointing directly to API Gateway
    const distribution = new cloudfront.Distribution(this, 'RemixDistribution', {
      defaultBehavior: {
        origin: new origins.HttpOrigin(
          `${httpApi.apiId}.execute-api.${this.region}.amazonaws.com`,
          {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          }
        ),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        // Use a custom origin request policy that doesn't forward the Host header
        // API Gateway needs SNI and will fail with 403 if Host header is forwarded
        originRequestPolicy: new cloudfront.OriginRequestPolicy(this, 'ApiGatewayOriginPolicy', {
          headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
            'Accept',
            'Accept-Language',
            'Content-Type',
            'Origin',
            'Referer',
            'User-Agent'
          ),
          queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
          cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      comment: 'CloudFront distribution for Remix app',
    });

    // Outputs
    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: remixFunction.functionName,
      description: 'Name of the Lambda function',
    });

    new cdk.CfnOutput(this, 'HttpApiUrl', {
      value: httpApi.url!,
      description: 'URL of the HTTP API Gateway',
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront distribution URL',
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID',
    });
  }
}
