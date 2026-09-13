const User = require('../models/User');
const TapState = require('../models/TapState');
const TapEvent = require('../models/TapEvent');
const energyService = require('../services/energyService');
const tapRewardService = require('../services/tapRewardService');
const antiBotService = require('../services/antiBotService');
const leaderboardService = require('../services/leaderboardService');
const rewardLedgerService = require('../services/rewardLedgerService');
const adService = require('../services/adService');
const tapEconomy = require('../config/tapEconomy');

class TapController {
  /**
   * Main Tap Endpoint: POST /api/tap (PDF §29 & §30)
   */
  async processTap(req, res) {
    try {
      const userId = req.user._id;
      const { requestId, physicalCount = 1, isPrecisionTap = false } = req.body;

      if (!requestId) {
        return res.status(400).json({ error: 'Missing unique requestId' });
      }

      // 1. Fetch user and tapState
      const user = await User.findById(userId);
      let tapState = await TapState.findOne({ userId });

      if (!user || !tapState) {
        return res.status(404).json({ error: 'User or TapState not initialized' });
      }

      // 2. Anti-Bot and 200 ms Validation (PDF §30 & §31)
      const botCheck = await antiBotService.validateTap(userId, requestId, tapState.lastTapAt);
      if (!botCheck.valid) {
        return res.status(429).json({
          error: botCheck.message,
          code: botCheck.code,
          tapState: this.formatStateResponse(tapState, user)
        });
      }

      // 3. Timestamp-based Energy Regeneration (PDF §5)
      tapState = energyService.regenerateEnergy(tapState);

      // 4. Calculate effective taps based on Multitap (PDF §41.3)
      const multiplier = tapState.tapMultiplier || 1;
      const effectiveCount = physicalCount * multiplier;

      // 5. Check and Consume Energy (PDF §5 & §41.8)
      const energyResult = energyService.calculateConsumption(tapState, effectiveCount);
      if (!energyResult.success) {
        return res.status(400).json({
          error: 'Not enough energy',
          code: 'NOT_ENOUGH_ENERGY',
          tapState: this.formatStateResponse(tapState, user)
        });
      }

      // 6. Update Streak & Combo (PDF §41.10)
      const engagement = tapRewardService.updateStreakAndCombo(tapState);

      // 7. Modifiers check (Boost & Efficiency)
      const isBoostActive = tapState.boost && tapState.boost.active;
      const efficiencyMultiplier = tapState.efficiency || 1.0;

      // 8. Server-Authoritative Reward Roll (PDF §41.2)
      let reward = tapRewardService.rollTapReward({
        boostActive: isBoostActive,
        efficiencyMultiplier
      });

      // Bonus Precision Tap Reward (PDF §10)
      let precisionBonus = 0;
      if (isPrecisionTap) {
        precisionBonus = tapEconomy.precisionTap.bonusTokens || 15;
        user.balances.tokens += precisionBonus;
      }

      // 9. Update Metrics and Counters
      const prevEffectiveTaps = tapState.totalEffectiveTaps || 0;
      tapState.totalPhysicalTaps = (tapState.totalPhysicalTaps || 0) + physicalCount;
      tapState.totalEffectiveTaps = prevEffectiveTaps + effectiveCount;
      tapState.seasonEffectiveTaps = (tapState.seasonEffectiveTaps || 0) + effectiveCount;
      tapState.luckyWindowTaps = (tapState.luckyWindowTaps || 0) + effectiveCount;

      // 10. Mystery Tap Evaluation (PDF §41.11)
      const mysteryResult = tapRewardService.evaluateMysteryTap(
        tapState.totalEffectiveTaps,
        prevEffectiveTaps
      );

      let mysteryBonus = null;
      if (mysteryResult.triggered) {
        user.balances.sve = Math.round((user.balances.sve + mysteryResult.amount) * 10) / 10;
        mysteryBonus = mysteryResult;
      }

      // 11. Credit Main Reward to User Balances
      if (reward.type === 'spin') {
        user.balances.spins = (user.balances.spins || 0) + reward.amount;
      } else if (user.balances[reward.type] !== undefined) {
        user.balances[reward.type] = Math.round((user.balances[reward.type] + reward.amount) * 10) / 10;
      }

      // Save user & tapState atomically
      await user.save();
      await tapState.save();

      // 12. Record TapEvent for audit and replay prevention (PDF §28 & §46)
      await TapEvent.create({
        userId,
        seasonId: user.currentTapSeasonId || 'season-1',
        timestamp: new Date(),
        serverAcceptedAt: new Date(),
        rewardType: reward.type,
        rewardAmount: reward.amount,
        energyBefore: tapState.energy + energyResult.totalConsumed,
        energyAfter: tapState.energy,
        energyConsumed: energyResult.totalConsumed,
        physicalCount,
        effectiveCount,
        shieldProtected: energyResult.shieldProtected,
        boostApplied: isBoostActive,
        efficiencyMultiplier,
        requestId
      });

      // 13. Update Season Leaderboard Score (PDF §22 & §41.13)
      await leaderboardService.recordTaps(
        user.currentTapSeasonId || 'season-1',
        userId,
        effectiveCount
      );

      // 14. Write to RewardLedger (PDF §28)
      await rewardLedgerService.recordTransaction({
        userId,
        source: 'tap',
        type: 'credit',
        amount: reward.amount,
        currency: reward.type,
        referenceId: requestId,
        notes: `Tap Reward: ${reward.label}`
      });

      // 15. Check Demo Ad Opportunity (PDF §42)
      const adOpportunity = adService.checkAdOpportunity(userId, effectiveCount);

      // 16. Assemble authoritative response payload
      return res.json({
        success: true,
        reward: {
          ...reward,
          precisionBonus,
          mysteryBonus
        },
        tapState: this.formatStateResponse(tapState, user),
        balances: user.balances,
        streak: engagement.streak,
        combo: engagement.combo,
        adOpportunity
      });
    } catch (error) {
      console.error('[Tap Processing Error]:', error);
      return res.status(500).json({ error: error.message || 'Tap processing failed' });
    }
  }

