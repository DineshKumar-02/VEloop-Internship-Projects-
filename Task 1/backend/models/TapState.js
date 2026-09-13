const mongoose = require('mongoose');

const TapStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  
  // Energy System (PDF §5 & §41.4)
  energy: { type: Number, default: 500 },
  maxEnergy: { type: Number, default: 500 },
  rechargeRate: { type: Number, default: 20 }, // +20 per 20 minutes
  lastEnergyAt: { type: Date, default: Date.now },

  // Multitap (PDF §7 & §41.5)
  tapMultiplier: { type: Number, default: 1 },
  multiplierTier: { type: String, default: 'x1.0' },
  multiplierExpiresAt: { type: Date, default: null },

  // Seasonal Tap Efficiency (PDF §19 & §41.9)
  efficiency: { type: Number, default: 1.0 },
  efficiencyTier: { type: String, default: 'x1.0' },
  efficiencyExpiresAt: { type: Date, default: null },

  // Engagement Dynamics (PDF §9, §12 & §41.10)
  streak: { type: Number, default: 0 },
  lastStreakAt: { type: Date, default: null },
  combo: { type: Number, default: 0 },
  lastComboAt: { type: Date, default: null },
  lastTapAt: { type: Date, default: null },

  // Tap Metrics
  totalPhysicalTaps: { type: Number, default: 0 },
  totalEffectiveTaps: { type: Number, default: 0 },
  seasonEffectiveTaps: { type: Number, default: 0 },
  luckyWindowTaps: { type: Number, default: 0 }, // Unlocks lucky spin at 300

  // 3-Day Energy Bank (PDF §17 & §41.7)
  energyBank: {
    active: { type: Boolean, default: false },
    capacity: { type: Number, default: 0 },
    current: { type: Number, default: 0 },
    purchasesCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    lastRechargeAt: { type: Date, default: null }
  },

  // Energy Shield (PDF §18 & §41.8)
  energyShield: {
    active: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    cooldownUntil: { type: Date, default: null }
  },

  // 30s Boost Window (PDF §13)
  boost: {
    active: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    lastActivatedAt: { type: Date, default: null }
  },

  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TapState', TapStateSchema);
