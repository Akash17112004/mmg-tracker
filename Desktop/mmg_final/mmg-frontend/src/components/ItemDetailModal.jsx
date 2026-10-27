import { useCallback, useEffect, useState } from 'react'
import {
  X, Clock, FileText, Download, UploadCloud, Pencil, Trash2, Save,
  RotateCcw, ShieldCheck, Paperclip, FileCheck2, AlertCircle
} from 'lucide-react'
import api from '../api/client.js'

function makeQueue(files) {
  return Array.from(files || []).map((file) => ({
    key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
    file,
    remarks: '',
  }))
}

function saveBlob(data, filename) {
  const url = window.URL.createObjectURL(new Blob([data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename || 'item-document')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export default function ItemDetailModal({ itemId, onClose }) {
  const [detail, setDetail] = useState(null)
  const [history, setHistory] = useState([])
  const [documents, setDocuments] = useState([])
  const [permissions, setPermissions] = useState({ canUpload: false, canEdit: false, canDelete: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [newFiles, setNewFiles] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingRemarks, setEditingRemarks] = useState('')
  const [replacementFile, setReplacementFile] = useState(null)

  const loadRecord = useCallback(async () => {
    if (!itemId) return
    setLoading(true)
    setMessage(null)
    try {
      const [detailRes, historyRes, docsRes] = await Promise.all([
        api.get(`/items/${itemId}`),
        api.get(`/items/${itemId}/history`),
        api.get(`/items/${itemId}/documents`),
      ])
      setDetail(detailRes.data)
      setHistory(historyRes.data)
      setDocuments(docsRes.data.documents || [])
      setPermissions({
        canUpload: !!docsRes.data.canUpload,
        canEdit: !!docsRes.data.canEdit,
        canDelete: !!docsRes.data.canDelete,
      })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Record details could not be loaded.' })
    } finally {
      setLoading(false)
    }
  }, [itemId])

  useEffect(() => {
    setNewFiles([])
    setEditingId(null)
    setReplacementFile(null)
    loadRecord()
  }, [loadRecord])

  async function downloadDocument(document) {
    try {
      const endpoint = document.legacy || !document.id
        ? `/items/${itemId}/document`
        : `/items/${itemId}/documents/${document.id}/download`
      const res = await api.get(endpoint, { responseType: 'blob' })
      const disposition = res.headers['content-disposition']
      const match = disposition && disposition.match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i)
      let filename = document.originalFilename || 'item-document'
      if (match?.[1]) {
        try { filename = decodeURIComponent(match[1].replace(/^"|"$/g, '')) } catch { filename = match[1].replace(/^"|"$/g, '') }
      }
      saveBlob(res.data, filename)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Could not download this document.' })
    }
  }

  function queueFiles(fileList) {
    const added = makeQueue(fileList)
    setNewFiles((current) => {
      const existing = new Set(current.map((entry) => `${entry.file.name}-${entry.file.size}-${entry.file.lastModified}`))
      return [...current, ...added.filter((entry) => !existing.has(`${entry.file.name}-${entry.file.size}-${entry.file.lastModified}`))]
    })
  }

  async function uploadDocuments(event) {
    event.preventDefault()
    if (!newFiles.length) return
    setSaving(true)
    setMessage(null)
    try {
      const data = new FormData()
      newFiles.forEach((entry) => {
        data.append('files', entry.file)
        data.append('remarks', entry.remarks || '')
      })
      const res = await api.post(`/items/${itemId}/documents`, data)
      setDocuments(res.data.documents || [])
      setPermissions({ canUpload: !!res.data.canUpload, canEdit: !!res.data.canEdit, canDelete: !!res.data.canDelete })
      setNewFiles([])
      const picker = event.currentTarget.querySelector('input[type="file"]')
      if (picker) picker.value = ''
      setMessage({ type: 'success', text: 'Documents added to the item register.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Document upload failed.' })
    } finally {
      setSaving(false)
    }
  }

  function beginEdit(document) {
    setEditingId(document.id)
    setEditingRemarks(document.remarks || '')
    setReplacementFile(null)
    setMessage(null)
  }

  async function saveEdit(event, documentId) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const data = new FormData()
      data.append('remarks', editingRemarks)
      if (replacementFile) data.append('file', replacementFile)
      const res = await api.put(`/items/${itemId}/documents/${documentId}`, data)
      setDocuments(res.data.documents || [])
      setPermissions({ canUpload: !!res.data.canUpload, canEdit: !!res.data.canEdit, canDelete: !!res.data.canDelete })
      setEditingId(null)
      setReplacementFile(null)
      setMessage({ type: 'success', text: 'Document record updated.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Could not update this document.' })
    } finally {
      setSaving(false)
    }
  }

  async function deleteDocument(document) {
    if (!window.confirm(`Delete “${document.originalFilename}” from this item? This also removes the stored file.`)) return
    setSaving(true)
    setMessage(null)
    try {
      await api.delete(`/items/${itemId}/documents/${document.id}`)
      setDocuments((current) => current.filter((entry) => entry.id !== document.id))
      setMessage({ type: 'success', text: 'Document removed from the item register.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Could not delete this document.' })
    } finally {
      setSaving(false)
    }
  }

  if (!itemId) return null

  return (
    <div className="item-modal-overlay" onClick={onClose}>
      <div className="item-modal" role="dialog" aria-modal="true" aria-label="Item record" onClick={(event) => event.stopPropagation()}>
        <div className="item-modal-topline"><span><ShieldCheck size={14} /> OFFICIAL ITEM RECORD</span><button className="item-modal-close" onClick={onClose} aria-label="Close item details"><X size={18} /></button></div>

        {loading ? (
          <div className="item-modal-loading">Loading item register…</div>
        ) : !detail ? (
          <div className="item-modal-loading">{message?.text || 'Item details are not available.'}</div>
        ) : (
          <>
            <div className="item-modal-heading">
              <div><div className="eyebrow">ITEM REGISTER / REF. {detail.id}</div><h2>{detail.itemName}</h2><p>Item metadata, official attachments and status history.</p></div>
              <span className={`status-badge status-${detail.status.toLowerCase()}`}>{detail.status.replace('_', ' ')}</span>
            </div>

            {message && <div className={`document-notice ${message.type}`}><span>{message.type === 'error' ? <AlertCircle size={15} /> : <FileCheck2 size={15} />}</span>{message.text}</div>}

            <div className="item-detail-grid">
              <Field label="Item reference" value={`MMG-${String(detail.id).padStart(5, '0')}`} />
              <Field label="Category" value={detail.categoryName || 'Not categorised'} />
              <Field label="Assigned to" value={detail.employeeName || 'Not yet assigned'} />
              <Field label="Registered on" value={detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '—'} />
              <Field label="Registered by" value={detail.assignedByUsername || 'System / intake desk'} />
            </div>

            {detail.description && <div className="item-description"><span>DESCRIPTION / NOTES</span><p>{detail.description}</p></div>}

            <section className="document-register">
              <div className="document-register-heading">
                <div><h3><Paperclip size={15} /> Document register</h3><p>Multiple supporting files may be stored against a single item, each with its own remarks.</p></div>
                <span className="document-count">{documents.length} {documents.length === 1 ? 'document' : 'documents'}</span>
              </div>

              {permissions.canUpload && (
                <form className="document-upload-panel" onSubmit={uploadDocuments}>
                  <label className="document-upload-drop">
                    <UploadCloud size={23} />
                    <span><strong>Add supporting documents</strong><small>Select multiple files. Add an individual remark for each file before uploading.</small></span>
                    <input type="file" multiple onChange={(event) => { queueFiles(event.target.files); event.target.value = '' }} />
                  </label>
                  {newFiles.map((entry) => (
                    <div className="document-file-entry" key={entry.key}>
                      <div className="document-file-name"><FileText size={13} /> {entry.file.name}<small>{(entry.file.size / 1024).toFixed(1)} KB</small><button type="button" className="queue-remove" onClick={() => setNewFiles((current) => current.filter((file) => file.key !== entry.key))}>Remove</button></div>
                      <label className="document-remark-field">Remarks for this file<textarea maxLength={2000} value={entry.remarks} onChange={(event) => setNewFiles((current) => current.map((file) => file.key === entry.key ? { ...file, remarks: event.target.value } : file))} placeholder="e.g. Approved specification, invoice copy, inspection note…" /></label>
                    </div>
                  ))}
                  {newFiles.length > 0 && <div className="document-form-actions"><span>{newFiles.length} file(s) queued</span><button type="submit" className="document-action primary" disabled={saving}><UploadCloud size={14} /> {saving ? 'Uploading…' : 'Upload documents'}</button></div>}
                </form>
              )}

              <div className="document-list">
                {documents.length === 0 ? (
                  <div className="document-empty"><FileText size={21} /><strong>No supporting documents</strong><span>Files added to this item will appear here with their remarks and upload details.</span></div>
                ) : documents.map((document) => (
                  <article className="document-row" key={document.id ?? `legacy-${document.originalFilename}`}>
                    <div className="document-file-title">
                      <span className="document-file-icon"><FileText size={17} /></span>
                      <span><strong>{document.originalFilename}</strong><small>Uploaded by {document.uploadedBy || 'System'}</small><small>{document.uploadedAt ? `Added ${new Date(document.uploadedAt).toLocaleString()}` : 'Date not recorded'}{document.legacy ? ' · Legacy file' : ''}</small>{document.updatedAt && document.updatedBy && <small>Last edited by {document.updatedBy} · {new Date(document.updatedAt).toLocaleString()}</small>}</span>
                    </div>
                    <div className="document-remarks">{document.remarks || 'No remarks provided.'}</div>
                    <div className="document-actions">
                      <button type="button" className="document-action primary" onClick={() => downloadDocument(document)}><Download size={13} /> Download</button>
                      {permissions.canEdit && !document.legacy && <button type="button" className="document-action" onClick={() => editingId === document.id ? setEditingId(null) : beginEdit(document)}><Pencil size={13} /> Edit</button>}
                      {permissions.canDelete && !document.legacy && <button type="button" className="document-action danger" disabled={saving} onClick={() => deleteDocument(document)}><Trash2 size={13} /> Delete</button>}
                    </div>
                    {editingId === document.id && (
                      <form className="document-edit-form" onSubmit={(event) => saveEdit(event, document.id)}>
                        <label className="document-remark-field">Edit remarks<textarea maxLength={2000} value={editingRemarks} onChange={(event) => setEditingRemarks(event.target.value)} placeholder="Add context or a handling note for this file" /></label>
                        <label className="document-remark-field">Replace file (optional)<input type="file" onChange={(event) => setReplacementFile(event.target.files?.[0] || null)} /><small>Leave empty to keep the current file. Replacing updates the stored attachment while retaining its record.</small></label>
                        {replacementFile && <div className="replacement-file-note"><RotateCcw size={13} /> Replacement selected: {replacementFile.name}</div>}
                        <div className="document-form-actions"><button type="button" className="document-action" onClick={() => { setEditingId(null); setReplacementFile(null) }}>Cancel</button><button type="submit" className="document-action primary" disabled={saving}><Save size={13} /> {saving ? 'Saving…' : 'Save changes'}</button></div>
                      </form>
                    )}
                  </article>
                ))}
              </div>
              <div className="document-permissions"><ShieldCheck size={13} /> {permissions.canDelete ? 'Executive / owning administrator: upload, edit, download and delete.' : permissions.canEdit ? 'Assigned employee: upload, edit remarks or replace files, and download. Deletion is restricted to administrators.' : 'Read-only access: download permitted documents only.'}</div>
            </section>

            <section className="item-history-section">
              <div className="item-history-title"><Clock size={15} /><h3>Status history</h3></div>
              <div className="item-timeline">
                {history.length === 0 ? <div className="item-history-empty">No status history recorded.</div> : history.map((entry, index) => (
                  <div key={`${entry.changedAt}-${index}`} className="item-timeline-row">
                    <span className="item-timeline-dot" />
                    <span className={`status-badge status-${entry.status.toLowerCase()}`}>{entry.status.replace('_', ' ')}</span>
                    <span className="item-timeline-date">{new Date(entry.changedAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return <div className="item-detail-field"><span>{label}</span><strong>{value}</strong></div>
}
