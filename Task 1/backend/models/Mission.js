const mongoose = require('mongoose');

const MissionSchema = new mongoose.Schema({
  missionId: { type: String, required: true, unique: true },
  seasonId: { type: String, default: 'season-1' },
  type: { type: String, enum: ['daily', 'seasonal'], required: true },
  category: { type: String, enum: ['taps', 'combo', 'precision', 'boost', 'streak', 'upgrade'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  target: { type: Number, required: true },
  reward: { type: Number, required: true },
  rewardType: { type: String, enum: ['tokens', 'sve', 've', 'gems'], default: 'tokens' },
  activeFrom: { type: Date, default: Date.now },
  activeTo: { type: Date }
});

module.exports = mongoose.model('Mission', MissionSchema);
