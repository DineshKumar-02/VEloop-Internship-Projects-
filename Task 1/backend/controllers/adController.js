const adService = require('../services/adService');
const tapEconomy = require('../config/tapEconomy');

class AdController {
  /**
   * GET /api/tap/ads/config
   */
  async getConfig(req, res) {
    return res.json({
      success: true,
      config: tapEconomy.ads
    });
  }

  /**
   * POST /api/tap/ads/event
   */
  async trackEvent(req, res) {
    try {
      const userId = req.user._id;
      const { placement, eventType, optionalRewardReference } = req.body;

      if (!placement || !eventType) {
        return res.status(400).json({ error: 'Missing placement or eventType' });
      }

      const event = await adService.recordAdEvent(userId, {
        placement,
        eventType,
        optionalRewardReference
      });

      return res.json({ success: true, event });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/tap/ads/claim-reward
   */
  async claimReward(req, res) {
    try {
      const userId = req.user._id;
      const { benefitType = 'energy' } = req.body; // 'energy' or 'boost'

      const result = await adService.grantRewardedAdBenefit(userId, benefitType);
      return res.json({ success: true, reward: result });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AdController();
