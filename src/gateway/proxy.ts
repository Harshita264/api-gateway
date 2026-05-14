import { createProxyMiddleware } from 'http-proxy-middleware';

const UPSTREAM_URL = process.env.MOCK_SERVICE_URL || 'http://localhost:4000';

export const proxyMiddleware = createProxyMiddleware({
  target: UPSTREAM_URL,
  changeOrigin: true,
});