import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { RequestsPerMinute } from '../api/metrics';

interface Props {
  data: RequestsPerMinute[];
}

export function RequestsChart({ data }: Props) {
  const formatted = data.map(d => ({
    time: new Date(d.minute).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    count: d.count,
  }));

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '20px',
    }}>
      <div style={{ color: 'var(--text-dim)', marginBottom: '16px', fontSize: '11px', letterSpacing: '2px' }}>
        REQUESTS PER MINUTE
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={formatted}>
          <XAxis
            dataKey="time"
            stroke="var(--border)"
            tick={{ fill: 'var(--text-dim)', fontSize: 10 }}
          />
          <YAxis
            stroke="var(--border)"
            tick={{ fill: 'var(--text-dim)', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}