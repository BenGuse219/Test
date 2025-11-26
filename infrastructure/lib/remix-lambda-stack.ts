import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as path from 'path';

export class RemixLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for uploaded photos
    const photoBucket = new s3.Bucket(this, 'BidPhotoBucket', {
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev - change to RETAIN for production
      autoDeleteObjects: true, // For dev - remove for production
    });

    // Lambda function for Remix app
    const remixFunction = new NodejsFunction(this, 'RemixFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../server.ts'),
      handler: 'handler',
      memorySize: 1024,
      timeout: cdk.Duration.seconds(60),
      environment: {
        NODE_ENV: 'production',
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
        PHOTO_BUCKET_NAME: photoBucket.bucketName,
      },
      bundling: {
        externalModules: ['aws-sdk'], // Force bundle of everything else
      },
    });

    // Grant Lambda permissions to read/write to S3 bucket
    photoBucket.grantReadWrite(remixFunction);

    // HTTP API Gateway (v2) - more cost-effective and simpler for Lambda proxy
    const httpApi = new apigateway.HttpApi(this, 'RemixHttpApi', {
      description: 'HTTP API for Remix Lambda function',
      defaultIntegration: new HttpLambdaIntegration(
        'RemixIntegration',
        remixFunction
      ),
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'RemixDistribution', {
      defaultBehavior: {
        origin: new origins.HttpOrigin(
          `${httpApi.apiId}.execute-api.${this.region}.amazonaws.com`,
          {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          }
        ),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, // Disable caching for dynamic content
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
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

    new cdk.CfnOutput(this, 'PhotoBucketName', {
      value: photoBucket.bucketName,
      description: 'S3 bucket for bid photos',
    });
  }
}
