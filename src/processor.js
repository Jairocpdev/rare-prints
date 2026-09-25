import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const config = {
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
  forcePathStyle: true,
};

const sqs = new SQSClient(config);
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient(config));

console.log("Processor RARE-PRINTS (labels reais) iniciado... esperando fila");

const fakeLabelsByName = {
  '1.jpg': ['Bauhaus', 'Poster', 'Geometric', 'Typography'],
  '2.jpg': ['Psychedelic', 'Concert Poster', '1960s', 'Typography'],
  '3.jpg': ['Abstract', 'Geometric', 'Screen Print', '1970s'],
  '4.jpg': ['Ukiyo-e', 'Mount Fuji', 'Wave', 'Japanese Print'],
  '5.jpg': ['Botanical', 'Engraving', 'Flower', 'Vintage Illustration']
};

async function poll() {
  while (true) {
    const data = await sqs.send(new ReceiveMessageCommand({
      QueueUrl: "http://localhost:4566/000000000000/rare-prints-queue",
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 5
    }));
    
    if (!data.Messages) continue;

    for (const msg of data.Messages) {
      const { bucket, key } = JSON.parse(msg.Body);
      console.log(`\n→ Analisando: ${key}...`);

      try {
        const labelsArray = fakeLabelsByName[key] || ['Rare Print', 'Art', 'Poster'];
        console.log("  Labels:", labelsArray.join(", "));

        await ddb.send(new PutCommand({
          TableName: "rare-prints-table",
          Item: {
            id: key,
            bucket,
            labels: labelsArray,
            processedAt: new Date().toISOString()
          }
        }));

        console.log(`✓ Salvo: ${key}`);
      } catch (e) {
        console.log("Erro:", e.message);
      }

      await sqs.send(new DeleteMessageCommand({
        QueueUrl: "http://localhost:4566/000000000000/rare-prints-queue",
        ReceiptHandle: msg.ReceiptHandle
      }));
    }
  }
}

poll();