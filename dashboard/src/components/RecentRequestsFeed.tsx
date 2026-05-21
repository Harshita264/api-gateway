import type { RecentRequest } from '../api/metrics';

interface Props {
  data: RecentRequest[];
}

export function RecentRequestsFeed({ data }: Props) {
  const statusColor = (code: number) => {
    if (code >= 500) return 'var(--red)';
    if (code >= 400) return 'var(--yellow)';
    return 'var(--accent)';
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '20px',
    }}>
      <div style={{ color: 'var(--text-dim)', marginBottom: '16px', fontSize: '11px', letterSpacing: '2px' }}>
        RECENT REQUESTS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {data.map(req => (
          <div key={req.id} style={{
            display: 'grid',
            gridTemplateColumns: '48px 140px 1fr 52px 60px',
            gap: '12px',
            padding: '6px 0',
            borderBottom: '1px solid var(--border)',
            alignItems: 'center',
            fontSize: '12px',
          }}>
            <span style={{ color: statusColor(req.statusCode), fontWeight: 600 }}>
              {req.statusCode}
            </span>
            <span style={{ color: 'var(--blue)' }}>{req.method}</span>
            <span style={{ color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {req.path}
            </span>
            <span style={{ color: 'var(--text-dim)', textAlign: 'right' }}>{req.latencyMs}ms</span>
            <span style={{ color: 'var(--text-dim)', textAlign: 'right', fontSize: '10px' }}>
              {new Date(req.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}