import { useEffect, useState } from 'react'
import { X, ArrowUp, ArrowDown } from 'lucide-react'
import api from '../api/client.js'

export default function StockHistoryModal({ itemId, itemName, onClose }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!itemId) return
    setLoading(true)
    api.get(`/store/items/${itemId}/history`).then((res) => {
      setHistory(res.data)
      setLoading(false)
    })
  }, [itemId])

  if (!itemId) return null

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeBtn}><X size={18} /></button>
        <h2 style={{ marginBottom: 20 }}>{itemName} — Movement History</h2>

        {loading ? (
          <div style={{ color: 'var(--ink-muted)' }}>Loading…</div>
        ) : history.length === 0 ? (
          <div style={{ color: 'var(--ink-muted)', fontSize: 13 }}>No movements recorded yet.</div>
        ) : (
          <div style={styles.list}>
            {history.map((h, i) => (
              <div key={i} style={styles.row}>
                {h.delta >= 0 ? <ArrowUp size={14} color="var(--status-completed)" /> : <ArrowDown size={14} color="var(--danger)" />}
                <span style={{ fontWeight: 700, color: h.delta >= 0 ? 'var(--status-completed)' : 'var(--danger)' }}>
                  {h.delta >= 0 ? '+' : ''}{h.delta}
                </span>
                <span style={styles.reason}>{h.reason.replace(/_/g, ' ')}</span>
                <span style={styles.meta}>{h.changedBy} · {new Date(h.changedAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(10,14,26,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: 'var(--bg-panel)', borderRadius: 14, padding: 28, width: 440, maxHeight: '75vh', overflowY: 'auto', position: 'relative', boxShadow: '0 24px 70px rgba(0,0,0,0.35)' },
  closeBtn: { position: 'absolute', top: 16, right: 16, background: 'transparent', color: 'var(--ink-muted)', padding: 6 },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 },
  reason: { color: 'var(--ink-muted)', fontSize: 12, flex: 1 },
  meta: { fontSize: 11, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' },
}