  /**
   * GET /api/tap/state (PDF §29)
   */
  async getState(req, res) {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
      let tapState = await TapState.findOne({ userId });

      if (!tapState && user) {
        tapState = await TapState.create({ userId });
      }

      // Regenerate energy from timestamps
      tapState = energyService.regenerateEnergy(tapState);
      await tapState.save();

      return res.json({
        success: true,
        tapState: this.formatStateResponse(tapState, user),
        balances: user.balances,
        user: {
          id: user._id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          level: user.level,
          role: user.role
        },
        economyConfig: tapEconomy
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/tap/boost/activate (PDF §13)
   */
  async activateBoost(req, res) {
    try {
      const userId = req.user._id;
      const tapState = await TapState.findOne({ userId });
      if (!tapState) return res.status(404).json({ error: 'TapState not found' });

      const now = new Date();
      if (tapState.boost && tapState.boost.active && now < new Date(tapState.boost.expiresAt)) {
        return res.status(400).json({ error: 'Boost is already active' });
      }

      const durationSec = tapEconomy.boost.durationSeconds || 30;
      tapState.boost = {
        active: true,
        expiresAt: new Date(now.getTime() + durationSec * 1000),
        lastActivatedAt: now
      };
      await tapState.save();

      return res.json({
        success: true,
        boost: tapState.boost,
        durationSeconds: durationSec
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/tap/history (PDF §29)
   */
  async getHistory(req, res) {
    try {
      const userId = req.user._id;
      const events = await TapEvent.find({ userId })
        .sort({ serverAcceptedAt: -1 })
        .limit(30)
        .lean();

      return res.json({ success: true, events });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Formats TapState for safe transmission
   */
  formatStateResponse(tapState, user) {
    const timeUntilRecharge = energyService.getTimeUntilNextRecharge(tapState);
    const now = Date.now();

    return {
      energy: tapState.energy,
      maxEnergy: tapState.maxEnergy,
      rechargeRate: tapState.rechargeRate,
      timeUntilRecharge,
      multitap: {
        multiplier: tapState.tapMultiplier || 1,
        tier: tapState.multiplierTier || 'x1.0',
        expiresAt: tapState.multiplierExpiresAt,
        active: tapState.multiplierExpiresAt ? new Date(tapState.multiplierExpiresAt).getTime() > now : true
      },
      efficiency: {
        multiplier: tapState.efficiency || 1.0,
        tier: tapState.efficiencyTier || 'x1.0',
        expiresAt: tapState.efficiencyExpiresAt,
        active: tapState.efficiencyExpiresAt ? new Date(tapState.efficiencyExpiresAt).getTime() > now : true
      },
      streak: tapState.streak || 0,
      combo: tapState.combo || 0,
      totalPhysicalTaps: tapState.totalPhysicalTaps || 0,
      totalEffectiveTaps: tapState.totalEffectiveTaps || 0,
      luckyWindowTaps: tapState.luckyWindowTaps || 0,
      energyBank: tapState.energyBank,
      energyShield: tapState.energyShield,
      boost: tapState.boost
    };
  }
}

module.exports = new TapController();
