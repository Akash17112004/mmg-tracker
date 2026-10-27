import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import Sidebar from '../components/Sidebar.jsx'

export default function Profile() {
  const navigate = useNavigate()
  const role = localStorage.getItem('mmg_role')
  const [newUsername, setNewUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      await api.put('/auth/me', {
        newUsername: newUsername || null,
        currentPassword,
        newPassword: newPassword || null,
      })
      if (newUsername) localStorage.setItem('mmg_username', newUsername)
      setMsg({ type: 'success', text: 'Profile updated. Please log in again if you changed your password.' })
      setCurrentPassword('')
      setNewPassword('')
      setNewUsername('')
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' })
    } finally {
      setLoading(false)
    }
  }

  const backPath = ['ADMIN', 'JS_ADMIN', 'DIRECTOR_ADMIN'].includes(role) ? '/admin' : ['OIC_STORE', 'BILLING', 'STORE'].includes(role) ? '/store' : '/employee'

  const navItems = [
    { key: 'back', label: '← Back', onClick: () => navigate(backPath) },
    { key: 'profile', label: 'Profile', onClick: () => {} },
  ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={navItems} active="profile" />

      <main style={styles.main}>
        <h1 style={{ marginBottom: 24 }}>Profile</h1>

        <form onSubmit={handleSubmit} style={styles.card}>
          <label style={styles.label}>
            New username <span style={styles.optional}>(leave blank to keep current)</span>
            <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
          </label>
          <label style={styles.label}>
            Current password <span style={styles.required}>(required to confirm any change)</span>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </label>
          <label style={styles.label}>
            New password <span style={styles.optional}>(leave blank to keep current)</span>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </label>

          {msg && <div style={msg.type === 'success' ? styles.success : styles.error}>{msg.text}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Saving…' : 'Save changes'}
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
  optional: { fontWeight: 400, color: 'var(--ink-muted)', fontSize: 11 },
  required: { fontWeight: 400, color: 'var(--danger)', fontSize: 11 },
  success: { background: '#ecfdf5', color: '#047857', padding: '8px 12px', borderRadius: 8, fontSize: 13 },
  error: { background: '#fef2f2', color: 'var(--danger)', padding: '8px 12px', borderRadius: 8, fontSize: 13 },
  button: { background: 'var(--accent)', color: '#fff', padding: '11px 16px', fontSize: 14, fontWeight: 600, marginTop: 4 },
}
