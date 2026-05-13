'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import { User, Search, Signal, SignalLow, Satellite, Navigation, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';

// Fix for Leaflet default icon issues in React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Pulse Icon for Live Tracking
const pulseIcon = L.divIcon({
    className: 'custom-pulse-icon',
    html: `<div class="pulse-dot"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

function ChangeView({ center, zoom, active }: { center: [number, number], zoom: number, active: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (!map) return;
        
        // Fix for the "world tiling" glitch
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 500);

        if (active && center && center[0] && center[1]) {
            try {
                map.setView(center, zoom, { animate: true });
            } catch (e) {
                console.warn('Map View Update Error:', e);
            }
        }
        return () => clearTimeout(timer);
    }, [center, zoom, map, active]);
    return null;
}

export default function LiveTrackingMap() {
    const [locations, setLocations] = useState<any[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
    const [searchQuery, setSearchQuery] = useState('');
    const [gpsStatus, setGpsStatus] = useState<'searching' | 'locked' | 'rejected'>('searching');
    const [hasMounted, setHasMounted] = useState(false);
    const [currentTelemetry, setCurrentTelemetry] = useState<any>(null);
    const [autoFollow, setAutoFollow] = useState(true);
    const socketRef = useRef<any>(null);

    useEffect(() => {
        setHasMounted(true);
        
        const socket = io('http://localhost:4000', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000
        });
        socketRef.current = socket;

        socket.on('location_update', (data) => {
            if (!data.latitude || !data.longitude) return;

            // Strict Filter: 
            // < 5.0km (5000m) = ACCEPTED (Wider region for Network-based)
            if (data.accuracy > 5000 && !data.deviceId.startsWith('LOCAL')) {
                setGpsStatus('rejected');
                return;
            }

            setGpsStatus('locked');
            setLocations(prev => {
                const index = prev.findIndex(l => l.deviceId === data.deviceId);
                if (index > -1) {
                    const newLocs = [...prev];
                    newLocs[index] = data;
                    return newLocs;
                }
                return [...prev, data];
            });
            
            if (!currentTelemetry) setCurrentTelemetry(data);
        });

        if (typeof window !== 'undefined' && navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    
                    const payload = {
                        deviceId: 'LOCAL-BROWSER-' + (window.localStorage.getItem('deviceId') || 'USER'),
                        employeeId: 'System User (Browser)',
                        latitude,
                        longitude,
                        accuracy,
                        timestamp: new Date().toISOString()
                    };

                    setGpsStatus('locked');
                    setLocations(prev => {
                        const index = prev.findIndex(l => l.deviceId === payload.deviceId);
                        if (index > -1) {
                            const newLocs = [...prev];
                            newLocs[index] = payload;
                            return newLocs;
                        }
                        return [...prev, payload];
                    });
                    
                    if (!currentTelemetry) setCurrentTelemetry(payload);

                    fetch('http://localhost:4000/api/telemetry/location', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }).catch(() => {}); 
                },
                (err) => console.warn('Chrome Geo Error:', err.message),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
            return () => {
                navigator.geolocation.clearWatch(watchId);
                socket.disconnect();
            };
        }

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        const found = locations.find(l => 
            l.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) || 
            l.deviceId.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (found) {
            setSelectedDeviceId(found.deviceId);
            setCurrentTelemetry(found);
            setAutoFollow(true);
        }
    };

    if (!hasMounted) return <div style={{ height: '100%', width: '100%', background: '#09090b' }} />;

    const selectedLocation = locations.find(l => l.deviceId === selectedDeviceId) || currentTelemetry;

    const mapTiles = mapType === 'street' 
        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

    return (
        <div style={{ display: 'flex', height: '100%', width: '100%', background: '#09090b', borderRadius: '24px', overflow: 'hidden', border: '1px solid #18181b' }}>
            {/* Left Sidebar */}
            <div style={{ width: '320px', padding: '2rem', borderRight: '1px solid #18181b', display: 'flex', flexDirection: 'column', gap: '2rem', background: '#0c0c0e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Fleet Tracking</h3>
                        <p style={{ fontSize: '0.7rem', color: '#71717a', margin: '4px 0 0 0' }}>Network-Assisted Location</p>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', padding: '4px 10px', border: '1px solid #10b981', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', fontWeight: 700 }}>
                        {locations.length} ACTIVE
                    </div>
                </div>

                <div className="hide-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
                    {locations.map(loc => (
                        <div 
                            key={loc.deviceId}
                            onClick={() => {
                                setSelectedDeviceId(loc.deviceId);
                                setAutoFollow(true);
                            }}
                            style={{ 
                                padding: '1rem', 
                                background: selectedDeviceId === loc.deviceId ? 'rgba(59, 130, 246, 0.1)' : '#161618', 
                                borderRadius: '14px', 
                                border: `1px solid ${selectedDeviceId === loc.deviceId ? '#3b82f6' : '#27272a'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: selectedDeviceId === loc.deviceId ? 'scale(1.02)' : 'scale(1)'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: selectedDeviceId === loc.deviceId ? '#3b82f6' : '#1f1f23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={18} color={selectedDeviceId === loc.deviceId ? '#fff' : '#71717a'} />
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loc.employeeId}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#3b82f6', opacity: 0.8 }}>Signal: {Math.round(loc.accuracy || 0)}m</div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {locations.length === 0 && (
                        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#3f3f46', background: '#0c0c0e', borderRadius: '16px', border: '1px dashed #27272a' }}>
                            <Signal size={32} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Scanning for Signals...</div>
                            <div style={{ fontSize: '0.7rem', marginTop: '8px', color: '#52525b', lineHeight: 1.4 }}>Connecting to nearest network nodes and hardware GPS</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div style={{ flex: 1, position: 'relative' }}>
                <MapContainer 
                    center={[14.4677, 75.9218]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                    zoomControl={false}
                >
                    <ZoomControl position="bottomright" />
                    <TileLayer url={mapTiles} attribution={mapType === 'street' ? '&copy; OpenStreetMap' : 'Esri, DigitalGlobe, GeoEye'} />
                    
                    {locations.map(loc => (
                        <React.Fragment key={loc.deviceId}>
                            {loc.latitude && loc.longitude && (
                                <Marker position={[loc.latitude, loc.longitude]} icon={pulseIcon}>
                                    <Popup className="custom-popup">
                                        <div style={{ padding: '12px', minWidth: '180px' }}>
                                            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px', color: '#fff' }}>{loc.employeeId}</div>
                                            <div style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 600 }}>Net: {loc.network || 'Ethernet/LTE'}</div>
                                            <div style={{ color: '#71717a', fontSize: '0.7rem', marginTop: '4px' }}>Accuracy: ±{Math.round(loc.accuracy)}m</div>
                                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #27272a', fontSize: '0.7rem', color: '#71717a' }}>
                                                Last Packet: {new Date(loc.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                            {selectedDeviceId === loc.deviceId && loc.latitude && loc.longitude && (
                                <Circle 
                                    center={[loc.latitude, loc.longitude]} 
                                    radius={Math.min(loc.accuracy || 10, 500)} 
                                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 1, dashArray: '5, 10' }} 
                                />
                            )}
                        </React.Fragment>
                    ))}

                    {selectedLocation && selectedLocation.latitude && selectedLocation.longitude && (
                        <ChangeView 
                            center={[selectedLocation.latitude, selectedLocation.longitude]} 
                            zoom={18} 
                            active={autoFollow}
                        />
                    )}
                </MapContainer>

                {/* Top Controls Overlay */}
                <div style={{ position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '90%', display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, background: 'rgba(12, 12, 14, 0.85)', backdropFilter: 'blur(16px)', borderRadius: '16px', display: 'flex', alignItems: 'center', padding: '0 1.25rem', border: '1px solid #27272a', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
                        <Search size={18} color="#71717a" />
                        <input 
                            placeholder="Search employee or device node..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            style={{ background: 'transparent', border: 'none', padding: '0.85rem', color: '#fff', width: '100%', outline: 'none', fontSize: '0.9rem' }} 
                        />
                    </div>
                    
                    <div style={{ display: 'flex', background: 'rgba(12, 12, 14, 0.85)', backdropFilter: 'blur(16px)', borderRadius: '16px', padding: '6px', border: '1px solid #27272a', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', gap: '6px' }}>
                        <button 
                            onClick={() => setAutoFollow(!autoFollow)} 
                            title={autoFollow ? "Disable Auto-Follow" : "Enable Auto-Follow"}
                            style={{ 
                                padding: '0.5rem', 
                                background: autoFollow ? '#3b82f6' : 'transparent', 
                                color: autoFollow ? '#fff' : '#71717a', 
                                border: 'none', 
                                borderRadius: '10px', 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Crosshair size={18} />
                        </button>
                        <div style={{ width: '1px', background: '#27272a', margin: '4px 0' }}></div>
                        <button onClick={() => setMapType('street')} style={{ padding: '0.5rem 1rem', background: mapType === 'street' ? '#3b82f6' : 'transparent', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>STREET</button>
                        <button onClick={() => setMapType('satellite')} style={{ padding: '0.5rem 1rem', background: mapType === 'satellite' ? '#3b82f6' : 'transparent', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>SATELLITE</button>
                    </div>
                </div>

                {/* Manual Zoom Legend */}
                <div style={{ position: 'absolute', bottom: '30px', left: '30px', zIndex: 1000, background: 'rgba(12, 12, 14, 0.8)', backdropFilter: 'blur(12px)', padding: '12px 16px', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Navigation size={14} color="#3b82f6" />
                    <span>Scroll to Zoom • Drag to Pan</span>
                    {!autoFollow && <span style={{ color: '#f59e0b', fontWeight: 700 }}>• MANUAL MODE</span>}
                </div>
            </div>

            <style jsx global>{`
                .custom-pulse-icon { display: flex; align-items: center; justify-content: center; }
                .pulse-dot { width: 14px; height: 14px; background: #3b82f6; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0% { transform: scale(0.9); opacity: 1; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.8); } 70% { transform: scale(1.2); opacity: 0.6; box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } 100% { transform: scale(0.9); opacity: 1; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
                .custom-popup .leaflet-popup-content-wrapper { background: #0c0c0e; color: #fff; border-radius: 14px; border: 1px solid #27272a; padding: 0; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8); }
                .custom-popup .leaflet-popup-tip { background: #0c0c0e; border: 1px solid #27272a; }
                .leaflet-container { background: #09090b !important; }
                .leaflet-bar { border: 1px solid #27272a !important; border-radius: 10px !important; overflow: hidden; background: #0c0c0e !important; }
                .leaflet-bar a { background: #0c0c0e !important; color: #fff !important; border-bottom: 1px solid #27272a !important; }
                .leaflet-bar a:hover { background: #1f1f23 !important; }
                
                /* Hide Scrollbars Globally */
                * {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                *::-webkit-scrollbar {
                    display: none;
                }
                body {
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}
