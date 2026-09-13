const mongoose = require('mongoose');

const UpgradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['capacity', 'multitap', 'rechargeSpeed', 'efficiency', 'energyBank', 'energyShield'] 
  },
  tier: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed },
  cost: { type: Number, required: true },
  currency: { type: String, required: true }, // 've' | 'sve' | 'tokens'
  purchasedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Upgrade', UpgradeSchema);
