import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Map, Users, Monitor, BarChart3, Bell, Settings, LogOut, Menu, X, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/map', icon: Map, label: 'Live Map' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/devices', icon: Monitor, label: 'Devices' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const handleLogout = () => { logout(); navigate('/login') }

  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches))

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleDarkMode = () => setIsDark(!isDark)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 dark:bg-gray-800 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-6 border-b dark:border-gray-700">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">LiveGuard Pro</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="h-6 w-6" /></button>
        </div>
        <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              <item.icon className="h-5 w-5" />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t p-4 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900">
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate dark:text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 truncate dark:text-gray-400">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
            <LogOut className="h-5 w-5" />Logout
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 dark:border-gray-700 dark:bg-gray-800 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" /></button>
          <div className="flex items-center gap-4 ml-auto">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 transition-colors" title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-gray-800 dark:text-white">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6"><Outlet /></main>
      </div>
    </div>
  )
}
