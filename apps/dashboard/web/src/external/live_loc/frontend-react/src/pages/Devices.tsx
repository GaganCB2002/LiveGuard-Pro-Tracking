import { useEffect, useState } from 'react'
import { Monitor, Smartphone, Tablet, Wifi, WifiOff, Battery, BatteryWarning, Globe } from 'lucide-react'

export default function Devices() {
  const [networkInfo, setNetworkInfo] = useState({ type: 'Detecting...', effectiveType: '' })
  const [deviceName, setDeviceName] = useState('Detecting...')

  useEffect(() => {
    // Get real network type
    const updateNetwork = () => {
      if ((navigator as any).connection) {
        const conn = (navigator as any).connection
        setNetworkInfo({
          type: conn.type === 'wifi' ? 'WiFi' : 'Cellular',
          effectiveType: conn.effectiveType || ''
        })
      } else {
        setNetworkInfo({ type: 'Unknown', effectiveType: '' })
      }
    }

    updateNetwork()
    // Simulated device name (since browser can't get actual OS hostname easily)
    setDeviceName(window.navigator.platform + ' System')

    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateNetwork)
    }
    return () => {
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', updateNetwork)
      }
    }
  }, [])

  const devices = [
    { id: 1, name: deviceName, type: 'LAPTOP', user: 'Admin User (Current)', status: 'online', battery: 98, lastSeen: 'Active Now', network: networkInfo.type, speed: networkInfo.effectiveType },
    { id: 2, name: 'iPhone 15 Pro', type: 'MOBILE', user: 'John Doe', status: 'online', battery: 42, lastSeen: 'Just now', network: 'Cellular (5G)', speed: '5g' },
    { id: 3, name: 'Dell-Latitude-5420', type: 'LAPTOP', user: 'Sarah Wilson', status: 'offline', battery: 12, lastSeen: '2 hours ago', network: 'None', speed: '' },
  ]

  const getIcon = (type: string) => {
    if (type === 'LAPTOP') return Monitor
    if (type === 'MOBILE') return Smartphone
    return Tablet
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Fleet</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider dark:bg-green-900/30 dark:text-green-400">
          <Globe className="h-3.5 w-3.5" />
          Live Monitoring Active
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => {
          const Icon = getIcon(device.type)
          return (
            <div key={device.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{device.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{device.user}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {device.status === 'online' ? (
                    <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-lg text-[10px] font-bold uppercase dark:bg-green-900/20 dark:text-green-400">
                      <Wifi className="h-3.5 w-3.5 animate-pulse" />
                      {device.network}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-400 bg-gray-100 px-2 py-1 rounded-lg text-[10px] font-bold uppercase dark:bg-gray-700 dark:text-gray-400">
                      <WifiOff className="h-3.5 w-3.5" />
                      Offline
                    </div>
                  )}
                  {device.speed && (
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{device.speed}</span>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    {device.battery < 20 ? (
                      <BatteryWarning className="h-4 w-4 text-red-500" />
                    ) : (
                      <Battery className={`h-4 w-4 ${device.battery > 80 ? 'text-green-500' : 'text-gray-400'}`} />
                    )}
                    <span className="font-bold text-gray-700 dark:text-gray-300">{device.battery}%</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{device.lastSeen}</span>
                </div>
                
                <button className="text-[10px] font-bold text-blue-600 uppercase hover:underline dark:text-blue-400">
                  Manage Device
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
