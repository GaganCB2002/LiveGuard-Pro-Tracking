import { Moon, Sun, Globe, Bell, Shield, Database } from 'lucide-react'
import { useState } from 'react'

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 divide-y dark:divide-gray-700">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <Sun className="h-5 w-5 text-gray-600" />}
            <div>
              <h3 className="font-medium dark:text-white">Dark Mode</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-medium dark:text-white">Push Notifications</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive real-time alert notifications</p>
            </div>
          </div>
          <button onClick={() => setNotifications(!notifications)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? 'bg-blue-600' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-medium dark:text-white">Language</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred language</p>
            </div>
          </div>
          <select className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-medium dark:text-white">Security</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Two-factor authentication settings</p>
            </div>
          </div>
          <button className="text-blue-600 hover:underline text-sm">Configure</button>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-medium dark:text-white">Data Retention</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage how long data is stored</p>
            </div>
          </div>
          <select className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <option>30 days</option>
            <option>90 days</option>
            <option>1 year</option>
          </select>
        </div>
      </div>
    </div>
  )
}
