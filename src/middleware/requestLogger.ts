import { Request, Response, NextFunction } from 'express';
import prisma from '../db/client';
import { broadcastRequest } from '../gateway/websocket';

const UPSTREAM_URL = process.env.MOCK_SERVICE_URL || 'http://localhost:4000';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    const originalEnd = res.end.bind(res);

    (res as any).end = function(...args: any[]) {
        const latencyMs = Date.now() - startTime;
        const timestamp = new Date().toISOString();

        prisma.requestLog.create({
            data: {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                latencyMs,
                apiKey: req.apiKey ?? null,
                upstreamUrl: UPSTREAM_URL,
            },
        }).catch((err: Error) => {
            console.error('Failed to log request:', err.message);
        });

        broadcastRequest({
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            latencyMs,
            apiKey: req.apiKey ?? null,
            timestamp,
        });

        return originalEnd(...args);
    };
    next();
}