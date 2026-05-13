const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const si = require('systeminformation');
const Redis = require('ioredis');
const { Pool } = require('pg');
const _ = require('lodash');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Redis & Postgres Initialization (graceful fallback if unavailable)
let redis;
try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
        lazyConnect: true
    });
    redis.connect().catch(() => {
        redis = null;
    });
    redis.on('error', () => {}); 
} catch(e) {
    redis = null;
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/worksphere',
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    // Suppress DB connection errors in console to keep logs clean
});

// In-memory fallback if Redis/PG connection fails during demo
const liveTrackingCache = new Map();

// --- Exact System Monitoring Engine (Integrated from System_momter) ---
const getExactMetrics = async () => {
    try {
        const [cpu, mem, disk, net, proc, sys] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.fsSize(),
            si.networkStats(),
            si.processes(),
            si.osInfo()
        ]);

        return {
            timestamp: new Date().toISOString(),
            system: {
                platform: sys.platform,
                hostname: sys.hostname,
                uptime_hours: Math.round(si.time().uptime / 3600)
            },
            cpu: {
                percent: Math.round(cpu.currentLoad),
                cores: cpu.cpus.length,
                freq_mhz: Math.round(cpu.cpus[0]?.speed * 1000) || 0
            },
            memory: {
                percent: Math.round((mem.active / mem.total) * 100),
                total_gb: Math.round(mem.total / (1024**3)),
                used_gb: Math.round(mem.active / (1024**3))
            },
            disk: {
                percent: disk[0] ? Math.round(disk[0].use) : 0,
                free_gb: disk[0] ? Math.round(disk[0].available / (1024**3)) : 0
            },
            network: {
                active_connections: net[0] ? net[0].operstate === 'up' ? 1 : 0 : 0,
                bytes_sent_mb: net[0] ? Math.round(net[0].tx_bytes / (1024**2)) : 0,
                bytes_recv_mb: net[0] ? Math.round(net[0].rx_bytes / (1024**2)) : 0
            },
            processes: {
                total: proc.all,
                top_consumers: proc.list.slice(0, 5).map(p => ({
                    name: p.name,
                    cpu: p.cpu,
                    memory: p.mem
                }))
            }
        };
    } catch (e) {
        console.error('Metrics Collection Error:', e);
        return null;
    }
};

setInterval(async () => {
    const metrics = await getExactMetrics();
    if (metrics) {
        const healthScore = Math.max(0, 100 - (metrics.cpu.percent * 0.5) - (metrics.memory.percent * 0.5));
        io.emit('system_update', {
            type: 'metrics',
            data: metrics,
            health_score: Math.round(healthScore),
            alerts: [],
            predictions: [],
            threats: []
        });
    }
}, 2000);

// Global Infrastructure Node (USA Office Injection)
setInterval(() => {
    const usaNode = {
        deviceId: 'DO-USA-NODE-01',
        employeeId: 'Global Infra (Santa Clara)',
        latitude: 37.35983,
        longitude: -121.98144,
        accuracy: 100,
        network: 'DigitalOcean, LLC',
        timestamp: new Date().toISOString()
    };
    liveTrackingCache.set(usaNode.deviceId, usaNode);
    io.emit('location_update', usaNode);
}, 10000);

// --- GPS Ingestion API ---
app.post('/api/telemetry/location', async (req, res) => {
    const { deviceId, employeeId, latitude, longitude, speed, timestamp, accuracy } = req.body;

    if (!deviceId || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Invalid location packet' });
    }

    const locationData = {
        deviceId,
        employeeId,
        latitude,
        longitude,
        speed: speed || 0,
        accuracy: accuracy || 0,
        timestamp: timestamp || new Date().toISOString(),
        isOnline: true,
        lastUpdate: Date.now()
    };

    // 1. Always cache in-memory for guaranteed live dashboard
    liveTrackingCache.set(deviceId, locationData);
    
    // Also cache in Redis if available
    if (redis) {
        try {
            await redis.hset('live_locations', deviceId, JSON.stringify(locationData));
        } catch (e) { /* Redis unavailable, in-memory is fine */ }
    }

    // 2. Broadcast via WebSockets
    io.emit('location_update', locationData);

    // 3. Persist to PostgreSQL (Async)
    pool.query(
        'INSERT INTO location_history (device_id, latitude, longitude, speed, accuracy, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
        [deviceId, latitude, longitude, speed, accuracy, timestamp]
    ).catch(err => console.error('DB Persistence Error:', err.message));

    res.status(200).json({ status: 'received' });
});

// --- Traccar/OsmAnd Protocol Compatibility ---
// Allows connection with professional GPS hardware models
app.get('/api/telemetry/traccar', async (req, res) => {
    const { id, lat, lon, speed, timestamp, hdop } = req.query;

    if (!id || !lat || !lon) {
        return res.status(400).send('Invalid Traccar Packet');
    }

    const locationData = {
        deviceId: id,
        employeeId: `Hardware-${id}`,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        speed: parseFloat(speed) || 0,
        accuracy: (parseFloat(hdop) * 5) || 5, // Approximate accuracy from HDOP
        timestamp: timestamp || new Date().toISOString(),
        isOnline: true,
        lastUpdate: Date.now()
    };

    liveTrackingCache.set(id, locationData);
    io.emit('location_update', locationData);
    
    res.status(200).send('OK');
});

// --- Dashboard APIs ---
app.get('/api/tracking/live', async (req, res) => {
    // Always serve from in-memory cache (most reliable)
    res.json(Array.from(liveTrackingCache.values()));
});

app.get('/api/tracking/history/:deviceId', async (req, res) => {
    const { deviceId } = req.params;
    const { start, end } = req.query;

    try {
        const result = await pool.query(
            'SELECT * FROM location_history WHERE device_id = $1 AND timestamp BETWEEN $2 AND $3 ORDER BY timestamp ASC',
            [deviceId, start, end]
        );
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// --- WebSocket Logic ---
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe_tracking', (deviceId) => {
        socket.join(`tracking:${deviceId}`);
        console.log(`Socket ${socket.id} subscribed to ${deviceId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`GPS Tracking Server running on port ${PORT}`);
});
