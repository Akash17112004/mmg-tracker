import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Plus, FileSpreadsheet } from 'lucide-react'
import api from '../api/client.js'
import Sidebar from '../components/Sidebar.jsx'
import DashboardAnalytics from '../components/DashboardAnalytics.jsx'
import ItemDetailModal from '../components/ItemDetailModal.jsx'
import { getAdminNavItems } from '../adminNav.js'

const STATUS_OPTIONS = ['UPLOADED', 'ASSIGNED', 'PENDING', 'IN_PROGRESS', 'COMPLETED']
const PAGE_SIZE = 8

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [items, setItems] = useState([])
  const [analyticsItems, setAnalyticsItems] = useState([])
  const [employees, setEmployees] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadSummary = useCallback(async () => {
    const res = await api.get('/dashboard/summary')
    setSummary(res.data)
  }, [])

  const loadEmployees = useCallback(async () => {
    const res = await api.get('/admin/employees')
    setEmployees(res.data)
  }, [])

  const loadAnalyticsItems = useCallback(async () => {
    const res = await api.get('/dashboard/items')
    setAnalyticsItems(Array.isArray(res.data) ? res.data : [])
  }, [])

  const loadFilteredItems = useCallback(async () => {
    const res = await api.get('/dashboard/items/filtered', {
      params: { status: statusFilter || undefined, page, size: PAGE_SIZE },
    })
    setItems(res.data.items)
    setTotalPages(res.data.totalPages || 1)
  }, [statusFilter, page])

  const searchItems = useCallback(async (q) => {
    const res = await api.get('/dashboard/items/search', { params: { q } })
    setItems(res.data)
    setTotalPages(1)
  }, [])

  useEffect(() => {
    Promise.all([loadSummary(), loadEmployees(), loadAnalyticsItems()]).finally(() => setLoading(false))
  }, [loadSummary, loadEmployees, loadAnalyticsItems])

  // Live search overrides filters/pagination while typing; falls back to filtered view when cleared
  useEffect(() => {
    const handle = setTimeout(() => {
      if (query.trim() === '') {
        loadFilteredItems()
      } else {
        searchItems(query)
      }
    }, 300)
    return () => clearTimeout(handle)
  }, [query, loadFilteredItems, searchItems])

  useEffect(() => { setPage(0) }, [statusFilter])

  async function assignItem(itemId, employeeId) {
    if (!employeeId) return
    await api.post(`/items/${itemId}/assign`, { employeeId: Number(employeeId) })
    loadSummary()
    loadFilteredItems()
    loadAnalyticsItems()
  }

  async function deleteItem(itemId) {
    if (!window.confirm('Delete this item permanently?')) return
    await api.delete(`/admin/items/${itemId}`)
    loadSummary()
    loadFilteredItems()
    loadAnalyticsItems()
    setSelectedIds((prev) => prev.filter((id) => id !== itemId))
  }


  function toggleSelect(itemId) {
    setSelectedIds((prev) => prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId])
  }

  async function bulkAssign(employeeId) {
    if (!employeeId) return
    for (const id of selectedIds) {
      await api.post(`/items/${id}/assign`, { employeeId: Number(employeeId) })
    }
    setSelectedIds([])
    loadSummary()
    loadFilteredItems()
    loadAnalyticsItems()
  }

  async function bulkDelete() {
    if (!window.confirm(`Delete ${selectedIds.length} selected item(s) permanently?`)) return
    for (const id of selectedIds) {
      await api.delete(`/admin/items/${id}`)
    }
    setSelectedIds([])
    loadSummary()
    loadFilteredItems()
    loadAnalyticsItems()
  }

  function exportCsv() {
    const headers = ['ID', 'Item', 'Status', 'Assigned To']
    const rows = items.map((i) => [i.id, i.itemName, i.status, i.employeeName || 'Unassigned'])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `mmg-items-page${page + 1}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const navItems = getAdminNavItems(navigate)

  const isSearching = query.trim() !== ''

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={navItems} active="dashboard" />

      <main style={styles.main}>
        <header className="workspace-page-header" style={styles.header}>
          <div className="workspace-page-title">
            <span className="analytics-panel-kicker">WORKSPACE / ITEM TRACKING</span>
            <h1>Status dashboard</h1>
            <p>Monitor incoming records, coordinate assignments and review item progress.</p>
          </div>
          <div className="workspace-header-actions">
            <input
              placeholder="Search item records…"
              aria-label="Search item records"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={styles.search}
            />
            <button onClick={exportCsv} className="workspace-secondary-action" type="button">
              <FileSpreadsheet size={17} /> Export register
            </button>
            <button onClick={() => navigate('/admin/upload')} className="workspace-primary-action" type="button">
              <Plus size={17} /> Register item
            </button>
          </div>
        </header>

        {loading ? (
          <div style={styles.loading}>Loading…</div>
        ) : !summary ? (
          <div style={styles.loading}>Couldn't load dashboard data. Try refreshing, or log in again if the problem continues.</div>
        ) : (
          <>
            <DashboardAnalytics summary={summary} items={analyticsItems} employees={employees} />

            <section className="register-section">
              <div className="register-section-head">
                <div>
                  <span className="analytics-panel-kicker">RECORDS MANAGEMENT</span>
                  <h2>Item register</h2>
                  <p>Open any record to review its details and attached documents. Use the controls to assign and manage records.</p>
                </div>
                <div className="register-view-count"><strong>{items.length}</strong><span>{isSearching ? 'matching results' : 'on this page'}</span></div>
              </div>

            {!isSearching && (
              <div style={styles.filterRow}>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            )}

            {selectedIds.length > 0 && (
              <div style={styles.bulkBar}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedIds.length} selected</span>
                <select onChange={(e) => bulkAssign(e.target.value)} value="" style={styles.filterSelect}>
                  <option value="" disabled>Assign to…</option>
                  {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.username}</option>)}
                </select>
                <button onClick={bulkDelete} style={styles.deleteBtn}>Delete Selected</button>
                <button onClick={() => setSelectedIds([])} style={styles.clearBtn}>Clear</button>
              </div>
            )}

            <div style={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 32 }}></th>
                    <th>ID</th>
                    <th>Item</th>
                    <th>Status</th>
                    <th>Assigned to</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={6} style={styles.empty}>No items match this view.</td></tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} />
                        </td>
                        <td className="mono" onClick={() => setSelectedItemId(item.id)} style={{ cursor: 'pointer' }}>{item.id}</td>
                        <td onClick={() => setSelectedItemId(item.id)} style={{ cursor: 'pointer', fontWeight: 500 }}>{item.itemName}</td>
                        <td>
                          <span className={`status-badge status-${item.status.toLowerCase()}`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select
                            value=""
                            onChange={(e) => assignItem(item.id, e.target.value)}
                            style={styles.assignSelect}
                          >
                            <option value="">{item.employeeName || 'Unassigned'}</option>
                            {employees
                              .filter((emp) => emp.username !== item.employeeName)
                              .map((emp) => (
                                <option key={emp.id} value={emp.id}>Assign: {emp.username}</option>
                              ))}
                          </select>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          {item.hasDocument && (
                            <button onClick={() => setSelectedItemId(item.id)} style={styles.docBtn}>📎 Files</button>
                          )}
                          <button onClick={() => deleteItem(item.id)} style={styles.deleteBtnSmall}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!isSearching && totalPages > 1 && (
              <div style={styles.pagination}>
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} style={styles.pageBtn}>← Previous</button>
                <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>Page {page + 1} of {totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} style={styles.pageBtn}>Next →</button>
              </div>
            )}
            </section>
          </>
        )}
      </main>

      <ItemDetailModal itemId={selectedItemId} onClose={() => { setSelectedItemId(null); loadSummary(); loadAnalyticsItems(); if (query.trim()) searchItems(query); else loadFilteredItems() }} />
    </div>
  )
}

const styles = {
  main: { marginLeft: 220, padding: '32px 40px', width: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  search: { width: 240 },
  exportBtn: { background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--ink-primary)', padding: '9px 14px', fontSize: 13, fontWeight: 600 },
  loading: { color: 'var(--ink-muted)', padding: 40 },
  filterRow: { display: 'flex', gap: 10, marginBottom: 16 },
  filterSelect: { fontSize: 13, padding: '8px 10px' },
  bulkBar: {
    display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-panel)',
    border: '1px solid var(--accent)', borderRadius: 8, padding: '10px 16px', marginBottom: 16,
  },
  clearBtn: { background: 'transparent', color: 'var(--ink-muted)', fontSize: 12, padding: '6px 10px' },
  tableWrap: { background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' },
  empty: { textAlign: 'center', color: 'var(--ink-muted)', padding: 32 },
  assignSelect: { fontSize: 12, padding: '5px 6px', maxWidth: 150 },
  docBtn: { background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '5px 10px', fontSize: 12, fontWeight: 600, marginRight: 8 },
  deleteBtn: { background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '7px 12px', fontSize: 12, fontWeight: 600 },
  deleteBtnSmall: { background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '5px 10px', fontSize: 12, fontWeight: 600 },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20 },
  pageBtn: { background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--ink-primary)', padding: '7px 14px', fontSize: 13, fontWeight: 600 },
}
