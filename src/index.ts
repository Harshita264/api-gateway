import express from 'express';
import dotenv from 'dotenv';
import { proxyMiddleware } from './gateway/proxy';
import { requestLogger } from './middleware/requestLogger';
import { authenticate } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { cacheMiddleware } from './middleware/cache';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/gateway/health', (req, res) => {
  res.json({
    status: 'OK', 
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  });
});

app.use(requestLogger);
app.use(authenticate);
app.use(rateLimiter);
app.use(cacheMiddleware);
app.use('/', proxyMiddleware);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Forwarding requests to ${process.env.MOCK_SERVICE_URL || 'https://localhost:4000'}`);
});