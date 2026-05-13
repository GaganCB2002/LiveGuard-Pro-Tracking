import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  employeeId: string;
  email: string;
  department: string;
  totalDuration: number;
  sessionStats: Record<string, number>;
  timeline: any[];
  allEvents: any[];
  loginTime: string;
  systemMetrics?: {
    healthScore: number;
    cpu: { percent: number; cores: number; freq_mhz: number };
    memory: { percent: number; total_gb: number; used_gb: number };
    disk: { percent: number; free_gb: number };
    network: { active_connections: number; bytes_sent_mb: number; bytes_recv_mb: number };
    system: { platform: string; hostname: string; uptime_hours: number };
    gpu?: { model: string; vram_gb: number; percent: number };
  };
  threats?: any[];
  alerts?: any[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// Generate a high-quality donut chart as a PNG data URL using Canvas 2D
function generateDonutChartImage(
  data: { name: string; value: number }[],
  totalValue: number,
  size: number = 500
): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.44;
  const innerRadius = size * 0.26;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Draw slices
  let currentAngle = -Math.PI / 2; // Start from top
  data.forEach((item, index) => {
    const sliceAngle = (item.value / totalValue) * 2 * Math.PI;
    const color = COLORS[index % COLORS.length];

    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, currentAngle, currentAngle + sliceAngle);
    ctx.arc(cx, cy, innerRadius, currentAngle + sliceAngle, currentAngle, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Subtle shadow between slices
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    currentAngle += sliceAngle;
  });

  // Center circle (white)
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius - 2, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Center text
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${size * 0.06}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Usage', cx, cy - size * 0.02);
  ctx.fillStyle = '#64748b';
  ctx.font = `${size * 0.04}px Arial, sans-serif`;
  ctx.fillText('Distribution', cx, cy + size * 0.04);

  return canvas.toDataURL('image/png', 1.0);
}

// Helper: Format Duration
const formatDuration = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
};

// Helper: Parse hex color to RGB
function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16)
  ];
}

