import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, ListChecks } from 'lucide-react'
import api from '../api/client.js'
import Sidebar from '../components/Sidebar.jsx'
import { getAdminNavItems } from '../adminNav.js'

export default function VendorUpload() {
  const navigate = useNavigate()
  const role = localStorage.getItem('mmg_role')
  const [vendors, setVendors] = useState([])
  const [categories, setCategories] = useState([])
  const [stockItems, setStockItems] = useState([])
  const [form, setForm] = useState({ vendorId: '', categoryId: '', itemName: '', description: '', stockItemId: '', quantityUsed: '' })
  const [file, setFile] = useState(null)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/meta/vendors').then((res) => setVendors(res.data))
    api.get('/meta/categories').then((res) => setCategories(res.data))
    api.get('/meta/stock-items').then((res) => setStockItems(res.data))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const data = new FormData()
    data.append('vendorId', form.vendorId)
    data.append('categoryId', form.categoryId)
    data.append('itemName', form.itemName)
    data.append('description', form.description)
    if (form.stockItemId) {
      data.append('stockItemId', form.stockItemId)
      data.append('quantityUsed', form.quantityUsed || 1)
    }
    if (file) data.append('file', file)

    try {
      const res = await api.post('/vendor/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMsg({ type: 'success', text: `Item "${res.data.itemName}" uploaded (status: ${res.data.status}).` })
      setForm({ vendorId: '', categoryId: '', itemName: '', description: '', stockItemId: '', quantityUsed: '' })
      setFile(null)
      e.target.reset()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Upload failed.' })
    } finally {
      setLoading(false)
    }
  }

  const navItems = (role === 'ADMIN' || role === 'SUPER_ADMIN')
    ? getAdminNavItems(navigate)
    : [
        { key: 'upload', label: 'Upload Item', icon: UploadCloud, onClick: () => {} },
        { key: 'my-uploads', label: 'My Uploads', icon: ListChecks, onClick: () => navigate('/vendor/my-uploads') },
      ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={navItems} active="upload" />

      <main style={styles.main}>
        <h1 style={{ marginBottom: 24 }}>Upload Item</h1>

        <form onSubmit={handleSubmit} style={styles.card}>
          <label style={styles.label}>
            Vendor
            <select
              value={form.vendorId}
              onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
              required
            >
              <option value="" disabled>Select a vendor…</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </label>
          <label style={styles.label}>
            Category
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="" disabled>Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label style={styles.label}>
            Item Name
            <input
              value={form.itemName}
              onChange={(e) => setForm({ ...form, itemName: e.target.value })}
              required
            />
          </label>
          <label style={styles.label}>
            Description
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label style={styles.label}>
            Document
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          </label>
          <label style={styles.label}>
            Uses material from store <span style={{ fontWeight: 400, color: 'var(--ink-muted)', fontSize: 11 }}>(optional)</span>
            <select
              value={form.stockItemId}
              onChange={(e) => setForm({ ...form, stockItemId: e.target.value })}
            >
              <option value="">None</option>
              {stockItems.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.quantity} {s.unit} available)</option>
              ))}
            </select>
          </label>
          {form.stockItemId && (
            <label style={styles.label}>
              Quantity used
              <input
                type="number"
                min="1"
                value={form.quantityUsed}
                onChange={(e) => setForm({ ...form, quantityUsed: e.target.value })}
                placeholder="1"
              />
            </label>
          )}

          {msg && (
            <div style={msg.type === 'success' ? styles.success : styles.error}>{msg.text}</div>
          )}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Uploading…' : 'Upload Item'}
          </button>
        </form>
      </main>
    </div>
  )
}

const styles = {
  main: { marginLeft: 220, padding: '32px 40px', width: '100%' },
  card: {
    background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10,
    padding: 28, width: 380, display: 'flex', flexDirection: 'column', gap: 14,
    boxShadow: 'var(--shadow-sm)',
  },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--ink-primary)' },
  success: { background: '#ecfdf5', color: '#047857', padding: '8px 12px', borderRadius: 8, fontSize: 13 },
  error: { background: '#fef2f2', color: 'var(--danger)', padding: '8px 12px', borderRadius: 8, fontSize: 13 },
  button: { background: 'var(--accent)', color: '#fff', padding: '11px 16px', fontSize: 14, fontWeight: 600, marginTop: 4 },
}
