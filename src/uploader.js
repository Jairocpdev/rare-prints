import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import fs from "fs";
import path from "path";

const config = {
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
  forcePathStyle: true,
};

const s3 = new S3Client({ ...config, forcePathStyle: true });
const sqs = new SQSClient(config);

const imagesDir = "./images";
const files = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f)) : [];

if (files.length === 0) {
  console.log("Nenhuma imagem em ./images - usando arquivos fake");
  files.push("print-001.jpg", "print-002.jpg", "print-rare-003.jpg");
}

for (const file of files) {
  const filePath = path.join(imagesDir, file);
  const body = fs.existsSync(filePath) ? fs.readFileSync(filePath) : Buffer.from("fake-" + file);
  
  await s3.send(new PutObjectCommand({
    Bucket: "rare-prints-bucket",
    Key: file,
    Body: body
  }));
  console.log(`↑ S3: ${file}`);

  await sqs.send(new SendMessageCommand({
    QueueUrl: "http://localhost:4566/000000000000/rare-prints-queue",
    MessageBody: JSON.stringify({ bucket: "rare-prints-bucket", key: file })
  }));
  console.log(`→ SQS: ${file}`);
}

console.log("\nUploader finalizado!");