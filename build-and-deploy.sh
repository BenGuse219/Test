#!/bin/bash
set -e

echo "🏗️  Building Remix application..."
npm run build

echo "📦 Installing infrastructure dependencies..."
cd infrastructure
npm install

echo "🚀 Deploying to AWS with CDK..."
cdk deploy --require-approval never

echo "✅ Deployment complete!"
