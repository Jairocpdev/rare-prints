import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" }
});
const ddb = DynamoDBDocumentClient.from(client);

const data = await ddb.send(new ScanCommand({ TableName: "rare-prints-table" }));
console.table(data.Items);