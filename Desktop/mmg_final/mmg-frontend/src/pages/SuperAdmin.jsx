import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import Sidebar from '../components/Sidebar.jsx'
import { getAdminNavItems } from '../adminNav.js'

export default function SuperAdmin() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)

  function load() {
    Promise.all([
      api.get('/admin/employees'),
      api.get('/superadmin/admins'),
    ]).then(([empRes, adminRes]) => {
      setEmployees(empRes.data)
      setAdmins(adminRes.data)
      setLoading(false)
    })
  }

  useEffect(load, [])

  async function reassign(employeeId, adminId) {
    try {
      await api.post(`/superadmin/employees/${employeeId}/assign-admin`, {
        adminId: adminId ? Number(adminId) : null,
      })
      setMsg({ type: 'success', text: 'Employee reassigned.' })
      load()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reassign.' })
    }
    setTimeout(() => setMsg(null), 2500)
  }

  const navItems = getAdminNavItems(navigate)

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={navItems} active="superadmin" />

      <main style={styles.main}>
        <h1 style={{ marginBottom: 8 }}>Executive Admin · Team Ownership</h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: 13, marginBottom: 24 }}>
          Assign each employee to the admin whose team they belong to. Unassigned employees appear on every admin's dashboard until assigned.
        </p>

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
                  <th>Employee</th>
                  <th>Total Tasks</th>
                  <th>Owning Admin</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan={3} style={styles.empty}>No employees yet.</td></tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: 600 }}>{emp.username}</td>
                      <td className="mono">{emp.total}</td>
                      <td>
                        <select
                          defaultValue={admins.find((a) => a.username === emp.adminUsername)?.id || ''}
                          onChange={(e) => reassign(emp.id, e.target.value)}
                          style={styles.select}
                        >
                          <option value="">Unassigned</option>
                          {admins.map((a) => (
                            <option key={a.id} value={a.id}>{a.username}</option>
                          ))}
                        </select>
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
  tableWrap: { background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' },
  empty: { textAlign: 'center', color: 'var(--ink-muted)', padding: 32 },
  select: { fontSize: 13, padding: '6px 8px' },
  success: { background: '#ecfdf5', color: '#047857', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  error: { background: '#fef2f2', color: 'var(--danger)', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
}
