import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
  Building2, ShieldCheck, LogOut, Sun, Moon,
  Contrast, ChevronRight, Menu, X, Landmark, BadgeCheck, Radio
} from 'lucide-react'
import { cycleTheme, getTheme } from '../theme.js'
import IndiaPulseBackground from './IndiaPulseBackground.jsx'

const GROUPS = [
  { title: 'Workspace', keys: ['overview', 'dashboard', 'mine'] },
  { title: 'Office administration', keys: ['employees', 'manage', 'upload'] },
  { title: 'Records & governance', keys: ['activity', 'store', 'demands', 'catalogue', 'corrections', 'superadmin'] },
  { title: 'Account', keys: ['back', 'profile'] },
]

export default function Sidebar({ items = [], active }) {
  const navigate = useNavigate()
  const username = localStorage.getItem('mmg_username') || 'Signed-in user'
  const role = localStorage.getItem('mmg_role') || 'USER'
  const [theme, setTheme] = useState(getTheme())
  const [mobileOpen, setMobileOpen] = useState(false)
  const roleLabel = role === 'DIRECTOR_ADMIN' ? 'Director Admin'
    : role === 'JS_ADMIN' ? 'JS Admin'
      : role === 'OIC_STORE' ? 'OIC Store'
        : role.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())

  const navItems = useMemo(() => {
    const hasExecutiveLink = items.some((item) => item.key === 'superadmin')
    return ['JS_ADMIN', 'DIRECTOR_ADMIN'].includes(role) && !hasExecutiveLink
      ? [...items, { key: 'superadmin', label: 'Executive Control', icon: ShieldCheck, onClick: () => navigate('/admin/superadmin') }]
      : items
  }, [items, role, navigate])

  const groupedItems = GROUPS.map((group) => ({
    ...group,
    items: navItems.filter((item) => group.keys.includes(item.key)),
  })).filter((group) => group.items.length > 0)
  const activeItem = navItems.find((item) => item.key === active)
  const moduleName = activeItem?.label || ({ ledger: 'Store & ledger', demands: 'Store demands', catalogue: 'Store catalogue', corrections: 'Correction requests' }[active] || 'Office workspace')
  const ThemeIcon = theme === 'light' ? Sun : theme === 'contrast' ? Contrast : Moon

  function logout() {
    localStorage.clear()
    navigate('/login', { replace: true })
  }

  function changeTheme() {
    setTheme(cycleTheme())
  }

  function choose(item) {
    if (item.onClick) item.onClick()
    setMobileOpen(false)
  }

  return (
    <>
      <IndiaPulseBackground />
      <header className="gov-topbar">
        <div className="gov-brand-lockup">
          <div className="gov-seal" aria-hidden="true"><Landmark size={25} strokeWidth={1.8} /></div>
          <div className="gov-brand-copy">
            <div className="gov-brand-kicker">MMG <span /> INTERNAL GOVERNMENT WORKSPACE</div>
            <div className="gov-brand-title">Office Operations Portal</div>
            <div className="gov-brand-subtitle">Item tracking · Personnel · Store records</div>
          </div>
        </div>

        <div className="gov-top-actions">
          <div className="gov-secure-status"><ShieldCheck size={15} /><span>SECURE SESSION</span><i /></div>
          <button className="gov-account-button" onClick={() => navigate('/profile')} title="Open account profile">
            <span className="gov-account-avatar">{username[0]?.toUpperCase()}</span>
            <span className="gov-account-copy"><strong>{username}</strong><small>{roleLabel}</small></span>
            <ChevronRight size={15} />
          </button>
          <button className="gov-icon-button gov-mobile-toggle" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle navigation">
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
          <button className="gov-logout-button" onClick={logout}><LogOut size={15} /><span>Sign out</span></button>
        </div>
      </header>

      <div className="gov-subbar">
        <div className="gov-breadcrumb"><Building2 size={14} /><span>OFFICE PORTAL</span><ChevronRight size={13} /><strong>{moduleName}</strong></div>
        <div className="gov-system-state"><Radio size={13} /><span>System status</span><strong><i /> Operational</strong></div>
      </div>

      <aside className={`gov-sidebar${mobileOpen ? ' is-open' : ''}`}>
        <div className="gov-nav-intro">
          <div className="gov-nav-intro-mark"><Landmark size={17} /></div>
          <div><strong>Navigation</strong><span>Operational modules</span></div>
        </div>

        <nav className="gov-nav" aria-label="Primary navigation">
          {groupedItems.map((group) => (
            <section className="gov-nav-group" key={group.title}>
              <div className="gov-nav-group-title">{group.title}</div>
              {group.items.map((item) => {
                const Icon = item.icon || Building2
                const selected = active === item.key
                return (
                  <button
                    type="button"
                    key={item.key}
                    className={`gov-nav-link${selected ? ' is-active' : ''}`}
                    aria-current={selected ? 'page' : undefined}
                    onClick={() => choose(item)}
                  >
                    <span className="gov-nav-icon"><Icon size={16} strokeWidth={selected ? 2.1 : 1.8} /></span>
                    <span className="gov-nav-label">{item.label}</span>
                    {selected && <span className="gov-nav-current" />}
                  </button>
                )
              })}
            </section>
          ))}
        </nav>

        <div className="gov-sidebar-bottom">
          <div className="gov-access-panel">
            <div className="gov-access-icon"><BadgeCheck size={16} /></div>
            <div><span>ACCESS LEVEL</span><strong>{roleLabel}</strong></div>
          </div>
          <button className="gov-theme-button" onClick={changeTheme}>
            <ThemeIcon size={16} />
            <span>Display appearance</span>
            <small>{theme === 'light' ? 'Light' : theme === 'contrast' ? 'Contrast' : 'Dark'}</small>
          </button>
          <div className="gov-sidebar-footnote"><span className="gov-mini-seal"><Landmark size={12} /></span> Internal use only <span className="gov-footnote-dot" /> MMG</div>
        </div>
      </aside>
    </>
  )
}
