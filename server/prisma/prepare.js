const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env if present, otherwise root .env
const serverEnvPath = path.join(__dirname, '../.env');
const rootEnvPath = path.join(__dirname, '../../.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

const databaseUrl = process.env.DATABASE_URL || '';
let provider = 'postgresql'; // default

if (databaseUrl.startsWith('file:') || databaseUrl.includes('.db') || databaseUrl === '') {
  provider = 'sqlite';
}

const schemaPath = path.join(__dirname, 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Replace the provider in the datasource block
  const newSchemaContent = schemaContent.replace(
    /provider\s*=\s*"[^"]+"\s*(?=\r?\n\s*url\s*=)/,
    `provider = "${provider}"\n  `
  );
  
  if (schemaContent !== newSchemaContent) {
    fs.writeFileSync(schemaPath, newSchemaContent, 'utf8');
    console.log(`[PRISMA PREPARE] Updated database provider to: ${provider}`);
  } else {
    console.log(`[PRISMA PREPARE] Database provider already set to: ${provider}`);
  }
} else {
  console.error('[PRISMA PREPARE] schema.prisma not found at:', schemaPath);
}