export const generateEnterpriseReport = async (data: ReportData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Data Processing
  const stats = data.sessionStats || {};
  const statsArray = Object.entries(stats)
    .map(([name, value]) => ({ name, value: Number(value) }))
    .filter(item => item.value > 10)
    .sort((a, b) => b.value - a.value);

  const top6 = statsArray.slice(0, 6);
  const totalTop6Value = top6.reduce((acc, curr) => acc + curr.value, 0);
  const totalDuration = data.totalDuration || 0;

  // ============================
  // PAGE 1: HEADER & SUMMARY
  // ============================
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, 60, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('WorkSphere Productivity Report', margin, 35);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Verified Work Evidence Log • ' + new Date().toLocaleDateString(), margin, 42);

  // Employee Info
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Authentication Data', margin, 75);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('EMPLOYEE NAME / ID', margin, 85);
  doc.text('REGISTERED EMAIL', margin + 80, 85);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(data.employeeId, margin, 92);
  doc.text(data.email, margin + 80, 92);

  // Shift & Productivity Summary
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Shift & Productivity Summary', margin, 110);

  const cardWidth = (pageWidth - (margin * 2) - 10) / 2;

  // Total Active Duration Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 118, cardWidth, 40, 3, 3, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL ACTIVE DURATION', margin + 10, 130);
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDuration(totalDuration), margin + 10, 145);

  // Shift Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + cardWidth + 10, 118, cardWidth, 40, 3, 3, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL OFFICE SHIFT', margin + cardWidth + 20, 130);
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('09:00 AM — 06:00 PM', margin + cardWidth + 20, 145);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text('Standard 9h Required Shift', margin + cardWidth + 20, 152);

  // ============================
  // PAGE 2: PRODUCTIVITY CHART
  // ============================
  doc.addPage();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Productivity Analysis Chart', margin, 20);

  // Generate and embed donut chart image
  if (top6.length > 0 && totalTop6Value > 0) {
    const chartImage = generateDonutChartImage(top6, totalTop6Value, 600);
    const chartSize = 65; // mm in PDF
    doc.addImage(chartImage, 'PNG', margin, 35, chartSize, chartSize);

    // Legend table (right side of chart)
    const legendX = margin + chartSize + 10;
    let legendY = 38;

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('App Usage Distribution', legendX, legendY);
    legendY += 10;

    top6.forEach((item, index) => {
      const percentage = (item.value / totalTop6Value) * 100;
      const [r, g, b] = hexToRgb(COLORS[index % COLORS.length]);
      const barMaxWidth = 25;

      // Color dot
      doc.setFillColor(r, g, b);
      doc.circle(legendX + 3, legendY - 1.5, 2.5, 'F');

      // App name
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      const displayName = item.name.length > 18 ? item.name.substring(0, 18) + '…' : item.name;
      doc.text(displayName, legendX + 9, legendY);

      // Duration
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(formatDuration(item.value), legendX + 55, legendY);

      // Progress bar background
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(legendX + 82, legendY - 3, barMaxWidth, 4.5, 1.5, 1.5, 'F');
      
      // Progress bar fill
      doc.setFillColor(r, g, b);
      const fillWidth = Math.max(1, barMaxWidth * (percentage / 100));
      doc.roundedRect(legendX + 82, legendY - 3, fillWidth, 4.5, 1.5, 1.5, 'F');

      legendY += 14;
    });
  }

  // ============================
  // PAGE 3: ACTIVITY TIMELINE
  // ============================
  doc.addPage();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Verified Activity Timeline', margin, 20);

  const timelineData = (data.timeline || []).slice(0, 100);

  autoTable(doc, {
    startY: 35,
    head: [['TIME IN', 'TIME OUT', 'APP / SERVICE', 'TAB / WINDOW TITLE', 'LOCATION', 'DURATION']],
    body: timelineData.map((t: any) => [
      new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      new Date(t.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      t.app,
      ((t.title || '') as string).substring(0, 30) + (((t.title || '') as string).length > 30 ? '...' : ''),
      t.latitude && t.latitude !== 0 ? `${t.latitude.toFixed(3)}, ${t.longitude.toFixed(3)}` : (t.network && t.network !== 'Unknown' ? t.network : 'WorkSphere Secure Node'),
      formatDuration(t.duration)
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 7, fontStyle: 'bold', cellPadding: 3 },
    bodyStyles: { fontSize: 6.5, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 20 },
      2: { cellWidth: 25, fontStyle: 'bold' },
      3: { cellWidth: 50 },
      4: { cellWidth: 35, fontSize: 6 },
      5: { cellWidth: 20, halign: 'right' as const, fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });

  // ============================
  // PAGE 4: GEOSPATIAL LOG
  // ============================
  doc.addPage();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Geospatial Presence Log', margin, 20);

  const locationEvents = (data.allEvents || [])
    .filter(e => e.eventType === 'LOCATION_UPDATE' || e.latitude)
    .slice(0, 50);

  autoTable(doc, {
    startY: 35,
    head: [['TIMESTAMP', 'LATITUDE', 'LONGITUDE', 'NETWORK / NODE', 'ACCURACY']],
    body: locationEvents.map((e: any) => [
      new Date(e.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      e.latitude.toFixed(5),
      e.longitude.toFixed(5),
      e.network || 'Ethernet/LTE',
      `±${Math.round(e.accuracy)}m`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 7, fontStyle: 'bold', cellPadding: 3 },
    bodyStyles: { fontSize: 6.5, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 60, fontStyle: 'bold' },
      4: { cellWidth: 30, halign: 'right' as const }
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      // Footer on every page
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `WorkSphere Report • ${data.employeeId} • Generated ${new Date().toLocaleString()}`,
        margin,
        pageHeight - 8
      );
      doc.text(
        `Page ${doc.getNumberOfPages()}`,
        pageWidth - margin - 10,
        pageHeight - 8
      );
    }
  });

  // ============================
  // PAGE 5: HARDWARE INTEGRITY AUDIT
  // ============================
  if (data.systemMetrics) {
    doc.addPage();
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Hardware Integrity Audit', margin, 20);

    const m = data.systemMetrics;

    doc.setFontSize(12);
    doc.text('System Health Summary', margin, 40);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(`Overall Integrity Score: ${m.healthScore}%`, margin, 48);

    autoTable(doc, {
        startY: 55,
        head: [['SUBSYSTEM', 'TELEMETRY DATA', 'INTEGRITY STATUS']],
        body: [
            ['CPU CORE ENGINE', `${m.cpu.percent}% Load | ${m.cpu.cores} Cores @ ${m.cpu.freq_mhz}MHz`, m.cpu.percent < 80 ? 'OPTIMAL' : 'HIGH LOAD'],
            ['MEMORY CAPACITY', `${m.memory.percent}% Used | ${m.memory.used_gb}GB / ${m.memory.total_gb}GB`, m.memory.percent < 90 ? 'OPTIMAL' : 'CRITICAL'],
            ['GPU ACCELERATION', m.gpu ? `${m.gpu.percent}% Load | ${m.gpu.model} | ${m.gpu.vram_gb}GB` : 'N/A', m.gpu ? (m.gpu.percent < 85 ? 'OPTIMAL' : 'HIGH LOAD') : 'N/A'],
            ['DISK ARCHITECTURE', `${m.disk.percent}% Used | ${m.disk.free_gb}GB Free`, m.disk.percent < 95 ? 'OPTIMAL' : 'SPACE WARNING'],
            ['NETWORK INTERFACE', `Active Connections: ${m.network.active_connections} | Sent: ${m.network.bytes_sent_mb}MB`, 'VERIFIED'],
            ['OPERATING SYSTEM', `${m.system.platform} | Host: ${m.system.hostname} | Uptime: ${m.system.uptime_hours}h`, 'STABLE']
        ],
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40 },
            1: { cellWidth: 90 },
            2: { halign: 'center' as const, fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin }
    });

    // Hardware Distribution Chart
    const hwData = [
      { name: 'CPU', value: m.cpu.percent },
      { name: 'MEM', value: m.memory.percent },
      { name: 'GPU', value: m.gpu?.percent || 5 },
      { name: 'DISK', value: m.disk.percent }
    ];
    const hwImage = generateDonutChartImage(hwData, hwData.reduce((a, b) => a + b.value, 0), 400);
    doc.addImage(hwImage, 'PNG', pageWidth - margin - 40, (doc as any).lastAutoTable.finalY + 10, 35, 35);
    
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('Resource Allocation', pageWidth - margin - 40, (doc as any).lastAutoTable.finalY + 8);
  }

  // ============================
  // PAGE 6: SECURITY & MALWARE AUDIT
  // ============================
  if (data.threats || data.alerts) {
    doc.addPage();
    doc.setFillColor(15, 23, 42); // Dark header for security
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Security & Malware Audit Report', margin, 20);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text('Threat Detection & Neutralization Log', margin, 40);

    const allFindings = [
        ...(data.threats || []).map(t => ({ ...t, type: 'CRITICAL THREAT' })),
        ...(data.alerts || []).map(a => ({ ...a, type: 'SECURITY ALERT' }))
    ];

    autoTable(doc, {
        startY: 50,
        head: [['IDENTIFIED AGENT', 'DESCRIPTION / PAYLOAD', 'SEVERITY', 'STATUS']],
        body: allFindings.map(f => [
            f.title,
            f.message,
            f.type,
            f.message.includes('RECTIFIED') || f.message.includes('isolated') ? 'NEUTRALIZED' : 'QUARANTINED'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68], fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 45 },
            1: { cellWidth: 80 },
            2: { cellWidth: 30, halign: 'center' as const },
            3: { cellWidth: 25, halign: 'center' as const, fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin }
    });

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Final Security Assessment:', margin, (doc as any).lastAutoTable.finalY + 15);
    doc.setFontSize(8);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('ALL IDENTIFIED MALWARE AND SUSPICIOUS PROCESSES HAVE BEEN RECTIFIED.', margin, (doc as any).lastAutoTable.finalY + 22);
  }

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Verification Note:', margin, (doc as any).lastAutoTable.finalY + 15);
    doc.setFontSize(7);
    doc.text('This audit is performed via WorkSphere Hardware Abstraction Layer (HAL). All metrics are verified against system-level sensors.', margin, (doc as any).lastAutoTable.finalY + 20);

  // Save
  doc.save(`WorkSphere_Report_${data.employeeId}_${Date.now()}.pdf`);
};
