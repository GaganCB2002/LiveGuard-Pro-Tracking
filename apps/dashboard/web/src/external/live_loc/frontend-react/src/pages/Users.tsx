import { useEffect, useState } from 'react'
import { Search, Filter, MoreVertical, Shield, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [publicIp, setPublicIp] = useState('Detecting...')
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    fetch('https://api64.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setPublicIp(data.ip))
      .catch(() => setPublicIp('0.0.0.0'))
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/v1/admin/users?page=0&size=20', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUsers(data.content || [])
        } else {
          throw new Error('Backend unavailable')
        }
      } catch (err) {
        // Mock User Data with real IP and Device info
        setUsers([
          {
            id: '1',
            firstName: 'Gagan',
            lastName: 'CB',
            email: 'admin@liveguard.com',
            role: 'ADMIN',
            isActive: true,
            lastLoginAt: new Date().toISOString(),
            deviceName: 'Gagan-Laptop-X1',
            ipAddress: publicIp
          },
          {
            id: '2',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@liveguard.com',
            role: 'MANAGER',
            isActive: true,
            lastLoginAt: new Date().toISOString(),
            deviceName: 'ThinkPad-Pro',
            ipAddress: '192.168.1.45'
          },
          {
            id: '3',
            firstName: 'Sarah',
            lastName: 'Wilson',
            email: 'sarah.w@liveguard.com',
            role: 'USER',
            isActive: true,
            lastLoginAt: new Date().toISOString(),
            deviceName: 'Dell-Latitude-5420',
            ipAddress: '172.16.0.12'
          }
        ])
      }
    }
    fetchUsers()
  }, [token, publicIp])

  const filtered = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Systems</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">Add Employee</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
        <div className="p-4 border-b dark:border-gray-700 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search employees or devices..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            <Filter className="h-4 w-4" />Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actual IP Address</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900 ring-2 ring-white dark:ring-gray-800">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-base tracking-tight">{user.ipAddress || '0.0.0.0'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {user.role === 'ADMIN' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}{user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-6 py-4"><button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><MoreVertical className="h-5 w-5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
