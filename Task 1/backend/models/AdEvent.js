const mongoose = require('mongoose');

const AdEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  placement: { type: String, enum: ['interstitial', 'video', 'banner'], required: true },
  provider: { type: String, default: 'DemoAdProvider' },
  eventType: { 
    type: String, 
    enum: ['opportunity', 'shown', 'completed', 'skipped', 'failed', 'rewarded'], 
    required: true 
  },
  rewardGranted: { type: String, default: null },
  optionalRewardReference: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdEvent', AdEventSchema);
