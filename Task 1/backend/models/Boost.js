const mongoose = require('mongoose');

const BoostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, default: '30s_tap_boost' },
  multiplier: { type: Number, default: 2.0 },
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired'], default: 'active' }
});

module.exports = mongoose.model('Boost', BoostSchema);
