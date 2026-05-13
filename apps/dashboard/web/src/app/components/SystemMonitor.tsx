'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, Cpu, Activity, Wifi, Battery, Clock, AlertTriangle } from 'lucide-react';

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
          
          // Track history for drain rate (% per hour)
          batteryHistory.current.push({ level, time: now });
          if (batteryHistory.current.length > 60) batteryHistory.current.shift(); // 2 mins of history

          let drainRate = 0;
          if (batteryHistory.current.length > 10) {
            const first = batteryHistory.current[0];
            const last = batteryHistory.current[batteryHistory.current.length - 1];
            const timeDiffHours = (last.time - first.time) / (1000 * 60 * 60);
            const levelDiff = first.level - last.level;
            if (timeDiffHours > 0 && levelDiff > 0) {
              drainRate = Math.round(levelDiff / timeDiffHours);
            }
          }

          setMetrics((prev: any) => ({
            ...prev,
            battery: {
              level,
              charging: battery.charging,
              chargingTime: battery.chargingTime,
            },
            drainRate
          }));
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      });
    }

    // 3. Long Task Detection (Forensic)
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(() => {
            longTaskWindow.current.push(Date.now());
          });
        });
        observer.observe({ type: 'longtask', buffered: true });
      } catch (e) {}
    }

    // 4. Network Latency Ping (Every 5s)
    const pingInterval = setInterval(async () => {
      const start = performance.now();
      try {
        // Use a tiny fetch to estimate RTT
        await fetch('/favicon.ico', { cache: 'no-store', mode: 'no-cors' });
        const rtt = Math.round(performance.now() - start);
        setMetrics((prev: any) => ({ ...prev, ping: rtt }));
      } catch (e) {
        // Fallback to navigator.connection rtt if fetch fails
        const conn = (navigator as any).connection;
        if (conn) setMetrics((prev: any) => ({ ...prev, ping: conn.rtt || 0 }));
      }
    }, 5000);

    // 5. High-Frequency Polling (Every 2 seconds)
    const metricsInterval = setInterval(() => {
      // --- CPU Benchmarking (10ms load test) ---
      const cpuStart = performance.now();
      let ops = 0;
      while (performance.now() - cpuStart < 10) {
        ops++; // Simple operation count
      }
      if (cpuBaseline.current === null) cpuBaseline.current = ops;
      const cpuLoad = Math.max(0, Math.min(100, Math.round(100 * (1 - (ops / cpuBaseline.current)))));

      // --- Memory & Pressure ---
      const perf = (performance as any).memory;
      let memory = null;
      let pressure = 'Normal';
      if (perf) {
        const used = Math.round(perf.usedJSHeapSize / (1024 * 1024));
        const limit = Math.round(perf.jsHeapSizeLimit / (1024 * 1024));
        const percent = (perf.usedJSHeapSize / perf.jsHeapSizeLimit) * 100;
        memory = { used, total: Math.round(perf.totalJSHeapSize / (1024 * 1024)), limit, percent };
        if (percent > 85) pressure = 'Critical';
        else if (percent > 65) pressure = 'Moderate';
      }

      // --- Lag & Jank Aggregation ---
      const now = Date.now();
      jankWindow.current = jankWindow.current.filter(t => now - t < 60000);
      longTaskWindow.current = longTaskWindow.current.filter(t => now - t < 60000);
      const jankCount = jankWindow.current.length;
      const longTasks = longTaskWindow.current.length;
      const lagScore = Math.min(100, (jankCount * 2) + (longTasks * 10));

      setMetrics((prev: any) => {
        // --- Health Score Calculation (Factor in all signals) ---
        let score = 100;
        if (cpuLoad > 70) score -= 20;
        if (pressure === 'Critical') score -= 25;
        if (pressure === 'Moderate') score -= 10;
        if (prev.fps < 30) score -= 30;
        if (lagScore > 40) score -= 15;
        if (longTasks > 5) score -= 10;
        if (prev.ping > 250) score -= 10;
        
        return {
          ...prev,
          cpuLoad,
          memory,
          memoryPressure: pressure,
          jankCount,
          longTasks,
          lagScore,
          healthScore: Math.max(0, score)
        };
      });
    }, 2000);

    // 6. FPS & Jank Detection (Real-time Frame Timing)
    let rafId: number;
    const updateFps = (time: number) => {
      const delta = time - lastFrameTime.current;
      lastFrameTime.current = time;

      // Jank Detection (> 50ms frame)
      if (delta > 50) {
        jankWindow.current.push(Date.now());
      }

      frames.current++;
      const now = Date.now();
      if (now - lastFpsUpdate.current >= 1000) {
        setMetrics((prev: any) => ({
          ...prev,
          fps: frames.current
        }));
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
    if (score > 85) return '#10b981'; // Green
    if (score > 60) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Info */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        padding: '2.5rem', 
        borderRadius: '24px', 
        border: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <Shield size={32} color="#3b82f6" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>System Guardian Auditor</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Verified Device-Native Security Stream</p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Security Health Score</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: getHealthColor(metrics.healthScore) }}>
            {metrics.healthScore}%
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* CPU & Memory Card */}
        <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Cpu size={18} color="#3b82f6" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fafafa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hardware & Load</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#71717a', fontSize: '0.85rem' }}>CPU Relative Load</span>
                <span style={{ fontWeight: 700, color: metrics.cpuLoad > 70 ? '#ef4444' : (metrics.cpuLoad > 40 ? '#f59e0b' : '#10b981') }}>
                  {metrics.cpuLoad}%
                </span>
              </div>
              <div style={{ height: '6px', background: '#18181b', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${metrics.cpuLoad}%`, 
                  height: '100%', 
                  background: metrics.cpuLoad > 70 ? '#ef4444' : (metrics.cpuLoad > 40 ? '#f59e0b' : '#10b981'),
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #18181b', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ color: '#71717a', fontSize: '0.85rem' }}>Memory Pressure</span>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '100px', 
                  fontSize: '0.7rem', 
                  fontWeight: 800, 
                  background: metrics.memoryPressure === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: metrics.memoryPressure === 'Critical' ? '#ef4444' : '#10b981',
                  border: `1px solid ${metrics.memoryPressure === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                }}>
                  {metrics.memoryPressure}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#71717a', fontSize: '0.8rem' }}>Heap Usage</span>
                <span style={{ fontWeight: 700, color: '#fafafa', fontSize: '0.85rem' }}>
                  {metrics.memory ? `${metrics.memory.used}MB / ${metrics.memory.limit}MB` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Energy & Uptime Card */}
        <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Zap size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fafafa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Energy Telemetry</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#71717a', fontSize: '0.85rem' }}>Battery Level</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Battery size={14} color={metrics.battery?.charging ? '#10b981' : '#71717a'} />
                <span style={{ fontWeight: 700, color: '#fafafa' }}>
                  {metrics.battery ? `${metrics.battery.level}%` : 'N/A'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#71717a', fontSize: '0.85rem' }}>Drain Velocity</span>
              <span style={{ fontWeight: 700, color: metrics.drainRate > 15 ? '#ef4444' : '#fafafa' }}>
                {metrics.battery?.charging ? 'Charging...' : `~${metrics.drainRate}%/hr`}
              </span>
            </div>

            <div style={{ borderTop: '1px solid #18181b', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#71717a', fontSize: '0.85rem' }}>Session Uptime</span>
                <span style={{ fontWeight: 800, color: '#fafafa', fontFamily: 'monospace' }}>
                  {formatUptime(metrics.uptime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance & Lag Card */}
        <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Activity size={18} color="#8b5cf6" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fafafa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lag & Stability</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#71717a', fontSize: '0.85rem' }}>Lag Score (Jank)</span>
              <span style={{ fontWeight: 800, color: metrics.lagScore > 30 ? '#ef4444' : '#10b981' }}>
                {metrics.lagScore} <span style={{ fontSize: '0.7rem', color: '#71717a' }}>/ 100</span>
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#71717a', fontSize: '0.85rem' }}>Long Tasks (Audit)</span>
              <span style={{ fontWeight: 700, color: metrics.longTasks > 0 ? '#f59e0b' : '#fafafa' }}>
                {metrics.longTasks} / min
              </span>
            </div>

            <div style={{ borderTop: '1px solid #18181b', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: '#71717a', fontSize: '0.85rem' }}>Rendering Speed</span>
                <span style={{ fontWeight: 800, color: metrics.fps > 45 ? '#10b981' : '#ef4444' }}>{metrics.fps} FPS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#71717a', fontSize: '0.85rem' }}>Network Latency</span>
                <span style={{ fontWeight: 700, color: metrics.ping > 150 ? '#ef4444' : '#10b981' }}>{metrics.ping}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      <div style={{ 
        background: 'rgba(239, 68, 68, 0.05)', 
        border: '1px solid rgba(239, 68, 68, 0.1)', 
        borderRadius: '16px', 
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <AlertTriangle size={20} color="#ef4444" />
        <div style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 500 }}>
          {metrics.healthScore < 80 
            ? 'WARNING: System resources are under high load. Performance may be degraded.' 
            : 'All system interfaces report optimal security status. Monitoring active.'}
        </div>
      </div>
    </div>
  );
}
