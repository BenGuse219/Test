#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RemixLambdaStack } from '../lib/remix-lambda-stack';

const app = new cdk.App();

new RemixLambdaStack(app, 'RemixLambdaStack', {
  // Let CDK auto-discover account and region from credentials
  description: 'Simple Remix app deployed to Lambda with CloudFront',
});
