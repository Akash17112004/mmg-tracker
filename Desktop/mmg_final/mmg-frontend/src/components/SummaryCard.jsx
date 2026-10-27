export default function SummaryCard({ label, value, colorVar }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.dot, background: `var(${colorVar})` }} />
      <div style={styles.value}>{value}</div>
      <div style={styles.label}>{label}</div>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--bg-panel)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '18px 20px',
    flex: 1,
    minWidth: 130,
  },
  dot: { width: 8, height: 8, borderRadius: '50%', marginBottom: 12 },
  value: { fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' },
  label: { fontSize: 12, color: 'var(--ink-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.03em' },
}
