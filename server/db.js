const { PrismaClient } = require('@prisma/client');
const path = require('path');

let prismaConfig = {
  log: ['error', 'warn'],
};

if (process.env.DATABASE_URL) {
  prismaConfig.datasourceUrl = process.env.DATABASE_URL;
} else {
  prismaConfig.datasourceUrl = process.env.DATA_PATH 
    ? `file:${path.join(process.env.DATA_PATH, 'dev.db')}`
    : `file:${path.join(__dirname, 'prisma/dev.db')}`;
}

const prisma = new PrismaClient(prismaConfig);

prisma.$connect()
  .then(() => console.log('[DB] Database connected successfully.'))
  .catch((err) => console.error('[DB] Connection failed:', err));

module.exports = prisma;
