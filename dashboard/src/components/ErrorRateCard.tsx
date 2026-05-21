import type { ErrorRate } from '../api/metrics';

interface Props {
  data: ErrorRate;
}

export function ErrorRateCard({ data }: Props) {
  const rate = parseFloat(data.errorRate);
  const color = rate > 10 ? 'var(--red)' : rate > 5 ? 'var(--yellow)' : 'var(--accent)';

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '20px',
    }}>
      <div style={{ color: 'var(--text-dim)', marginBottom: '16px', fontSize: '11px', letterSpacing: '2px' }}>
        ERROR RATE
      </div>
      <div style={{ fontSize: '40px', fontWeight: 600, color, marginBottom: '16px' }}>
        {data.errorRate}<span style={{ fontSize: '16px', color: 'var(--text-dim)' }}>%</span>
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>4XX</div>
          <div style={{ color: 'var(--yellow)' }}>{data.clientErrors}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>5XX</div>
          <div style={{ color: 'var(--red)' }}>{data.serverErrors}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>TOTAL</div>
          <div>{data.total}</div>
        </div>
      </div>
    </div>
  );
}