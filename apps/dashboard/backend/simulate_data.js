const fs = require('fs');
const path = require('path');
const os = require('os');

const logDir = path.join(os.homedir(), 'AppData', 'Roaming', 'worksphere-agent');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const logPath = path.join(logDir, 'activity_log.jsonl');

console.log('Simulating 1 hour of high-frequency tracking (3600 data points)...');

const startTime = new Date();
startTime.setHours(startTime.getHours() - 1);

const stream = fs.createWriteStream(logPath);

for (let i = 0; i < 3600; i++) {
    const timestamp = new Date(startTime.getTime() + i * 1000);
    const mockApps = ['VS Code', 'Google Chrome', 'Slack', 'Zoom', 'Terminal', 'Figma'];
    const mockApp = i < 1800 ? 'VS Code' : (i < 3000 ? 'Google Chrome' : 'Slack'); // 30m Dev, 20m Chrome, 10m Slack
    
    let mockTitle = 'Working...';
    let url = null;
    if (mockApp === 'Google Chrome') {
        url = 'https://github.com/worksphere/agent';
        mockTitle = 'GitHub Repo';
    }

    const activity = {
        timestamp: timestamp.toISOString(),
        app: mockApp,
        title: mockTitle,
        url: url,
        eventType: Math.random() > 0.95 ? 'link_click' : 'moment_snapshot',
        keystrokeVelocity: Math.floor(Math.random() * 60) + 40,
        mouseClicks: Math.floor(Math.random() * 3),
        mouseDistance: Math.floor(Math.random() * 100),
        focused: true
    };
    stream.write(JSON.stringify(activity) + '\n');
}

stream.end(() => {
    console.log('Simulation complete. Data saved to:', logPath);
});
