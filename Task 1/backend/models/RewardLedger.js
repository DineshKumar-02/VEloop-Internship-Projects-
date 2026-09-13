const mongoose = require('mongoose');

const RewardLedgerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  source: { 
    type: String, 
    required: true,
    enum: ['tap', 'spin', 'mission_claim', 'daily_challenge', 'upgrade_purchase', 'shield_purchase', 'energy_bank_purchase', 'boost_activation', 'ad_reward', 'season_reward', 'admin_adjustment']
  },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true }, // 've', 'sve', 'tokens', 'gems', 'spins', 'fragments', 'energy'
  balanceAfter: { type: Number },
  referenceId: { type: String, default: null },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
});

RewardLedgerSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('RewardLedger', RewardLedgerSchema);
