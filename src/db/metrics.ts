import prisma from './client';

export async function getRequestsPerMinute() {
  const result = await prisma.$queryRaw<Array<{ minute: Date; count: bigint }>>`
    SELECT 
      date_trunc('minute', timestamp) as minute,
      COUNT(*) as count
    FROM request_logs
    WHERE timestamp > NOW() - INTERVAL '1 hour'
    GROUP BY minute
    ORDER BY minute ASC
  `;

  return result.map(row => ({
    minute: row.minute,
    count: Number(row.count),
  }));
}

export async function getLatencyMetrics() {
  const result = await prisma.$queryRaw<Array<{
    avg_latency: number;
    p95_latency: number;
    min_latency: number;
    max_latency: number;
  }>>`
    SELECT
      ROUND(AVG("latencyMs")) as avg_latency,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "latencyMs") as p95_latency,
      MIN("latencyMs") as min_latency,
      MAX("latencyMs") as max_latency
    FROM request_logs
    WHERE timestamp > NOW() - INTERVAL '1 hour'
  `;

  return result[0] || {
    avg_latency: 0,
    p95_latency: 0,
    min_latency: 0,
    max_latency: 0,
  };
}

export async function getErrorRate() {
  const result = await prisma.$queryRaw<Array<{
    total: bigint;
    client_errors: bigint;
    server_errors: bigint;
  }>>`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE "statusCode" >= 400 AND "statusCode" < 500) as client_errors,
      COUNT(*) FILTER (WHERE "statusCode" >= 500) as server_errors
    FROM request_logs
    WHERE timestamp > NOW() - INTERVAL '1 hour'
  `;

  const row = result[0];
  const total = Number(row.total);
  const clientErrors = Number(row.client_errors);
  const serverErrors = Number(row.server_errors);

  return {
    total,
    clientErrors,
    serverErrors,
    errorRate: total > 0
      ? ((clientErrors + serverErrors) / total * 100).toFixed(2)
      : '0.00',
  };
}

export async function getTopEndpoints() {
  const result = await prisma.$queryRaw<Array<{
    path: string;
    count: bigint;
    avg_latency: number;
  }>>`
    SELECT
      path,
      COUNT(*) as count,
      ROUND(AVG("latencyMs")) as avg_latency
    FROM request_logs
    WHERE timestamp > NOW() - INTERVAL '1 hour'
    GROUP BY path
    ORDER BY count DESC
    LIMIT 10
  `;

  return result.map(row => ({
    path: row.path,
    count: Number(row.count),
    avgLatency: Number(row.avg_latency),
  }));
}

export async function getRecentRequests(limit = 20) {
  return prisma.requestLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}

export async function getMetricSummary() {
  const [requestsPerMinute, latency, errorRate, topEndpoints, recentRequests] =
    await Promise.all([
      getRequestsPerMinute(),
      getLatencyMetrics(),
      getErrorRate(),
      getTopEndpoints(),
      getRecentRequests(),
    ]);

  return {
    requestsPerMinute,
    latency,
    errorRate,
    topEndpoints,
    recentRequests,
  };
}