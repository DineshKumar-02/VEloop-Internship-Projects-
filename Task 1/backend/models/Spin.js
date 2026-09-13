const mongoose = require('mongoose');

const SpinSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  seasonId: { type: String, default: 'season-1' },
  spinId: { type: String, required: true, unique: true },
  triggerSource: { type: String, enum: ['lucky_tap', 'user_spin_inventory'], default: 'user_spin_inventory' },
  resultType: { type: String, required: true }, // 'tokens' | 've' | 'spin' | 'gems' | 'sve' | 'energy' | 'none'
  resultAmount: { type: Number, default: 0 },
  resultLabel: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Spin', SpinSchema);
