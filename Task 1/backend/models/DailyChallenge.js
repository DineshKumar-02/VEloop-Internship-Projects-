const mongoose = require('mongoose');

const DailyChallengeSchema = new mongoose.Schema({
  dateKey: { type: String, required: true, unique: true }, // Format YYYY-MM-DD
  title: { type: String, default: 'Daily Tap Blitz' },
  description: { type: String, default: 'Hit 250 accepted taps today' },
  targetTaps: { type: Number, default: 250 },
  rewardTokens: { type: Number, default: 200 },
  rewardSVE: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DailyChallenge', DailyChallengeSchema);
