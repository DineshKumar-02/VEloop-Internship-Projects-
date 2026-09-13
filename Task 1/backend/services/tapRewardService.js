const tapEconomy = require('../config/tapEconomy');

class TapRewardService {
  /**
   * Rolls a server-authoritative reward outcome based strictly on Section 41.2
   */
  rollTapReward(modifiers = { boostActive: false, efficiencyMultiplier: 1.0 }) {
    const probs = tapEconomy.rewards.probabilities;
    const rand = Math.random();
    let cumulative = 0;

    const boostMult = modifiers.boostActive ? (tapEconomy.boost.rewardMultiplier || 2.0) : 1.0;
    const effMult = modifiers.efficiencyMultiplier || 1.0;

    // 1. SVE (60%)
    cumulative += probs.sve;
    if (rand < cumulative) {
      const baseAmount = tapEconomy.rewards.sve.amount; // 1 SVE
      const finalAmount = Math.round(baseAmount * boostMult * effMult * 10) / 10;
      return {
        type: 'sve',
        amount: finalAmount,
        label: `+${finalAmount} SVE`,
        color: '#FBBF24'
      };
    }

    // 2. VE (20%) - Random 0.6 to 1.7 with 1 decimal place
    cumulative += probs.ve;
    if (rand < cumulative) {
      const min = Math.round(tapEconomy.rewards.ve.min * 10);
      const max = Math.round(tapEconomy.rewards.ve.max * 10);
      const randomTenth = Math.floor(Math.random() * (max - min + 1)) + min;
      const baseAmount = randomTenth / 10;
      const finalAmount = Math.round(baseAmount * boostMult * effMult * 10) / 10;
      return {
        type: 've',
        amount: finalAmount,
        label: `+${finalAmount} VE`,
        color: '#F59E0B'
      };
    }

    // 3. Spin (2%) - 1 Spin (no multiplier per §41.9)
    cumulative += probs.spin;
    if (rand < cumulative) {
      return {
        type: 'spin',
        amount: 1,
        label: '+1 Spin',
        color: '#8B5CF6'
      };
    }

    // 4. Gems (5%) - Discrete options [0.5, 0.8, 1.0, 1.2, 2.0]
    cumulative += probs.gems;
    if (rand < cumulative) {
      const opts = tapEconomy.rewards.gems.options;
      const baseAmount = opts[Math.floor(Math.random() * opts.length)];
      const finalAmount = Math.round(baseAmount * effMult * 10) / 10;
      return {
        type: 'gems',
        amount: finalAmount,
        label: `+${finalAmount} Gems`,
        color: '#EC4899'
      };
    }

    // 5. Tokens (13% Remainder) - Random 5 to 100
    const minTokens = tapEconomy.rewards.tokens.min;
    const maxTokens = tapEconomy.rewards.tokens.max;
    const baseTokens = Math.floor(Math.random() * (maxTokens - minTokens + 1)) + minTokens;
    const finalTokens = Math.round(baseTokens * boostMult * effMult);
    return {
      type: 'tokens',
      amount: finalTokens,
      label: `+${finalTokens} Tokens`,
      color: '#3B82F6'
    };
  }

  /**
   * Evaluates Mystery Tap eligibility (PDF §11 & §41.11)
   * Triggered at 250 effective taps milestone with 0.5% chance.
   */
  evaluateMysteryTap(currentEffectiveTaps, previousEffectiveTaps) {
    const milestone = tapEconomy.mysteryTap.effectiveTapMilestone; // 250
    const crossedMilestone = Math.floor(currentEffectiveTaps / milestone) > Math.floor(previousEffectiveTaps / milestone);

    if (crossedMilestone) {
      const roll = Math.random();
      if (roll < tapEconomy.mysteryTap.triggerChance) { // 0.5%
        return {
          triggered: true,
          type: 'mystery',
          rewardType: 'sve',
          amount: tapEconomy.mysteryTap.rewardSVE,
          label: `✨ Mystery Tap! +${tapEconomy.mysteryTap.rewardSVE} SVE`
        };
      }
    }
    return { triggered: false };
  }

  /**
   * Updates streak and combo with strict inactivity reset timers (PDF §41.10)
   */
  updateStreakAndCombo(tapState) {
    const now = new Date();
    const streakResetMs = tapEconomy.streak.inactivityResetSeconds * 1000; // 5000 ms
    const comboResetMs = tapEconomy.combo.inactivityResetSeconds * 1000;   // 2000 ms

    // Streak Check (5s inactivity reset)
    if (tapState.lastStreakAt && (now.getTime() - new Date(tapState.lastStreakAt).getTime() <= streakResetMs)) {
      tapState.streak = (tapState.streak || 0) + 1;
    } else {
      tapState.streak = 1;
    }
    tapState.lastStreakAt = now;

    // Combo Check (2s inactivity reset)
    if (tapState.lastComboAt && (now.getTime() - new Date(tapState.lastComboAt).getTime() <= comboResetMs)) {
      tapState.combo = (tapState.combo || 0) + 1;
    } else {
      tapState.combo = 1;
    }
    tapState.lastComboAt = now;
    tapState.lastTapAt = now;

    return {
      streak: tapState.streak,
      combo: tapState.combo
    };
  }

  /**
   * Evaluates Lucky Spin Wheel result (PDF §41.12)
   */
  rollLuckySpin() {
    const rewards = tapEconomy.luckyTap.spinRewards;
    const rand = Math.random();
    let cumulative = 0;

    for (const item of rewards) {
      cumulative += item.probability;
      if (rand < cumulative) {
        return item;
      }
    }
    return rewards[rewards.length - 1];
  }
}

module.exports = new TapRewardService();
