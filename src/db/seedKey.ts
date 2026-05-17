import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL || 
    'postgresql://admin:password@localhost:5432/gateway_db',
});

const prisma = new PrismaClient({ adapter });

async function generateKey(name: string) {
    const key = `gw_${randomBytes(24).toString('hex')}`;

    const apiKey = await prisma.apiKey.create({
        data: { key, name },
    });

    console.log(`Created API key for "${name}":`);
    console.log(`Key: ${apiKey.key}`);
    console.log(`ID: ${apiKey.id}`);
    console.log('Copy this key - you will use it in Postman headers');
}

const name = process.argv[2] || 'default';
generateKey(name).finally(() => prisma.$disconnect());