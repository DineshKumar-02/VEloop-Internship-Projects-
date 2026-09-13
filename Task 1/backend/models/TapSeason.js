const mongoose = require('mongoose');

const TapSeasonSchema = new mongoose.Schema({
  seasonId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['active', 'frozen', 'archived'], default: 'active' },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  efficiencyRules: {
    maxEfficiency: { type: Number, default: 1.3 },
    resetsAtEnd: { type: Boolean, default: true }
  },
  rewardRules: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TapSeason', TapSeasonSchema);
