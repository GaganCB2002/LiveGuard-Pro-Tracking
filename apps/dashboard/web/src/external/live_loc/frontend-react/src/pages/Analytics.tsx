import { TrendingUp, Map, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const productivityData = [
  { day: 'Mon', productive: 6.5, idle: 1.5 },
  { day: 'Tue', productive: 7.2, idle: 0.8 },
  { day: 'Wed', productive: 5.8, idle: 2.2 },
  { day: 'Thu', productive: 8.0, idle: 0.5 },
  { day: 'Fri', productive: 6.0, idle: 2.0 },
]

const travelData = [
  { day: 'Mon', distance: 12 },
  { day: 'Tue', distance: 8 },
  { day: 'Wed', distance: 25 },
  { day: 'Thu', distance: 15 },
  { day: 'Fri', distance: 5 },
]

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Productivity</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">87%</p>
          <p className="text-sm text-green-600 mt-1">+5.2% vs last week</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Map className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Distance</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">142 km</p>
          <p className="text-sm text-blue-600 mt-1">This week</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Hours</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">38.5h</p>
          <p className="text-sm text-purple-600 mt-1">Avg 7.7h/day</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Productivity Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="productive" fill="#10b981" name="Productive" />
              <Bar dataKey="idle" fill="#ef4444" name="Idle" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Travel Distance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={travelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="distance" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
