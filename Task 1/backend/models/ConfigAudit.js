const mongoose = require('mongoose');

const ConfigAuditSchema = new mongoose.Schema({
  admin: { type: String, required: true },
  changedKey: { type: String, required: true },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  reason: { type: String, default: 'Economy tuning' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ConfigAudit', ConfigAuditSchema);
