const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const DEFAULT_PORT = 3001;
let port = process.env.PORT || DEFAULT_PORT;

// Helper to find available port
const net = require('net');
async function findAvailablePort(startPort) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.unref();
        server.on('error', () => resolve(findAvailablePort(startPort + 1)));
        server.listen(startPort, () => {
            server.close(() => resolve(startPort));
        });
    });
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Attach Prisma directly to Request for route accessibility
const prisma = require('./db');
app.use((req, res, next) => {
    req.prisma = prisma;
    next();
});

// Real-time Sync Engine: Initialize Socket.io early
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Attach IO to request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const paymentRoutes = require('./routes/payment');
const branchRoutes = require('./routes/branchRoutes');
const miscRoutes = require('./routes/miscRoutes');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const bulkUploadRoutes = require('./routes/bulkUploadRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const systemRoutes = require('./routes/systemRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const supportRoutes = require('./routes/supportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const billingRoutes = require('./routes/billing');
const teamRoutes = require('./routes/team');
const parentRoutes = require('./routes/parentRoutes');
const { createBackup } = require('./services/backupService');
const { authenticate } = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/super-admin', authenticate, superAdminRoutes);
app.use('/api/branches', authenticate, branchRoutes);
app.use('/api/payment', authenticate, paymentRoutes);
app.use('/api/misc-fees', authenticate, miscRoutes);
app.use('/api/scholarships', authenticate, scholarshipRoutes);
app.use('/api/bulk-upload', authenticate, bulkUploadRoutes);
app.use('/api/payroll', authenticate, payrollRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/comms', authenticate, communicationRoutes);
app.use('/api/support', authenticate, supportRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/billing', authenticate, billingRoutes);
app.use('/api/team', authenticate, teamRoutes);
app.use('/api/parent', authenticate, parentRoutes);

// PRODUCTION: Serve React Frontend
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// PRODUCTION: Support Client-side routing (SPAs)
app.get('*', (req, res) => {
    // If it's an API route that wasn't matched above, 404 it
    if (req.url.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    // Otherwise serve index.html
    res.sendFile(path.join(distPath, 'index.html'));
});

// Start server with port discovery
(async () => {
    // If not in production, or if no port provided by host, find one
    if (process.env.NODE_ENV !== 'production' && !process.env.PORT) {
        port = await findAvailablePort(DEFAULT_PORT);
    }
    
    // cPanel/QServers often passes the port via environment
    const actualPort = process.env.PORT || port;

    server.listen(actualPort, () => {
        console.log(`Kuntau-Pay running on port ${actualPort}`);
        // Notify Electron of the actual port being used
        if (process.send) process.send({ type: 'server-ready', port: actualPort }); 
        
        // FISCAL SNAPSHOT PROTOCOL: Initialize startup backup
        if (process.env.NODE_ENV === 'production') {
            console.log('[PROD] System initialized in production mode.');
        } else {
            createBackup('startup').catch(err => console.error('[STARTUP BACKUP ERROR]', err));
        }
    });

    io.on('connection', (socket) => {
        console.log(`[SOCKET] User connected: ${socket.id}`);
        socket.on('disconnect', () => console.log(`[SOCKET] User disconnected`));
    });

    // Attach io to app for use in routes
    app.set('io', io);

    process.on('SIGTERM', () => {
        server.close();
    });
})();
