const TapState = require('../models/TapState');
const User = require('../models/User');
const Spin = require('../models/Spin');
const tapRewardService = require('../services/tapRewardService');
const rewardLedgerService = require('../services/rewardLedgerService');
const tapEconomy = require('../config/tapEconomy');
const { v4: uuidv4 } = require('uuid');

class LuckyController {
  /**
   * GET /api/tap/lucky (PDF §14 & §29)
   * Returns eligibility status toward 300-tap threshold
   */
  async getStatus(req, res) {
    try {
      const userId = req.user._id;
      const tapState = await TapState.findOne({ userId });
      const user = await User.findById(userId);

      const threshold = tapEconomy.luckyTap.thresholdTaps; // 300
      const currentTaps = tapState?.luckyWindowTaps || 0;
      const isEligible = currentTaps >= threshold || (user?.balances?.spins > 0);

      return res.json({
        success: true,
        threshold,
        currentTaps: Math.min(currentTaps, threshold),
        progressPercent: Math.min(100, Math.floor((currentTaps / threshold) * 100)),
        isEligible,
        spinsAvailable: user?.balances?.spins || 0,
        rewardsList: tapEconomy.luckyTap.spinRewards
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/tap/lucky/spin (PDF §14 & §29)
   * Executes server-authoritative spin
   */
  async executeSpin(req, res) {
    try {
      const userId = req.user._id;
      const { requestId } = req.body;
      const spinId = requestId || `spin_${uuidv4()}`;

      // Prevent duplicate spins
      const existing = await Spin.findOne({ spinId });
      if (existing) {
        return res.status(400).json({ error: 'Duplicate spin request' });
      }

      const user = await User.findById(userId);
      const tapState = await TapState.findOne({ userId });
      const threshold = tapEconomy.luckyTap.thresholdTaps; // 300

      let triggerSource = 'user_spin_inventory';
      if ((tapState?.luckyWindowTaps || 0) >= threshold) {
        triggerSource = 'lucky_tap';
        // Reset lucky window taps
        tapState.luckyWindowTaps = 0;
        await tapState.save();
      } else if (user.balances.spins > 0) {
        user.balances.spins -= 1;
        await user.save();
      } else {
        return res.status(400).json({ 
          error: `Not eligible for Lucky Spin. Reach 300 taps or acquire a Spin token. Current: ${tapState?.luckyWindowTaps || 0}/300` 
        });
      }

      // Roll server-authoritative outcome
      const outcome = tapRewardService.rollLuckySpin();

      // Persist Spin
      const spinDoc = await Spin.create({
        userId,
        seasonId: user.currentTapSeasonId || 'season-1',
        spinId,
        triggerSource,
        resultType: outcome.outcome,
        resultAmount: outcome.amount,
        resultLabel: outcome.label
      });

      // Apply outcome reward
      let newBalances = user.balances;
      if (outcome.outcome !== 'none' && outcome.amount > 0) {
        if (outcome.outcome === 'energy') {
          tapState.energy = Math.min(tapState.maxEnergy, tapState.energy + outcome.amount);
          await tapState.save();
        } else {
          const ledgerResult = await rewardLedgerService.recordTransaction({
            userId,
            source: 'spin',
            type: 'credit',
            amount: outcome.amount,
            currency: outcome.outcome,
            referenceId: spinId,
            notes: `Lucky Tap Wheel: ${outcome.label}`
          });
          newBalances = ledgerResult.newBalances;
        }
      }

      return res.json({
        success: true,
        spinId,
        outcome: {
          id: outcome.id,
          label: outcome.label,
          outcome: outcome.outcome,
          amount: outcome.amount,
          color: outcome.color
        },
        balances: newBalances,
        energy: tapState.energy,
        spinsRemaining: user.balances.spins
      });
    } catch (error) {
      console.error('[Spin Execution Error]:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new LuckyController();
