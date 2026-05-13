/**
 * LIVEGUARD STANDALONE TRACKING MODULE
 * This module can be integrated into any React project.
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
    <div style={{ padding: '10px', background: '#f0f4f8', borderRadius: '8px' }}>
      <h4>LiveGuard Bot Status: {status}</h4>
      {lastLocation && (
        <p>Location: {lastLocation.latitude.toFixed(4)}, {lastLocation.longitude.toFixed(4)}</p>
      )}
    </div>
  );
};
