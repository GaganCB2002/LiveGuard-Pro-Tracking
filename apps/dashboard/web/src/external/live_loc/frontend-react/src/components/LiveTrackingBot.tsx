/**
 * LIVEGUARD STANDALONE TRACKING MODULE
 * This module is now correctly placed within the React source tree.
 * It provides real-time location tracking and abnormal activity detection.
 */

import React, { useEffect, useState } from 'react';

interface TrackingData {
  latitude: number;
  longitude: number;
  speed: number;
  batteryLevel: number;
  isOnline: boolean;
  networkType: string;
}

export const LiveTrackingBot: React.FC = () => {
  const [status, setStatus] = useState<'IDLE' | 'TRACKING' | 'ALERT'>('IDLE');
  const [lastLocation, setLastLocation] = useState<TrackingData | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const data: TrackingData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed || 0,
          batteryLevel: 100, // Placeholder
          isOnline: navigator.onLine,
          networkType: (navigator as any).connection?.effectiveType || 'unknown'
        };

        setLastLocation(data);
        setStatus('TRACKING');

        // DETECT ABNORMAL ACTIVITY
        if (data.speed > 100) {
          triggerAlert('Excessive speed detected!');
        }
      },
      (error) => console.error(error),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const triggerAlert = (msg: string) => {
    setStatus('ALERT');
    // Integration point: Send to API or show local notification
    console.warn(`[BOT ALERT]: ${msg}`);
  };

  return (
    <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status === 'ALERT' ? '#ef4444' : '#10b981' }} />
        <h4 style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>LiveGuard Bot: {status}</h4>
      </div>
      {lastLocation && (
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
          Current: {lastLocation.latitude.toFixed(4)}, {lastLocation.longitude.toFixed(4)}
        </p>
      )}
    </div>
  );
};
