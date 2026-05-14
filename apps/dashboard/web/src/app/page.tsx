'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Monitor, 
  FileText, 
  LogOut, 
  Download,
  Zap,
  Globe,
  Code,
  Terminal,
  Layers,
  Search,
  User,
  Shield,
  Menu,
  Map as MapIcon,
  Navigation,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Radar,
  LineChart,
  Target,
  FileSearch,
  Fingerprint,
  Bell,
  UserCheck,
  Camera,
  MapPin,
  RefreshCw
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { generateEnterpriseReport } from './utils/reportEngine';

const LiveTrackingMap = dynamic(() => import('./components/LiveTrackingMap'), { 
  ssr: false,
  loading: () => <div style={{ height: '600px', background: '#18181b', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>Initializing High-Precision Map Engine...</div>
});

const SystemGuardian = dynamic(() => import('./components/SystemGuardian'), { ssr: false });


import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';

const COLORS = ['var(--accent-blue)', 'var(--accent-green)', 'var(--accent-cyan)', 'var(--accent-purple)', 'var(--status-warning)', 'var(--accent-indigo)'];

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
};

function PrintStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @media print {
        @page { size: A4; margin: 0; }
        body { background: white !important; margin: 0 !important; padding: 0 !important; }
        
        /* Hide everything by default using visibility to preserve layout for the target */
        body * { visibility: hidden !important; }
        
        /* Show only the printable report */
        #printable-report, #printable-report * { 
          visibility: visible !important; 
          display: block !important;
        }
        
        #printable-report { 
          position: absolute !important; 
          left: 0 !important; 
          top: 0 !important; 
          width: 210mm !important; /* Fixed A4 width */
          min-height: 297mm !important;
          margin: 0 !important;
          padding: 20mm !important;
          background: white !important;
        }

        /* Clean up table for print */
        table { width: 100% !important; border-collapse: collapse !important; }
        th, td { border: 1px solid #eee !important; padding: 10px !important; }
        
        /* Ensure specific removals */
        nav, aside, header, button, .no-print { display: none !important; visibility: hidden !important; }
      }
    ` }} />
  );
}

function AppUsageChart({ stats, isPrint = false }: any) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  
  const data = Object.entries(stats || {}).map(([name, value]) => ({ 
    name, 
    value: Number(value) || 0 
  })).filter(item => item.value > 10).sort((a, b) => b.value - a.value);

  if (!isClient) return <div style={{ height: '400px' }} />;
  if (data.length === 0) {
    return (
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
        No telemetry data synchronized.
      </div>
    );
  }

  // STRICTLY ENFORCE TOP 5 FOR REPORT/PDF
  const activeData = isPrint ? data.slice(0, 5) : data;
  const totalValue = Object.values(stats).reduce((a: any, b: any) => a + Number(b), 0) as number;

  return (
    <div style={{ 
      width: '100%', 
      display: 'flex', 
      flexDirection: isPrint ? 'row' : 'row',
      gap: isPrint ? '4rem' : '2rem', 
      alignItems: 'center',
    }}>
      <div style={{ 
        height: isPrint ? '320px' : '350px', 
        width: isPrint ? '350px' : '100%', 
        flex: isPrint ? 'none' : 1.2, 
        position: 'relative', 
        display: 'flex', 
        justifyContent: 'center' 
      }}>
        <ResponsiveContainer width="100%" height={isPrint ? 320 : 350}>
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              innerRadius={isPrint ? "40%" : "60%"}
              outerRadius={isPrint ? "70%" : "85%"}
              paddingAngle={4}
              dataKey="value"
              startAngle={0}
              endAngle={360}
              isAnimationActive={!isPrint}
              animationDuration={1500}
              animationBegin={0}
              stroke="none"
            >
              {activeData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            {!isPrint && (
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-strong)', 
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  color: 'var(--text-primary)'
                }}
                itemStyle={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{ 
        maxHeight: isPrint ? 'none' : '400px', 
        overflowY: isPrint ? 'visible' : 'auto', 
        width: isPrint ? '400px' : '100%',
        flex: 1
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {activeData.map((item, index) => (
            <div key={item.name} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '0.875rem 1.25rem', 
              background: isPrint ? '#f8fafc' : '#18181b', 
              borderRadius: '12px', 
              border: isPrint ? '1px solid #e2e8f0' : '1px solid #27272a',
              color: isPrint ? '#0f172a' : '#fafafa'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.name}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatDuration(item.value)}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>{((item.value / totalValue) * 100).toFixed(1)}% Usage</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VelocityChart({ events }: any) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  if (!isClient) return <div style={{ height: '400px' }} />;
  if (!events || events.length === 0) {
    return (
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a', background: '#18181b', borderRadius: '12px', border: '1px solid #27272a' }}>
        No velocity data available.
      </div>
    );
  }

  const chartData = (events || []).slice(-20).map((e: any) => ({
    ...e,
    keystrokeVelocity: Number(e.keystrokeVelocity) || 0
  }));

  const avgVelocity = chartData.reduce((acc: number, curr: any) => acc + curr.keystrokeVelocity, 0) / chartData.length;

  return (
    <div style={{ height: '400px', width: '100%', position: 'relative' }}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <defs>
            <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            stroke="#71717a"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => `${val} CPM`}
          />
          <Tooltip 
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
            itemStyle={{ color: '#fafafa', fontWeight: 600 }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar 
            dataKey="keystrokeVelocity" 
            fill="url(#colorVelocity)" 
            radius={[6, 6, 0, 0]} 
            barSize={35} 
            isAnimationActive={false} 
          />
          {avgVelocity > 0 && (
            <ReferenceLine 
              y={avgVelocity} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              label={{ value: 'Avg', position: 'right', fill: '#ef4444', fontSize: 10, fontWeight: 700 }} 
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [telemetry, setTelemetry] = useState<any>({
    employeeId: 'EMP-GAGAN',
    email: 'gagan@worksphere.com',
    department: 'Product Engineering',
    latest: { app: 'System', title: 'Live Stream Active', appDuration: 0, keystrokeVelocity: 0, mouseClicks: 0 },
    sessionStats: {},
    loginTime: new Date().toISOString(),
    allEvents: [],
    isBreak: false
  });
  const [currentTab, setCurrentTab] = useState('Overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Gagan',
    id: 'EMP-GAGAN',
    email: 'gagan@worksphere.com',
    dept: 'Product Engineering'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'System Security Active', message: 'All hardware sensors verified.', time: 'Just now', type: 'success' },
    { id: 2, title: 'Shift Started', message: 'Activity tracking is now live.', time: '10m ago', type: 'info' }
  ]);

  // Face Capture State
  const [showCapture, setShowCapture] = useState(false);
  const [captureType, setCaptureType] = useState<'login' | 'logout'>('login');
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [hasLoggedInToday, setHasLoggedInToday] = useState(false);
  const [lastLoginInfo, setLastLoginInfo] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/telemetry');
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
        }
      } catch (e) {
        console.error('Telemetry Fetch Error:', e);
      }
    };

    fetchTelemetry();
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 1000); // 1 second high-speed polling

    // Check if login capture is needed
    const lastLogin = localStorage.getItem('last_login_date');
    const today = new Date().toLocaleDateString();
    if (lastLogin !== today) {
        setTimeout(() => {
            setCaptureType('login');
            setShowCapture(true);
        }, 1000);
    } else {
        setHasLoggedInToday(true);
    }

    // Load attendance logs
    const savedLogs = localStorage.getItem('attendance_logs');
    if (savedLogs) {
      const logs = JSON.parse(savedLogs);
      setAttendanceLogs(logs);
      if (logs.length > 0) {
        setLastLoginInfo(logs[logs.length - 1]);
      }
    }

    const sessionAuth = localStorage.getItem('is_authenticated');
    if (sessionAuth === 'true') setIsAuthenticated(true);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (telemetry.employeeId && !isEditingProfile) {
      setProfile(prev => ({
        ...prev,
        id: telemetry.employeeId,
        email: telemetry.email || prev.email,
        dept: telemetry.department || prev.dept
      }));
    }
  }, [telemetry.employeeId, telemetry.email, telemetry.department, isEditingProfile]);

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds === undefined || seconds === null) return '0h 0m 0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getAppIcon = (app: string | undefined | null, size = 24) => {
    const name = (app || 'system').toLowerCase();
    if (name.includes('chrome') || name.includes('edge') || name.includes('browser')) return <Globe size={size} />;
    if (name.includes('code') || name.includes('vscode')) return <Code size={size} />;
    if (name.includes('terminal') || name.includes('cmd') || name.includes('powershell')) return <Terminal size={size} />;
    if (name.includes('explorer')) return <Layers size={size} />;
    if (name.includes('search')) return <Search size={size} />;
    return <Zap size={size} />;
  };

  const recentEvents = telemetry.allEvents?.slice(-5).reverse();
  const allEvents = telemetry.allEvents || [];

  // Improved Activity Logic
  const isIdleApp = telemetry.latest.app === 'Idle' || (telemetry.latest.app === 'System' && telemetry.latest.title === 'Live Stream Active');
  const isActive = !isIdleApp && !telemetry.isBreak && telemetry.status !== 'STANDBY_MODE';
  const isStandby = telemetry.status === 'STANDBY_MODE' || telemetry.latest.eventType === 'STANDBY';
  const statusColor = isStandby ? '#3b82f6' : (telemetry.isBreak ? '#f59e0b' : (isActive ? '#22c55e' : '#71717a'));
  const statusText = isStandby ? 'STANDBY MODE' : (telemetry.isBreak ? 'ON BREAK' : (isActive ? 'TRACKING LIVE' : 'IDLE / LOCKED'));

  if (!isAuthenticated) {
    return (
      <div style={{ 
        height: '100vh', width: '100vw', background: '#020617', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* Animated Background Elements */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', filter: 'blur(80px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(0, 229, 143, 0.05) 0%, transparent 70%)', filter: 'blur(80px)' }}></div>

        <div style={{ zIndex: 10, textAlign: 'center', maxWidth: '500px', animation: 'fadeIn 0.8s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ padding: '1.25rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.2)', boxShadow: '0 0 40px rgba(59, 130, 246, 0.1)' }}>
              <Shield size={56} color="#3b82f6" strokeWidth={1.5} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0, color: 'white', lineHeight: 1 }}>WorkSphere</h1>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.4em', marginTop: '0.4rem' }}>Enterprise Intelligence</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '32px', padding: '3.5rem',
            boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.8)'
          }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.8rem', letterSpacing: '-0.02em' }}>Unified Session Access</h2>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Welcome back. The system is ready for identity validation. Please click below to initiate your secure session.
            </p>

            <button 
              onClick={() => { setCaptureType('login'); setShowCapture(true); }}
              style={{ 
                width: '100%', padding: '1.4rem', borderRadius: '18px', border: 'none',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white', fontSize: '1.15rem', fontWeight: 950, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                boxShadow: '0 12px 35px -10px rgba(59, 130, 246, 0.6)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 45px -10px rgba(59, 130, 246, 0.7)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 35px -10px rgba(59, 130, 246, 0.6)';
              }}
            >
              <Camera size={26} />
              LOGIN TO WORKSPACE
            </button>

            <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e58f', boxShadow: '0 0 10px #00e58f' }}></div>
                 <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>GPS Active</span>
              </div>
              <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e58f', boxShadow: '0 0 10px #00e58f' }}></div>
                 <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Biometric Ready</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '4rem', fontSize: '0.7rem', color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            WorkSphere Global Security Protocol &bull; v2026.4
          </div>
        </div>

        {/* Modal needs to be here too */}
        {showCapture && (
          <FaceCaptureModal 
            type={captureType} 
            onCapture={(data) => {
              const newLogs = [...attendanceLogs, data];
              setAttendanceLogs(newLogs);
              setLastLoginInfo(data);
              localStorage.setItem('attendance_logs', JSON.stringify(newLogs));
              
              if (captureType === 'login') {
                setHasLoggedInToday(true);
                setIsAuthenticated(true);
                localStorage.setItem('is_authenticated', 'true');
                setShowCapture(false);
              }
            }}
            onClose={() => setShowCapture(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: 'var(--bg-primary)', 
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-geist-sans), Inter, system-ui, sans-serif'
    }}>
      {/* Sidebar */}
      <aside style={{ 
        width: sidebarCollapsed ? '64px' : '240px', 
        borderRight: '1px solid var(--border-subtle)', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'visible',
        position: 'relative',
        zIndex: 50
      }}>
        <div style={{ 
          height: '56px', 
          background: 'transparent', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          padding: sidebarCollapsed ? '0' : '0 1rem',
          flexShrink: 0
        }}>
          {/* Logo Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)', 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 15px rgba(31, 111, 235, 0.3)'
            }}>
              <Shield size={18} color="#fff" fill="#fff" />
            </div>
            {!sidebarCollapsed && <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>WorkSphere</span>}
          </div>

          {/* Floating Arrow Toggle Button */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-strong)',
              color: 'var(--accent-blue)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'absolute',
              right: '-16px',
              top: '12px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              outline: 'none',
              zIndex: 60,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              padding: 0
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--accent-blue)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {sidebarCollapsed ? <ChevronRight size={18} strokeWidth={3} /> : <ChevronLeft size={18} strokeWidth={3} />}
          </button>
        </div>

        <div style={{ padding: '1rem 0.75rem', width: '100%' }}>
          <div style={{ 
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)', 
            borderRadius: '16px', 
            padding: sidebarCollapsed ? '0.75rem 0.25rem' : '1rem',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: sidebarCollapsed ? 'center' : 'flex-start',
            gap: '0.75rem',
            overflow: 'hidden',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            {!sidebarCollapsed && <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Session</div>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', gap: '0.75rem', width: '100%' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '12px', 
                background: 'var(--bg-tertiary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid var(--border-strong)',
                flexShrink: 0
              }}>
                <User size={18} color="var(--accent-blue)" />
              </div>
              {!sidebarCollapsed && (
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{telemetry.employeeId}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>{telemetry.email}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav style={{ flex: 1, padding: '0 0.75rem', width: '100%' }}>
          <SidebarLink active={currentTab === 'Overview'} icon={<LayoutDashboard size={18} />} label={sidebarCollapsed ? "" : "Overview"} onClick={() => setCurrentTab('Overview')} collapsed={sidebarCollapsed} />
          <SidebarLink active={currentTab === 'Activity'} icon={<Radar size={18} />} label={sidebarCollapsed ? "" : "Activity"} onClick={() => setCurrentTab('Activity')} collapsed={sidebarCollapsed} />
          <SidebarLink active={currentTab === 'Analytics'} icon={<LineChart size={18} />} label={sidebarCollapsed ? "" : "Analytics"} onClick={() => setCurrentTab('Analytics')} collapsed={sidebarCollapsed} />
          <SidebarLink active={currentTab === 'Live Tracking'} icon={<Target size={18} />} label={sidebarCollapsed ? "" : "Live Tracking"} onClick={() => setCurrentTab('Live Tracking')} collapsed={sidebarCollapsed} />
          <SidebarLink active={currentTab === 'Reports'} icon={<FileSearch size={18} />} label={sidebarCollapsed ? "" : "Reports"} onClick={() => setCurrentTab('Reports')} collapsed={sidebarCollapsed} />
          <SidebarLink active={currentTab === 'Attendance'} icon={<UserCheck size={18} />} label={sidebarCollapsed ? "" : "Attendance"} onClick={() => setCurrentTab('Attendance')} collapsed={sidebarCollapsed} />
          <SidebarLink active={currentTab === 'System Audit'} icon={<Fingerprint size={18} />} label={sidebarCollapsed ? "" : "System Audit"} onClick={() => setCurrentTab('System Audit')} collapsed={sidebarCollapsed} />
        </nav>

        {/* Footer Section */}
        <div style={{ padding: '1.5rem 0.75rem', borderTop: '1px solid #27272a', width: '100%' }}>
          <SidebarLink 
            icon={<LogOut size={18} color="#ef4444" />} 
            label={sidebarCollapsed ? "" : "Logout System"} 
            collapsed={sidebarCollapsed}
            onClick={async () => {
              setCaptureType('logout');
              setShowCapture(true);
            }} 
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Sleek Enterprise Header */}
        <header style={{ 
          padding: '0 1.5rem', 
          height: '56px',
          minHeight: '56px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Command Center</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-strong)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}></div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{statusText}</span>
            </div>
            <div style={{ height: '12px', width: '1px', background: 'var(--border-strong)' }}></div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {telemetry.employeeId}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Session: {mounted ? new Date(telemetry.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </div>
            </div>
            <div 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ position: 'relative', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
               <Bell size={18} color={showNotifications ? 'var(--accent-blue)' : "var(--text-secondary)"} />
               <div style={{ position: 'absolute', top: '0', right: '0', background: 'var(--accent-blue)', width: '8px', height: '8px', borderRadius: '50%', border: '2px solid var(--bg-primary)' }}></div>
               
               {showNotifications && (
                 <div style={{ 
                   position: 'absolute', top: '100%', right: '0', marginTop: '1rem', width: '300px', 
                   background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', 
                   borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 100,
                   overflow: 'hidden', animation: 'slideDown 0.3s ease'
                 }}>
                   <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Notifications</div>
                   <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                     {notifications.map(n => (
                       <div key={n.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', cursor: 'default' }}>
                         <div style={{ fontWeight: 700, fontSize: '0.85rem', color: n.type === 'success' ? 'var(--accent-green)' : 'var(--text-primary)' }}>{n.title}</div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{n.message}</div>
                         <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 600 }}>{n.time}</div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </div>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              background: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              fontWeight: 500,
              fontSize: '0.75rem',
              border: '1px solid var(--border-strong)'
            }}>
              {mounted && telemetry.email ? telemetry.email[0].toUpperCase() : 'G'}
            </div>
          </div>
        </header>

        <div style={{ padding: '2.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {currentTab === 'Overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {isStandby && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                  padding: '2.5rem', 
                  borderRadius: '20px', 
                  border: '1px solid #1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.5rem',
                  textAlign: 'center',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
                    <Shield size={48} color="#3b82f6" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>System in Standby Mode</h2>
                    <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
                      Tracking is automatically paused outside office hours (09:00 AM - 06:00 PM). Your privacy is protected and no snapshots are being recorded at this time.
                    </p>
                  </div>
                  <div style={{ padding: '0.75rem 1.5rem', background: '#1e293b', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6' }}>
                    Next Tracking Session: Tomorrow at 09:00 AM
                  </div>
                </div>
              )}

              {/* Active Status Card */}
              <div style={{ 
                background: 'var(--bg-secondary)',
                borderRadius: '20px',
                border: '1px solid var(--border-strong)',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                backgroundImage: 'radial-gradient(circle at top left, rgba(255,255,255,0.03), transparent)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: statusColor }}>
                    <Monitor size={18} />
                    <span style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {telemetry.isBreak ? 'On Break' : (isActive ? 'System Active' : 'System Idle')}
                    </span>
                  </div>
                  {isActive && (
                    <div style={{ 
                      background: 'rgba(0, 229, 143, 0.1)', 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '100px',
                      color: 'var(--accent-green)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: '1px solid rgba(0, 229, 143, 0.2)',
                      letterSpacing: '0.05em'
                    }}>
                      {formatDuration(telemetry.latest.appDuration).toUpperCase()}
                    </div>
                  )}
                </div>

                {isActive ? (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2.5rem' }}>
                    <div style={{ 
                      width: '80px', 
                      height: '80px', 
                      background: 'var(--bg-tertiary)', 
                      borderRadius: '20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--text-primary)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                      {getAppIcon(telemetry.latest.app, 48)}
                    </div>
                    <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Foreground Process</div>
                      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1, letterSpacing: '-0.03em' }}>
                        {telemetry.latest.app}
                      </h1>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-blue)' }}></div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
                          {telemetry.latest.title}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2.5rem', padding: '0.5rem 0', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '2.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.6rem' }}>Keyboard</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                          {telemetry.latest.keystrokeVelocity} 
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>CPM</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.6rem' }}>Mouse</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                          {telemetry.latest.mouseClicks}
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>CLKS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '-0.01em' }}>
                      {telemetry.isBreak ? '☕ System on Break' : '🔒 System in Standby'}
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '0.95rem' }}>Awaiting user activity or next scheduled session...</p>
                  </div>
                )}

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${statusColor}, transparent)`, opacity: 0.5 }}></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* App Usage List */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-strong)', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.4rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                      <Clock size={16} color="var(--accent-blue)" />
                    </div>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Daily App Usage</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.entries(telemetry.sessionStats).sort((a: any, b: any) => b[1] - a[1]).slice(0, 6).map(([app, sec]: any) => (
                      <div key={app} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ color: 'var(--text-muted)' }}>{getAppIcon(app, 16)}</div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{app}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{formatDuration(sec)}</span>
                      </div>
                    ))}
                    {Object.keys(telemetry.sessionStats).length === 0 && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', fontSize: '0.85rem' }}>No telemetry data.</div>}
                  </div>
                </div>

                {/* Event Feed */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-strong)', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.4rem', background: 'rgba(20, 184, 166, 0.1)', borderRadius: '8px' }}>
                      <Layers size={16} color="var(--accent-cyan)" />
                    </div>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent System Events</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recentEvents.slice(0, 4).map((event: any, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ width: '2px', background: 'var(--border-strong)', borderRadius: '1px' }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{event.eventType}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'Activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Audit Intelligence</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Comprehensive real-time activity ledger and event sequencing.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {allEvents.map((ev: any, i: number) => (
                  <div key={i} className="transition-premium" style={{ 
                    padding: '1rem 1.5rem', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: '16px', 
                    border: '1px solid var(--border-strong)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '10px', 
                        background: 'var(--bg-tertiary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--accent-blue)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        {getAppIcon(ev.app, 20)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ev.app}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ev.eventType}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{ev.title}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{new Date(ev.timestamp).toLocaleTimeString([], { hour12: false })}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID: {ev.employeeId || 'USER'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'Analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-strong)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Utilization Rate</div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
                    {formatDuration(Object.values(telemetry.sessionStats).reduce((a: any, b: any) => a + b, 0) as number)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>Active production time today</div>
                </div>
                <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-strong)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Max Velocity</div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
                    {Math.max(...allEvents.map((e: any) => e.keystrokeVelocity || 0), 0)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>CPM</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>Peak input concentration</div>
                </div>
                <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-strong)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Network Signals</div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
                    {telemetry.sessionStats ? Object.keys(telemetry.sessionStats).length : 0} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>APPS</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>Unique applications audited</div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-strong)', padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Efficiency Distribution</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Audit of time investment per application lifecycle.</p>
                  </div>
                  <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    SESSION: LIVE
                  </div>
                </div>
                <div style={{ height: '400px' }}>
                  <AppUsageChart stats={telemetry.sessionStats} />
                </div>
              </div>
            </div>
          )}          {currentTab === 'Live Tracking' && (
            <div style={{ height: 'calc(100vh - 120px)', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Signal Intelligence</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Live GPS hardware telemetry and regional signal tracking.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ padding: '0.6rem 1.25rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)' }}></div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>ENCRYPTED SIGNAL</span>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: '500px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-strong)', boxShadow: '0 12px 48px rgba(0,0,0,0.5)' }}>
                <LiveTrackingMap />
              </div>
            </div>
          )}
          {currentTab === 'Reports' && (
            <div id="report-tab-view" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Premium Report Header */}
              <div style={{ 
                background: 'var(--bg-secondary)', 
                borderRadius: '24px', 
                border: '1px solid var(--border-strong)', 
                padding: '2rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px' }}>
                      <FileText size={20} color="var(--accent-blue)" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Intelligence Reporting</h2>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: '3rem' }}>Verified work evidence and hardware telemetry for <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>{telemetry.employeeId}</span></p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', zIndex: 1 }}>
                  <button 
                    onClick={() => {
                      const csv = [
                        ['Start Time', 'End Time', 'Duration', 'Application', 'Window/Tab Title', 'Location'],
                        ...(telemetry.timeline || []).map((t: any) => [
                          new Date(t.startTime).toLocaleTimeString(),
                          new Date(t.endTime).toLocaleTimeString(),
                          formatDuration(t.duration),
                          t.app,
                          t.title,
                          t.latitude && t.latitude !== 0 ? `${t.latitude}, ${t.longitude}` : (t.network && t.network !== 'Unknown' ? t.network : 'WorkSphere Secure Node')
                        ])
                      ].map(e => e.join(",")).join("\n");
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.setAttribute('hidden', '');
                      a.setAttribute('href', url);
                      a.setAttribute('download', `WorkSphere_Report_${telemetry.employeeId}.csv`);
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="transition-premium"
                    style={{ 
                      background: 'transparent', 
                      color: 'var(--text-primary)', 
                      border: '1px solid var(--border-strong)', 
                      padding: '0.75rem 1.5rem', 
                      borderRadius: '12px', 
                      cursor: 'pointer', 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.6rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Download size={16} /> Export CSV
                  </button>
                  <button 
                    disabled={isGenerating}
                    onClick={async () => {
                      setIsGenerating(true);
                      try {
                        const res = await fetch('/api/telemetry');
                        if (!res.ok) throw new Error('Failed to fetch live data');
                        const liveData = await res.json();
                        if (liveData.error) throw new Error(liveData.error);
                        
                        const stats = liveData.sessionStats || {};
                        const totalDuration = Object.values(stats).reduce((a: any, b: any) => a + Number(b), 0) as number;

                        const sysRes = await fetch('http://localhost:4000/api/system/metrics');
                        let systemMetrics = null;
                        if (sysRes.ok) {
                          systemMetrics = await sysRes.json();
                        }

                        await generateEnterpriseReport({
                          ...liveData,
                          sessionStats: stats,
                          totalDuration: totalDuration,
                          systemMetrics: systemMetrics
                        });
                        
                      } catch (err: any) {
                        alert(`Export failed: ${err.message}`);
                      } finally {
                        setIsGenerating(false);
                      }
                    }} 
                    className="transition-premium"
                    style={{ 
                      background: 'var(--accent-green)', 
                      color: 'black', 
                      border: 'none', 
                      padding: '0.75rem 1.75rem', 
                      borderRadius: '12px', 
                      cursor: isGenerating ? 'not-allowed' : 'pointer', 
                      fontWeight: 800, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.6rem',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 12px rgba(0, 229, 143, 0.3)',
                      opacity: isGenerating ? 0.7 : 1
                    }}
                  >
                    {isGenerating ? <Activity size={18} className="animate-spin" /> : <Download size={18} />} 
                    {isGenerating ? 'GENERATING...' : 'Download PDF'}
                  </button>
                </div>
                <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.05 }}>
                   <BarChart3 size={180} />
                </div>
              </div>

              {/* Professional Report Preview */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                padding: '4rem 2rem',
                background: 'var(--bg-primary)',
                borderRadius: '32px',
                border: '1px solid var(--border-strong)',
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)',
                marginBottom: '4rem',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '1rem', left: '2rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>DOCUMENT PREVIEW</div>
                <div id="printable-report" style={{ 
                  background: 'white', 
                  color: '#0f172a', 
                  padding: '5rem',
                  width: '950px',
                  borderRadius: '4px',
                  boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7), 0 0 20px rgba(59, 130, 246, 0.1)',
                  minHeight: '1200px',
                  border: '1px solid #e2e8f0',
                  position: 'relative'
                }}>
                  {/* Page 1: Header & Summary Cards */}
                  <div style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: '2rem', marginBottom: '3rem' }}>
                      <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 950, margin: 0, letterSpacing: '-0.05em', color: '#0f172a' }}>WorkSphere Productivity Report</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem', fontWeight: 500 }}>Verified Work Evidence Log</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{new Date().toLocaleDateString()}</div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>{telemetry.employeeId}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '3rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Employee Authentication Data</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee Name / ID</div>
                          <input 
                            value={profile.id} 
                            onChange={(e) => setProfile({...profile, id: e.target.value})}
                            onFocus={() => setIsEditingProfile(true)}
                            onBlur={() => setTimeout(() => setIsEditingProfile(false), 5000)}
                            style={{ 
                              fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem', color: '#0f172a', 
                              border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem 0.8rem', width: '100%',
                              outline: 'none', background: '#f8fafc'
                            }} 
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Email</div>
                          <input 
                            value={profile.email} 
                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                            onFocus={() => setIsEditingProfile(true)}
                            onBlur={() => setTimeout(() => setIsEditingProfile(false), 5000)}
                            style={{ 
                              fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem', color: '#0f172a', 
                              border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem 0.8rem', width: '100%',
                              outline: 'none', background: '#f8fafc'
                            }} 
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Last Session Verification</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>
                            {lastLoginInfo ? `${lastLoginInfo.date} @ ${lastLoginInfo.time}` : 'No active session verified'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Verification Location</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3b82f6', marginTop: '0.3rem', lineHeight: 1.4 }}>
                            {lastLoginInfo ? lastLoginInfo.address : 'System GPS Standby'}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                         <button 
                           onClick={() => {
                             setIsEditingProfile(false);
                             setNotifications([{ id: Date.now(), title: 'Profile Updated', message: 'System records have been updated successfully.', time: 'Just now', type: 'success' }, ...notifications]);
                             alert('Profile updated successfully!');
                           }}
                           style={{ 
                             background: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.5rem', 
                             borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem'
                           }}
                         >
                           Update System Record
                         </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '4rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Shift & Productivity Summary</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div style={{ padding: '2.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Total Active Duration</div>
                          <div style={{ fontSize: '3rem', fontWeight: 950, marginTop: '1rem', color: '#0f172a', letterSpacing: '-0.02em' }}>{formatDuration(Object.values(telemetry.sessionStats).reduce((a: any, b: any) => a + Number(b), 0) as number)}</div>
                        </div>
                        <div style={{ padding: '2.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Official Office Shift</div>
                          <div style={{ fontSize: '2.25rem', fontWeight: 950, marginTop: '1rem', color: '#0f172a' }}>09:00 AM — 06:00 PM</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '0.5rem' }}>Standard 9h Required Shift</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page 2: Productivity Analysis Chart */}
                  <div style={{ marginBottom: '5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2.5rem', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Productivity Analysis Chart</h3>
                    <div style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem' }}>App Usage Distribution</div>
                        <div style={{ height: '300px' }}>
                          <AppUsageChart stats={telemetry.sessionStats} isPrint={true} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page 3: Verified Activity Timeline */}
                  <div style={{ marginTop: '4rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', color: '#0f172a' }}>Verified Activity Timeline</h3>
                    <div style={{ overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#0f172a', fontSize: '0.75rem', fontWeight: 900 }}>DATE</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#0f172a', fontSize: '0.75rem', fontWeight: 900 }}>TIME IN</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#0f172a', fontSize: '0.75rem', fontWeight: 900 }}>TIME OUT</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#0f172a', fontSize: '0.75rem', fontWeight: 900 }}>APP / SERVICE</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#0f172a', fontSize: '0.75rem', fontWeight: 900 }}>TAB / WINDOW TITLE</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#0f172a', fontSize: '0.75rem', fontWeight: 900 }}>LOCATION</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#0f172a', fontSize: '0.75rem', fontWeight: 900 }}>DURATION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(telemetry.timeline || []).slice(0, 20).map((t: any, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#64748b' }}>{new Date(t.startTime).toLocaleDateString()}</td>
                              <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                              <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{new Date(t.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                              <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  {getAppIcon(t.app, 16)}
                                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>{t.app}</span>
                                </div>
                              </td>
                              <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#64748b', maxWidth: '300px' }}>{t.title}</td>
                              <td style={{ padding: '1rem', fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>
                                {t.latitude && t.latitude !== 0 ? `${t.latitude.toFixed(3)}, ${t.longitude.toFixed(3)}` : (t.network && t.network !== 'Unknown' ? t.network : 'WorkSphere Secure Node')}
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <span style={{ background: '#000', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 950 }}>{formatDuration(t.duration)}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'Attendance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Attendance Intelligence</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Visual verification of login and logout sequences with biometric metadata.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {attendanceLogs.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px dashed var(--border-strong)', textAlign: 'center' }}>
                    <Camera size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No attendance records found for this period.</div>
                  </div>
                ) : (
                  attendanceLogs.slice().reverse().map((log: any, i: number) => (
                    <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-strong)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                      <div style={{ position: 'relative', height: '200px', background: '#000' }}>
                        <img src={log.image} alt="Capture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: log.type === 'login' ? 'var(--accent-green)' : '#ef4444', color: 'black', fontSize: '0.65rem', fontWeight: 900, padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase' }}>
                          {log.type}
                        </div>
                      </div>
                      <div style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Timestamp</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{log.time}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Date</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{log.date}</div>
                          </div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                             <MapPin size={12} color="var(--accent-blue)" />
                             <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Location</span>
                           </div>
                           <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.4 }}>{log.address}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {currentTab === 'System Audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <SystemGuardian />
            </div>
          )}
        </div>
      </main>

      {/* Face Capture Modal */}
      {showCapture && (
        <FaceCaptureModal 
          type={captureType} 
          onCapture={(data) => {
            const newLogs = [...attendanceLogs, data];
            setAttendanceLogs(newLogs);
            setLastLoginInfo(data);
            localStorage.setItem('attendance_logs', JSON.stringify(newLogs));
            
            if (captureType === 'login') {
              setHasLoggedInToday(true);
              setIsAuthenticated(true);
              localStorage.setItem('is_authenticated', 'true');
              setShowCapture(false);
            } else {
              fetch('/api/logout', { method: 'POST' }).then(() => {
                alert('Shift ended successfully. WorkSphere session terminated.');
                window.location.reload();
              });
            }
          }}
          onClose={() => {
            if (captureType === 'logout') setShowCapture(false);
            // Login capture is mandatory, cannot close without it unless already logged in
          }}
        />
      )}
    </div>
  );
}

function FaceCaptureModal({ type, onCapture, onClose }: { type: 'login' | 'logout', onCapture: (data: any) => void, onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [address, setAddress] = useState('Fetching high-precision location...');
  const [coords, setCoords] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);

  useEffect(() => {
    // Start camera
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      })
      .catch(err => {
        console.error("Camera error:", err);
        alert("Camera access is required for identity verification.");
      });

    // Get Location
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setCoords(pos.coords);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          setAddress(data.display_name || `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        } catch (e) {
          setAddress(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (GPS Lock)`);
        }
      },
      () => setAddress('Location access denied. Using fallback node.')
    );

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || isCaptured) return;
    
    setIsProcessing(true);
    const context = canvasRef.current.getContext('2d');
    if (!context) {
      setIsProcessing(false);
      return;
    }

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
    setIsCaptured(true);
    
    onCapture({
      type,
      image: imageData,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      address: address,
      coords: coords ? { lat: coords.latitude, lng: coords.longitude } : null
    });
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{ 
        width: '100%', maxWidth: '500px', background: 'var(--bg-secondary)', 
        borderRadius: '32px', border: '1px solid var(--border-strong)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.6)', overflow: 'hidden'
      }}>
        <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: type === 'login' ? 'rgba(0, 229, 143, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', marginBottom: '1rem' }}>
            {type === 'login' ? <UserCheck size={32} color="var(--accent-green)" /> : <LogOut size={32} color="#ef4444" />}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            {type === 'login' ? 'Identity Verification' : 'Shift Termination'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
            Biometric face capture required to {type === 'login' ? 'start' : 'end'} your session.
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{ 
            position: 'relative', width: '100%', aspectRatio: '4/3', 
            background: '#000', borderRadius: '20px', overflow: 'hidden',
            border: '2px solid var(--border-strong)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
          }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            {!isCameraReady && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={32} className="animate-spin" />
              </div>
            )}
            <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--accent-blue)', borderRadius: '20px', opacity: 0.3, pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
              SECURE_LINK_ACTIVE // 256-BIT
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
               <MapPin size={14} color="var(--accent-blue)" />
               <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Verification Node</span>
             </div>
             <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.4 }}>{address}</div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            {type === 'logout' && (
              <button 
                onClick={onClose}
                style={{ flex: 1, background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', padding: '1rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                Cancel
              </button>
            )}
            <button 
              onClick={() => {
                if (isCaptured) {
                  alert('Your photo is already captured. Processing verification...');
                  return;
                }
                handleCapture();
              }}
              disabled={!isCameraReady || isProcessing || isCaptured}
              style={{ 
                flex: 2, 
                background: isCaptured ? 'var(--text-muted)' : (type === 'login' ? 'var(--accent-green)' : '#ef4444'), 
                color: 'black', border: 'none', padding: '1rem', borderRadius: '12px', 
                fontWeight: 950, cursor: (isCameraReady && !isProcessing && !isCaptured) ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: isCaptured ? 'none' : (type === 'login' ? '0 10px 20px rgba(0, 229, 143, 0.2)' : '0 10px 20px rgba(239, 68, 68, 0.2)'),
                transition: 'all 0.3s ease'
              }}
            >
              {isProcessing ? <RefreshCw size={20} className="animate-spin" /> : <Camera size={20} />}
              {isCaptured ? 'PHOTO CAPTURED' : (type === 'login' ? 'VERIFY & LOGIN' : 'VERIFY & LOGOUT')}
            </button>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

function SidebarLink({ icon, label, active = false, onClick, collapsed = false }: any) {
  return (
    <div 
      onClick={onClick}
      className="transition-premium"
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? '0' : '1rem', 
        padding: collapsed ? '0.75rem 0' : '0.75rem 1rem', 
        borderRadius: '12px', 
        cursor: 'pointer',
        backgroundColor: active ? 'rgba(31, 111, 235, 0.1)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        marginBottom: '0.4rem',
        position: 'relative',
        overflow: 'hidden',
        border: active ? '1px solid rgba(31, 111, 235, 0.3)' : '1px solid transparent',
        fontWeight: active ? 700 : 500,
        fontSize: '0.9rem'
      }}
      onMouseOver={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }
      }}
      onMouseOut={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {active && (
        <div style={{ 
          position: 'absolute', 
          left: 0, 
          top: '20%', 
          bottom: '20%', 
          width: '4px', 
          background: 'var(--accent-blue)', 
          borderRadius: '0 8px 8px 0', 
          boxShadow: '0 0 15px var(--accent-blue)' 
        }}></div>
      )}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? 'var(--text-primary)' : 'inherit' }}>
        {React.cloneElement(icon as any, { size: 20 })}
      </div>
      {!collapsed && <span style={{ fontSize: '0.9rem', fontWeight: active ? 800 : 600, letterSpacing: '0.01em' }}>{label}</span>}
    </div>
  );
}
