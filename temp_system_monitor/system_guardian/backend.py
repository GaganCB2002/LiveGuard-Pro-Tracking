"""
============================================================
BACKEND CORE - System Guardian API Server (Reporting Edition)
============================================================
"""

from flask import Flask, render_template, jsonify, request, send_file
from flask_socketio import SocketIO, emit
import time
from datetime import datetime
import os
from config import Config

app = Flask(__name__, 
            template_folder=os.path.join(os.path.dirname(__file__), 'templates'),
            static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'secret!'

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

_AGENT = None
_PAYLOAD = None

def worker():
    global _PAYLOAD
    print("[Backend] Reporting Service active")
    while True:
        if _AGENT:
            try:
                m = _AGENT.collect_metrics()
                if m:
                    a = _AGENT.analyze(m)
                    _PAYLOAD = {
                        'metrics': m,
                        'alerts': a['alerts'],
                        'learning': a['learning'],
                        'health_score': a['health_score'],
                        'timestamp': datetime.now().isoformat()
                    }
                    socketio.emit('update', _PAYLOAD)
            except Exception as e:
                print(f"Worker Error: {e}")
        socketio.sleep(2)

@app.route('/')
def index():
    return render_template('dashboard.html')

@app.route('/api/report/pdf')
def download_pdf_report():
    """Generates and serves the professional PDF report"""
    if _AGENT:
        try:
            filename = _AGENT.generate_pdf_report()
            return send_file(filename, as_attachment=True, download_name="System_Guardian_Security_Report.pdf")
        except Exception as e:
            return jsonify({'error': f"Failed to generate PDF: {str(e)}"}), 500
    return "Agent not initialized", 404

@socketio.on('test_alert')
def handle_test_alert():
    emit('alert', {
        'severity': 'WARNING',
        'component': 'AI System',
        'title': 'Manual Scan Initiated',
        'message': 'Integrity check requested by user.',
        'timestamp': datetime.now().isoformat()
    })

def initialize_backend(agent_module=None):
    global _AGENT
    _AGENT = agent_module
    socketio.start_background_task(worker)
    return app, socketio

if __name__ == '__main__':
    app, socketio = initialize_backend()
    socketio.run(app, host='0.0.0.0', port=Config.PORT, allow_unsafe_werkzeug=True)
