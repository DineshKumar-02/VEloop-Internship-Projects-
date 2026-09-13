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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'VELoop Rewards Tap & Earn API',
    platformBodyColor: '#161827',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/tap', tapRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`====================================================`);
    console.log(`VELoop Rewards Tap & Earn Server listening on http://127.0.0.1:${PORT}`);
    console.log(`Fintech Body Color: #161827`);
    console.log(`====================================================`);
  });
}

module.exports = app;
