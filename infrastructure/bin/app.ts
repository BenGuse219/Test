#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RemixLambdaStack } from '../lib/remix-lambda-stack';

const app = new cdk.App();

new RemixLambdaStack(app, 'RemixLambdaStack', {
  env: {
    account: '573731143733',
    region: 'us-east-1',
  },
  description: 'Simple Remix app deployed to Lambda with CloudFront',
});
