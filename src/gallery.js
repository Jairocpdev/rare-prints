import express from 'express';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const app = express();
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" }
}));

app.get('/', async (req,res)=>{
  const data = await ddb.send(new ScanCommand({TableName:"rare-prints-table"}));
  let html = `<h1>Prints Raros - ${data.Items.length} itens</h1><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">`;
  for(const item of data.Items){
    html+=`<div style="border:1px solid #ccc;padding:10px"><h3>${item.id}</h3><p>${item.labels.join(', ')}</p><small>${item.processedAt}</small></div>`
  }
  res.send(html + '</div>');
});

app.listen(3000, ()=>console.log('Galeria em http://localhost:4566'));