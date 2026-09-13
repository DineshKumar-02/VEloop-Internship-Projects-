const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Check for User ID in headers or query (for flexible demo / platform integration)
    const headerUserId = req.headers['x-veloop-user-id'] || req.query.userId;

    let user;
    if (headerUserId) {
      user = await User.findById(headerUserId);
    }

    // If no user specified or found, fallback to primary default demo user
    if (!user) {
      user = await User.findOne({ username: 'veloop_pro_tapper' });
    }

    if (!user) {
      // Auto-provision demo user if database was not seeded
      user = await User.create({
        username: 'veloop_pro_tapper',
        displayName: 'Alex Rivers (Pro Tapper)',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=veloop_pro',
        level: 12,
        balances: {
          ve: 285.5,
          sve: 1450.0,
          tokens: 4320,
          gems: 8.5,
          spins: 4,
          fragments: 78
        },
        currentTapSeasonId: 'season-1'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
