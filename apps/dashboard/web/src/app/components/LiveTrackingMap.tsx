'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import { User, Search, Signal, Satellite, Navigation, Crosshair, MapPin, Globe, RefreshCcw, ShieldCheck } from 'lucide-react';

// Fix for Leaflet default icon issues in React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const pulseIcon = L.divIcon({
    className: 'custom-pulse-icon',
    html: `<div class="pulse-dot-container">
            <div class="pulse-ring"></div>
            <div class="pulse-dot-core"></div>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

function MapController({ center, zoom, active }: { center: [number, number], zoom: number, active: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (!map || !active || !center || !center[0] || !center[1]) return;
        map.setView(center, zoom, { animate: true, duration: 1.5 });
    }, [center, zoom, map, active]);
    return null;
}

export default function LiveTrackingMap() {
    const [locations, setLocations] = useState<any[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
    const [searchQuery, setSearchQuery] = useState('');
    const [autoFollow, setAutoFollow] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const socketRef = useRef<any>(null);

    useEffect(() => {
        setHasMounted(true);
        
        // Initial Fetch of all live nodes
        const fetchInitialNodes = async () => {
            try {
                const res = await fetch('http://localhost:4000/api/tracking/live');
                if (res.ok) {
                    const data = await res.json();
                    setLocations(data);
                }
            } catch (e) {
                console.error("Failed to fetch initial nodes", e);
            }
        };
        fetchInitialNodes();

        const socket = io('http://localhost:4000', {
            transports: ['websocket', 'polling'],
            reconnection: true
        });
        socketRef.current = socket;

        socket.on('location_update', (data) => {
            if (!data.latitude || !data.longitude) return;
            
            // CRITICAL: Block Santa Clara Mock data explicitly
            if (data.latitude > 37.3 && data.latitude < 37.4 && data.longitude < -121.9 && data.longitude > -122.0) {
                if (!data.deviceId.includes('DASHBOARD')) return; 
            }

            setLocations(prev => {
                const index = prev.findIndex(l => l.deviceId === data.deviceId);
                if (index > -1) {
                    const updated = [...prev];
                    updated[index] = data;
                    return updated;
                } else {
                    return [...prev, data];
                }
            });
            
            if (autoFollow && (!selectedDeviceId || selectedDeviceId === data.deviceId)) {
                setSelectedDeviceId(data.deviceId);
            }
        });

        // Get local system position for "Me"
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const localData = {
                        deviceId: 'DASHBOARD-ADMIN',
                        employeeId: 'Current System User',
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                        timestamp: new Date().toISOString(),
                        isLocal: true,
                        status: 'Online'
                    };
                    setLocations(prev => {
                        const filtered = prev.filter(l => l.deviceId !== 'DASHBOARD-ADMIN');
                        return [...filtered, localData];
                    });
                    setSelectedDeviceId('DASHBOARD-ADMIN');
                },
                null,
                { enableHighAccuracy: true }
            );
        }

        return () => { socket.disconnect(); };
    }, []); // Only run once on mount

    const handleRecenter = () => {
        setAutoFollow(true);
        const local = locations.find(l => l.deviceId === 'DASHBOARD-ADMIN' || l.deviceId.startsWith('LOCAL'));
        if (local) setSelectedDeviceId(local.deviceId);
    };

    if (!hasMounted) return <div style={{ height: '100%', width: '100%', background: '#0D1117' }} />;

    const selectedLoc = locations.find(l => l.deviceId === selectedDeviceId) || locations[0];
    const mapTiles = mapType === 'street' 
        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

    return (
        <div style={{ display: 'flex', height: '100%', width: '100%', position: 'relative', background: 'var(--bg-primary)', overflow: 'hidden' }}>
            {/* Top Navigation Bar */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 1000, display: 'flex', gap: '10px', pointerEvents: 'none' }}>
                <div style={{ 
                    background: 'var(--bg-glass)', 
                    backdropFilter: 'blur(12px)', 
                    borderRadius: '12px', 
                    padding: '6px 16px', 
                    border: '1px solid var(--border-strong)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    pointerEvents: 'auto',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    width: '300px'
                }}>
                    <Search size={16} color="var(--text-secondary)" />
                    <input 
                        placeholder="Search fleet nodes..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.8rem', width: '100%' }}
                    />
                </div>

                <div style={{ 
                    background: 'var(--bg-glass)', 
                    backdropFilter: 'blur(12px)', 
                    borderRadius: '12px', 
                    padding: '4px', 
                    border: '1px solid var(--border-strong)', 
                    display: 'flex', 
                    gap: '4px',
                    pointerEvents: 'auto'
                }}>
                    <button onClick={() => setMapType('street')} style={{ padding: '6px 12px', background: mapType === 'street' ? 'var(--accent-blue)' : 'transparent', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>STREET</button>
                    <button onClick={() => setMapType('satellite')} style={{ padding: '6px 12px', background: mapType === 'satellite' ? 'var(--accent-blue)' : 'transparent', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>SATELLITE</button>
                </div>

                <div style={{ flex: 1 }} />

                <button 
                    onClick={handleRecenter}
                    style={{ 
                        background: 'var(--bg-glass)', 
                        backdropFilter: 'blur(12px)', 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        border: '1px solid var(--border-strong)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        pointerEvents: 'auto'
                    }}
                >
                    <Navigation size={18} fill={autoFollow ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Map Area */}
            <div style={{ flex: 1 }}>
                <MapContainer center={[14.4677, 75.9218]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <ZoomControl position="bottomright" />
                    <TileLayer url={mapTiles} attribution='&copy; WorkSphere' />
                    
                    {locations.map(loc => (
                        <React.Fragment key={loc.deviceId}>
                            <Marker position={[loc.latitude, loc.longitude]} icon={pulseIcon}>
                                <Popup>
                                    <div style={{ padding: '4px' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--accent-blue)', fontSize: '0.9rem' }}>{loc.employeeId}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Accuracy: ±{Math.round(loc.accuracy)}m</div>
                                        <div style={{ fontSize: '0.6rem', marginTop: '4px', opacity: 0.6 }}>{new Date(loc.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                </Popup>
                            </Marker>
                            {selectedDeviceId === loc.deviceId && (
                                <Circle center={[loc.latitude, loc.longitude]} radius={Math.min(loc.accuracy, 200)} pathOptions={{ color: 'var(--accent-blue)', fillOpacity: 0.1, weight: 1 }} />
                            )}
                        </React.Fragment>
                    ))}

                    {selectedLoc && (
                        <MapController center={[selectedLoc.latitude, selectedLoc.longitude]} zoom={17} active={autoFollow} />
                    )}
                </MapContainer>
            </div>

            {/* Right Sidebar */}
            <div style={{ 
                width: '320px', 
                background: 'var(--bg-secondary)', 
                borderLeft: '1px solid var(--border-strong)', 
                display: 'flex', 
                flexDirection: 'column',
                zIndex: 1000
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={18} color="var(--accent-cyan)" />
                            <h2 style={{ fontSize: '1rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>FLEET INTELLIGENCE</h2>
                        </div>
                        <div style={{ background: 'var(--accent-blue)', color: 'white', fontSize: '0.6rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>
                            {locations.length} ACTIVE
                        </div>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>Tracking {locations.length} hardware nodes in real-time</p>
                </div>

                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {locations.filter(l => l.employeeId.toLowerCase().includes(searchQuery.toLowerCase())).map(loc => (
                        <div 
                            key={loc.deviceId}
                            onClick={() => { setSelectedDeviceId(loc.deviceId); setAutoFollow(true); }}
                            style={{ 
                                padding: '16px', 
                                background: selectedDeviceId === loc.deviceId ? 'var(--bg-tertiary)' : 'transparent', 
                                borderRadius: '12px', 
                                cursor: 'pointer',
                                border: `1px solid ${selectedDeviceId === loc.deviceId ? 'var(--border-strong)' : 'transparent'}`,
                                transition: 'all 0.2s ease',
                                marginBottom: '8px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: loc.isLocal ? 'var(--accent-green)' : 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={16} color={loc.isLocal ? '#fff' : 'var(--text-secondary)'} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{loc.employeeId}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-blue)', fontWeight: 600 }}>{Math.round(loc.accuracy)}m Precision</div>
                                </div>
                                <Signal size={12} color={loc.accuracy < 100 ? 'var(--accent-green)' : 'var(--status-warning)'} />
                            </div>
                        </div>
                    ))}
                    {locations.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <RefreshCcw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Scanning for hardware signals...</div>
                        </div>
                    )}
                </div>

                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700 }}>
                        <RefreshCcw size={10} className="animate-spin" />
                        POLLING HARDWARE GPS...
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-pulse-icon { display: flex; align-items: center; justify-content: center; }
                .pulse-dot-container { position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
                .pulse-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; background: var(--accent-blue); opacity: 0.4; animation: leaflet-pulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
                .pulse-dot-core { position: relative; width: 10px; height: 10px; background: var(--accent-blue); border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
                @keyframes leaflet-pulse { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
                .leaflet-container { background: #0D1117 !important; }
                .leaflet-popup-content-wrapper { background: var(--bg-secondary) !important; color: var(--text-primary) !important; border-radius: 12px !important; border: 1px solid var(--border-strong) !important; }
                .leaflet-popup-tip { background: var(--bg-secondary) !important; border: 1px solid var(--border-strong) !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }
            `}</style>
        </div>
    );
}
