import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { HttpsProxyAgent } from 'https-proxy-agent';

async function getAccountId() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
  const agent = new HttpsProxyAgent(proxyUrl);

  const client = new STSClient({
    region: 'us-east-1',
    requestHandler: new NodeHttpHandler({
      httpsAgent: agent,
      httpAgent: agent,
    }),
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
