import { useState, useEffect, useRef } from 'react';
import { fetchSummary, type RecentRequest, type MetricsSummary } from './api/metrics';
import { RequestsChart } from './components/RequestsChart';
import { LatencyCard } from './components/LatencyCard';
import { ErrorRateCard } from './components/ErrorRateCard';
import { TopEndpointsTable } from './components/TopEndpointsTable';
import { RecentRequestsFeed } from './components/RecentRequestsFeed';

const REFRESH_INTERVAL = 5000;
const WS_URL = 'ws://localhost:3000';

export default function App() {
  const [data, setData] = useState<MetricsSummary | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveRequests, setLiveRequests] = useState<RecentRequest[]>([]);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

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
    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if(message.type === 'new_request') {
          setLiveRequests(prev => [message.data, ...prev].slice(0, 50));
        }
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
        setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setWsStatus('disconnected');
      };
    }

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const allRequests = liveRequests.length > 0
  ? liveRequests
  : (data?.recentRequests ?? []);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginBottom: '4px' }}>
            {/* WebSocket status indicator */}
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: wsStatus === 'connected' ? 'var(--accent)' : 'var(--red)',
            }} />
            <span style={{ color: wsStatus === 'connected' ? 'var(--accent)' : 'var(--red)' }}>
              {wsStatus.toUpperCase()}
            </span>
          </div>
          <div>AUTO REFRESH 5s</div>
          {lastUpdated && (
            <div style={{ color: 'var(--accent)' }}>
              UPDATED {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

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

      {!data && !error && (
        <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '60px' }}>
          LOADING METRICS...
        </div>
      )}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <LatencyCard data={data.latency} />
            <ErrorRateCard data={data.errorRate} />
          </div>

          <RequestsChart data={data.requestsPerMinute} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <TopEndpointsTable data={data.topEndpoints} />
            {/* Pass live requests — updates instantly via WebSocket */}
            <RecentRequestsFeed data={allRequests} />
          </div>
        </div>
      )}
    </div>
  );
}