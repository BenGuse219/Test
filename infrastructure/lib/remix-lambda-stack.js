"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemixLambdaStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const apigateway = __importStar(require("aws-cdk-lib/aws-apigatewayv2"));
const aws_apigatewayv2_integrations_1 = require("aws-cdk-lib/aws-apigatewayv2-integrations");
const cloudfront = __importStar(require("aws-cdk-lib/aws-cloudfront"));
const origins = __importStar(require("aws-cdk-lib/aws-cloudfront-origins"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const path = __importStar(require("path"));
class RemixLambdaStack extends cdk.Stack {
    constructor(scope, id, props) {
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
        const remixFunction = new aws_lambda_nodejs_1.NodejsFunction(this, 'RemixFunction', {
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
            defaultIntegration: new aws_apigatewayv2_integrations_1.HttpLambdaIntegration('RemixIntegration', remixFunction),
        });
        // CloudFront distribution
        const distribution = new cloudfront.Distribution(this, 'RemixDistribution', {
            defaultBehavior: {
                origin: new origins.HttpOrigin(`${httpApi.apiId}.execute-api.${this.region}.amazonaws.com`, {
                    protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
                }),
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
            value: httpApi.url,
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
exports.RemixLambdaStack = RemixLambdaStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtaXgtbGFtYmRhLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVtaXgtbGFtYmRhLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQywrREFBaUQ7QUFDakQscUVBQStEO0FBQy9ELHlFQUEyRDtBQUMzRCw2RkFBa0Y7QUFDbEYsdUVBQXlEO0FBQ3pELDRFQUE4RDtBQUM5RCx1REFBeUM7QUFFekMsMkNBQTZCO0FBRTdCLE1BQWEsZ0JBQWlCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDN0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixnQ0FBZ0M7UUFDaEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUN4RCxJQUFJLEVBQUU7Z0JBQ0o7b0JBQ0UsY0FBYyxFQUFFO3dCQUNkLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRzt3QkFDbEIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHO3dCQUNsQixFQUFFLENBQUMsV0FBVyxDQUFDLElBQUk7cUJBQ3BCO29CQUNELGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztvQkFDckIsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDO2lCQUN0QjthQUNGO1lBQ0QsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLDRDQUE0QztZQUN0RixpQkFBaUIsRUFBRSxJQUFJLEVBQUUsa0NBQWtDO1NBQzVELENBQUMsQ0FBQztRQUVILGdDQUFnQztRQUNoQyxNQUFNLGFBQWEsR0FBRyxJQUFJLGtDQUFjLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUM5RCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FB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XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XHJcbmltcG9ydCB7IE5vZGVqc0Z1bmN0aW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ub2RlanMnO1xyXG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5djInO1xyXG5pbXBvcnQgeyBIdHRwTGFtYmRhSW50ZWdyYXRpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheXYyLWludGVncmF0aW9ucyc7XHJcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnQgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnQnO1xyXG5pbXBvcnQgKiBhcyBvcmlnaW5zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250LW9yaWdpbnMnO1xyXG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuXHJcbmV4cG9ydCBjbGFzcyBSZW1peExhbWJkYVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICAvLyBTMyBidWNrZXQgZm9yIHVwbG9hZGVkIHBob3Rvc1xyXG4gICAgY29uc3QgcGhvdG9CdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdCaWRQaG90b0J1Y2tldCcsIHtcclxuICAgICAgY29yczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGFsbG93ZWRNZXRob2RzOiBbXHJcbiAgICAgICAgICAgIHMzLkh0dHBNZXRob2RzLkdFVCxcclxuICAgICAgICAgICAgczMuSHR0cE1ldGhvZHMuUFVULFxyXG4gICAgICAgICAgICBzMy5IdHRwTWV0aG9kcy5QT1NULFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIGFsbG93ZWRPcmlnaW5zOiBbJyonXSxcclxuICAgICAgICAgIGFsbG93ZWRIZWFkZXJzOiBbJyonXSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAvLyBGb3IgZGV2IC0gY2hhbmdlIHRvIFJFVEFJTiBmb3IgcHJvZHVjdGlvblxyXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSwgLy8gRm9yIGRldiAtIHJlbW92ZSBmb3IgcHJvZHVjdGlvblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uIGZvciBSZW1peCBhcHBcclxuICAgIGNvbnN0IHJlbWl4RnVuY3Rpb24gPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ1JlbWl4RnVuY3Rpb24nLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18yMF9YLFxyXG4gICAgICBlbnRyeTogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL3NlcnZlci50cycpLFxyXG4gICAgICBoYW5kbGVyOiAnaGFuZGxlcicsXHJcbiAgICAgIG1lbW9yeVNpemU6IDEwMjQsXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLFxyXG4gICAgICAgIEFOVEhST1BJQ19BUElfS0VZOiBwcm9jZXNzLmVudi5BTlRIUk9QSUNfQVBJX0tFWSB8fCAnJyxcclxuICAgICAgICBQSE9UT19CVUNLRVRfTkFNRTogcGhvdG9CdWNrZXQuYnVja2V0TmFtZSxcclxuICAgICAgfSxcclxuICAgICAgYnVuZGxpbmc6IHtcclxuICAgICAgICBleHRlcm5hbE1vZHVsZXM6IFsnYXdzLXNkayddLCAvLyBGb3JjZSBidW5kbGUgb2YgZXZlcnl0aGluZyBlbHNlXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHcmFudCBMYW1iZGEgcGVybWlzc2lvbnMgdG8gcmVhZC93cml0ZSB0byBTMyBidWNrZXRcclxuICAgIHBob3RvQnVja2V0LmdyYW50UmVhZFdyaXRlKHJlbWl4RnVuY3Rpb24pO1xyXG5cclxuICAgIC8vIEhUVFAgQVBJIEdhdGV3YXkgKHYyKSAtIG1vcmUgY29zdC1lZmZlY3RpdmUgYW5kIHNpbXBsZXIgZm9yIExhbWJkYSBwcm94eVxyXG4gICAgY29uc3QgaHR0cEFwaSA9IG5ldyBhcGlnYXRld2F5Lkh0dHBBcGkodGhpcywgJ1JlbWl4SHR0cEFwaScsIHtcclxuICAgICAgZGVzY3JpcHRpb246ICdIVFRQIEFQSSBmb3IgUmVtaXggTGFtYmRhIGZ1bmN0aW9uJyxcclxuICAgICAgZGVmYXVsdEludGVncmF0aW9uOiBuZXcgSHR0cExhbWJkYUludGVncmF0aW9uKFxyXG4gICAgICAgICdSZW1peEludGVncmF0aW9uJyxcclxuICAgICAgICByZW1peEZ1bmN0aW9uXHJcbiAgICAgICksXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBDbG91ZEZyb250IGRpc3RyaWJ1dGlvblxyXG4gICAgY29uc3QgZGlzdHJpYnV0aW9uID0gbmV3IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKHRoaXMsICdSZW1peERpc3RyaWJ1dGlvbicsIHtcclxuICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XHJcbiAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5IdHRwT3JpZ2luKFxyXG4gICAgICAgICAgYCR7aHR0cEFwaS5hcGlJZH0uZXhlY3V0ZS1hcGkuJHt0aGlzLnJlZ2lvbn0uYW1hem9uYXdzLmNvbWAsXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHByb3RvY29sUG9saWN5OiBjbG91ZGZyb250Lk9yaWdpblByb3RvY29sUG9saWN5LkhUVFBTX09OTFksXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgKSxcclxuICAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19BTEwsXHJcbiAgICAgICAgY2FjaGVQb2xpY3k6IGNsb3VkZnJvbnQuQ2FjaGVQb2xpY3kuQ0FDSElOR19ESVNBQkxFRCwgLy8gRGlzYWJsZSBjYWNoaW5nIGZvciBkeW5hbWljIGNvbnRlbnRcclxuICAgICAgICBvcmlnaW5SZXF1ZXN0UG9saWN5OiBjbG91ZGZyb250Lk9yaWdpblJlcXVlc3RQb2xpY3kuQUxMX1ZJRVdFUixcclxuICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcclxuICAgICAgfSxcclxuICAgICAgY29tbWVudDogJ0Nsb3VkRnJvbnQgZGlzdHJpYnV0aW9uIGZvciBSZW1peCBhcHAnLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3V0cHV0c1xyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0xhbWJkYUZ1bmN0aW9uTmFtZScsIHtcclxuICAgICAgdmFsdWU6IHJlbWl4RnVuY3Rpb24uZnVuY3Rpb25OYW1lLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ05hbWUgb2YgdGhlIExhbWJkYSBmdW5jdGlvbicsXHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnSHR0cEFwaVVybCcsIHtcclxuICAgICAgdmFsdWU6IGh0dHBBcGkudXJsISxcclxuICAgICAgZGVzY3JpcHRpb246ICdVUkwgb2YgdGhlIEhUVFAgQVBJIEdhdGV3YXknLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Nsb3VkRnJvbnRVcmwnLCB7XHJcbiAgICAgIHZhbHVlOiBgaHR0cHM6Ly8ke2Rpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25Eb21haW5OYW1lfWAsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ2xvdWRGcm9udCBkaXN0cmlidXRpb24gVVJMJyxcclxuICAgIH0pO1xyXG5cclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDbG91ZEZyb250RGlzdHJpYnV0aW9uSWQnLCB7XHJcbiAgICAgIHZhbHVlOiBkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uSWQsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ2xvdWRGcm9udCBkaXN0cmlidXRpb24gSUQnLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1Bob3RvQnVja2V0TmFtZScsIHtcclxuICAgICAgdmFsdWU6IHBob3RvQnVja2V0LmJ1Y2tldE5hbWUsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnUzMgYnVja2V0IGZvciBiaWQgcGhvdG9zJyxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=