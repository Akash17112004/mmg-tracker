import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boxes, PackageX, Layers3, CircleAlert, ArrowUpRight } from 'lucide-react'
import api from '../api/client.js'
import Sidebar from '../components/Sidebar.jsx'
import DashboardAnalytics from '../components/DashboardAnalytics.jsx'
import { getAdminNavItems } from '../adminNav.js'

export default function Overview() {
  const navigate = useNavigate()
  const [itemSummary, setItemSummary] = useState(null)
  const [stockSummary, setStockSummary] = useState(null)
  const [employees, setEmployees] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/store/summary'),
      api.get('/admin/employees'),
      api.get('/dashboard/items'),
    ]).then(([itemsRes, stockRes, empRes, allItemsRes]) => {
      setItemSummary(itemsRes.data)
      setStockSummary(stockRes.data)
      setEmployees(empRes.data)
      setItems(Array.isArray(allItemsRes.data) ? allItemsRes.data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const navItems = getAdminNavItems(navigate)

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={navItems} active="overview" />

      <main style={styles.main}>
        <header className="workspace-page-header">
          <div className="workspace-page-title">
            <span className="analytics-panel-kicker">OFFICE INTELLIGENCE</span>
            <h1>Office overview</h1>
            <p>Operational analytics for item tracking, inventory position and staff allocation.</p>
          </div>
        </header>

        {loading ? (
          <div className="analytics-loading">Preparing office analytics…</div>
        ) : (
          <>
            <DashboardAnalytics summary={itemSummary} items={items} employees={employees} />

            <section className="overview-store-section">
              <div className="overview-section-heading">
                <div><span className="analytics-panel-kicker">MATERIALS & INVENTORY</span><h2>Store position</h2><p>Inventory indicators from the office store register.</p></div>
                <button className="overview-link-button" onClick={() => navigate('/store')}>Open store register <ArrowUpRight size={16} /></button>
              </div>
              <div className="overview-store-grid">
                <article className="overview-store-card">
                  <span className="overview-store-icon"><Boxes size={21} /></span>
                  <div className="overview-store-value">{stockSummary?.totalItems ?? '—'}</div>
                  <h3>Stock line items</h3>
                  <p>Materials recorded in the store register</p>
                </article>
                <article className="overview-store-card overview-store-warning">
                  <span className="overview-store-icon"><CircleAlert size={21} /></span>
                  <div className="overview-store-value">{stockSummary?.lowStockCount ?? '—'}</div>
                  <h3>Low-stock alerts</h3>
                  <p>Items that may need replenishment</p>
                  <div className="overview-store-progress"><span style={{ width: `${stockSummary?.totalItems ? Math.min(100, (stockSummary.lowStockCount / stockSummary.totalItems) * 100) : 0}%` }} /></div>
                </article>
                <article className="overview-store-card">
                  <span className="overview-store-icon"><Layers3 size={21} /></span>
                  <div className="overview-store-value">{stockSummary?.totalQuantity ?? '—'}</div>
                  <h3>Recorded quantity</h3>
                  <p>Total quantity currently reflected in the summary</p>
                </article>
              </div>
            </section>

            <section className="overview-team-section">
              <div className="overview-section-heading">
                <div><span className="analytics-panel-kicker">PERSONNEL SNAPSHOT</span><h2>Employee workload register</h2><p>Task counts currently associated with each employee.</p></div>
              </div>
              <div className="analytics-panel overview-team-panel">
                <div className="overview-team-table-wrap">
                  <table>
                    <thead><tr><th>Employee</th><th>Total tasks</th><th>Allocation share</th></tr></thead>
                    <tbody>
                      {employees.length === 0 ? (
                        <tr><td colSpan={3} className="analytics-table-empty">No employee records are available.</td></tr>
                      ) : employees.map((emp) => {
                        const maxTasks = Math.max(1, ...employees.map((entry) => Number(entry.total) || 0))
                        const pct = Math.round(((Number(emp.total) || 0) / maxTasks) * 100)
                        return <tr key={emp.id}>
                          <td><div className="overview-team-person"><span>{String(emp.username || 'U').slice(0, 1).toUpperCase()}</span><strong>{emp.username}</strong></div></td>
                          <td><strong className="overview-team-total">{emp.total ?? 0}</strong></td>
                          <td><div className="overview-team-allocation"><span><i style={{ width: `${pct}%` }} /></span><small>{pct}% of highest workload</small></div></td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

const styles = {
  main: { marginLeft: 220, padding: '32px 40px', width: '100%' },
  sectionTitle: { fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-muted)', margin: '20px 0 12px' },
  cards: { display: 'flex', gap: 16, marginBottom: 8 },
  tableWrap: { background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' },
  empty: { textAlign: 'center', color: 'var(--ink-muted)', padding: 32 },
}
