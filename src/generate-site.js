import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import fs from "fs";

const TITLE_MAP = {
 "1.jpg": "001 — Bauhaus Poster 1923",
 "2.jpg": "002 — Art Nouveau 1969 (substituto)",
 "3.jpg": "003 — Bauhaus Study 1928 (substituto)",
 "4.jpg": "004 — Ukiyo-e Wave 1831",
 "5.jpg": "005 — Botânica 1882"
};

let items = [];
try {
  const client = new DynamoDBClient({
    endpoint: "http://localhost:4566",
    region: "us-east-1",
    credentials: { accessKeyId: "test", secretAccessKey: "test" }
  });
  const ddb = DynamoDBDocumentClient.from(client);
  const data = await ddb.send(new ScanCommand({ TableName: "rare-prints-table" }));
  items = (data.Items || []).sort((a,b) => (a.id||"").localeCompare(b.id||""));
  if(items.length===0) throw new Error("vazio");
} catch(e) {
  items = [
    { filename:"1.jpg", title:TITLE_MAP["1.jpg"], labels:["Bauhaus","Poster","Geometric","Typography"], technique:"Letterpress" },
    { filename:"2.jpg", title:TITLE_MAP["2.jpg"], labels:["Psychedelic","Concert Poster","1960s","Typography"], technique:"Lithograph" },
    { filename:"3.jpg", title:TITLE_MAP["3.jpg"], labels:["Abstract","Geometric","Screen Print","1970s"], technique:"Screen Print" },
    { filename:"4.jpg", title:TITLE_MAP["4.jpg"], labels:["Ukiyo-e","Mount Fuji","Wave","Japanese Print"], technique:"Woodblock" },
    { filename:"5.jpg", title:TITLE_MAP["5.jpg"], labels:["Botanical","Engraving","Flower","Vintage Illustration"], technique:"Engraving" },
  ];
}

const cards = items.map(i => {
  const fname = i.filename || i.id;
  const title = i.title || TITLE_MAP[fname] || fname;
  const labels = (i.labels||[]).join(" • ");
  return `<div class="card"><img src="images/${fname}" loading="lazy"><div>${title}</div><div class="meta">${labels} • CC0</div></div>`;
}).join("\n");

const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prints Raros — Arquivo de 5 peças raras</title>
<style>body{margin:0;background:#0A0A0A;color:#F8F5EB;font-family:Georgia,serif}header{padding:40px;border-bottom:1px solid #222}h1{font-size:28px;margin:0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;padding:40px}.card{border:1px solid #222;padding:16px}.card img{width:100%;aspect-ratio:4/3;object-fit:cover;background:#111}.meta{font-family:monospace;font-size:11px;opacity:.6;margin-top:8px}footer{padding:40px;border-top:1px solid #222;font-family:monospace;font-size:10px;opacity:.7;line-height:1.6}.cc0{display:inline-block;border:1px solid #333;padding:2px 8px;margin-bottom:12px}</style></head>
<body><header><h1>Prints Raros — Arquivo de 5 peças raras</h1><div class="meta">PIPELINE AWS LOCAL (Floci) | INVENTARIO ${items.length} ITENS | S3 -> SQS -> DynamoDB</div></header>
<div class="grid">${cards}</div>
<footer><div class="cc0">CC0 PUBLIC DOMAIN</div><br>ARQUIVO DE ESTUDO — Todas as imagens em dominio publico (CC0) ou acervos de museu abertos. 002 e 003 substituidos. Fins educacionais e de demonstracao do pipeline AWS Local (Floci).<br><br>REFERENCIAS: Bauhaus-Archiv Berlin • Fillmore Poster Archive • Ukiyo-e.org<br>PIPELINE: S3 (Floci) → SQS → processor.js → DynamoDB → Galeria<br>© 2024 Prints Raros</footer></body></html>`;

fs.mkdirSync("site/images", {recursive:true});
fs.writeFileSync("site/index.html", html, "utf8");
console.log("Gerado site/index.html com", items.length, "itens");
