import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, ShieldCheck, LockKeyhole, ClipboardList, FileText, Warehouse, ArrowUpRight, CircleHelp } from 'lucide-react'
import api from '../api/client.js'
import IndiaPulseBackground from '../components/IndiaPulseBackground.jsx'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/auth/login', { username, password })
      const { token, role, username: signedInUsername } = response.data
      localStorage.setItem('mmg_token', token)
      localStorage.setItem('mmg_role', role)
      localStorage.setItem('mmg_username', signedInUsername)
      navigate(
        ['ADMIN', 'JS_ADMIN', 'DIRECTOR_ADMIN'].includes(role) ? '/admin'
          : role === 'OIC_STORE' || role === 'BILLING' || role === 'STORE' ? '/store'
          : '/employee'
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Sign-in failed. Check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-portal">
      <IndiaPulseBackground variant="login" />
      <header className="login-official-header">
        <div className="login-brand-mark"><Landmark size={25} /></div>
        <div className="login-brand-copy"><span>MMG / INTERNAL GOVERNMENT WORKSPACE</span><strong>Office Operations Portal</strong><small>Item tracking · Personnel · Store records</small></div>
        <div className="login-header-status"><ShieldCheck size={16} /><span><strong>Secure access</strong><small>Authorised accounts only</small></span></div>
      </header>

      <main className="login-main-grid">
        <section className="login-welcome-panel">
          <div className="login-eyebrow"><span /> DEPARTMENT SERVICES / AUTHENTICATION</div>
          <h1>One secure workspace for operational records.</h1>
          <p>Track item assignments, maintain supporting documents, review activity history and coordinate Store workflows through a role-based internal workspace.</p>

          <div className="login-capabilities">
            <div className="login-capability"><span><ClipboardList size={17} /></span><div><strong>Item lifecycle register</strong><small>Assignments, status changes and item-level records.</small></div></div>
            <div className="login-capability"><span><FileText size={17} /></span><div><strong>Document control</strong><small>Multiple attachments, individual remarks and access rules.</small></div></div>
            <div className="login-capability"><span><Warehouse size={17} /></span><div><strong>Store and ledger workflows</strong><small>Catalogue, demands, corrections and inventory history.</small></div></div>
          </div>
          <div className="login-classification"><span className="login-classification-dot" /> INTERNAL USE ONLY <span /> MMG OPERATIONS NETWORK</div>
        </section>

        <section className="login-card login-access-card">
          <div className="login-card-icon"><LockKeyhole size={21} /></div>
          <div className="login-eyebrow">ACCOUNT AUTHENTICATION</div>
          <h2>Sign in to continue</h2>
          <p className="login-card-intro">Use the account issued by your system administrator.</p>

          <form onSubmit={handleSubmit} className="login-access-form">
            <label className="login-label">Office username
              <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" autoFocus required placeholder="Enter your username" />
            </label>
            <label className="login-label">Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required placeholder="Enter your password" />
            </label>

            {error && <div className="login-error" role="alert">{error}</div>}

            <button type="submit" disabled={loading} className="login-submit-button">{loading ? 'Authenticating…' : 'Authenticate and enter'} <ArrowUpRight size={16} /></button>
          </form>

          <div className="login-assistance"><CircleHelp size={15} /><span>Need access or a password reset? Contact your system administrator.</span></div>
          <div className="login-security-note"><ShieldCheck size={14} /><span>Your modules and actions are restricted by your assigned role.</span></div>
        </section>
      </main>

      <footer className="login-footer"><span>MMG · Office Operations Portal</span><span>Secure internal application <i /> Role-based access enabled</span></footer>
    </div>
  )
}
