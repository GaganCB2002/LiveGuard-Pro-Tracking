import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LiveMap from './pages/LiveMap'
import Users from './pages/Users'
import Devices from './pages/Devices'
import Analytics from './pages/Analytics'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import { useAuthStore } from './store/authStore'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  // Bypassed for testing
  return <>{children}</>
}

function App() {
  const { user, setAuth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Automatically set a dummy admin user for testing
    if (!user) {
      setAuth('dummy-token', 'dummy-refresh', {
        id: '1',
        email: 'admin@liveguard.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      })
    }
  }, [user, setAuth])

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<LiveMap />} />
          <Route path="users" element={<Users />} />
          <Route path="devices" element={<Devices />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  )
}
export default App
