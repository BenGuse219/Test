# HandyBid AI - Professional Bidding Tool for Handymen

A modern, AI-powered bidding and estimating tool built with Remix, deployed serverlessly on AWS.

## Features

### 🚀 What We Built

1. **Modern UI** - Claude.com/ChatGPT-style interface with:
   - Clean, professional gradient design
   - Responsive layout (mobile-friendly)
   - Real-time loading states
   - Smooth animations and transitions

2. **Photo Upload & AI Vision** - Upload job site photos:
   - Drag-and-drop or click to upload
   - Multiple photo support
   - Photos uploaded to S3 for storage
   - Claude Vision API analyzes photos for better estimates

3. **AI-Powered Estimates** - Using Claude 3.5 Sonnet:
   - Analyzes job descriptions
   - Examines uploaded photos
   - Generates itemized estimates with:
     - Labor costs (hours × rate)
     - Material costs with quantities
     - Subtotal, tax (8%), and total
     - Special considerations based on photos

4. **PDF Generation** - Professional downloadable PDFs:
   - Company branding
   - Job description
   - Itemized estimate
   - Professional formatting
   - Ready to share with customers

5. **Serverless Architecture** - AWS Lambda + CloudFront:
   - Auto-scales to demand
   - Global CDN for fast loading
   - Pay only for what you use
   - S3 for photo storage

## Tech Stack

- **Frontend**: Remix (React) + Tailwind CSS
- **AI**: Anthropic Claude 3.5 Sonnet with Vision
- **Backend**: Node.js on AWS Lambda
- **Infrastructure**: AWS CDK (TypeScript)
- **Storage**: AWS S3
- **CDN**: AWS CloudFront
- **PDF**: PDFKit

## How to Use

### For Local Development

1. **Set Environment Variable**:
   ```bash
   # Windows PowerShell
   $env:ANTHROPIC_API_KEY="your-api-key-here"

   # Windows CMD
   set ANTHROPIC_API_KEY=your-api-key-here

   # Mac/Linux
   export ANTHROPIC_API_KEY=your-api-key-here
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Visit: http://localhost:5173

3. **Test the App**:
   - Enter a job description (e.g., "Replace kitchen faucet, install garbage disposal")
   - Optionally upload photos of the work site
   - Click "Generate Estimate"
   - Download the PDF

### For AWS Deployment

1. **Set up AWS credentials** (if not already done):
   ```bash
   aws configure
   ```

2. **Set your Anthropic API key** as an environment variable:
   ```bash
   # Windows PowerShell
   $env:ANTHROPIC_API_KEY="your-api-key-here"
   ```

3. **Build and deploy**:
   ```bash
   npm run build
   cd infrastructure
   npm install
   cdk deploy
   ```

4. **After deployment**, CDK will output:
   - CloudFront URL (your production app URL)
   - S3 bucket name (for photo storage)
   - Lambda function name

## File Structure

```
app/
├── routes/
│   ├── _index.tsx          # Main bidding interface
│   └── download-pdf.tsx    # PDF generation endpoint
├── root.tsx                # App layout with Tailwind
└── tailwind.css            # Tailwind configuration

infrastructure/
└── lib/
    └── remix-lambda-stack.ts  # AWS infrastructure (Lambda, S3, CloudFront)

server.ts                    # Lambda handler
```

## Key Features Explained

### Photo Upload Flow
1. User selects photos → Uploads to S3
2. Photos encoded as base64 → Sent to Claude Vision API
3. AI analyzes photos alongside job description
4. Generates estimate considering visual details

### PDF Generation
- Route: `/download-pdf`
- Takes estimate text and job description
- Generates professional PDF with branding
- Formats markdown-style text properly
- Downloads automatically

### Modern UI Components
- **Gradient header** with branding
- **Split-panel layout**: Input on left, results on right
- **Photo preview** with removal option
- **Loading states** with spinner animation
- **Error handling** with clear messages
- **Sticky header** for better UX

## Cost Considerations

With AWS Free Tier:
- **Lambda**: 1M requests/month free
- **API Gateway**: 1M requests/month free
- **S3**: 5GB storage free (first 12 months)
- **CloudFront**: 1TB transfer/month free (first 12 months)
- **Claude API**: Pay-per-token pricing

Expected costs for low-moderate usage: < $10/month

## Future Enhancements

Potential features to add:
- [ ] User authentication (AWS Cognito)
- [ ] Bid history/database (DynamoDB)
- [ ] Customer management
- [ ] Email estimates directly to customers
- [ ] Custom branding/logo upload
- [ ] Multiple estimate templates
- [ ] Mobile app (React Native)

## Troubleshooting

### Local Development Issues

**Issue**: "Missing API Key configuration"
- **Solution**: Set `ANTHROPIC_API_KEY` environment variable

**Issue**: Photos not uploading locally
- **Solution**: S3 upload only works when deployed to AWS. For local testing, the vision API will still work with the photos.

### Deployment Issues

**Issue**: "S3 bucket not configured"
- **Solution**: Make sure CDK deployment completed successfully

**Issue**: Build fails
- **Solution**: Run `npm install` in both root and infrastructure directories

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck

# Deploy to AWS
npm run cdk:deploy

# View CloudFormation template
npm run cdk:synth

# Destroy AWS resources
npm run cdk:destroy
```

## Support

For issues or questions:
1. Check the main README.md
2. Review AWS CloudWatch logs for Lambda errors
3. Ensure all environment variables are set correctly

---

**Built with Claude Code** 🤖
