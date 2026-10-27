import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LayoutDashboard, Activity as ActivityIcon, ArrowLeft } from 'lucide-react'
import api from '../api/client.js'
import Sidebar from '../components/Sidebar.jsx'
import ItemDetailModal from '../components/ItemDetailModal.jsx'
import { getAdminNavItems } from '../adminNav.js'

export default function Activity() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = localStorage.getItem('mmg_role')
  const employeeId = searchParams.get('employeeId')
  const employeeName = searchParams.get('employeeName')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItemId, setSelectedItemId] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/activity', { params: employeeId ? { employeeId } : {} }).then((res) => {
      setEvents(res.data)
      setLoading(false)
    })
  }, [employeeId])

  const navItems = (role === 'ADMIN' || ['JS_ADMIN', 'DIRECTOR_ADMIN'].includes(role))
    ? getAdminNavItems(navigate)
    : [
        { key: 'mine', label: 'My Dashboard', icon: LayoutDashboard, onClick: () => navigate('/employee') },
        { key: 'activity', label: 'Activity', icon: ActivityIcon, onClick: () => {} },
      ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={navItems} active="activity" />

      <main style={styles.main}>
        {employeeId ? (
          <>
            <button onClick={() => navigate('/admin/activity')} style={styles.backBtn}>
              <ArrowLeft size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              All activity
            </button>
            <h1 style={{ marginBottom: 24 }}>Activity — {employeeName || 'Employee'}</h1>
          </>
        ) : (
          <h1 style={{ marginBottom: 24 }}>Recent Activity</h1>
        )}

        {loading ? (
          <div style={{ color: 'var(--ink-muted)' }}>Loading…</div>
        ) : events.length === 0 ? (
          <div style={styles.empty}>No activity yet.</div>
        ) : (
          <div style={styles.feed}>
            {events.map((e, i) => (
              <div key={i} style={styles.row} onClick={() => setSelectedItemId(e.itemId)}>
                <div className={`status-badge status-${e.status.toLowerCase()}`} style={styles.badgeFixed}>
                  {e.status.replace('_', ' ')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.itemName}>{e.itemName}</div>
                  <div style={styles.meta}>
                    {e.employeeName ? `Assigned to ${e.employeeName}` : 'Unassigned'} · {new Date(e.changedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ItemDetailModal itemId={selectedItemId} onClose={() => setSelectedItemId(null)} />
    </div>
  )
}

const styles = {
  main: { marginLeft: 220, padding: '32px 40px', width: '100%' },
  backBtn: { background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 14, cursor: 'pointer' },
  empty: { color: 'var(--ink-muted)', padding: 32, textAlign: 'center' },
  feed: { background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' },
  row: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
    borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s ease',
  },
  badgeFixed: { minWidth: 90, justifyContent: 'center' },
  itemName: { fontWeight: 600, fontSize: 14 },
  meta: { fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 },
}
