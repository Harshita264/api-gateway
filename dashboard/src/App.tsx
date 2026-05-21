import { useState, useEffect } from 'react';
import { fetchSummary, type MetricsSummary } from './api/metrics';
import { RequestsChart } from './components/RequestsChart';
import { LatencyCard } from './components/LatencyCard';
import { ErrorRateCard } from './components/ErrorRateCard';
import { TopEndpointsTable } from './components/TopEndpointsTable';
import { RecentRequestsFeed } from './components/RecentRequestsFeed';

const REFRESH_INTERVAL = 5000;

export default function App() {
  const [data, setData] = useState<MetricsSummary | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const summary = await fetchSummary();
      setData(summary);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError('Failed to fetch metrics — is the gateway running?');
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '16px',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--accent)', letterSpacing: '3px', marginBottom: '4px' }}>
            API GATEWAY
          </div>
          <div style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.5px' }}>
            MONITORING DASHBOARD
          </div>
        </div>
        <div style={{ textAlign: 'right', color: 'var(--text-dim)', fontSize: '11px' }}>
          <div>AUTO REFRESH 5s</div>
          {lastUpdated && (
            <div style={{ color: 'var(--accent)' }}>
              UPDATED {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          background: '#ff444411',
          border: '1px solid var(--red)',
          padding: '12px 16px',
          color: 'var(--red)',
          marginBottom: '24px',
          fontSize: '12px',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Loading state */}
      {!data && !error && (
        <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '60px' }}>
          LOADING METRICS...
        </div>
      )}

      {/* Dashboard grid */}
      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Row 1 — stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <LatencyCard data={data.latency} />
            <ErrorRateCard data={data.errorRate} />
          </div>

          {/* Row 2 — requests chart */}
          <RequestsChart data={data.requestsPerMinute} />

          {/* Row 3 — table + feed */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <TopEndpointsTable data={data.topEndpoints} />
            <RecentRequestsFeed data={data.recentRequests} />
          </div>

        </div>
      )}
    </div>
  );
}