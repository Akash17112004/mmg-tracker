import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Employees from './pages/Employees.jsx'
import Manage from './pages/Manage.jsx'
import EmployeeDashboard from './pages/EmployeeDashboard.jsx'
import UploadItem from './pages/UploadItem.jsx'
import Profile from './pages/Profile.jsx'
import Activity from './pages/Activity.jsx'
import Store from './pages/Store.jsx'
import Overview from './pages/Overview.jsx'
import SuperAdmin from './pages/SuperAdmin.jsx'

function getRole() {
  return localStorage.getItem('mmg_role')
}

function ProtectedRoute({ allow, children }) {
  const token = localStorage.getItem('mmg_token')
  const role = getRole()
  if (!token) return <Navigate to="/login" replace />
  if (allow && !allow.includes(role)) return <Navigate to="/login" replace />
  return children
}

function RoleRedirect() {
  const role = getRole()
  if (['ADMIN', 'JS_ADMIN', 'DIRECTOR_ADMIN'].includes(role)) return <Navigate to="/admin" replace />
  if (role === 'EMPLOYEE') return <Navigate to="/employee" replace />
  if (role === 'OIC_STORE' || role === 'BILLING') return <Navigate to="/store" replace />
  if (role === 'STORE') return <Navigate to="/store" replace />
  return <Navigate to="/login" replace />
}

const ADMIN_ROLES = ['ADMIN', 'JS_ADMIN', 'DIRECTOR_ADMIN']

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RoleRedirect />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={ADMIN_ROLES}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/overview"
          element={
            <ProtectedRoute allow={ADMIN_ROLES}>
              <Overview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute allow={ADMIN_ROLES}>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage"
          element={
            <ProtectedRoute allow={ADMIN_ROLES}>
              <Manage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/upload"
          element={
            <ProtectedRoute allow={ADMIN_ROLES}>
              <UploadItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <ProtectedRoute allow={ADMIN_ROLES}>
              <Activity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/superadmin"
          element={
            <ProtectedRoute allow={['JS_ADMIN', 'DIRECTOR_ADMIN']}>
              <SuperAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <ProtectedRoute allow={['EMPLOYEE']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/activity"
          element={
            <ProtectedRoute allow={['EMPLOYEE']}>
              <Activity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store"
          element={
            <ProtectedRoute allow={['OIC_STORE', 'BILLING', 'STORE', ...ADMIN_ROLES]}>
              <Store />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allow={[...ADMIN_ROLES, 'EMPLOYEE', 'OIC_STORE', 'BILLING', 'STORE']}>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
