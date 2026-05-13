import { AlertTriangle, CheckCircle, Filter, Bell } from 'lucide-react'
import { useState } from 'react'

const alerts = [
  { id: 1, type: 'GEOFENCE', severity: 'HIGH', title: 'Geofence Violation', message: 'User John Doe exited authorized zone', time: '5 min ago', read: false },
  { id: 2, type: 'DEVICE', severity: 'MEDIUM', title: 'Device Offline', message: 'iPhone 15 Pro has been offline for 30 minutes', time: '15 min ago', read: false },
  { id: 3, type: 'BATTERY', severity: 'LOW', title: 'Low Battery', message: 'MacBook Pro battery below 20%', time: '1 hour ago', read: true },
  { id: 4, type: 'SOS', severity: 'CRITICAL', title: 'SOS Alert', message: 'Emergency button pressed by Jane Smith', time: '2 hours ago', read: true },
]

export default function Alerts() {
  const [filter, setFilter] = useState('ALL')
  const filtered = filter === 'ALL' ? alerts : alerts.filter((a) => a.severity === filter)

  const severityColors: any = {
    LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <option value="ALL">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 divide-y dark:divide-gray-700">
        {filtered.map((alert) => (
          <div key={alert.id} className={`p-6 flex items-start gap-4 ${!alert.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
            <div className={`p-2 rounded-lg ${severityColors[alert.severity]}`}>
              {alert.type === 'SOS' ? <Bell className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold dark:text-white">{alert.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColors[alert.severity]}`}>{alert.severity}</span>
                {!alert.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
              <p className="text-xs text-gray-400 mt-2">{alert.time}</p>
            </div>
            {!alert.read && (
              <button className="text-gray-400 hover:text-green-600">
                <CheckCircle className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
