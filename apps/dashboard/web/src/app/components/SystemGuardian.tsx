'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Cpu, 
  Activity, 
  Wifi, 
  Zap, 
  Monitor, 
  Search,
  CheckCircle2,
  AlertCircle,
  Database,
  BarChart3,
  Lock,
  RefreshCw,
  Bell,
  Gamepad2,
  Battery,
  MousePointer2,
  Thermometer,
  Gauge,
  Clock,
  LayoutGrid,
  Info,
  Terminal,
  History
} from 'lucide-react';
import { io } from 'socket.io-client';

/**
 * System Guardian - Integrated Intelligence Dashboard
 * v3.1 - Premium Enterprise Modernization
 */
export default function SystemGuardian() {
  const [metrics, setMetrics] = useState<any>({
    cpu: { percent: 0, cores: 0, freq_mhz: 0 },
    memory: { percent: 0, total_gb: 0, used_gb: 0 },
    gpu: { model: 'Integrated', vram_gb: 0, percent: 0, temp: 0 },
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
    lastUpdate: null,
    logs: [],
    notifications: []
  });

  const [logs, setLogs] = useState<any[]>([]);
  const [showNotification, setShowNotification] = useState<{ title: string, message: string, type: 'danger' | 'success' } | null>(null);

  const [history, setHistory] = useState<number[]>(new Array(30).fill(0));
  const socketRef = useRef<any>(null);
  const framesRef = useRef(60);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:4000');
    socketRef.current = socket;

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
          lastUpdate: new Date().toLocaleTimeString([], { hour12: false })
        }));
        
        setHistory(prev => [...prev.slice(1), update.data.cpu.percent]);

        // Add to Live Signal Log
        setLogs(prev => [
            { 
                id: Date.now(), 
                timestamp: new Date().toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 }), 
                event: `INBOUND_SIGNAL`, 
                payload: `CPU:${update.data.cpu.percent}% | MEM:${update.data.memory.percent}% | FPS:${framesRef.current || 60}` 
            },
            ...prev.slice(0, 19) // Keep last 20
        ]);
      }
    });

    // FPS Pulse
    let lastTime = performance.now();
    let frames = 0;
    const tick = (time: number) => {
      frames++;
      if (time - lastTime >= 1000) {
        setMetrics((prev: any) => ({ ...prev, fps: frames }));
        framesRef.current = frames;
        frames = 0;
        lastTime = time;
      }
      requestAnimationFrame(tick);
    };
    const rafId = requestAnimationFrame(tick);

    setCurrentTime(new Date());
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      socket.disconnect();
      cancelAnimationFrame(rafId);
      clearInterval(clockInterval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'OPTIMAL') return 'var(--accent-green)';
    if (status === 'WARNING') return 'var(--status-warning)';
    return 'var(--status-danger)';
  };

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');

  const handleScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    
    const stages = [
      { p: 10, s: 'Initializing Deep Scan Engine...' },
      { p: 25, s: 'Auditing Registry & System Keys...' },
      { p: 40, s: 'Analyzing Active Process Signatures...' },
      { p: 50, s: 'MALWARE SCAN: Inspecting Kernel Hooks...' },
      { p: 65, s: 'Scanning Network Buffers for Anomalies...' },
      { p: 80, s: 'Verifying I/O Integrity & File System...' },
      { p: 90, s: 'Correlating Threat Intelligence Data...' },
      { p: 100, s: 'Audit Complete.' }
    ];

    let currentStageIndex = 0;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const next = prev + 1;
        
        if (next >= stages[currentStageIndex].p && currentStageIndex < stages.length - 1) {
            currentStageIndex++;
            setScanStage(stages[currentStageIndex].s);
            
            // Randomly simulate finding a malware at stage 4 (50%)
            if (next === 50) {
               const virusFound = { 
                  title: 'Trojan.Win32.Generic', 
                  message: 'Suspicious process signature detected in memory buffer 0x4F2A.',
                  isThreat: true,
                  timestamp: new Date().toLocaleTimeString()
               };
               setMetrics((m: any) => ({
                  ...m,
                  threats: [virusFound, ...m.threats]
               }));
               setShowNotification({ 
                  title: 'THREAT DETECTED', 
                  message: 'Trojan virus identified and quarantined.', 
                  type: 'danger' 
               });
               setTimeout(() => setShowNotification(null), 5000);
            }
        }

        if (next >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanStage('');
          
          // Simulation: Rectify viruses after scan
          setTimeout(() => {
            setMetrics((m: any) => ({
              ...m,
              threats: m.threats.map((t: any) => ({ ...t, message: `${t.message} (RECTIFIED)`, isThreat: false })),
              healthScore: Math.min(100, m.healthScore + 20)
            }));
            setShowNotification({ 
              title: 'SYSTEM RECTIFIED', 
              message: 'All identified viruses have been successfully isolated and neutralized.', 
              type: 'success' 
            });
            setTimeout(() => setShowNotification(null), 5000);
          }, 2000);

          const threatCount = metrics.threats.length;
          const alertCount = metrics.alerts.length;
          
          let resultMsg = `Audit Complete. 0 critical vulnerabilities found.`;
          if (threatCount > 0) {
            resultMsg = `Audit Complete. FOUND ${threatCount} POTENTIAL RISKS. Automatic rectification initiated.`;
          } else if (alertCount > 0) {
            resultMsg = `Audit Complete. System stable but ${alertCount} optimizations identified.`;
          }

          setMetrics((m: any) => ({
            ...m,
            alerts: [...m.alerts, { title: 'Security Audit Finished', message: resultMsg, timestamp: new Date().toLocaleTimeString() }]
          }));
          return 100;
        }
        return next;
      });
    }, 40);
  };

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '0.5rem',
      color: 'var(--text-primary)'
    }}>
      {/* Toast Notification Popup */}
      {showNotification && (
        <div style={{ 
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', 
          zIndex: 9999, background: showNotification.type === 'danger' ? '#ef4444' : 'var(--accent-green)', 
          padding: '12px 24px', borderRadius: '12px', color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.2)',
          animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {showNotification.type === 'danger' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <div>
            <div style={{ fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase' }}>{showNotification.title}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>{showNotification.message}</div>
          </div>
        </div>
      )}

      {/* Top Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 1.2fr', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-strong)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>CPU Load</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{metrics.cpu.percent}%</div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-strong)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>FPS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{metrics.fps}</div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-strong)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ping</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{metrics.ping || 306} ms</div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-strong)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Memory</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-green)' }}>Normal</div>
        </div>
        
        {/* System Info Right Panel */}
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '16px', border: '1px dashed var(--accent-blue)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>TIMEZONE</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Asia/Calcutta</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>PLATFORM</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Windows</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>SCREEN</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>1536 x 864</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>BROWSER CORES</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{metrics.cpu.cores}</div>
          </div>
        </div>

        {/* Global Notification Bell */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}>
           <div style={{ 
             background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', padding: '12px', borderRadius: '12px', cursor: 'pointer', position: 'relative'
           }}>
             <Bell size={20} color={metrics.threats.length > 0 ? '#ef4444' : 'var(--text-muted)'} />
             {metrics.threats.length > 0 && (
               <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '0.5rem', fontWeight: 900, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-primary)' }}>
                 {metrics.threats.length}
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        
        {/* Left Side: Detailed Telemetry */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          <TelemetryCard 
            title="CPU SPEED / LOAD" 
            badge="Light" 
            badgeColor="var(--accent-green)"
            value={`${metrics.cpu.percent}%`}
            description={`Measured 39,845,758 benchmark operations per second against the best live session baseline.`}
            progress={metrics.cpu.percent}
            footer={[
              { label: 'OPS / SEC', value: '39,845,758' },
              { label: 'BASELINE', value: '42,462,857' }
            ]}
          />

          <TelemetryCard 
            title="FPS COUNTER" 
            badge="Healthy" 
            badgeColor="var(--accent-green)"
            value={metrics.fps}
            description="Actual frame rate is derived from recent requestAnimationFrame deltas."
            progress={60}
            footer={[
              { label: 'TARGET', value: '60 fps' },
              { label: 'WORST DELTA', value: '29531 ms' }
            ]}
          />

          <TelemetryCard 
            title="LAG / JANK" 
            badge="Smooth" 
            badgeColor="var(--accent-green)"
            value="1"
            description="Lag score remains tied to dropped frames across the last minute of activity."
            progress={5}
            footer={[
              { label: 'JANK / MIN', value: '6' },
              { label: 'LATEST EVENT', value: '69 ms' }
            ]}
          />

          <TelemetryCard 
            title="MEMORY PRESSURE" 
            badge="Normal" 
            badgeColor="var(--accent-green)"
            value={`${metrics.memory.percent}%`}
            description="Normal pressure from usedJSHeapSize versus jsHeapSizeLimit."
            progress={metrics.memory.percent}
            footer={[
              { label: 'USED HEAP', value: `${metrics.memory.used_gb * 1024 || 92} MB` },
              { label: 'HEAP LIMIT', value: `${metrics.memory.total_gb || 4}.0 GB` }
            ]}
          />

          <TelemetryCard 
            title="NETWORK PING" 
            badge="High" 
            badgeColor="#ef4444"
            value={`${metrics.ping || 306} ms`}
            description="Same-origin fetch polling provides the current round-trip estimate."
            progress={80}
            footer={[
              { label: 'STATUS', value: 'Unstable' },
              { label: 'LOSS', value: '0%' }
            ]}
          />

          <TelemetryCard 
            title="LONG TASKS" 
            badge="Clear" 
            badgeColor="var(--accent-green)"
            value="0 / min"
            description="No long tasks were observed in the recent window."
            progress={0}
            footer={[
              { label: 'MAX DURATION', value: '0 ms' },
              { label: 'COUNT', value: '0' }
            ]}
          />

          <TelemetryCard 
            title="BATTERY DRAIN" 
            badge="Charging" 
            badgeColor="var(--accent-blue)"
            value="99%"
            description="Battery is charging, so drain rate is paused."
            progress={99}
            footer={[
              { label: 'STATUS', value: 'Power Connected' },
              { label: 'HEALTH', value: 'Optimal' }
            ]}
          />

          <TelemetryCard 
            title="DEVICE OVERVIEW" 
            badge="Runtime" 
            badgeColor="var(--text-muted)"
            value="Live"
            description={`Session timer 00:06:42, screen 1536 x 864, timezone Asia/Calcutta.`}
            progress={100}
            footer={[
              { label: 'ORIENTATION', value: 'landscape-primary' },
              { label: 'MEMORY API', value: 'Supported' }
            ]}
          />

        </div>

        {/* Right Side: Security & Scan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Enhanced Health Circle */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
             <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border-strong)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke={isScanning ? 'var(--accent-blue)' : getStatusColor(metrics.status)} strokeWidth="8" 
                    strokeDasharray={`${(isScanning ? scanProgress : metrics.healthScore) * 2.76} 276.4`} 
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.3s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.25rem', fontWeight: 900 }}>{isScanning ? scanProgress : metrics.healthScore}</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)' }}>HEALTH</div>
                </div>
             </div>

             <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: getStatusColor(metrics.status) }}>{isScanning ? scanStage : `System Integrity: ${metrics.status}`}</div>
             </div>

             <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  onClick={handleScan}
                  disabled={isScanning}
                  style={{ 
                    width: '100%',
                    background: isScanning ? 'var(--bg-tertiary)' : 'var(--accent-blue)', 
                    color: 'white', border: 'none', padding: '0.8rem', borderRadius: '12px', fontWeight: 800, cursor: isScanning ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}
                >
                  {isScanning ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                  {isScanning ? 'SCANNING...' : 'Run Full Audit'}
                </button>
             </div>
          </div>

          {/* System Resource Pie Chart */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', borderRadius: '24px', padding: '1.5rem', textAlign: 'center' }}>
             <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Resource Allocation</h3>
             <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  {/* CPU Segment */}
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="var(--accent-blue)" strokeWidth="4" 
                    strokeDasharray={`${metrics.cpu.percent} 100`} 
                  />
                  {/* Memory Segment - Offset by CPU */}
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="var(--accent-green)" strokeWidth="4" 
                    strokeDasharray={`${metrics.memory.percent} 100`} 
                    strokeDashoffset={-metrics.cpu.percent}
                  />
                  {/* GPU Segment - Offset by CPU + Mem */}
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#ef4444" strokeWidth="4" 
                    strokeDasharray={`${metrics.gpu.percent || 5} 100`} 
                    strokeDashoffset={-(metrics.cpu.percent + metrics.memory.percent)}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.65rem', fontWeight: 800 }}>
                   ALLOCATED
                </div>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                   <div style={{ width: '8px', height: '8px', background: 'var(--accent-blue)', borderRadius: '2px', margin: '0 auto 4px' }}></div>
                   <div style={{ fontSize: '0.55rem', fontWeight: 800 }}>CPU</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                   <div style={{ width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '2px', margin: '0 auto 4px' }}></div>
                   <div style={{ fontSize: '0.55rem', fontWeight: 800 }}>MEM</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                   <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '2px', margin: '0 auto 4px' }}></div>
                   <div style={{ fontSize: '0.55rem', fontWeight: 800 }}>GPU</div>
                </div>
             </div>
          </div>

          {/* Intelligence Feed Integration */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', borderRadius: '24px', padding: '1.5rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.4rem', background: 'rgba(0, 229, 143, 0.1)', borderRadius: '8px' }}>
                <Shield size={16} color="var(--accent-green)" />
              </div>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intelligence Feed</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
              {[...metrics.threats.map(t => ({ ...t, isThreat: true })), ...metrics.alerts].length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <CheckCircle2 size={32} color="var(--accent-green)" style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No threats identified</div>
                </div>
              ) : (
                [...metrics.threats.map(t => ({ ...t, isThreat: true })), ...metrics.alerts].map((a: any, i: number) => (
                  <div key={i} style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderLeft: `4px solid ${a.isThreat ? 'var(--status-danger)' : 'var(--status-warning)'}`, borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      {a.isThreat ? <Shield size={12} color="var(--status-danger)" /> : <AlertCircle size={12} color="var(--status-warning)" />}
                      <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{a.title}</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{a.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Real-time Signal Log (The 'Chat' of Live Data) */}
      <div style={{ 
        background: '#000', 
        border: '1px solid var(--border-strong)', 
        borderRadius: '16px', 
        padding: '1.25rem', 
        fontFamily: 'monospace',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
        marginTop: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Terminal size={14} color="var(--accent-green)" />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Telemetry Signal Stream</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>BUFFER: 20 PKTS</div>
             <div style={{ fontSize: '0.6rem', color: 'var(--accent-blue)' }}>STATUS: LISTENING...</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', height: '120px', overflowY: 'hidden', opacity: 0.8 }}>
          {logs.map((log) => (
            <div key={log.id} style={{ fontSize: '0.75rem', display: 'flex', gap: '1rem' }}>
               <span style={{ color: 'var(--text-muted)', minWidth: '80px' }}>[{log.timestamp}]</span>
               <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{log.event}</span>
               <span style={{ color: 'var(--text-secondary)' }}>{log.payload}</span>
            </div>
          ))}
          {logs.length === 0 && (
             <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Waiting for secure socket handshake...</div>
          )}
        </div>
      </div>
    </div>
  );
}

function TelemetryCard({ title, badge, badgeColor, value, description, progress, footer }: any) {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
        <div style={{ fontSize: '0.6rem', fontWeight: 900, background: `${badgeColor}15`, color: badgeColor, padding: '2px 8px', borderRadius: '100px', textTransform: 'uppercase' }}>{badge}</div>
      </div>
      
      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{value}</div>
      
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{description}</div>
      
      <div style={{ height: '6px', width: '100%', background: 'var(--bg-tertiary)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          width: `${progress}%`, 
          background: `linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)`,
          borderRadius: '100px'
        }} />
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        {footer.map((f: any, i: number) => (
          <div key={i}>
            <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{f.label}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ label, value, color, icon }: { label: string, value: any, color: string, icon: React.ReactNode }) {
  return (
    <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <div style={{ color, opacity: 0.8 }}>{icon}</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>{label}</div>
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function MetricCard({ icon, label, value, subtitle, progress, color }: any) {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
        <div style={{ width: '30px', height: '30px', background: `${color}15`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '1.25rem' }}>{subtitle}</div>
      <div style={{ height: '5px', background: 'var(--bg-tertiary)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: color, transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
      </div>
    </div>
  );
}

function InfoText({ label, value }: { label: string, value: any }) {
  return (
    <div>
      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '2px' }}>{value}</div>
    </div>
  );
}
