import type { TopEndpoint } from '../api/metrics';

interface Props {
  data: TopEndpoint[];
}

export function TopEndpointsTable({ data }: Props) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '20px',
    }}>
      <div style={{ color: 'var(--text-dim)', marginBottom: '16px', fontSize: '11px', letterSpacing: '2px' }}>
        TOP ENDPOINTS
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: 'var(--text-dim)', fontSize: '10px' }}>
            <th style={{ textAlign: 'left', paddingBottom: '8px' }}>PATH</th>
            <th style={{ textAlign: 'right', paddingBottom: '8px' }}>REQUESTS</th>
            <th style={{ textAlign: 'right', paddingBottom: '8px' }}>AVG LAT</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ep, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0', color: 'var(--accent)' }}>{ep.path}</td>
              <td style={{ textAlign: 'right', padding: '8px 0' }}>{ep.count}</td>
              <td style={{ textAlign: 'right', padding: '8px 0', color: 'var(--text-dim)' }}>
                {ep.avgLatency}ms
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}