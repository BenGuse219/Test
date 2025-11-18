# GitHub Actions Workflows

## Automatic Deployment

The `deploy.yml` workflow automatically deploys your Remix app to AWS whenever you push code to:
- `main` branch
- Any `claude/*` branch (branches created by Claude Code)

### Setup Instructions

To enable automatic deployment, you need to configure AWS credentials in GitHub Secrets:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

   - **AWS_ACCESS_KEY_ID**: `<your-aws-access-key-id>`
   - **AWS_SECRET_ACCESS_KEY**: `<your-aws-secret-access-key>`

### How It Works

1. **Push code** from Claude Code (or anywhere)
2. GitHub Actions automatically:
   - Installs dependencies
   - Builds the Remix app
   - Deploys infrastructure with CDK
   - Outputs the CloudFront URL

### Manual Deployment

You can also trigger deployment manually:

1. Go to **Actions** tab in GitHub
2. Click **Deploy Remix App to AWS**
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

### Monitoring Deployments

- Go to the **Actions** tab to see deployment progress
- Each deployment takes ~4-5 minutes
- Check the logs for the CloudFront URL

### Security Note

⚠️ **Important**: These credentials should be rotated regularly and have minimal required permissions. Consider using IAM roles with OIDC for better security in production.

For production apps, use:
- AWS IAM roles with OIDC (no long-lived credentials)
- Separate AWS accounts for dev/staging/prod
- AWS Secrets Manager for sensitive values
