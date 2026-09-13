const tapEconomy = require('../config/tapEconomy');
const ConfigAudit = require('../models/ConfigAudit');
const TapEvent = require('../models/TapEvent');
const TapState = require('../models/TapState');
const RewardLedger = require('../models/RewardLedger');
const User = require('../models/User');
const Upgrade = require('../models/Upgrade');
const antiBotService = require('../services/antiBotService');

class AdminController {
  /**
   * GET /api/admin/config (PDF §43)
   */
  async getConfig(req, res) {
    return res.json({ success: true, config: tapEconomy });
  }

  /**
   * PUT /api/admin/config (PDF §43)
   * Updates centralized economy config with audit logging
   */
  async updateConfig(req, res) {
    try {
      const { path, value, reason = 'Admin optimization' } = req.body;
      const adminName = req.user?.username || 'Admin';

      if (!path || value === undefined) {
        return res.status(400).json({ error: 'Missing path or value' });
      }

      // Resolve key in tapEconomy object
      const keys = path.split('.');
      let target = tapEconomy;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!target[keys[i]]) target[keys[i]] = {};
        target = target[keys[i]];
      }

      const oldValue = target[keys[keys.length - 1]];
      target[keys[keys.length - 1]] = value;

      // Write ConfigAudit
      const audit = await ConfigAudit.create({
        admin: adminName,
        changedKey: path,
        oldValue,
        newValue: value,
        reason,
        timestamp: new Date()
      });

      return res.json({
        success: true,
        message: `Updated configuration key: ${path}`,
        audit,
        currentValue: value
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/admin/analytics (PDF §43)
   */
  async getAnalytics(req, res) {
    try {
      // Aggregate Tap statistics
      const totalEvents = await TapEvent.countDocuments();
      const tapAggregation = await TapEvent.aggregate([
        {
          $group: {
            _id: null,
            totalPhysical: { $sum: '$physicalCount' },
            totalEffective: { $sum: '$effectiveCount' },
            totalEnergyConsumed: { $sum: '$energyConsumed' }
          }
        }
      ]);

      // Total currency issued via ledger
      const currencyIssuance = await RewardLedger.aggregate([
        { $match: { type: 'credit' } },
        {
          $group: {
            _id: '$currency',
            totalIssued: { $sum: '$amount' }
          }
        }
      ]);

      // Upgrade sink totals (currency spent)
      const upgradeSinks = await RewardLedger.aggregate([
        { $match: { type: 'debit', source: { $regex: 'upgrade|shield|bank' } } },
        {
          $group: {
            _id: '$currency',
            totalSpent: { $sum: '$amount' }
          }
        }
      ]);

      const userCount = await User.countDocuments();
      const activeTappers = await TapState.countDocuments({ totalPhysicalTaps: { $gt: 0 } });
      const violations = antiBotService.getViolations(10);

      return res.json({
        success: true,
        summary: {
          totalUsers: userCount,
          activeTappers,
          totalAcceptedTaps: totalEvents,
          totalPhysicalTaps: tapAggregation[0]?.totalPhysical || 0,
          totalEffectiveTaps: tapAggregation[0]?.totalEffective || 0,
          totalEnergyConsumed: tapAggregation[0]?.totalEnergyConsumed || 0
        },
        currencyIssuance: currencyIssuance.reduce((acc, item) => ({ ...acc, [item._id]: item.totalIssued }), {}),
        upgradeSinks: upgradeSinks.reduce((acc, item) => ({ ...acc, [item._id]: item.totalSpent }), {}),
        recentViolations: violations
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/admin/bot-logs (PDF §43)
   */
  async getBotLogs(req, res) {
    return res.json({
      success: true,
      violations: antiBotService.getViolations(100)
    });
  }

  /**
   * GET /api/admin/ledger (PDF §43)
   */
  async getLedger(req, res) {
    try {
      const { currency, type, limit = 50 } = req.query;
      const query = {};
      if (currency) query.currency = currency;
      if (type) query.type = type;

      const ledger = await RewardLedger.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('userId', 'username displayName')
        .lean();

      return res.json({ success: true, ledger });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/admin/audits (PDF §43)
   */
  async getAudits(req, res) {
    try {
      const audits = await ConfigAudit.find()
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();
      return res.json({ success: true, audits });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AdminController();
