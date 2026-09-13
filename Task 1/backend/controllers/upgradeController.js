const upgradeService = require('../services/upgradeService');
const TapSeason = require('../models/TapSeason');

class UpgradeController {
  /**
   * POST /api/tap/upgrade (PDF §29)
   */
  async purchaseUpgrade(req, res) {
    try {
      const userId = req.user._id;
      const { type, tier } = req.body;

      if (!type) {
        return res.status(400).json({ error: 'Upgrade type is required' });
      }

      let result;
      switch (type) {
        case 'capacity':
          result = await upgradeService.purchaseCapacity(userId);
          break;
        case 'multitap':
          result = await upgradeService.purchaseMultitap(userId, tier);
          break;
        case 'rechargeSpeed':
          result = await upgradeService.purchaseRechargeSpeed(userId);
          break;
        case 'efficiency': {
          const season = await TapSeason.findOne({ status: 'active' }).lean();
          result = await upgradeService.purchaseEfficiency(userId, tier, season?.endAt);
          break;
        }
        case 'energyBank':
          result = await upgradeService.purchaseEnergyBank(userId);
          break;
        case 'energyShield':
          result = await upgradeService.purchaseEnergyShield(userId);
          break;
        default:
          return res.status(400).json({ error: `Unsupported upgrade type: ${type}` });
      }

      return res.json({ success: true, ...result });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/tap/energy-bank/purchase (PDF §29)
   */
  async purchaseEnergyBank(req, res) {
    try {
      const userId = req.user._id;
      const result = await upgradeService.purchaseEnergyBank(userId);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/tap/shield/purchase (PDF §29)
   */
  async purchaseShield(req, res) {
    try {
      const userId = req.user._id;
      const result = await upgradeService.purchaseEnergyShield(userId);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UpgradeController();
