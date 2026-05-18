import { Request, Response, NextFunction } from 'express';
import redis from '../redis/client';

const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 1000;

export async function rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const apiKey = req.apiKey;

    if(!apiKey) {
        return next();
    }

    const redisKey = `ratelimit:${apiKey}`;
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    const pipeline = redis.pipeline();

    pipeline.zremrangebyscore(redisKey, '-inf', windowStart);

    pipeline.zcard(redisKey);

    pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);

    pipeline.expire(redisKey, Math.ceil(WINDOW_MS / 1000));

    const results = await pipeline.exec();

    const requestCount = (results?.[1]?.[1] as number) ?? 0;

    res.setHeader('X-RateLimit-Limit', RATE_LIMIT);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT - requestCount - 1));
    res.setHeader('X-RateLimit-Reset', new Date(now + WINDOW_MS).toISOString());

    if(requestCount >= RATE_LIMIT) {
        return res.status(429).json({
            error:'Too Many Requests',
            message: `Rate limit exceeded. You get ${RATE_LIMIT} requests per minute.`,
            retryAfter: Math.ceil(WINDOW_MS / 1000),
        });
    }

    next();
}

//Explanation from line 22-38
// This is a Redis pipeline — runs all commands as one atomic transaction
// Think of it like a database transaction but for Redis operations
// Step 1: Remove all requests outside the current window
// ZREMRANGEBYSCORE removes all entries with score between -infinity and windowStart
// This cleans up old entries so we only count recent requests
// Step 2: Count how many requests remain in the window
// Step 3: Add the current request to the set
// Score is the current timestamp, value is timestamp + random string (must be unique)
// Step 4: Set expiry on the key so Redis cleans it up automatically
// Without this, keys for inactive API keys would stay in Redis forever
// Execute all four commands atomically
// results[1] is the response to zcard — the count of requests in the window
// results is an array of [error, value] pairs
// Set headers so clients know their rate limit status
// This is the standard convention — most APIs do this