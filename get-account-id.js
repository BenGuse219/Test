import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

async function getAccountId() {
  const client = new STSClient({
    region: 'us-east-1',
    endpoint: 'https://sts.amazonaws.com',  // Use global endpoint
    useDualstackEndpoint: false,
  });
  const command = new GetCallerIdentityCommand({});
  try {
    const response = await client.send(command);
    console.log(response.Account);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getAccountId();
