import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import {fromCognitoIdentityPool} from "@aws-sdk/credential-providers";

async function awsClient () {
  
  // Ref: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-browser-credentials-cognito.html
  const client = new DynamoDBClient({ 
    region: "ap-southeast-1", 
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: "ap-southeast-1" },
      identityPoolId: 'ap-southeast-1:5b08d690-81df-4a05-b1cf-36e894f1ae61'
    })
  })
  const command = new ListTablesCommand({});
  try {
    const results = await client.send(command);
    console.log('OK');
    console.log(results.TableNames.join("\n"));
  } catch (err) {
    console.error(err);
  }
};

export default awsClient;