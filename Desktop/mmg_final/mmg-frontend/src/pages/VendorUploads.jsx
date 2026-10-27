import { useEffect, useState } from 'react'
import { UploadCloud, ListChecks } from 'lucide-react'
import api from '../api/client.js'
import Sidebar from '../components/Sidebar.jsx'
import { useNavigate } from 'react-router-dom'

export default function VendorUploads() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/vendor/my-uploads').then((res) => {
      setItems(res.data)
      setLoading(false)
    })
  }, [])

  const navItems = [
    { key: 'upload', label: 'Upload Item', icon: UploadCloud, onClick: () => navigate('/vendor') },
    { key: 'my-uploads', label: 'My Uploads', icon: ListChecks, onClick: () => {} },
  ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={navItems} active="my-uploads" />

      <main style={styles.main}>
        <h1 style={{ marginBottom: 24 }}>My Uploads</h1>

        {loading ? (
          <div style={{ color: 'var(--ink-muted)' }}>Loading…</div>
        ) : (
          <div style={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Vendor</th>
                  <th>Status</th>
                  <th>Assigned to</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={5} style={styles.empty}>You haven't uploaded anything yet.</td></tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td className="mono">{item.id}</td>
                      <td style={{ fontWeight: 600 }}>{item.itemName}</td>
                      <td>{item.vendorName || '—'}</td>
                      <td>
                        <span className={`status-badge status-${item.status.toLowerCase()}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{item.employeeName || <span style={{ color: 'var(--ink-muted)' }}>Unassigned</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  main: { marginLeft: 220, padding: '32px 40px', width: '100%' },
  tableWrap: { background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' },
  empty: { textAlign: 'center', color: 'var(--ink-muted)', padding: 32 },
}
