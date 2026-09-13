const mongoose = require('mongoose');

const UserDailyChallengeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  dateKey: { type: String, required: true },
  tapsProgress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  claimedAt: { type: Date, default: null }
});

UserDailyChallengeSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('UserDailyChallenge', UserDailyChallengeSchema);
