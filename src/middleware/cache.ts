import { Request, Response, NextFunction} from 'express';
import redis from '../redis/client';
import http from 'http';

const CACHE_TTL = 30;

const UPSTREAM_URL = process.env.MOCK_SERVICE_URL || 'http://localhost:4000';

function fetchFromUpstrem(path: string): Promise<{ status: number; body: string }> {
    return new Promise((resolve, reject) => {
        const url = new URL(path, UPSTREAM_URL);

        http.get(url.toString(), (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                resolve({
                    status: res.statusCode || 200,
                    body,
                });
            });
        }).on('error', reject);
    })
}

export async function cacheMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {

    if (req.method !== 'GET') {
        return next();
    }

    const cacheKey = `cache:${req.path}${req.query ? '?' + new URLSearchParams(req.query as any).toString() : ''}`;

    const cached = await redis.get(cacheKey);

    if(cached) {
        const parsed = JSON.parse(cached);
        res.setHeader('X-Cached-Hit', 'true');
        res.setHeader('Content-Type', 'application/json');
        return res.status(parsed.status).send(parsed.body);
    }

    try {
        const upstream = await fetchFromUpstrem(req.url);

        if(upstream.status >= 200 && upstream.status < 300) {
            await redis.setex(
                cacheKey,
                CACHE_TTL,
                JSON.stringify({status: upstream.status, body: upstream.body})
            );
    }
        res.setHeader('X-Cache-Hit', 'false');
        res.setHeader('Content-Type', 'application/json');
        return res.status(upstream.status).send(upstream.body);

    } catch (err) {
        console.error('cache middleware upstream error:', err);
        return next();
    }
}