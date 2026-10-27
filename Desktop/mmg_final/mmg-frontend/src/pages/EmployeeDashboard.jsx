import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Activity } from 'lucide-react'
import api from '../api/client.js'
import Sidebar from '../components/Sidebar.jsx'
import DashboardAnalytics from '../components/DashboardAnalytics.jsx'
import ItemDetailModal from '../components/ItemDetailModal.jsx'

const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'COMPLETED']

export default function EmployeeDashboard() {
  const [summary, setSummary] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItemId, setSelectedItemId] = useState(null)

  async function load() {
    const [summaryRes, itemsRes] = await Promise.all([
      api.get('/dashboard/employee/summary'),
      api.get('/dashboard/employee/items'),
    ])
    setSummary(summaryRes.data)
    setItems(itemsRes.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(itemId, status) {
    await api.post(`/items/${itemId}/status`, { status })
    load()
  }


  const navigate = useNavigate()
  const navItems = [
    { key: 'mine', label: 'My Dashboard', icon: LayoutDashboard, onClick: () => {} },
    { key: 'activity', label: 'Activity', icon: Activity, onClick: () => navigate('/employee/activity') },
  ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={navItems} active="mine" />

      <main style={styles.main}>
        <header className="workspace-page-header">
          <div className="workspace-page-title">
            <span className="analytics-panel-kicker">EMPLOYEE WORKSPACE</span>
            <h1>My dashboard</h1>
            <p>Review assigned records, update your work status and manage the documents attached to your items.</p>
          </div>
        </header>

        {loading ? (
          <div style={{ color: 'var(--ink-muted)' }}>Loading…</div>
        ) : !summary ? (
          <div style={{ color: 'var(--ink-muted)' }}>Couldn't load your dashboard. Try refreshing, or log in again if the problem continues.</div>
        ) : (
          <>
            <DashboardAnalytics summary={summary} items={items} employeeMode />

            <section className="register-section employee-register-section">
              <div className="register-section-head">
                <div><span className="analytics-panel-kicker">ASSIGNED TO YOU</span><h2>My item register</h2><p>Open an item to view its record and supporting files.</p></div>
                <div className="register-view-count"><strong>{items.length}</strong><span>assigned records</span></div>
              </div>
            <div style={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Item</th>
                    <th>Status</th>
                    <th>Assigned By</th>
                    <th>Document</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={6} style={styles.empty}>Nothing assigned to you yet.</td></tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td className="mono">{item.id}</td>
                        <td><button type="button" onClick={() => setSelectedItemId(item.id)} className="record-name-button">{item.itemName}</button><small className="record-subtext">Open item record & documents</small></td>
                        <td>
                          <span className={`status-badge status-${item.status.toLowerCase()}`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{item.assignedByUsername || <span style={{ color: 'var(--ink-muted)' }}>—</span>}</td>
                        <td>
                          {item.hasDocument ? (
                            <button onClick={() => setSelectedItemId(item.id)} style={styles.docBtn}>
                              📎 View files
                            </button>
                          ) : (
                            <span style={{ color: 'var(--ink-muted)' }}>—</span>
                          )}
                        </td>
                        <td>
                          <select
                            value={item.status}
                            onChange={(e) => updateStatus(item.id, e.target.value)}
                            style={styles.select}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </section>
          </>
        )}
      </main>
      <ItemDetailModal itemId={selectedItemId} onClose={() => { setSelectedItemId(null); load().catch(() => {}) }} />
    </div>
  )
}

const styles = {
  main: { marginLeft: 220, padding: '32px 40px', width: '100%' },
  tableWrap: { background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' },
  empty: { textAlign: 'center', color: 'var(--ink-muted)', padding: 32 },
  select: { fontSize: 13, padding: '6px 8px' },
  docBtn: {
    background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)',
    padding: '5px 10px', fontSize: 12, fontWeight: 600,
  },
}
