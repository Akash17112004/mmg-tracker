import { LayoutDashboard, Users, Settings2, FileUp, History, Warehouse, Home, ShieldCheck } from 'lucide-react'

export function getAdminNavItems(navigate) {
  return [
    { key: 'overview', label: 'Office overview', icon: Home, onClick: () => navigate('/admin/overview') },
    { key: 'dashboard', label: 'Item status register', icon: LayoutDashboard, onClick: () => navigate('/admin') },
    { key: 'employees', label: 'Personnel directory', icon: Users, onClick: () => navigate('/admin/employees') },
    { key: 'manage', label: 'Access & categories', icon: Settings2, onClick: () => navigate('/admin/manage') },
    { key: 'upload', label: 'Register an item', icon: FileUp, onClick: () => navigate('/admin/upload') },
    { key: 'activity', label: 'Activity & audit trail', icon: History, onClick: () => navigate('/admin/activity') },
    { key: 'store', label: 'Store & ledger', icon: Warehouse, onClick: () => navigate('/store') },
    ...( ['JS_ADMIN', 'DIRECTOR_ADMIN'].includes(localStorage.getItem('mmg_role'))
      ? [{ key: 'superadmin', label: 'Executive control', icon: ShieldCheck, onClick: () => navigate('/admin/superadmin') }]
      : []),
  ]
}
