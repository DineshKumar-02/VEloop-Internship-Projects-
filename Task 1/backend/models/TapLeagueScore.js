const mongoose = require('mongoose');

const TapLeagueScoreSchema = new mongoose.Schema({
  seasonId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  acceptedTapCount: { type: Number, default: 0, index: true },
  updatedAt: { type: Date, default: Date.now, index: true }
});

TapLeagueScoreSchema.index({ seasonId: 1, userId: 1 }, { unique: true });
TapLeagueScoreSchema.index({ seasonId: 1, acceptedTapCount: -1, updatedAt: 1 });

module.exports = mongoose.model('TapLeagueScore', TapLeagueScoreSchema);
