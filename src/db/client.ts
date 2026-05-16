import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://admin:password@localhost:5432/gateway_db',
});

const prisma = new PrismaClient({ adapter });

export default prisma;