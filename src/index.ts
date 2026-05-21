import express from 'express';
import dotenv from 'dotenv';
import { proxyMiddleware } from './gateway/proxy';
import { requestLogger } from './middleware/requestLogger';
import { authenticate } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { cacheMiddleware } from './middleware/cache';
import metricsRouter from './gateway/metricsRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS must be first — before any route or middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Headers', 'X-API-Key, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.get('/gateway/health', (req, res) => {
  res.json({
    status: 'OK', 
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  });
});

app.use('/gateway/metrics', metricsRouter);

app.use(requestLogger);
app.use(authenticate);
app.use(rateLimiter);
app.use(cacheMiddleware);
app.use('/', proxyMiddleware);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Forwarding requests to ${process.env.MOCK_SERVICE_URL || 'https://localhost:4000'}`);
});