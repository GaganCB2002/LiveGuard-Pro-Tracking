import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function GET() {
    try {
        const logPath = path.join(os.homedir(), 'AppData', 'Roaming', 'worksphere-agent', 'activity_log.jsonl');
        
        if (!fs.existsSync(logPath)) {
            return NextResponse.json({ error: 'Log file not found' }, { status: 404 });
        }

        const fileContent = fs.readFileSync(logPath, 'utf8');
        const lines = fileContent.trim().split('\n').filter(l => l.length > 0);
        
        const now = new Date();
        const hours = now.getHours();
        // TEMPORARILY DISABLED FOR TESTING: Office hours active 24/7
        const isWorkingHours = true;

        if (lines.length === 0) {
            return NextResponse.json({ 
                status: isWorkingHours ? 'WAITING_FOR_ACTIVITY' : 'STANDBY_MODE',
                message: isWorkingHours ? 'Waiting for first office hour activity...' : 'Outside office hours (09:00 - 18:00)',
                employeeId: 'EMP-' + (os.userInfo().username.toUpperCase()),
                email: `${os.userInfo().username.toLowerCase()}@worksphere.com`,
                department: 'Product Engineering',
                latest: { eventType: 'STANDBY', app: 'System', title: isWorkingHours ? 'Waiting for Activity' : 'Standby Mode' },
                sessionStats: {},
                timeline: [],
                allEvents: [],
                isBreak: false
            });
        }

        const username = os.userInfo().username || 'gagan';
        const dataPoints = lines.map(l => {
            try { return JSON.parse(l); } catch(e) { return null; }
        }).filter(p => p !== null);

        if (dataPoints.length === 0) {
            return NextResponse.json({ error: 'Empty log' }, { status: 200 });
        }

        const snapshots = dataPoints.filter(p => p.eventType === 'system_snapshot');
        const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : dataPoints[dataPoints.length - 1];

        // Advanced Timeline Engine: Grouping snapshots into logical sessions
        const timeline: any[] = [];
        let currentSession: any = null;

        snapshots.forEach((p, index) => {
            const isNewSession = !currentSession || 
                                currentSession.app !== p.app || 
                                currentSession.title !== p.title;

            if (isNewSession) {
                if (currentSession) {
                    currentSession.endTime = p.timestamp;
                    currentSession.duration = Math.floor((new Date(p.timestamp).getTime() - new Date(currentSession.startTime).getTime()) / 1000);
                    timeline.push(currentSession);
                }
                currentSession = {
                    app: p.app,
                    title: p.title,
                    startTime: p.timestamp,
                    endTime: p.timestamp,
                    duration: 0,
                    latitude: p.latitude || 0,
                    longitude: p.longitude || 0,
                    network: p.network || 'Unknown'
                };
            } else {
                currentSession.endTime = p.timestamp;
            }

            // Push the last session
            if (index === snapshots.length - 1 && currentSession) {
                currentSession.duration = Math.floor((new Date(p.timestamp).getTime() - new Date(currentSession.startTime).getTime()) / 1000);
                timeline.push(currentSession);
            }
        });

        // Aggregate durations and events
        const durations: Record<string, number> = {};
        const events: any[] = [];
        
        dataPoints.forEach(p => {
            if (p.eventType === 'system_snapshot' && p.app !== 'Idle') {
                durations[p.app] = (durations[p.app] || 0) + 1;
            } else if (p.eventType !== 'system_snapshot') {
                events.push(p);
            }
        });

        return NextResponse.json({
            employeeId: latest.employeeId || 'EMP-GAGAN',
            email: `${username.toLowerCase()}@worksphere.com`,
            department: 'Product Engineering',
            latest,
            sessionStats: durations,
            timeline: timeline.reverse(),
            loginTime: latest.loginTime || new Date().toISOString(),
            allEvents: events.reverse().slice(0, 50),
            isBreak: latest.eventType === 'BREAK_START' || (latest.eventType === 'system_snapshot' && latest.isBreak),
            status: isWorkingHours ? 'LIVE' : 'STANDBY_MODE'
        });
        
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
