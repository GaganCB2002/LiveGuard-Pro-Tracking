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

## 📁 Project Architecture

```text
worksphere/
├── apps/
│   ├── agent/                 # System-Level Tracking Agent
│   │   ├── main.js            # Core lifecycle & telemetry logic
│   │   ├── package.json       # Agent dependencies
│   │   └── activity_log.jsonl # Durable activity database
│   └── dashboard/
│       ├── web/               # Next.js Analytics Portal
│       │   ├── src/app/       # Telemetry APIs & UI Pages
│       │   ├── public/        # Asset & Report Templates
│       │   └── package.json    # Dashboard dependencies
│       └── backend/           # Standalone Reporting Scripts
│           ├── report_engine.js # Automated report generator
│           └── API.md         # Internal API documentation
├── run_all.bat                # Unified System Launcher
└── README.md                  # Root Documentation
```

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

## 💎 Key Performance Features

*   **⚡ Sub-Second Latency**: Detects focus changes in under 500ms with negligible CPU overhead.
*   **🛡️ Data Durability**: Every heartbeat is flushed to a JSONL log, preventing data loss from unexpected power-offs.
*   **📊 Intelligent Categorization**: Automatically distinguishes between "Deep Work" (IDEs, Spreadsheets) and "Communication" (Slack, Teams).
*   **📑 Audit-Ready Reports**: Generate high-fidelity PDF reports with embedded charts and granular time logs.

---

## 🛡️ Support & Configuration

For advanced configuration, refer to the `apps/dashboard/backend/API.md` for telemetry endpoints or modify `apps/agent/main.js` to adjust polling intervals.

**Developed by Gagan CB (LiveGuard Pro Enterprise Solutions)**
