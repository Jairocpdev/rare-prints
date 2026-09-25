import { S3Client, CreateBucketCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import { SQSClient, CreateQueueCommand } from "@aws-sdk/client-sqs";
import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";

const config = {
  endpoint: process.env.AWS_ENDPOINT || "http://localhost:4566",
  region: process.env.AWS_REGION || "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
  forcePathStyle: true,
};

const s3 = new S3Client({ ...config, forcePathStyle: true });
const sqs = new SQSClient(config);
const ddb = new DynamoDBClient(config);

console.log("Conectando no Floci:", config.endpoint);

try {
  await s3.send(new CreateBucketCommand({ Bucket: "rare-prints-bucket" }));
  console.log("✓ Bucket criado: rare-prints-bucket");
} catch (e) {
  console.log("Bucket já existe ou erro:", e.message);
}

try {
  const q = await sqs.send(new CreateQueueCommand({ QueueName: "rare-prints-queue" }));
  console.log("✓ Fila criada:", q.QueueUrl);
} catch (e) {
  console.log("Fila já existe ou erro:", e.message);
}

try {
  await ddb.send(new CreateTableCommand({
    TableName: "rare-prints-table",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST"
  }));
  console.log("✓ Tabela DynamoDB criada: rare-prints-table");
} catch (e) {
  console.log("Tabela já existe ou erro:", e.message);
}

console.log("\nSetup complete! Floci pronto em http://localhost:4566");