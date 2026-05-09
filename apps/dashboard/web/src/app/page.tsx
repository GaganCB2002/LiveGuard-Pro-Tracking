'use client';

import React, { useState, useEffect } from 'react';
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
  Menu
} from 'lucide-react';
import { generateEnterpriseReport } from './utils/reportEngine';
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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a', background: '#18181b', borderRadius: '12px', border: '1px solid #27272a' }}>
        No activity data tracked yet.
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
              innerRadius={isPrint ? "40%" : "55%"}
              outerRadius={isPrint ? "70%" : "80%"}
              paddingAngle={5}
              dataKey="value"
              startAngle={0}
              endAngle={360}
              isAnimationActive={false}
            >
              {activeData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            {!isPrint && (
              <Tooltip 
                contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                itemStyle={{ color: '#fafafa' }}
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
        console.error('Fetch Error:', e);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 200);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds === undefined || seconds === null) return '0h 0m 0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getAppIcon = (app: string, size = 24) => {
    const name = app.toLowerCase();
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

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: '#09090b', 
      color: '#fafafa',
      fontFamily: 'var(--font-geist-sans), Inter, system-ui, sans-serif'
    }}>
      {/* Sidebar */}
      <aside style={{ 
        width: sidebarCollapsed ? '80px' : '280px', 
        borderRight: '1px solid #27272a', 
        display: 'flex', 
        flexDirection: 'column',
        background: '#09090b',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        zIndex: 50
      }}>
        {/* Sidebar Header - Logo & Menu */}
        <div style={{ 
          height: '60px', 
          background: 'rgba(9, 9, 11, 0.8)', 
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #27272a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          padding: sidebarCollapsed ? '0' : '0 1rem',
          gap: '0.5rem',
          flexShrink: 0
        }}>
          {/* Shield Icon */}
          <div style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
            width: '36px', 
            height: '36px', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            flexShrink: 0
          }}>
            <Shield size={18} color="white" />
          </div>

          {/* Menu Toggle */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fafafa',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none',
              flexShrink: 0
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          >
            <Menu size={18} />
          </button>

          {/* Brand Name - only when expanded */}
          {!sidebarCollapsed && <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fafafa', letterSpacing: '-0.03em', whiteSpace: 'nowrap', marginLeft: '0.25rem' }}>WorkSphere</span>}
        </div>

        {/* Active Employee Section */}
        <div style={{ padding: '0 0.75rem 2rem 0.75rem', width: '100%' }}>
          <div style={{ 
            background: '#18181b', 
            borderRadius: '12px', 
            padding: sidebarCollapsed ? '0.75rem 0' : '1rem',
            border: '1px solid #27272a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            width: '100%'
          }}>
            {!sidebarCollapsed && <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.75rem', width: '100%', padding: '0 1rem' }}>Active Employee</div>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', gap: '0.75rem', width: '100%', padding: sidebarCollapsed ? '0' : '0 1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={18} color="#a1a1aa" />
              </div>
              {!sidebarCollapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{telemetry.employeeId}</div>
                  <div style={{ fontSize: '0.75rem', color: '#71717a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{telemetry.email}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav style={{ flex: 1, padding: '0 0.75rem', width: '100%' }}>
          <SidebarLink active={currentTab === 'Overview'} icon={<Monitor size={18} />} label={sidebarCollapsed ? "" : "Overview"} onClick={() => setCurrentTab('Overview')} collapsed={sidebarCollapsed} />
          <SidebarLink active={currentTab === 'Activity'} icon={<Activity size={18} />} label={sidebarCollapsed ? "" : "Activity"} onClick={() => setCurrentTab('Activity')} collapsed={sidebarCollapsed} />
          <SidebarLink active={currentTab === 'Analytics'} icon={<BarChart3 size={18} />} label={sidebarCollapsed ? "" : "Analytics"} onClick={() => setCurrentTab('Analytics')} collapsed={sidebarCollapsed} />
          <SidebarLink active={currentTab === 'Reports'} icon={<FileText size={18} />} label={sidebarCollapsed ? "" : "Reports"} onClick={() => setCurrentTab('Reports')} collapsed={sidebarCollapsed} />
        </nav>

        {/* Footer Section */}
        <div style={{ padding: '1.5rem 0.75rem', borderTop: '1px solid #27272a', width: '100%' }}>
          <SidebarLink 
            icon={<LogOut size={18} color="#ef4444" />} 
            label={sidebarCollapsed ? "" : "Logout System"} 
            collapsed={sidebarCollapsed}
            onClick={() => {
              if(confirm('Terminate current tracking session?')) {
                fetch('/api/logout', { method: 'POST' }).then(() => {
                  window.location.reload();
                });
              }
            }} 
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Glossy Header */}
        <header style={{ 
          padding: '0 2rem', 
          height: '60px',
          minHeight: '60px',
          borderBottom: '1px solid #27272a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(9, 9, 11, 0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fafafa', letterSpacing: '-0.02em' }}>System Command Center</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '100px', background: '#18181b', border: '1px solid #27272a' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{statusText}</span>
              <span style={{ fontSize: '0.75rem', color: '#71717a', marginLeft: '0.5rem', borderLeft: '1px solid #3f3f46', paddingLeft: '0.5rem' }}>ID: {telemetry.employeeId}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                Login: {mounted ? new Date(telemetry.loginTime).toLocaleTimeString() : '--:--:--'}
              </div>
            </div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              {mounted && telemetry.email ? telemetry.email[0].toUpperCase() : 'G'}
            </div>
          </div>
        </header>

        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
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
                background: '#09090b',
                borderRadius: '16px',
                border: `1px solid ${isActive ? '#10b981' : (telemetry.isBreak ? '#f59e0b' : '#27272a')}`,
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: statusColor }}>
                    <Monitor size={20} />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {telemetry.isBreak ? 'On Break' : (isActive ? 'Current Foreground' : 'System Idle')}
                    </span>
                  </div>
                  {isActive && (
                    <div style={{ 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '8px',
                      color: '#10b981',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      TIME ON APP: {formatDuration(telemetry.latest.appDuration)}
                    </div>
                  )}
                </div>

                {isActive ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ 
                      width: '80px', 
                      height: '80px', 
                      background: '#18181b', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid #27272a',
                      color: '#10b981'
                    }}>
                      {getAppIcon(telemetry.latest.app, 40)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#fafafa', margin: 0, lineHeight: 1.1, letterSpacing: '-0.04em' }}>
                        {telemetry.latest.app}
                      </h1>
                      <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                        Tab/Window: <span style={{ color: '#e4e4e7' }}>{telemetry.latest.title}</span>
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '3rem', padding: '0 2rem', borderLeft: '1px solid #27272a' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Input Velocity</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa' }}>{telemetry.latest.keystrokeVelocity} <span style={{ fontSize: '0.75rem', color: '#71717a' }}>CPM</span></div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Interactions</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa' }}>{telemetry.latest.mouseClicks} <span style={{ fontSize: '0.75rem', color: '#71717a' }}>s</span></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ fontSize: '1.5rem', color: '#71717a', fontWeight: 500 }}>
                      {telemetry.isBreak ? '☕ Taking a Break' : '🔒 Screen Locked / Idle'}
                    </div>
                    <p style={{ color: '#3f3f46', marginTop: '0.5rem' }}>System is currently waiting for activity...</p>
                  </div>
                )}

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${statusColor}, transparent)` }}></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* App Usage List */}
                <div style={{ background: '#09090b', borderRadius: '16px', border: '1px solid #27272a', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Clock size={18} color="#a1a1aa" />
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fafafa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily App Usage</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.entries(telemetry.sessionStats).sort((a: any, b: any) => b[1] - a[1]).map(([app, sec]: any) => (
                      <div key={app} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#18181b', borderRadius: '10px', border: '1px solid #27272a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ color: '#71717a' }}>{getAppIcon(app, 18)}</div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{app}</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#71717a', fontFamily: 'monospace' }}>{formatDuration(sec)}</span>
                      </div>
                    ))}
                    {Object.keys(telemetry.sessionStats).length === 0 && <div style={{ color: '#3f3f46', textAlign: 'center', padding: '1rem' }}>No apps tracked yet today.</div>}
                  </div>
                </div>

                {/* Event Feed */}
                <div style={{ background: '#09090b', borderRadius: '16px', border: '1px solid #27272a', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Layers size={18} color="#a1a1aa" />
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fafafa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent System Events</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {recentEvents.map((event: any, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ width: '2px', background: '#27272a', borderRadius: '1px' }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#71717a' }}>{new Date(event.timestamp).toLocaleTimeString()}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{event.eventType}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#e4e4e7' }}>{event.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'Activity' && (
            <div style={{ background: '#09090b', borderRadius: '16px', border: '1px solid #27272a', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Full Session Activity</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {allEvents.map((ev: any, i: number) => (
                  <div key={i} style={{ padding: '1rem', background: '#18181b', borderRadius: '10px', border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3b82f6' }}>{ev.eventType}</div>
                      <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>{ev.app} — {ev.title}</div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{new Date(ev.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'Analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ background: '#09090b', borderRadius: '16px', border: '1px solid #27272a', padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Efficiency Metrics</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ padding: '1.5rem', background: '#18181b', borderRadius: '12px', border: '1px solid #27272a' }}>
                    <div style={{ color: '#71717a', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Active Hours</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.5rem' }}>
                      {formatDuration(Object.values(telemetry.sessionStats).reduce((a: any, b: any) => a + b, 0) as number)}
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem', background: '#18181b', borderRadius: '12px', border: '1px solid #27272a' }}>
                    <div style={{ color: '#71717a', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Peak Velocity</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fafafa', marginTop: '0.5rem' }}>
                      {Math.max(...allEvents.map((e: any) => e.keystrokeVelocity || 0), 0)} <span style={{ fontSize: '1rem', color: '#71717a' }}>CPM</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div style={{ background: '#09090b', borderRadius: '16px', border: '1px solid #27272a', padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '2rem' }}>App Distribution (Time Spent)</h3>
                  <div style={{ height: '500px' }}>
                    <AppUsageChart stats={telemetry.sessionStats} />
                  </div>
                </div>
              </div>
            </div>
          )}
 
          {currentTab === 'Reports' && (
            <div id="report-tab-view" style={{ minHeight: 'calc(100vh - 120px)', width: '100%', padding: '0 1rem' }}>
              {/* Premium Report Header */}
              <div style={{ 
                background: 'rgba(24, 24, 27, 0.8)', 
                backdropFilter: 'blur(16px)',
                borderRadius: '24px', 
                border: '1px solid rgba(255, 255, 255, 0.05)', 
                padding: '2rem 2.5rem', 
                marginBottom: '3rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                zIndex: 10,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '6px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                      <FileText size={20} color="#3b82f6" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Reporting Engine</h2>
                  </div>
                  <p style={{ color: '#71717a', fontSize: '0.95rem', marginLeft: '2.75rem' }}>Enterprise-grade work evidence preview for <span style={{ color: '#3b82f6', fontWeight: 600 }}>{telemetry.employeeId}</span></p>
                </div>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <button 
                    onClick={() => {
                      const csv = [
                        ['Start Time', 'End Time', 'Duration', 'Application', 'Window/Tab Title'],
                        ...(telemetry.timeline || []).map((t: any) => [
                          new Date(t.startTime).toLocaleTimeString(),
                          new Date(t.endTime).toLocaleTimeString(),
                          formatDuration(t.duration),
                          t.app,
                          t.title
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
                    style={{ 
                      background: '#27272a', 
                      color: '#fff', 
                      border: '1px solid #3f3f46', 
                      padding: '0.85rem 1.75rem', 
                      borderRadius: '12px', 
                      cursor: 'pointer', 
                      fontWeight: 600, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#3f3f46'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#27272a'}
                  >
                    <Download size={18} /> Export CSV
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

                        await generateEnterpriseReport({
                          ...liveData,
                          sessionStats: stats,
                          totalDuration: totalDuration
                        });
                        
                      } catch (err: any) {
                        alert(`Export failed: ${err.message}`);
                      } finally {
                        setIsGenerating(false);
                      }
                    }} 
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.85rem 2.25rem', 
                      borderRadius: '14px', 
                      cursor: isGenerating ? 'not-allowed' : 'pointer', 
                      fontWeight: 800, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.85rem',
                      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: isGenerating ? 0.7 : 1
                    }}
                  >
                    {isGenerating ? <Activity size={20} /> : <Download size={20} />} 
                    {isGenerating ? 'PREPARING PDF...' : 'Download PDF Report'}
                  </button>
                </div>
              </div>

              {/* Professional Report Preview */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                padding: '4rem 2rem',
                background: '#0c0c0e',
                borderRadius: '32px',
                border: '1px solid #18181b',
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)',
                marginBottom: '4rem'
              }}>
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
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem', color: '#0f172a' }}>{telemetry.employeeId}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Email</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem', color: '#0f172a' }}>{telemetry.email}</div>
                        </div>
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
        </div>
      </main>
    </div>
  );
}


function SidebarLink({ icon, label, active = false, onClick, collapsed = false }: any) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? '0' : '0.75rem', 
        padding: '0.85rem 1rem', 
        borderRadius: '10px', 
        cursor: 'pointer',
        backgroundColor: active ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
        color: active ? '#10b981' : '#a1a1aa',
        marginBottom: '0.25rem',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        border: active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
        position: 'relative'
      }}
      onMouseOver={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
          e.currentTarget.style.color = '#fafafa';
        }
      }}
      onMouseOut={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#a1a1aa';
        }
      }}
    >
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      {!collapsed && <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{label}</span>}
      {active && !collapsed && (
        <div style={{ 
          position: 'absolute', 
          right: '12px', 
          width: '4px', 
          height: '4px', 
          borderRadius: '50%', 
          backgroundColor: '#10b981',
          boxShadow: '0 0 10px #10b981'
        }} />
      )}
    </div>
  );
}
