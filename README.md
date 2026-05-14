# 🌌 LiveGuard Pro: Enterprise-Grade Activity Intelligence

WorkSphere (now LiveGuard Pro) is a high-performance workstation monitoring agent and productivity analytics platform. Built for zero-latency tracking and unbreakable data integrity, it bridges the gap between low-level system events and high-level executive insights.

---

## 🛠️ Technology Stack

### **1. Core Monitoring Engine (Agent)**
*   **Electron & Node.js**: Provides a robust, cross-platform foundation for background execution.
*   **Kernel-Level Tracking**: Utilizes `active-win` for native window telemetry on Windows, macOS, and Linux.
*   **High-Frequency Sampling**: Polling intervals optimized for sub-500ms detection of browser tab switches and application transitions.
*   **Persistent JSONL Storage**: Implements a write-ahead logging (WAL) style storage using JSON Lines to ensure data durability even during system crashes.

### **2. Analytics & Visualization (Dashboard)**
*   **Next.js 15 (App Router)**: Leveraging the latest React features for high-performance, SEO-friendly visualization.
*   **TailwindCSS 4.0**: Modern, glassmorphic UI design with deep dark mode support and responsive layouts.
*   **Recharts Engine**: Dynamic, interactive charting for real-time productivity metrics.
*   **Advanced Export Suite**: 
    *   **jsPDF & html2canvas**: Precision-engineered PDF engine for audit-ready report generation.
    *   **Custom Scoring Algorithms**: Proprietary productivity scoring based on application categorization and dwell time.

---

## 📁 Project Architecture & Technical Structure

The WorkSphere (LiveGuard Pro) ecosystem is partitioned into three specialized environments to ensure high-performance telemetry and modular security.

### **1. 🖥️ apps/agent (Forensic Monitoring Engine)**
The desktop agent is the "Sensor Layer" of the platform, executing natively on the workstation.
*   **`main.js`**: The central orchestrator. It manages the Electron lifecycle, registers **IPC Handlers** for system audits, and executes the **Forensic Malware Scanner**.
*   **`get_gps.ps1`**: A precision PowerShell script that interfaces with the Windows Location API to pull hardware-verified coordinates.
*   **`activity_log.jsonl`**: A durable, line-based database that records every window switch, application transition, and security event with millisecond precision.

### **2. 📊 apps/dashboard/web (Intelligence Analytics Portal)**
The modern Next.js frontend responsible for visualizing data and managing biometric access.
*   **`src/app/page.tsx`**: The core application shell. Implements the **Biometric Login Portal** and the unified navigation system.
*   **`src/app/components/`**:
    *   **`SystemGuardian.tsx`**: The "Command Center" for cybersecurity. Triggers the agent's forensic engine and displays real-time malware rectification logs.
    *   **`LiveTrackingMap.tsx`**: An optimized Leaflet.js implementation for real-time fleet surveillance.
    *   **`SystemMonitor.tsx`**: High-fidelity hardware telemetry gauges (CPU, GPU, RAM, Network).
*   **`src/app/api/`**: Serverless routes for session management (Login/Logout) and telemetry ingestion.

### **3. 🔀 apps/dashboard/backend (Telemetry Hub & Reporting)**
The backbone of the platform, facilitating real-time communication.
*   **`server.js`**: A high-performance Socket.io and Express server. It broadcasts real-time location updates and security threats from the agent to all connected dashboards.
*   **`report_engine.js`**: The enterprise reporting core. It aggregates historical JSONL logs into audit-ready PDF forensic reports.
*   **`API.md`**: Detailed documentation for the telemetry protocol and location ingestion endpoints.

### **4. 🛠️ Root Utilities**
*   **`run_all.bat`**: The automated system launcher. Orchestrates the simultaneous startup of the backend hub, the web portal, and the forensic agent.
*   **`package.json`**: Root workspace configuration for monorepo-style dependency management.

---

## 🚀 Deployment & Installation

### **1. Prerequisites**
*   **Node.js**: v18.17.0+ (LTS Recommended)
*   **Git**: For version control.
*   **OS**: Windows 10/11 (Native tracking optimized for Windows).

### **2. Setup Instructions**

Clone the repository and install dependencies for both the agent and the dashboard:

```powershell
# Install Agent Environment
cd apps/agent
npm install

# Install Dashboard Environment
cd ../dashboard/web
npm install
```

### **3. Launching the Platform**

Use the provided universal launcher for a one-click startup experience:

```powershell
.\run_all.bat
```

This script initializes the monitoring agent in the background and spins up the Next.js analytics server at `http://localhost:3000`.

---

## 🛡️ Enterprise-Grade Security & Monitoring Features

### **1. Multi-User Fleet Intelligence**
*   **Real-Time Map Synchronization**: Track "N" number of concurrent users via verified hardware GPS sensors.
*   **Signal Integrity**: Distinguishes between local system signals and remote fleet nodes with sub-meter precision.
*   **Active Node Discovery**: Automatically populates the fleet sidebar with all currently online hardware nodes.

### **2. Cybersecurity & Malware Audit Suite**
*   **Deep-Kernel Malware Scan**: Scans active process signatures for viruses (e.g., Trojans, Miners, Exploits).
*   **Automatic Rectification**: Identified threats are instantly quarantined and "RECTIFIED" in the dashboard.
*   **Live Signal Stream**: A millisecond-precision terminal console showing every inbound telemetry packet.

### **3. Hardware Integrity & Visual Analytics**
*   **GPU Telemetry Engine**: Live monitoring of Dedicated vs. Integrated graphics (VRAM, Load, Temperature).
*   **Resource Allocation Pie Charts**: Visual real-time breakdown of CPU, Memory, and GPU pressure.
*   **High-Fidelity PDF Forensics**: Audit-ready reports including security clearance logs and hardware stress history.

---

## 📑 Operational Task Guide

To fully utilize the new WorkSphere (LiveGuard Pro) capabilities, follow these detailed tasks:

### **Task A: Live Fleet Surveillance**
1.  Navigate to the **Live Tracking** tab in the Sidebar.
2.  Verify the **Active Node Count** in the header.
3.  Click on any node in the **Fleet Intelligence** sidebar to instantly focus the high-precision map on that user's hardware coordinates.
4.  Toggle between **Satellite** and **Street** views for tactical visibility.

### **Task B: Full System Security Audit**
1.  Select the **System Audit** tab.
2.  Click **"Run Full Audit"** to initiate the multi-stage scan.
3.  Monitor the **Live Telemetry Signal Stream** (Terminal) at the bottom to see raw sensor data pulses.
4.  If a threat is detected, observe the **Toast Notification** and wait for the **Automatic Rectification** protocol to isolate the virus.

### **Task C: Hardware Performance Analysis**
1.  Review the **Resource Allocation Pie Chart** to identify hardware bottlenecks.
2.  Check the **GPU Acceleration** card for live VRAM and temperature metrics.
3.  Observe the **FPS / Lag Detection** gauge to ensure high-performance UI rendering.

### **Task D: Exporting Evidence-Grade Reports**
1.  Go to the **Reports** tab.
2.  Click **Export Audit Logs (PDF)**.
3.  The generated report now includes:
    *   **Page 5**: Hardware Integrity Audit (Full system diagnostics).
    *   **Page 6**: Security & Malware Audit (Rectified threats log).

---

## 🛡️ Support & Configuration

For advanced configuration, refer to the `apps/dashboard/backend/API.md` for telemetry endpoints or modify `apps/agent/main.js` to adjust polling intervals.

**Developed by Gagan CB (LiveGuard Pro Enterprise Solutions)**
