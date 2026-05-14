'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, Cpu, Activity, Wifi, Battery, Clock, AlertTriangle, BarChart3, Gauge, Thermometer, Signal } from 'lucide-react';

/**
 * SystemMonitor - Premium Browser-Native Diagnostics
 * v2.1 - Modernized Design System
 */
export default function SystemMonitor() {
  const [metrics, setMetrics] = useState<any>({
    cpu: navigator.hardwareConcurrency || 'N/A',
    cpuLoad: 0,
    memory: null,
    memoryPressure: 'Normal',
    battery: null,
    drainRate: 0,
    network: null,
    ping: 0,
    uptime: 0,
    fps: 0,
    lagScore: 0,
    jankCount: 0,
    longTasks: 0,
    healthScore: 100
  });

  const startTime = useRef(Date.now());
  const frames = useRef(0);
  const lastFpsUpdate = useRef(Date.now());
  const lastFrameTime = useRef(performance.now());
  const batteryHistory = useRef<{ level: number, time: number }[]>([]);
  const cpuBaseline = useRef<number | null>(null);
  const jankWindow = useRef<number[]>([]);
  const longTaskWindow = useRef<number[]>([]);

  useEffect(() => {
    // 1. Uptime Timer
    const uptimeInterval = setInterval(() => {
      setMetrics((prev: any) => ({
        ...prev,
        uptime: Math.floor((Date.now() - startTime.current) / 1000)
      }));
    }, 1000);

    // 2. Battery & Drain Rate
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          const now = Date.now();
          const level = Math.round(battery.level * 100);
          batteryHistory.current.push({ level, time: now });
          if (batteryHistory.current.length > 60) batteryHistory.current.shift();
          let drainRate = 0;
          if (batteryHistory.current.length > 10) {
            const first = batteryHistory.current[0];
            const last = batteryHistory.current[batteryHistory.current.length - 1];
            const timeDiffHours = (last.time - first.time) / (1000 * 60 * 60);
            const levelDiff = first.level - last.level;
            if (timeDiffHours > 0 && levelDiff > 0) drainRate = Math.round(levelDiff / timeDiffHours);
          }
          setMetrics((prev: any) => ({
            ...prev,
            battery: { level, charging: battery.charging, chargingTime: battery.chargingTime },
            drainRate
          }));
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      });
    }

    // 3. Long Task Detection
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(() => { longTaskWindow.current.push(Date.now()); });
        });
        observer.observe({ type: 'longtask', buffered: true });
      } catch (e) {}
    }

    // 4. Latency
    const pingInterval = setInterval(async () => {
      const start = performance.now();
      try {
        await fetch('/favicon.ico', { cache: 'no-store', mode: 'no-cors' });
        const rtt = Math.round(performance.now() - start);
        setMetrics((prev: any) => ({ ...prev, ping: rtt }));
      } catch (e) {
        const conn = (navigator as any).connection;
        if (conn) setMetrics((prev: any) => ({ ...prev, ping: conn.rtt || 0 }));
      }
    }, 5000);

    // 5. Polling Metrics
    const metricsInterval = setInterval(() => {
      const cpuStart = performance.now();
      let ops = 0;
      while (performance.now() - cpuStart < 10) ops++;
      if (cpuBaseline.current === null) cpuBaseline.current = ops;
      const cpuLoad = Math.max(0, Math.min(100, Math.round(100 * (1 - (ops / cpuBaseline.current)))));

      const perf = (performance as any).memory;
      let memory = null;
      let pressure = 'Normal';
      if (perf) {
        const percent = (perf.usedJSHeapSize / perf.jsHeapSizeLimit) * 100;
        memory = { used: Math.round(perf.usedJSHeapSize / (1024 * 1024)), limit: Math.round(perf.jsHeapSizeLimit / (1024 * 1024)), percent };
        if (percent > 85) pressure = 'Critical';
        else if (percent > 65) pressure = 'Moderate';
      }

      const now = Date.now();
      jankWindow.current = jankWindow.current.filter(t => now - t < 60000);
      longTaskWindow.current = longTaskWindow.current.filter(t => now - t < 60000);
      const lagScore = Math.min(100, (jankWindow.current.length * 2) + (longTaskWindow.current.length * 10));

      setMetrics((prev: any) => {
        let score = 100;
        if (cpuLoad > 70) score -= 20;
        if (pressure === 'Critical') score -= 25;
        if (prev.fps < 30) score -= 30;
        return { ...prev, cpuLoad, memory, memoryPressure: pressure, lagScore, healthScore: Math.max(0, score) };
      });
    }, 2000);

    // 6. FPS
    let rafId: number;
    const updateFps = (time: number) => {
      const delta = time - lastFrameTime.current;
      lastFrameTime.current = time;
      if (delta > 50) jankWindow.current.push(Date.now());
      frames.current++;
      const now = Date.now();
      if (now - lastFpsUpdate.current >= 1000) {
        setMetrics((prev: any) => ({ ...prev, fps: frames.current }));
        frames.current = 0;
        lastFpsUpdate.current = now;
      }
      rafId = requestAnimationFrame(updateFps);
    };
    rafId = requestAnimationFrame(updateFps);

    return () => {
      clearInterval(uptimeInterval);
      clearInterval(pingInterval);
      clearInterval(metricsInterval);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  };

  const getHealthColor = (score: number) => {
    if (score > 85) return 'var(--accent-green)';
    if (score > 60) return 'var(--status-warning)';
    return 'var(--status-danger)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div style={{ 
        background: 'var(--bg-secondary)', 
        padding: '2rem', 
        borderRadius: '24px', 
        border: '1px solid var(--border-strong)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 1 }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            background: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent-blue)'
          }}>
            <Shield size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Browser Diagnostics</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Local interface integrity & rendering performance</p>
          </div>
        </div>

        <div style={{ textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>DOM HEALTH</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 950, color: getHealthColor(metrics.healthScore), lineHeight: 1 }}>
            {metrics.healthScore}%
          </div>
        </div>
        
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.03 }}>
           <Gauge size={160} />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        
        <MetricBox 
          icon={<Cpu size={18} color="var(--accent-blue)" />} 
          label="Interface Load" 
          value={`${metrics.cpuLoad}%`} 
          progress={metrics.cpuLoad}
          color="var(--accent-blue)"
          subtitle={`Hardware Concurrency: ${metrics.cpu}`}
        />

        <MetricBox 
          icon={<Zap size={18} color="var(--status-warning)" />} 
          label="Energy Profile" 
          value={metrics.battery ? `${metrics.battery.level}%` : 'N/A'} 
          progress={metrics.battery?.level || 0}
          color="var(--status-warning)"
          subtitle={metrics.battery?.charging ? 'Status: Charging' : `Drain: ${metrics.drainRate}%/hr`}
        />

        <MetricBox 
          icon={<Activity size={18} color="var(--accent-green)" />} 
          label="Render Performance" 
          value={`${metrics.fps} FPS`} 
          progress={(metrics.fps / 60) * 100}
          color="var(--accent-green)"
          subtitle={`Uptime: ${formatUptime(metrics.uptime)}`}
        />

      </div>

      {/* Secondary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
         <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-strong)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
               <BarChart3 size={16} color="var(--accent-blue)" />
               <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Memory Pressure Audit</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Heap Allocation</span>
               <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{metrics.memory ? `${metrics.memory.used}MB` : 'N/A'}</span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
               <div style={{ height: '100%', width: `${metrics.memory?.percent || 0}%`, background: 'var(--accent-blue)', transition: 'width 1s ease' }}></div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
               <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status: <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{metrics.memoryPressure}</span></span>
               <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Limit: {metrics.memory?.limit}MB</span>
            </div>
         </div>

         <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-strong)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
               <Signal size={16} color="var(--accent-cyan)" />
               <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Network Connectivity</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Response Latency</span>
               <span style={{ fontSize: '0.9rem', fontWeight: 700, color: metrics.ping > 200 ? 'var(--status-danger)' : 'var(--text-primary)' }}>{metrics.ping}ms</span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
               <div style={{ height: '100%', width: `${Math.min(100, (metrics.ping / 500) * 100)}%`, background: 'var(--accent-cyan)', transition: 'width 1s ease' }}></div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
               <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Connection: <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>ACTIVE</span></span>
               <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Protocol: HTTP/2+WS</span>
            </div>
         </div>
      </div>
    </div>
  );
}

function MetricBox({ icon, label, value, progress, color, subtitle }: any) {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
        <div style={{ color, opacity: 0.8 }}>{icon}</div>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '1.25rem' }}>{subtitle}</div>
      <div style={{ height: '5px', background: 'var(--bg-tertiary)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: color, transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
      </div>
    </div>
  );
}
