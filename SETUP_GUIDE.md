# HandyBid AI - Setup Guide

## ✅ Environment Setup Complete!

Your `.env` file has been created and your Anthropic API key is configured.

## What's Configured

✅ **Local Development** - `.env` file created
✅ **API Key** - Your Claude API key is set
✅ **Dotenv Package** - Installed and configured
✅ **Vite Config** - Loads environment variables automatically

## Quick Start

### 1. Start Development Server

```bash
npm run dev
```

Then visit: **http://localhost:5173**

### 2. Test the Application

Try creating an estimate:
1. Enter a job description like: "Replace kitchen faucet and install garbage disposal"
2. Optionally upload photos (any JPG/PNG)
3. Click "Generate Estimate"
4. Wait 5-15 seconds for AI to analyze
5. Download the PDF

### 3. Run Tests

```bash
# Run all tests
npm test

# Interactive UI mode (recommended!)
npm run test:ui

# Watch tests run in browser
npm run test:headed
```

## Environment Variables

Your `.env` file contains:

```env
ANTHROPIC_API_KEY=sk-ant-***  # ✅ Set
AWS_REGION=us-east-1          # Default region
```

### For Local Development

Everything works with just the `.env` file! The app will:
- Load your API key automatically
- Use Claude AI for estimates
- Work without AWS (no S3 uploads in dev mode)
- Generate PDFs locally

### For AWS Deployment

When you deploy, we'll use AWS Secrets Manager or environment variables:

```bash
# Your API key will be set in Lambda via CDK
# No manual configuration needed!
npm run cdk:deploy
```

## AWS Secrets Manager (Production)

For production, you mentioned using AWS Secrets Manager. Here's how:

### Option 1: AWS Systems Manager Parameter Store

```bash
# Store the secret
aws ssm put-parameter \
  --name "/handybid/anthropic-api-key" \
  --value "sk-ant-your-key" \
  --type "SecureString"

# CDK will retrieve it automatically
```

### Option 2: AWS Secrets Manager

```bash
# Create secret
aws secretsmanager create-secret \
  --name handybid-api-key \
  --secret-string "sk-ant-your-key"
```

Then update `infrastructure/lib/remix-lambda-stack.ts`:

```typescript
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

// In your stack constructor:
const apiKey = secretsmanager.Secret.fromSecretNameV2(
  this,
  'ApiKey',
  'handybid-api-key'
);

// In Lambda environment:
environment: {
  ANTHROPIC_API_KEY: apiKey.secretValue.unsafeUnwrap(),
}

// Grant read permission:
apiKey.grantRead(remixFunction);
```

## File Structure

```
.env                 # Your secrets (NOT in git)
.env.example         # Template for others
.gitignore           # .env is already excluded
vite.config.ts       # Loads .env automatically
```

## Security Notes

✅ **`.env` is in `.gitignore`** - Won't be committed
✅ **`.env.example` provided** - For team members
✅ **Vite handles injection** - Secure in build
✅ **Production uses AWS Secrets** - Even more secure

## Troubleshooting

### "API Key configuration missing"

**Check .env file exists:**
```bash
cat .env
```

**Should show:**
```
ANTHROPIC_API_KEY=sk-ant-...
```

**Restart dev server:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

### "Tests skipping AI tests"

Some tests need the API key. Make sure `.env` is present:
```bash
# This should show your key is set
node --input-type=module -e "import dotenv from 'dotenv'; dotenv.config(); console.log(process.env.ANTHROPIC_API_KEY ? 'Set!' : 'NOT set');"
```

### Environment not loading

**Vite loads .env automatically**, but you can also:
```bash
# Load manually in Node scripts
node --input-type=module -e "import dotenv from 'dotenv'; dotenv.config();"
```

## Next Steps

### 1. ✅ Test Locally
```bash
npm run dev
# Visit http://localhost:5173
```

### 2. ✅ Run Tests
```bash
npm run test:ui
```

### 3. 🚀 Deploy to AWS
```bash
npm run build
npm run cdk:deploy
```

### 4. 🔐 (Optional) Set up AWS Secrets Manager

For production, migrate from `.env` to AWS Secrets Manager using the code snippets above.

## What Happens in Each Environment

### Local Development (npm run dev)
- ✅ Reads `.env` file
- ✅ Uses Anthropic API directly
- ❌ No S3 (photos not uploaded)
- ✅ PDF generation works
- ✅ All features functional except S3

### AWS Deployment (cdk deploy)
- ✅ Uses Lambda environment variables
- ✅ Uses Anthropic API from Lambda
- ✅ S3 uploads work
- ✅ PDF generation works
- ✅ All features fully functional

### Testing (npm test)
- ✅ Reads `.env` file
- ✅ Starts dev server automatically
- ✅ Tests with Playwright
- ⚠️ Some tests skip without API key

## Costs

### Local Development
- **Free!** Only Anthropic API usage (~$0.01-0.03 per estimate)

### AWS Deployment
- Lambda: Free tier covers most usage
- S3: ~$0.023/GB/month
- CloudFront: Free tier 1TB/month (12 months)
- **Estimated**: $5-20/month

### Claude API
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens
- **Per estimate**: ~$0.01-0.03
- **100 estimates/month**: ~$1-3

## Support

Need help?
1. Check [TESTING.md](TESTING.md) for test issues
2. Check [HANDYBID_README.md](HANDYBID_README.md) for app issues
3. Check [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) for deployment

---

**You're all set!** 🎉

Run `npm run dev` to start building estimates!
