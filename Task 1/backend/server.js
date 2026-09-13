require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const tapRoutes = require('./routes/tapRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 4500;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logging for audit trail
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log(`[API ${req.method}] ${req.originalUrl}`);
  }
  next();
});

// Health and root status endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'VELoop Rewards Tap & Earn API',
    platformBodyColor: '#161827',
    endpoints: {
      health: '/api/health',
      tapState: '/api/tap/state',
      tapLeague: '/api/tap/league',
      missions: '/api/tap/missions',
      dailyChallenge: '/api/tap/daily-challenge',
      adminConfig: '/api/admin/config'
    },
    databaseStatus: require('mongoose').connection.readyState === 1 ? 'connected' : 'connecting',
    timestamp: new Date()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'VELoop Rewards Tap & Earn API',
    platformBodyColor: '#161827',
    database: require('mongoose').connection.readyState === 1 ? 'connected' : 'connecting',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/tap', tapRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Serve static frontend in production if available
const path = require('path');
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexHtml = path.join(frontendDist, 'index.html');
  const fs = require('fs');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    next();
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' || process.env.RENDER ? '0.0.0.0' : '127.0.0.1');
  app.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`VELoop Rewards Tap & Earn Server listening on http://${HOST}:${PORT}`);
    console.log(`Fintech Body Color: #161827`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
