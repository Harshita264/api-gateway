import axios from 'axios';

const BASE = 'http://localhost:3000/gateway/metrics';

export interface RequestsPerMinute {
  minute: string;
  count: number;
}

export interface LatencyMetrics {
  avg_latency: number;
  p95_latency: number;
  min_latency: number;
  max_latency: number;
}

export interface ErrorRate {
  total: number;
  clientErrors: number;
  serverErrors: number;
  errorRate: string;
}

export interface TopEndpoint {
  path: string;
  count: number;
  avgLatency: number;
}

export interface RecentRequest {
  id: number;
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  apiKey: string | null;
  timestamp: string;
}

export interface MetricsSummary {
  requestsPerMinute: RequestsPerMinute[];
  latency: LatencyMetrics;
  errorRate: ErrorRate;
  topEndpoints: TopEndpoint[];
  recentRequests: RecentRequest[];
}

export async function fetchSummary(): Promise<MetricsSummary> {
  const { data } = await axios.get(`${BASE}/summary`);
  return data;
}