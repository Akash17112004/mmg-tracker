import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck, ClipboardList, FileText, FolderOpen, Plus, UploadCloud, X } from 'lucide-react'
import api from '../api/client.js'
import Sidebar from '../components/Sidebar.jsx'
import { getAdminNavItems } from '../adminNav.js'

export default function UploadItem() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [stockItems, setStockItems] = useState([])
  const [form, setForm] = useState({ categoryId: '', itemName: '', description: '', stockItemId: '', quantityUsed: '' })
  const [files, setFiles] = useState([])
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [catalogueError, setCatalogueError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/meta/categories'),
      api.get('/meta/stock-items'),
    ]).then(([categoryRes, stockRes]) => {
      setCategories(categoryRes.data)
      setStockItems(stockRes.data)
    }).catch((err) => {
      setCatalogueError(err.response?.data?.message || 'Some reference data could not be loaded. Refresh after checking the backend connection.')
    })
  }, [])

  function addFiles(fileList) {
    const additions = Array.from(fileList || []).map((file) => ({
      key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      remarks: '',
    }))
    setFiles((current) => {
      const existing = new Set(current.map((entry) => `${entry.file.name}-${entry.file.size}-${entry.file.lastModified}`))
      return [...current, ...additions.filter((entry) => !existing.has(`${entry.file.name}-${entry.file.size}-${entry.file.lastModified}`))]
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    setLoading(true)
    setMsg(null)
    const data = new FormData()
    data.append('categoryId', form.categoryId)
    data.append('itemName', form.itemName.trim())
    data.append('description', form.description)
    if (form.stockItemId) {
      data.append('stockItemId', form.stockItemId)
      data.append('quantityUsed', form.quantityUsed || '1')
    }
    files.forEach((entry) => {
      data.append('files', entry.file)
      data.append('remarks', entry.remarks || '')
    })

    try {
      const res = await api.post('/items/upload', data)
      setMsg({ type: 'success', text: `Item “${res.data.itemName}” was registered with reference MMG-${String(res.data.itemId).padStart(5, '0')}.` })
      setForm({ categoryId: '', itemName: '', description: '', stockItemId: '', quantityUsed: '' })
      setFiles([])
      formElement.reset()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'The item could not be registered. Check the required fields and server logs.' })
    } finally {
      setLoading(false)
    }
  }

  const navItems = getAdminNavItems(navigate)

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={navItems} active="upload" />
      <main className="page-main">
        <div className="page-heading">
          <div><div className="eyebrow">REGISTRY SERVICES / NEW RECORD</div><h1>Register an item</h1><p>Create an item record and attach supporting documentation to its official file.</p></div>
          <span className="role-chip"><BadgeCheck size={14} /> Authorised intake</span>
        </div>

        {catalogueError && <div className="register-form-message error" style={{ marginBottom: 14 }}>{catalogueError}</div>}
        {msg && <div className={`register-form-message ${msg.type}`} style={{ marginBottom: 14 }}>{msg.text}</div>}

        <div className="register-item-layout">
          <form onSubmit={handleSubmit} className="register-item-card">
            <div><h2><ClipboardList size={18} style={{ color: 'var(--accent-bright)', verticalAlign: -4, marginRight: 8 }} />Item particulars</h2><p>Enter the item details exactly as they should appear in the office tracking register.</p></div>

            <label className="field-label">Item category
              <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required>
                <option value="" disabled>Select an approved category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>

            <label className="field-label">Official item name
              <input value={form.itemName} onChange={(event) => setForm({ ...form, itemName: event.target.value })} placeholder="Enter item name or short reference" required maxLength={200} />
            </label>

            <label className="field-label">Description / case notes
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Purpose, context, required action or related reference" rows={4} />
            </label>

            <div className="document-register-heading"><div><h3><PaperclipFallback /> Supporting documents</h3><p>Upload several files in one go. Each attachment can have its own remarks.</p></div><span className="document-count">{files.length} queued</span></div>
            <label className="document-upload-drop">
              <UploadCloud size={23} />
              <span><strong>Select files to attach</strong><small>PDF, Word, Excel or image files supported by the server. Select multiple files.</small></span>
              <input type="file" multiple onChange={(event) => { addFiles(event.target.files); event.target.value = '' }} />
            </label>

            {files.length > 0 && <div className="register-file-queue">{files.map((entry) => (
              <div className="register-file-entry" key={entry.key}>
                <div className="register-file-title"><FileText size={15} /><span>{entry.file.name}<small>{(entry.file.size / 1024).toFixed(1)} KB <button type="button" className="queue-remove" onClick={() => setFiles((current) => current.filter((file) => file.key !== entry.key))}><X size={11} style={{ verticalAlign: -2 }} /> Remove</button></small></span></div>
                <label className="register-inline-label">Remarks for this file<textarea value={entry.remarks} maxLength={2000} onChange={(event) => setFiles((current) => current.map((file) => file.key === entry.key ? { ...file, remarks: event.target.value } : file))} placeholder="e.g. Signed approval copy, supporting invoice…" /></label>
              </div>
            ))}</div>}

            <div className="register-select-row">
              <label className="field-label">Issue material from Store <span style={{ fontWeight: 400 }}>(optional)</span>
                <select value={form.stockItemId} onChange={(event) => setForm({ ...form, stockItemId: event.target.value })}>
                  <option value="">No stock item linked</option>
                  {stockItems.map((stock) => <option key={stock.id} value={stock.id}>{stock.name} ({stock.quantity} {stock.unit} available)</option>)}
                </select>
              </label>
              <label className="field-label">Quantity used
                <input type="number" min="1" value={form.quantityUsed} onChange={(event) => setForm({ ...form, quantityUsed: event.target.value })} placeholder={form.stockItemId ? '1' : 'Not applicable'} disabled={!form.stockItemId} />
              </label>
            </div>

            <div className="helper-panel"><BadgeCheck size={15} /><span>Each file is registered separately under this item. Attachments and remarks are visible according to the signed-in user's permissions, and the original item remains a single trackable record.</span></div>
            <button type="submit" className="primary-action" disabled={loading || !categories.length}>{loading ? 'Registering item…' : 'Register item and attachments'} <span><Plus size={15} /></span></button>
          </form>

          <aside className="register-item-preview">
            <div className="card-icon card-icon-violet"><FolderOpen size={19} /></div>
            <h3>Record processing</h3>
            <p>New items enter the tracking register with an initial status. Assignments and progress updates are then managed from the item status register.</p>
            <div className="register-preview-step"><span>01</span><div><strong>Record particulars</strong><small>Category, name and description become the searchable register entry.</small></div></div>
            <div className="register-preview-step"><span>02</span><div><strong>Evidence & remarks</strong><small>Attach supporting files with individual handling notes for each file.</small></div></div>
            <div className="register-preview-step"><span>03</span><div><strong>Assignment & review</strong><small>Authorised administrators assign the item to the responsible employee.</small></div></div>
            <div className="helper-panel"><FileText size={15} /><span>Document register permissions: executive administrators and the owning administrator can delete files. Assigned employees can add, update remarks, replace attachments and download. Other authorised viewers remain read-only.</span></div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function PaperclipFallback() {
  return <FileText size={15} style={{ verticalAlign: -3, marginRight: 6, color: 'var(--accent-bright)' }} />
}
