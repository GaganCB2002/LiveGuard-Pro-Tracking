import { useEffect, useState } from 'react'
import { Users, Monitor, MapPin, AlertTriangle, Activity, TrendingUp, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuthStore } from '../store/authStore'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/v1/admin/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) setStats(await res.json())
      } catch (err) { console.error(err) }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [token])

  const activityData = [
    { time: '00:00', locations: 12 },
    { time: '04:00', locations: 5 },
    { time: '08:00', locations: 45 },
    { time: '12:00', locations: 78 },
    { time: '16:00', locations: 65 },
    { time: '20:00', locations: 34 },
  ]

  const deviceDistribution = [
    { name: 'Mobile', value: 65 },
    { name: 'Laptop', value: 30 },
    { name: 'Tablet', value: 5 },
  ]

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-500', trend: '+12%' },
    { title: 'Online Devices', value: stats?.onlineDevices || 0, icon: Monitor, color: 'bg-green-500', trend: '+5%' },
    { title: 'Live Locations', value: stats?.todayLocations || 0, icon: MapPin, color: 'bg-purple-500', trend: '+23%' },
    { title: 'Active Alerts', value: stats?.unreadAlerts || 0, icon: AlertTriangle, color: 'bg-red-500', trend: '-8%' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Activity className="h-4 w-4 animate-pulse text-green-500" />Live Updates Active
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="rounded-xl bg-white p-6 shadow-sm border dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{stat.trend}</span>
              <span className="text-gray-400 ml-2">vs last week</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm border dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Location Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={activityData}>
              <defs><linearGradient id="colorLoc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="locations" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLoc)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Device Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={deviceDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {deviceDistribution.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {deviceDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-white shadow-sm border dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700"><h3 className="text-lg font-semibold dark:text-white">Recent Activity</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">User</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Activity</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Device</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {[1,2,3,4,5].map((i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium dark:text-white">User {i}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">Location updated</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">iPhone 15 Pro</td>
                  <td className="px-6 py-4"><span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">Online</span></td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" />2 min ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
