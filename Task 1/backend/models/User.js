const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  displayName: { type: String, default: 'VELoop User' },
  avatar: { type: String, default: 'https://api.dicebear.com/7.x/bottts/svg?seed=veloop1' },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  balances: {
    ve: { type: Number, default: 250.0 },       // Primary VE Coin
    sve: { type: Number, default: 150.0 },     // SVE Currency
    tokens: { type: Number, default: 1200 },    // Standard Tokens
    gems: { type: Number, default: 10.0 },      // Rare Gems
    spins: { type: Number, default: 3 },        // Lucky Spins
    fragments: { type: Number, default: 45 }    // VE Fragments (PDF §20)
  },
  currentTapSeasonId: { type: String, default: 'season-1' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
