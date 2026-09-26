# Prints Raros — Pipeline AWS Local (Floci)

Arquivo de estudo com 5 peças em domínio público (CC0).

Pipeline: S3 → SQS → processor.js (Rekognition) → DynamoDB → site/index.html

\\\
npm i
.\floci.exe start && .\floci.exe wait
npm run setup
npm run processor  # terminal 1
npm run uploader   # terminal 2
node src/generate-site.js
\\\

Deploy Vercel: Output Directory = site, Build OFF.
