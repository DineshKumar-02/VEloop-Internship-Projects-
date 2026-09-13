const mongoose = require('mongoose');

const TapEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  seasonId: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true },
  serverAcceptedAt: { type: Date, default: Date.now },
  rewardType: { type: String, required: true }, // 'sve' | 've' | 'spin' | 'gems' | 'tokens' | 'mystery' | 'precision'
  rewardAmount: { type: Number, required: true },
  energyBefore: { type: Number, required: true },
  energyAfter: { type: Number, required: true },
  energyConsumed: { type: Number, required: true },
  physicalCount: { type: Number, default: 1 },
  effectiveCount: { type: Number, default: 1 },
  shieldProtected: { type: Boolean, default: false },
  boostApplied: { type: Boolean, default: false },
  efficiencyMultiplier: { type: Number, default: 1.0 },
  requestId: { type: String, required: true, unique: true, index: true }
});

TapEventSchema.index({ userId: 1, timestamp: -1 });
TapEventSchema.index({ seasonId: 1, serverAcceptedAt: -1 });

module.exports = mongoose.model('TapEvent', TapEventSchema);
