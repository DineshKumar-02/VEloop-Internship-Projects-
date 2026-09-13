const tapEconomy = require('../config/tapEconomy');
const AdEvent = require('../models/AdEvent');
const User = require('../models/User');
const TapState = require('../models/TapState');
const RewardLedger = require('../models/RewardLedger');

class AdService {
  constructor() {
    // Tracks taps since last ad opportunity per user
    this.userTapCounters = new Map();
  }

  /**
   * Evaluates if user should receive a demo ad prompt (PDF §42)
   */
  checkAdOpportunity(userId, effectiveTapsCount) {
    const minThreshold = tapEconomy.ads.minAdTapThreshold || 15;
    const maxThreshold = tapEconomy.ads.maxAdTapThreshold || 40;

    let currentCount = this.userTapCounters.get(userId.toString()) || 0;
    currentCount += effectiveTapsCount;
    this.userTapCounters.set(userId.toString(), currentCount);

    // Random trigger once threshold is reached
    if (currentCount >= minThreshold) {
      const chance = (currentCount - minThreshold + 1) / (maxThreshold - minThreshold + 1);
      if (Math.random() < chance || currentCount >= maxThreshold) {
        // Reset counter
        this.userTapCounters.set(userId.toString(), 0);
        return {
          showAd: true,
          placement: Math.random() > 0.5 ? 'video' : 'interstitial',
          adId: `demo_ad_${Date.now()}`
        };
      }
    }

    return { showAd: false };
  }

  /**
   * Records ad lifecycle event
   */
  async recordAdEvent(userId, { placement, eventType, optionalRewardReference }) {
    return await AdEvent.create({
      userId,
      placement,
      provider: 'DemoAdProvider',
      eventType,
      optionalRewardReference
    });
  }

  /**
   * Verifies and grants rewarded ad benefit (PDF §32)
   */
  async grantRewardedAdBenefit(userId, benefitType) {
    const tapState = await TapState.findOne({ userId });
    const user = await User.findById(userId);
    if (!tapState || !user) throw new Error('User or TapState not found');

    let grantedDetails = {};

    if (benefitType === 'energy') {
      const refillAmount = tapEconomy.ads.rewardedEnergyBenefit || 50;
      tapState.energy = Math.min(tapState.maxEnergy, tapState.energy + refillAmount);
      await tapState.save();

      await RewardLedger.create({
        userId,
        source: 'ad_reward',
        type: 'credit',
        amount: refillAmount,
        currency: 'energy',
        balanceAfter: tapState.energy,
        notes: `Rewarded Ad: +${refillAmount} Energy Refill`
      });

      grantedDetails = { type: 'energy', amount: refillAmount, currentEnergy: tapState.energy };
    } else if (benefitType === 'boost') {
      const boostDuration = tapEconomy.ads.rewardedBoostBenefitSeconds || 30;
      tapState.boost = {
        active: true,
        expiresAt: new Date(Date.now() + boostDuration * 1000),
        lastActivatedAt: new Date()
      };
      await tapState.save();

      await RewardLedger.create({
        userId,
        source: 'ad_reward',
        type: 'credit',
        amount: boostDuration,
        currency: 'sve',
        notes: `Rewarded Ad: ${boostDuration}s Tap Boost Activated`
      });

      grantedDetails = { type: 'boost', durationSeconds: boostDuration, expiresAt: tapState.boost.expiresAt };
    }

    // Log rewarded event
    await AdEvent.create({
      userId,
      placement: 'video',
      provider: 'DemoAdProvider',
      eventType: 'rewarded',
      rewardGranted: JSON.stringify(grantedDetails)
    });

    return grantedDetails;
  }
}

module.exports = new AdService();
