import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { HttpsProxyAgent } from 'https-proxy-agent';

async function testCredentials() {
  try {
    const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
    console.log('Testing AWS credentials...');
    console.log('Using proxy:', proxyUrl ? 'Yes' : 'No');

    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

    const config = {
      region: 'us-east-1',
    };

    if (agent) {
      config.requestHandler = new NodeHttpHandler({
        httpsAgent: agent,
        httpAgent: agent,
      });
    }

    const client = new S3Client(config);
    const command = new ListBucketsCommand({});

    console.log('Making API call to list S3 buckets...');
    const response = await client.send(command);

    console.log('\n✅ SUCCESS! AWS credentials are working!');
    console.log(`Found ${response.Buckets?.length || 0} S3 buckets in your account.`);
    console.log('\nYour AWS Account has access to AWS services.');

  } catch (error) {
    console.error('\n❌ FAILED to access AWS:');
    console.error('Error:', error.message);

    if (error.name === 'CredentialsProviderError') {
      console.error('\nProblem: AWS credentials not found or invalid');
    } else if (error.$metadata) {
      console.error('HTTP Status:', error.$metadata.httpStatusCode);
    }

    process.exit(1);
  }
}

testCredentials();
