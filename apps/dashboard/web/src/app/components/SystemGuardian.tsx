'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Cpu, 
  Activity, 
  Wifi, 
  Battery, 
  Clock, 
  AlertTriangle, 
  Zap, 
  Monitor, 
  Info,
  MousePointer2,
  Tally3,
  Globe,
  Lock,
  Search
} from 'lucide-react';
import { io } from 'socket.io-client';

/**
 * System Guardian - Integrated Intelligence Dashboard
 * v3.0 - Unified Hardware & Security Telemetry
 */
export default function SystemGuardian() {
  const [metrics, setMetrics] = useState<any>({
    cpu: { percent: 0, cores: 0, freq_mhz: 0 },
    memory: { percent: 0, total_gb: 0, used_gb: 0 },
    disk: { percent: 0, free_gb: 0 },
    network: { active_connections: 0, bytes_sent_mb: 0, bytes_recv_mb: 0 },
    processes: { total: 0, top_consumers: [] },
    system: { platform: 'Loading...', hostname: '...', uptime_hours: 0 },
    healthScore: 100,
    status: 'OPTIMAL',
    alerts: [],
    threats: [],
    predictions: [],
    ping: 0,
    fps: 60,
    lastUpdate: null
  });

  const [history, setHistory] = useState<number[]>(new Array(30).fill(0));
  const socketRef = useRef<any>(null);
  const startTime = useRef(Date.now());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Connect to the Backend Telemetry Server
    const socket = io('http://localhost:4000');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[SystemGuardian] Connected to telemetry stream');
    });

    socket.on('system_update', (update: any) => {
      if (update.type === 'metrics') {
        setMetrics((prev: any) => ({
          ...prev,
          ...update.data,
          healthScore: update.health_score,
          status: update.health_score > 80 ? 'OPTIMAL' : (update.health_score > 50 ? 'WARNING' : 'CRITICAL'),
          alerts: update.alerts || [],
          threats: update.threats || [],
          predictions: update.predictions || [],
          lastUpdate: new Date().toLocaleTimeString()
        }));
        
        setHistory(prev => [...prev.slice(1), update.data.cpu.percent]);
      }
    });

    // FPS & Local UI Pulse
    let lastTime = performance.now();
    let frames = 0;
    const tick = (time: number) => {
      frames++;
      if (time - lastTime >= 1000) {
        setMetrics((prev: any) => ({ ...prev, fps: frames }));
        frames = 0;
        lastTime = time;
      }
      requestAnimationFrame(tick);
    };
    const rafId = requestAnimationFrame(tick);

    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      socket.disconnect();
      cancelAnimationFrame(rafId);
      clearInterval(clockInterval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'OPTIMAL') return '#10b981';
    if (status === 'WARNING') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ 
      background: '#0a0f1d', 
      color: '#e2e8f0', 
      minHeight: '100%', 
      padding: '2rem',
      borderRadius: '24px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        background: 'rgba(15, 23, 42, 0.5)',
        padding: '1.5rem 2rem',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ 
            width: '44px', height: '44px', 
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
          }}>🛡️</div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>System Guardian</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(metrics.status), boxShadow: `0 0 10px ${getStatusColor(metrics.status)}` }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getStatusColor(metrics.status), textTransform: 'uppercase' }}>
                System {metrics.status} | {metrics.lastUpdate || 'Syncing...'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{currentTime.toLocaleTimeString([], { hour12: false })}</div>
          <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', marginTop: '4px' }}>{currentTime.toDateString()}</div>
        </div>
      </header>

      {/* Main Stats Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '2rem', background: 'rgba(15, 23, 42, 0.3)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '2rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '130px', height: '130px' }}>
          <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={getStatusColor(metrics.status)} strokeWidth="8" 
              strokeDasharray={`${metrics.healthScore * 2.82} 282.6`} 
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>{metrics.healthScore}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Health</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <StatBox label="Active Alerts" value={metrics.alerts.length} color="#f59e0b" />
          <StatBox label="Blocked Threats" value={metrics.threats.length} color="#10b981" />
          <StatBox label="Predictions" value={metrics.predictions.length} color="#8b5cf6" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={16} /> Security Scan
          </button>
          <button style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
            Generate Report
          </button>
        </div>
      </div>

      {/* Hardware Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <MetricCard icon={<Cpu size={20} color="#3b82f6" />} label="CPU Usage" value={`${metrics.cpu.percent}%`} subtitle={`${metrics.cpu.cores} Cores @ ${metrics.cpu.freq_mhz} MHz`} progress={metrics.cpu.percent} color="#3b82f6" />
        <MetricCard icon={<Activity size={20} color="#10b981" />} label="Memory" value={`${metrics.memory.percent}%`} subtitle={`${metrics.memory.used_gb} GB / ${metrics.memory.total_gb} GB`} progress={metrics.memory.percent} color="#10b981" />
        <MetricCard icon={<Zap size={20} color="#f59e0b" />} label="Disk Space" value={`${metrics.disk.percent}%`} subtitle={`${metrics.disk.free_gb} GB Available`} progress={metrics.disk.percent} color="#f59e0b" />
        <MetricCard icon={<Wifi size={20} color="#8b5cf6" />} label="Network" value={metrics.network.active_connections} subtitle={`Sent: ${metrics.network.bytes_sent_mb}MB | Recv: ${metrics.network.bytes_recv_mb}MB`} progress={metrics.network.active_connections > 0 ? 100 : 0} color="#8b5cf6" />
      </div>

      {/* Intelligence Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Performance Chart */}
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Performance History (CPU %)</h3>
          <div style={{ height: '200px', width: '100%', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
              <path 
                d={`M ${history.map((v, i) => `${i * 10},${100 - v}`).join(' L ')}`} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3" 
                strokeLinejoin="round"
                style={{ transition: 'all 0.5s ease' }}
              />
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
             <InfoText label="PLATFORM" value={metrics.system.platform} />
             <InfoText label="HOSTNAME" value={metrics.system.hostname} />
             <InfoText label="UPTIME" value={`${metrics.system.uptime_hours} Hours`} />
             <InfoText label="FPS" value={metrics.fps} />
          </div>
        </div>

        {/* Security Alerts */}
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Security Intelligence</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {metrics.alerts.length === 0 && metrics.threats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
                <Shield size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>No active threats detected.</p>
                <p style={{ fontSize: '0.75rem' }}>System operating within secure thresholds.</p>
              </div>
            ) : (
              metrics.alerts.map((a: any, i: number) => (
                <div key={i} style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>{a.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{a.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: any, color: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginTop: '4px', fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function MetricCard({ icon, label, value, subtitle, progress, color }: any) {
  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '20px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ width: '32px', height: '32px', background: `${color}15`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1.25rem' }}>{subtitle}</div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: color, transition: 'width 1s ease' }}></div>
      </div>
    </div>
  );
}

function InfoText({ label, value }: { label: string, value: any }) {
  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>{value}</div>
    </div>
  );
}
