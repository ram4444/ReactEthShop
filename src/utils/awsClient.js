import { DynamoDBClient, ListTablesCommand, BatchGetItemCommand, ConditionCheckItemCommand, GetItemCommand, QueryCommand, ScanCommand, PutItemCommand} from '@aws-sdk/client-dynamodb';
import {fromCognitoIdentityPool} from "@aws-sdk/credential-providers";


async function initConnection() {
  // Ref: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-browser-credentials-cognito.html
  const client = new DynamoDBClient({ 
    region: "ap-southeast-1", 
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: "ap-southeast-1" },
      identityPoolId: 'ap-southeast-1:5b08d690-81df-4a05-b1cf-36e894f1ae61'
    })
    
  })
  return client;
};

export async function listTable() {
  const command = new ListTablesCommand({});
  try {
    const results = await initConnection().send(command);
    console.log(results.TableNames.join("\n"));
  } catch (err) {
    console.error(err);
  }
}

export async function queryOrdersByReceiver(toAddr) {
  const client = new DynamoDBClient({ 
    region: "ap-southeast-1", 
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: "ap-southeast-1" },
      identityPoolId: 'ap-southeast-1:5b08d690-81df-4a05-b1cf-36e894f1ae61'
    })
  })

  // ref: https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html#API_Scan_RequestSyntax

  const params = {
    TableName: 'orders',
    IndexName: 'toAddr-index',
    // ProjectionExpression: "order_id, chain, fromAddr, toAddr, product_cover, product_name, product_id, buyer_name, buyer_email, delivery_addr1, delivery_addr2, currencyName, product_price, transactionHash",
    // FilterExpression: "toAddr = :val",
    // ExpressionAttributeValues: {":val": {"S": toAddr}},
    KeyConditions: {
      toAddr: {
        "ComparisonOperator":"EQ",
        "AttributeValueList": [ {"S": toAddr} ]
      }
    }
  };

  let results = {}
  const command = new QueryCommand(params);
  try {
    results = await client.send(command);
    console.log(results);
  } catch (err) {
    console.error(err);
  }

  return results;
}

export async function scanTable(table) {
  const client = new DynamoDBClient({ 
    region: "ap-southeast-1", 
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: "ap-southeast-1" },
      identityPoolId: 'ap-southeast-1:5b08d690-81df-4a05-b1cf-36e894f1ae61'
    })
  })

  // ref: https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html#API_Scan_RequestSyntax

  const params = {
    TableName: table,
    ProjectionExpression: "order_id, chain, fromAddr, toAddr, product_cover, product_name, product_id, buyer_name, buyer_email, delivery_addr1, delivery_addr2, currencyName, product_price, transactionHash",
    FilterExpression: "product_name = :val",
    ExpressionAttributeValues: {":val": {"S": "TestT777R2"}},
  };

  let results = {}
  const command = new ScanCommand(params);
  try {
    results = await client.send(command);
    console.log(results);
  } catch (err) {
    console.error(err);
  }

  return results;
}

export async function putItem(table, item) {
  const client = new DynamoDBClient({ 
    region: "ap-southeast-1", 
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: "ap-southeast-1" },
      identityPoolId: 'ap-southeast-1:5b08d690-81df-4a05-b1cf-36e894f1ae61'
    })
    
  })

  // Ref: https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeValue.html
  /* Sample 
  const params = {
    TableName: "TABLE_NAME",
    Item: {
      CUSTOMER_ID: { N: "001" },
      CUSTOMER_NAME: { S: "Richard Roe" },
    },
  };
  */

  const params = {
    TableName: "orders",
    Item: item,
  };
  
  console.log(params)
  const command = new PutItemCommand(params);
  console.log(command)
  try {
    const results = await client.send(command);
    console.log(results);
  } catch (err) {
    console.error(err);
  }
}