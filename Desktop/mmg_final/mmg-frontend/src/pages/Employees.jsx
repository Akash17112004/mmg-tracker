import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import api from '../api/client.js'
import Sidebar from '../components/Sidebar.jsx'
import { getAdminNavItems } from '../adminNav.js'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const navigate = useNavigate()
  const role = localStorage.getItem('mmg_role')
  const isSuperAdmin = ['JS_ADMIN', 'DIRECTOR_ADMIN'].includes(role)

  useEffect(() => {
    api.get('/admin/employees').then((res) => {
      setEmployees(res.data)
      setLoading(false)
    })
  }, [])

  async function resetPassword(emp) {
    const newPassword = window.prompt(`Set a new password for "${emp.username}":`)
    if (!newPassword) return
    try {
      await api.post(`/admin/users/${emp.id}/reset-password`, { newPassword })
      setMsg({ type: 'success', text: `Password reset for ${emp.username}.` })
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reset password.' })
    }
    setTimeout(() => setMsg(null), 3000)
  }

  const navItems = getAdminNavItems(navigate)

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={navItems} active="employees" />

      <main style={styles.main}>
        <h1 style={{ marginBottom: 24 }}>Employees</h1>

        {msg && (
          <div style={msg.type === 'success' ? styles.success : styles.error}>{msg.text}</div>
        )}

        {loading ? (
          <div style={{ color: 'var(--ink-muted)' }}>Loading…</div>
        ) : (
          <div style={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  {isSuperAdmin && <th>Admin</th>}
                  <th>Assigned</th>
                  <th>Pending</th>
                  <th>In Progress</th>
                  <th>Completed</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan={isSuperAdmin ? 8 : 7} style={styles.empty}>No employees yet.</td></tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id}>
                      <td
                        style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--accent)' }}
                        onClick={() => navigate(`/admin/activity?employeeId=${emp.id}&employeeName=${encodeURIComponent(emp.username)}`)}
                      >
                        {emp.username}
                      </td>
                      {isSuperAdmin && (
                        <td>{emp.adminUsername || <span style={{ color: 'var(--ink-muted)' }}>Unassigned</span>}</td>
                      )}
                      <td className="mono">{emp.assigned}</td>
                      <td className="mono">{emp.pending}</td>
                      <td className="mono">{emp.inProgress}</td>
                      <td className="mono">{emp.completed}</td>
                      <td className="mono" style={{ fontWeight: 700 }}>{emp.total}</td>
                      <td>
                        <button onClick={() => resetPassword(emp)} style={styles.resetBtn}>
                          <KeyRound size={12} style={{ marginRight: 5, verticalAlign: -2 }} />
                          Reset Password
                        </button>
                      </td>
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
  tableWrap: { background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' },
  empty: { textAlign: 'center', color: 'var(--ink-muted)', padding: 32 },
  resetBtn: {
    background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink-primary)',
    padding: '5px 10px', fontSize: 12, fontWeight: 600,
  },
  success: { background: '#ecfdf5', color: '#047857', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  error: { background: '#fef2f2', color: 'var(--danger)', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
}
