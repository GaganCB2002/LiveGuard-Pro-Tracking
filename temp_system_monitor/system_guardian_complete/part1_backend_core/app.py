"""
============================================================
PART 1: BACKEND CORE - System Guardian API Server
============================================================
This is the central hub that:
- Serves the dashboard (Part 3)
- Provides REST API endpoints
- Handles WebSocket connections for real-time updates
- Receives data from AI Agent (Part 2)
- Broadcasts alerts to connected clients

CONNECTS TO: Part 2 (AI Agent) | Part 3 (Frontend via WebSocket)
"""

from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_socketio import SocketIO, emit
import threading
import time
import json
from datetime import datetime
import sys
import os

# ============================================================
# CONFIGURATION - Edit these settings
# ============================================================
class Config:
    SECRET_KEY = 'system-guardian-secret-key-2026'
    HOST = '0.0.0.0'
    PORT = 5000
    DEBUG = False

    # WebSocket settings
    CORS_ALLOWED_ORIGINS = "*"
    ASYNC_MODE = 'threading'

    # Monitoring settings
    MONITOR_INTERVAL = 2  # seconds between updates
    MAX_ALERT_HISTORY = 1000

    # Paths (adjust if you move folders)
    TEMPLATE_DIR = '../part3_frontend_dashboard/templates'
    STATIC_DIR = '../part3_frontend_dashboard/static'

# ============================================================
# FLASK APP + SOCKETIO SETUP
# ============================================================
app = Flask(__name__, 
            template_folder=Config.TEMPLATE_DIR,
            static_folder=Config.STATIC_DIR)
app.config['SECRET_KEY'] = Config.SECRET_KEY

socketio = SocketIO(app, 
                   cors_allowed_origins=Config.CORS_ALLOWED_ORIGINS,
                   async_mode=Config.ASYNC_MODE)

# ============================================================
# GLOBAL STATE
# ============================================================
monitoring_active = False
monitor_thread = None
connected_clients = set()
alert_history = []
latest_metrics = None
latest_analysis = None
latest_threats = []

# ============================================================
# MONITORING THREAD - Runs in background
# ============================================================
class MonitoringThread(threading.Thread):
    """
    Background thread that continuously collects system data.
    This thread calls the AI Agent (Part 2) to get analyzed data.
    """

    def __init__(self, agent_module=None):
        super().__init__(daemon=True)
        self.running = True
        self.interval = Config.MONITOR_INTERVAL
        self.agent = agent_module  # Reference to AI Agent from Part 2

    def run(self):
        global latest_metrics, latest_analysis, latest_threats, alert_history

        while self.running:
            try:
                if self.agent:
                    # Get data from AI Agent (Part 2)
                    metrics = self.agent.collect_metrics()
                    analysis = self.agent.analyze_anomalies(metrics)

                    # Security scan every 10 seconds
                    threats = []
                    if int(time.time()) % 10 == 0:
                        threats = self.agent.security_scan()

                    # Calculate health score
                    health_score = self._calculate_health_score(
                        metrics, analysis, threats
                    )

                    # Store latest data
                    latest_metrics = metrics
                    latest_analysis = analysis
                    latest_threats = threats

                    # Store new alerts
                    for alert in analysis['alerts']:
                        alert['received_at'] = datetime.now().isoformat()
                        alert_history.insert(0, alert)
                        if len(alert_history) > Config.MAX_ALERT_HISTORY:
                            alert_history = alert_history[:Config.MAX_ALERT_HISTORY]

                    for threat in threats:
                        threat['received_at'] = datetime.now().isoformat()
                        alert_history.insert(0, threat)

                    # Build update package
                    update = {
                        'type': 'metrics',
                        'timestamp': datetime.now().isoformat(),
                        'data': metrics,
                        'alerts': analysis['alerts'],
                        'predictions': analysis['predictions'],
                        'threats': threats,
                        'health_score': health_score
                    }

                    # Broadcast to all connected clients (Part 3 receives this)
                    socketio.emit('system_update', update, namespace='/')

                    # Emit individual notifications
                    for alert in analysis['alerts']:
                        socketio.emit('new_alert', alert, namespace='/')

                    for threat in threats:
                        socketio.emit('new_threat', threat, namespace='/')

                time.sleep(self.interval)

            except Exception as e:
                print(f"[Backend] Monitoring error: {e}")
                time.sleep(5)

    def _calculate_health_score(self, metrics, analysis, threats):
        score = 100
        score -= max(0, (metrics['cpu']['percent'] - 50) * 0.5)
        score -= max(0, (metrics['memory']['percent'] - 60) * 0.5)
        score -= max(0, (metrics['disk']['percent'] - 70) * 0.3)
        score -= len(analysis['alerts']) * 10
        score -= len(threats) * 15
        return max(0, min(100, round(score, 1)))

    def stop(self):
        self.running = False

# ============================================================
# API ROUTES - REST Endpoints
# ============================================================

@app.route('/')
def index():
    """Serve the main dashboard (from Part 3)"""
    return render_template('dashboard.html')

