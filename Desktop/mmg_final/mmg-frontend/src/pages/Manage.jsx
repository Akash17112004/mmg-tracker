import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, FolderPlus, ShieldCheck } from 'lucide-react'
import api from '../api/client.js'
import Sidebar from '../components/Sidebar.jsx'
import { getAdminNavItems } from '../adminNav.js'

export default function Manage() {
  const navigate = useNavigate()
  const role = localStorage.getItem('mmg_role')
  const isExecutiveAdmin = ['JS_ADMIN', 'DIRECTOR_ADMIN'].includes(role)
  const [msg, setMsg] = useState('')
  const [admins, setAdmins] = useState([])
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'EMPLOYEE', adminId: '' })
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    if (isExecutiveAdmin) api.get('/superadmin/admins').then((res) => setAdmins(res.data)).catch(() => {})
  }, [isExecutiveAdmin])

  function flash(text) { setMsg(text); setTimeout(() => setMsg(''), 3200) }

  async function addUser(e) {
    e.preventDefault()
    try {
      await api.post('/admin/users', { ...userForm, adminId: userForm.adminId || null })
      flash(`User \"${userForm.username}\" created successfully.`)
      setUserForm({ username: '', password: '', role: 'EMPLOYEE', adminId: '' })
    } catch (err) { flash(err.response?.data?.message || 'Failed to create user.') }
  }

  async function addCategory(e) {
    e.preventDefault()
    try {
      await api.post('/admin/categories', { name: categoryName })
      flash(`Category \"${categoryName}\" created.`)
      setCategoryName('')
    } catch (err) { flash(err.response?.data?.message || 'Failed to create category.') }
  }

  return (
    <div className="app-shell">
      <Sidebar items={getAdminNavItems(navigate)} active="manage" />
      <main className="page-main">
        <div className="page-heading">
          <div><div className="eyebrow">CONTROL CENTRE / ACCESS</div><h1>Manage workspace</h1><p>Provision accounts and keep item categories organised.</p></div>
          <span className="role-chip"><ShieldCheck size={14} /> {isExecutiveAdmin ? 'Executive access' : 'Admin access'}</span>
        </div>
        {msg && <div className="toast-message">{msg}</div>}
        <div className="manage-grid">
          <form onSubmit={addUser} className="surface-card manage-card">
            <div className="card-icon"><UserPlus size={19} /></div>
            <h3>Create user</h3><p className="muted-copy">Add a teammate and assign the right access level.</p>
            <label className="field-label">Username<input placeholder="e.g. akash.tomar" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} required /></label>
            <label className="field-label">Temporary password<input placeholder="Create a secure password" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required minLength={6} /></label>
            <label className="field-label">Role<select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="EMPLOYEE">Employee</option><option value="ADMIN">Admin</option>
              {isExecutiveAdmin && <><option value="JS_ADMIN">JS Admin</option><option value="DIRECTOR_ADMIN">Director Admin</option><option value="OIC_STORE">OIC Store</option><option value="BILLING">Billing</option></>}
            </select></label>
            {isExecutiveAdmin && userForm.role === 'EMPLOYEE' && <label className="field-label">Team owner<select value={userForm.adminId} onChange={(e) => setUserForm({ ...userForm, adminId: e.target.value })}><option value="">Assign later</option>{admins.map((a) => <option key={a.id} value={a.id}>{a.username}</option>)}</select></label>}
            <button type="submit" className="primary-action">Create account <span>↗</span></button>
          </form>

          <form onSubmit={addCategory} className="surface-card manage-card">
            <div className="card-icon card-icon-violet"><FolderPlus size={19} /></div>
            <h3>Create item category</h3><p className="muted-copy">Keep the item-tracking workspace searchable and structured.</p>
            <label className="field-label">Category name<input placeholder="e.g. Equipment" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required /></label>
            <div className="helper-panel"><ShieldCheck size={16} /><span>Store catalogue categories and their custom subfields are managed separately in the Store workspace.</span></div>
            <button type="submit" className="primary-action">Create category <span>↗</span></button>
          </form>
        </div>
      </main>
    </div>
  )
}
