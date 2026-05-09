import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST() {
    try {
        const username = os.userInfo().username.toUpperCase();
        const logDir = path.join(os.homedir(), 'AppData', 'Roaming', 'worksphere-agent');
        const logPath = path.join(logDir, 'activity_log.jsonl');

        const logoutEvent = {
            timestamp: new Date().toISOString(),
            employeeId: `EMP-${username}`,
            eventType: 'LOGOUT',
            app: 'System',
            title: 'User Logout via Dashboard'
        };

        fs.appendFileSync(logPath, JSON.stringify(logoutEvent) + '\n');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ success: false, error: 'Could not log logout' }, { status: 500 });
    }
}