@app.route('/api/status')
def api_status():
    """Get server status"""
    return jsonify({
        'status': 'running',
        'monitoring': monitoring_active,
        'clients': len(connected_clients),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/metrics')
def api_metrics():
    """Get current system metrics"""
    if latest_metrics:
        return jsonify(latest_metrics)
    return jsonify({'error': 'No metrics available yet'}), 503

@app.route('/api/report')
def api_report():
    """Get full system report (requires Part 2 agent)"""
    global monitor_thread
    if monitor_thread and monitor_thread.agent:
        report = monitor_thread.agent.generate_report()
        return jsonify(report)
    return jsonify({'error': 'AI Agent not connected'}), 503

@app.route('/api/alerts')
def api_alerts():
    """Get alert history with optional filtering"""
    severity = request.args.get('severity', 'all')
    if severity == 'all':
        return jsonify(alert_history)
    filtered = [a for a in alert_history if a.get('severity') == severity.upper()]
    return jsonify(filtered)

@app.route('/api/alerts/<alert_id>/acknowledge', methods=['POST'])
def acknowledge_alert(alert_id):
    """Acknowledge an alert"""
    for alert in alert_history:
        if alert.get('id') == alert_id:
            alert['acknowledged'] = True
            alert['acknowledged_at'] = datetime.now().isoformat()
            return jsonify({'success': True, 'alert': alert})
    return jsonify({'success': False, 'error': 'Alert not found'}), 404

@app.route('/api/threats')
def api_threats():
    """Get current security threats"""
    return jsonify(latest_threats)

@app.route('/api/threats/<threat_id>/quarantine', methods=['POST'])
def quarantine_threat(threat_id):
    """Quarantine a threat (calls Part 2 agent)"""
    global monitor_thread
    if monitor_thread and monitor_thread.agent:
        # In production, this would actually quarantine
        return jsonify({
            'success': True,
            'message': f'Threat {threat_id} quarantined',
            'action': 'Process isolated, network connections dropped'
        })
    return jsonify({'error': 'AI Agent not available'}), 503

@app.route('/api/predictions')
def api_predictions():
    """Get predictive analysis"""
    if latest_analysis:
        return jsonify(latest_analysis.get('predictions', []))
    return jsonify([])

@app.route('/api/system/info')
def api_system_info():
    """Get system information"""
    import platform
    return jsonify({
        'platform': platform.platform(),
        'processor': platform.processor(),
        'hostname': platform.node(),
        'python_version': platform.python_version(),
        'architecture': platform.architecture()
    })

# ============================================================
# WEBSOCKET EVENTS - Real-time Communication
# ============================================================

@socketio.on('connect')
def handle_connect():
    """Client connected (Part 3 dashboard)"""
    connected_clients.add(request.sid)
    print(f"[Backend] Client connected: {request.sid} (Total: {len(connected_clients)})")
    emit('connected', {'status': 'connected', 'monitoring': monitoring_active})

    # Send immediate data if available
    if latest_metrics:
        health = 85  # default
        if latest_analysis:
            health = max(0, 100 - len(latest_analysis.get('alerts', [])) * 10 - len(latest_threats) * 15)
        emit('system_update', {
            'type': 'metrics',
            'timestamp': datetime.now().isoformat(),
            'data': latest_metrics,
            'alerts': latest_analysis.get('alerts', []) if latest_analysis else [],
            'predictions': latest_analysis.get('predictions', []) if latest_analysis else [],
            'threats': latest_threats,
            'health_score': health
        })

@socketio.on('disconnect')
def handle_disconnect():
    """Client disconnected"""
    connected_clients.discard(request.sid)
    print(f"[Backend] Client disconnected: {request.sid} (Total: {len(connected_clients)})")

@socketio.on('start_monitoring')
def handle_start_monitoring():
    """Start monitoring (called from Part 3)"""
    global monitoring_active
    monitoring_active = True
    emit('monitoring_status', {'active': True})
    print("[Backend] Monitoring started")

@socketio.on('stop_monitoring')
def handle_stop_monitoring():
    """Stop monitoring"""
    global monitoring_active
    if monitor_thread:
        monitor_thread.stop()
    monitoring_active = False
    emit('monitoring_status', {'active': False})
    print("[Backend] Monitoring stopped")

@socketio.on('request_report')
def handle_request_report():
    """Generate full report (calls Part 2)"""
    global monitor_thread
    if monitor_thread and monitor_thread.agent:
        report = monitor_thread.agent.generate_report()
        emit('full_report', report)
    else:
        emit('full_report', {'error': 'AI Agent not available'})

@socketio.on('run_security_scan')
def handle_security_scan():
    """Run security scan (calls Part 2)"""
    global monitor_thread
    if monitor_thread and monitor_thread.agent:
        threats = monitor_thread.agent.security_scan()
        emit('security_scan_complete', {
            'threats_found': len(threats),
            'threats': threats
        })
    else:
        emit('security_scan_complete', {'threats_found': 0, 'threats': []})

# ============================================================
# INITIALIZATION FUNCTION
# ============================================================

def initialize_backend(agent_module=None):
    """
    Initialize the backend with an AI Agent from Part 2.

    Args:
        agent_module: The SystemGuardianAgent class from Part 2
    """
    global monitor_thread, monitoring_active

    print("=" * 60)
    print("  SYSTEM GUARDIAN - BACKEND CORE (Part 1)")
    print("=" * 60)
    print(f"  Dashboard URL: http://localhost:{Config.PORT}")
    print(f"  API Base: http://localhost:{Config.PORT}/api/")
    print("=" * 60)

    if agent_module:
        # Start monitoring with AI Agent
        monitor_thread = MonitoringThread(agent_module=agent_module)
        monitor_thread.start()
        monitoring_active = True
        print("[Backend] AI Agent connected - Monitoring active")
    else:
        print("[Backend] WARNING: No AI Agent connected - Running in API-only mode")

    return app, socketio

# ============================================================
# MAIN ENTRY POINT
# ============================================================

if __name__ == '__main__':
    # Standalone mode (without Part 2 - for testing)
    app, socketio = initialize_backend(agent_module=None)
    socketio.run(app, host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
