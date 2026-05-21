import type { LatencyMetrics } from '../api/metrics';

interface Props {
  data: LatencyMetrics;
}

export function LatencyCard({ data }: Props) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '20px',
    }}>
      <div style={{ color: 'var(--text-dim)', marginBottom: '16px', fontSize: '11px', letterSpacing: '2px' }}>
        LATENCY
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[
          { label: 'AVG', value: data.avg_latency, color: 'var(--accent)' },
          { label: 'P95', value: data.p95_latency, color: 'var(--yellow)' },
          { label: 'MIN', value: data.min_latency, color: 'var(--blue)' },
          { label: 'MAX', value: data.max_latency, color: 'var(--red)' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <div style={{ color: 'var(--text-dim)', fontSize: '10px', marginBottom: '4px' }}>{label}</div>
            <div style={{ color, fontSize: '24px', fontWeight: 600 }}>
              {Math.round(value)}<span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '2px' }}>ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}