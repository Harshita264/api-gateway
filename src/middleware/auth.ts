import { Request, Response, NextFunction } from 'express';
import prisma from '../db/client';

declare global {
    namespace Express {
        interface Request{
            apiKey?: string;
        }
    }
}

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const apiKey = req.headers['x-api-key'] as string;

    if(!apiKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing X-API-Key header',
        });
    }

    const keyRecord = await prisma.apiKey.findUnique({
        where: { key: apiKey},
    });

    if (!keyRecord) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid API key',
        });
    }

    if(!keyRecord.isActive) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'API key has been disabled',
        });
    }

    req.apiKey = apiKey;

    next();
}