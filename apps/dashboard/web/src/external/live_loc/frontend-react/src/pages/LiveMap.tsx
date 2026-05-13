import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Play, Pause, RotateCcw, Navigation, FileDown, MapPin, Search } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const onlineIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16], iconAnchor: [8, 8]
})

const offlineIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16], iconAnchor: [8, 8]
})

function MapController({ center, zoom }: { center: [number, number], zoom?: number }) {
  const map = useMap()
  useEffect(() => { 
    if (center) {
      map.flyTo(center, zoom || map.getZoom(), {
        duration: 1.5,
        easeLinearity: 0.25
      })
    }
  }, [center, zoom, map])
  return null
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function LiveMap() {
  const [userLocations, setUserLocations] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [routeHistory, setRouteHistory] = useState<any[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackIndex, setPlaybackIndex] = useState(0)
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090])
  const [mapZoom, setMapZoom] = useState(13)
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street')
  const [searchQuery, setSearchQuery] = useState('')
  const [geofenceCenter] = useState<[number, number]>([28.6139, 77.2090])
  const [hasNotifiedBreach, setHasNotifiedBreach] = useState(false)
  const playbackRef = useRef<any>(null)
  const token = useAuthStore((state) => state.token)
  const toastIdRef = useRef<string | null>(null)

  const [realCoords, setRealCoords] = useState<[number, number] | null>(null)

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setRealCoords([position.coords.latitude, position.coords.longitude])
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      )
      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  useEffect(() => {
    const fetchLocations = async () => {
      const currentLat = realCoords ? realCoords[0] : 28.6139;
      const currentLng = realCoords ? realCoords[1] : 77.2090;
      
      // Get real network type
      let networkType = 'WiFi';
      if ((navigator as any).connection) {
        const conn = (navigator as any).connection;
        networkType = conn.type === 'wifi' ? 'WiFi' : (conn.effectiveType || 'Cellular');
      }

      // FETCH REAL IP ADDRESS (IPv4 and IPv6)
      let publicIp = 'Detecting...';
      try {
        const ipRes = await fetch('https://api64.ipify.org?format=json');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          publicIp = ipData.ip; // This service returns IPv6 if available, else IPv4
        }
      } catch (e) { console.error("IP fetch failed", e); }

      // FETCH REAL ADDRESS from Nominatim (Reverse Geocoding)
      let actualAddress = 'Detecting address...';
      if (realCoords) {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLng}`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            actualAddress = geoData.display_name;
          }
        } catch (e) { console.error("Geocoding failed", e); }
      }

      try {
        const res = await fetch('http://localhost:8080/api/v1/gps/users/live', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUserLocations(data)
          if (data.length > 0) setMapCenter([data[0].latitude, data[0].longitude])
        } else {
          throw new Error('Backend unavailable')
        }
      } catch (err) {
        const mockData = [
          {
            userId: '1',
            deviceId: 'dev-1',
            firstName: 'Gagan',
            lastName: 'CB',
            latitude: currentLat,
            longitude: currentLng,
            address: actualAddress,
            ipAddress: publicIp,
            speed: 0,
            batteryLevel: 98,
            networkType: networkType,
            isOnline: true,
          },
          {
            userId: '2',
            deviceId: 'dev-2',
            firstName: 'John',
            lastName: 'Doe',
            latitude: currentLat + 0.005,
            longitude: currentLng + 0.005,
            address: 'Nearby Area',
            ipAddress: '192.168.1.45',
            speed: 12.5,
            batteryLevel: 42,
            networkType: 'Cellular (5G)',
            isOnline: true,
          },
          {
            userId: '3',
            deviceId: 'dev-3',
            firstName: 'Sarah',
            lastName: 'Wilson',
            latitude: currentLat - 0.008,
            longitude: currentLng + 0.012,
            address: 'Nearby Area',
            ipAddress: '172.16.0.12',
            speed: 0,
            batteryLevel: 76,
            networkType: 'WiFi (Home)',
            isOnline: true,
          }
        ]
        setUserLocations(mockData)

        // Abnormal Activity Detection
        const distance = calculateDistance(currentLat, currentLng, geofenceCenter[0], geofenceCenter[1]);
        const speed = mockData[0].speed;
        const battery = mockData[0].batteryLevel;

        import('react-hot-toast').then(({ toast }) => {
          // 1. Only notify Geofence Breach if MOVING (speed > 0)
          if (distance > 500 && speed > 0 && !hasNotifiedBreach) {
             toast.error('ABNORMAL ACTIVITY: Gagan CB moved out of safety zone!', { id: 'breach' });
             setHasNotifiedBreach(true);
          } else if (distance <= 500) {
            setHasNotifiedBreach(false);
          }

          // 2. Abnormal Battery Drain
          if (battery < 15) {
            toast.error('CRITICAL: Device Battery Low (15%)', { id: 'battery' });
          }

          // 3. Excessive Speed Alert
          if (speed > 100) {
            toast.error('ALERT: High Speed Detected (>100 km/h)', { id: 'speed' });
          }
        });

        if (realCoords && userLocations.length === 0) {
          setMapCenter(realCoords)
          setMapZoom(16)
        }
      }
    }
    fetchLocations()
    const interval = setInterval(fetchLocations, 3000)
    return () => clearInterval(interval)
  }, [token, realCoords])

  const fetchRouteHistory = useCallback(async (userId: string) => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    try {
      const res = await fetch(`http://localhost:8080/api/v1/gps/route/${userId}?from=${yesterday.toISOString()}&to=${now.toISOString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setRouteHistory(data.map((p: any) => ({ lat: p.latitude, lng: p.longitude, speed: p.speed || 0, time: p.recordedAt })))
        setPlaybackIndex(0); setIsPlaying(false)
      } else {
        throw new Error('Backend unavailable')
      }
    } catch (err) {
      // Mock History for Demonstration
      const mockHistory = Array.from({ length: 20 }, (_, i) => ({
        lat: 28.6139 + i * 0.001,
        lng: 77.2090 + i * 0.001,
        speed: 10 + Math.random() * 30,
        time: new Date(now.getTime() - (20 - i) * 60000).toISOString()
      }))
      setRouteHistory(mockHistory)
      setPlaybackIndex(0)
      setIsPlaying(false)
    }
  }, [token])

  const startPlayback = useCallback(() => {
    if (playbackRef.current) clearInterval(playbackRef.current)
    setIsPlaying(true)
    playbackRef.current = setInterval(() => {
      setPlaybackIndex((prev) => {
        if (prev >= routeHistory.length - 1) { setIsPlaying(false); return prev }
        return prev + 1
      })
    }, 500)
  }, [routeHistory.length])

  const pausePlayback = useCallback(() => { setIsPlaying(false); if (playbackRef.current) clearInterval(playbackRef.current) }, [])
  const resetPlayback = useCallback(() => { pausePlayback(); setPlaybackIndex(0) }, [pausePlayback])

  const currentPlaybackPoint = routeHistory[playbackIndex]

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('LiveGuard Pro - Location Report', 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)

    const tableData = userLocations.map(user => [
      `${user.firstName} ${user.lastName}`,
      user.address || 'Unknown',
      user.ipAddress || 'Detecting...',
      user.networkType || 'WiFi',
      `${user.batteryLevel}%`,
      user.isOnline ? 'Online' : 'Offline'
    ])

    autoTable(doc, {
      startY: 40,
      head: [['Employee', 'Current Address', 'IP Address', 'Network', 'Battery', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    })

    doc.save(`LiveGuard_Report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setMapCenter([parseFloat(lat), parseFloat(lon)])
        setMapZoom(16)
      } else {
        import('react-hot-toast').then(({ toast }) => toast.error('Location not found'))
      }
    } catch (err) { console.error(err) }
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4">
      <div className="w-80 bg-white rounded-xl shadow-sm border dark:bg-gray-800 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold dark:text-white">Active Users</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{userLocations.filter((u) => u.isOnline).length} online</p>
          </div>
          <button onClick={downloadPDF} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300" title="Download Report">
            <FileDown className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-2">
          {userLocations.map((user) => (
            <button key={user.deviceId} onClick={() => { 
                setSelectedUser(user.userId); 
                setMapCenter([user.latitude, user.longitude]); 
                setMapZoom(18); // Zoom in on click
                fetchRouteHistory(user.userId) 
              }}
              className={`w-full text-left p-3 rounded-lg transition-colors border dark:border-gray-700 ${selectedUser === user.userId ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm dark:text-white truncate">{user.firstName} {user.lastName}</p>
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{user.address || 'Detecting...'}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {user.speed > 0 ? `${user.speed.toFixed(1)} km/h` : 'Stationary'} • {user.networkType || 'WiFi'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Battery {user.batteryLevel}%</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {routeHistory.length > 0 && (
          <div className="p-4 border-t dark:border-gray-700 space-y-3">
            <h3 className="text-sm font-medium dark:text-white">Route Playback</h3>
            <div className="flex items-center gap-2">
              <button onClick={isPlaying ? pausePlayback : startPlayback} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button onClick={resetPlayback} className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"><RotateCcw className="h-4 w-4" /></button>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{playbackIndex + 1} / {routeHistory.length}</span>
            </div>
            <input type="range" min={0} max={routeHistory.length - 1} value={playbackIndex} onChange={(e) => setPlaybackIndex(Number(e.target.value))} className="w-full" />
          </div>
        )}
      </div>
      <div className="flex-1 rounded-xl overflow-hidden shadow-sm border dark:border-gray-700 relative">
        {/* Google Map Style Filters */}
        <div className="absolute top-4 left-14 z-[1000] flex gap-2">
          <form onSubmit={handleAddressSearch} className="flex shadow-lg rounded-lg overflow-hidden border dark:border-gray-700 bg-white dark:bg-gray-800">
            <input 
              type="text" 
              placeholder="Search location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 w-64 outline-none text-sm dark:bg-gray-800 dark:text-white"
            />
            <button type="submit" className="px-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              <Search className="h-4 w-4" />
            </button>
          </form>
          <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 overflow-hidden">
            <button 
              onClick={() => setMapStyle('street')}
              className={`px-3 py-2 text-xs font-bold uppercase transition-colors ${mapStyle === 'street' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
            >
              Street
            </button>
            <button 
              onClick={() => setMapStyle('satellite')}
              className={`px-3 py-2 text-xs font-bold uppercase transition-colors ${mapStyle === 'satellite' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
            >
              Satellite
            </button>
          </div>
        </div>

        <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full">
          {mapStyle === 'street' ? (
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          ) : (
            <TileLayer 
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community' 
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
            />
          )}
          <MapController center={mapCenter} zoom={mapZoom} />
          {/* 500m Geofence Visualization */}
          <Circle 
            center={geofenceCenter} 
            radius={500} 
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 2, dashArray: '5, 10' }} 
          />
          {userLocations.map((user) => (
            <Marker key={user.deviceId} position={[user.latitude, user.longitude]} icon={user.isOnline ? onlineIcon : offlineIcon}>
              <Popup>
                <div className="p-2 space-y-1">
                  <h3 className="font-semibold text-base">{user.firstName} {user.lastName}</h3>
                  <div className="flex items-start gap-1 text-xs text-gray-600 bg-gray-50 p-1.5 rounded">
                    <MapPin className="h-3 w-3 mt-0.5 text-blue-600" />
                    <span>{user.address || 'Address lookup...'}</span>
                  </div>
                  <p className="text-xs text-gray-600 italic">{user.latitude.toFixed(4)}, {user.longitude.toFixed(4)}</p>
                  <div className="pt-1 space-y-0.5">
                    <p className="text-xs text-gray-600">Status: <span className="font-medium text-green-600">{user.isOnline ? 'Online' : 'Offline'}</span></p>
                    <p className="text-xs text-gray-600">Network: <span className="font-medium">{user.networkType || 'WiFi'}</span></p>
                    <p className="text-xs text-gray-600">IP Address: <span className="font-medium font-mono">{user.ipAddress || '0.0.0.0'}</span></p>
                    <p className="text-xs text-gray-600">Battery: <span className="font-medium">{user.batteryLevel}%</span></p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          {routeHistory.length > 0 && (
            <>
              <Polyline positions={routeHistory.map((p) => [p.lat, p.lng])} color="#3b82f6" weight={3} opacity={0.7} />
              {currentPlaybackPoint && <Circle center={[currentPlaybackPoint.lat, currentPlaybackPoint.lng]} radius={50} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.5 }} />}
            </>
          )}
        </MapContainer>
        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
          <button onClick={() => { if (userLocations.length > 0) setMapCenter([userLocations[0].latitude, userLocations[0].longitude]) }} className="p-2 rounded-lg shadow-lg bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300" title="Center"><Navigation className="h-5 w-5" /></button>
        </div>
      </div>
    </div>
  )
}
