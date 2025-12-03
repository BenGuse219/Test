#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RemixLambdaStack } from '../lib/remix-lambda-stack';

const app = new cdk.App();

new RemixLambdaStack(app, 'RemixLambdaStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'Simple Remix app deployed to Lambda with CloudFront',
});
