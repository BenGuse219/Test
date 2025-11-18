# Remix Hello World on AWS Lambda with CloudFront

A simple "Hello World" Remix application deployed to AWS Lambda with CloudFront CDN using AWS CDK.

## Architecture

- **Remix** - Full-stack web framework
- **AWS Lambda** - Serverless compute for running the Remix app
- **API Gateway (HTTP API)** - Entry point for Lambda
- **CloudFront** - CDN for global content distribution
- **AWS CDK** - Infrastructure as Code

## Prerequisites

- Node.js 20+ installed
- AWS CLI configured with credentials
- AWS CDK CLI installed (`npm install -g aws-cdk`)

## Quick Start

### 1. Install Dependencies

```bash
# Install app dependencies
npm install

# Install infrastructure dependencies
cd infrastructure
npm install
cd ..
```

### 2. Build the Remix App

```bash
npm run build
```

### 3. Bootstrap CDK (First Time Only)

If you haven't used CDK in your AWS account/region before:

```bash
cd infrastructure
cdk bootstrap
cd ..
```

### 4. Deploy to AWS

```bash
# Deploy using the convenience script
chmod +x build-and-deploy.sh
./build-and-deploy.sh

# OR deploy manually
cd infrastructure
cdk deploy
```

### 5. Access Your App

After deployment, CDK will output the CloudFront URL:

```
Outputs:
RemixLambdaStack.CloudFrontUrl = https://d1234567890.cloudfront.net
```

Visit this URL to see your Remix app running on Lambda!

## Development

### Local Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app running locally.

### Project Structure

```
.
├── app/                    # Remix app source
│   ├── root.tsx           # Root component
│   └── routes/            # Route components
│       └── _index.tsx     # Home page
├── build/                 # Built Remix app (after npm run build)
├── infrastructure/        # CDK infrastructure code
│   ├── bin/
│   │   └── app.ts        # CDK app entry point
│   └── lib/
│       └── remix-lambda-stack.ts  # Main stack definition
├── server.ts              # Lambda handler for Remix
├── package.json           # App dependencies
└── vite.config.ts         # Vite configuration
```

## Available Commands

### Application

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking

### Infrastructure

- `npm run cdk:deploy` - Deploy infrastructure
- `npm run cdk:synth` - Synthesize CloudFormation template
- `npm run cdk:destroy` - Destroy infrastructure

## Updating the App

1. Make changes to your app code
2. Build the app: `npm run build`
3. Deploy: `cd infrastructure && cdk deploy`
4. CloudFront will serve the updated Lambda function

## Cleanup

To remove all AWS resources:

```bash
cd infrastructure
cdk destroy
```

## Notes

- CloudFront caching is disabled for this demo to see changes immediately
- Lambda function has 1024MB memory and 30-second timeout
- Uses Node.js 20 runtime
- The CloudFront distribution may take 5-10 minutes to fully deploy

## Cost Considerations

This setup uses:
- AWS Lambda (free tier: 1M requests/month)
- API Gateway HTTP API (free tier: 1M requests/month)
- CloudFront (free tier: 1TB transfer/month for 12 months)

With the free tier, this demo should cost nearly nothing!
