/**
 * Centralized Tap & Earn Economy Configuration (Single Source of Truth)
 * Strictly matches Section 4, Section 5, and Section 41 of the specification.
 */

const tapEconomy = {
  version: "1.0.0",

  // Section 41.2: Reward Probabilities & Roll Config
  rewards: {
    probabilities: {
      sve: 0.60,      // 60%
      ve: 0.20,       // 20%
      spin: 0.02,     // 2%
      gems: 0.05,     // 5%
      tokens: 0.13    // 13% (Remainder)
    },
    sve: {
      amount: 1
    },
    ve: {
      min: 0.6,
      max: 1.7,
      step: 0.1 // discrete values with 1 decimal place: 0.6, 0.7, ..., 1.7
    },
    spin: {
      amount: 1
    },
    gems: {
      options: [0.5, 0.8, 1.0, 1.2, 2.0]
    },
    tokens: {
      min: 5,
      max: 100
    }
  },

  // Section 5 & Section 41.4: Energy System & Capacity Tiers
  energy: {
    baseCapacity: 500,
    baseRechargeRate: 20, // +20 energy
    rechargeIntervalMs: 20 * 60 * 1000, // 20 minutes (1200000 ms)
    consumptionPerEffectiveTap: 1,
    capacityTiers: [
      { capacity: 500, costVE: 0, current: true },
      { capacity: 600, costVE: 100 },
      { capacity: 700, costVE: 150 },
      { capacity: 800, costVE: 210 },
      { capacity: 900, costVE: 280 },
      { capacity: 1000, costVE: 360 }
    ]
  },

  // Section 7 & Section 41.5: Multitap Tiers (Valid for 7 days)
  multitap: {
    tiers: [
      { tier: "x1.0", multiplier: 1, costSVE: 0, durationDays: 0, default: true },
      { tier: "x1.1", multiplier: 2, costSVE: 1000, durationDays: 7, label: "x2 Effective Taps" },
      { tier: "x1.2", multiplier: 3, costSVE: 1300, durationDays: 7, label: "x3 Effective Taps" },
      { tier: "x1.3", multiplier: 4, costSVE: 2000, durationDays: 7, label: "x4 Effective Taps" }
    ]
  },

  // Section 8 & Section 41.6: Energy Recharge Speed Tiers
  rechargeSpeed: {
    tiers: [
      { tier: 1, rate: 20, intervalMin: 20, costTokens: 0, default: true },
      { tier: 2, rate: 22, intervalMin: 20, costTokens: 2000 },
      { tier: 3, rate: 24, intervalMin: 20, costTokens: 3500 },
      { tier: 4, rate: 27, intervalMin: 20, costTokens: 5000 },
      { tier: 5, rate: 30, intervalMin: 20, costTokens: 7500 }
    ]
  },

  // Section 17 & Section 41.7: Energy Bank
  energyBank: {
    initialCapacity: 500,
    maxPurchasesPerCycle: 2,
    purchase1CostVE: 100,
    purchase2CostVE: 500,
    maxCapacity: 1000,
    rechargeAmount: 20,
    rechargeIntervalMs: 120 * 60 * 1000, // +20 Energy every 120 minutes
    validityDurationMs: 3 * 24 * 60 * 60 * 1000 // 3 days
  },

  // Section 18 & Section 41.8: Energy Shield
  energyShield: {
    costVE: 100,
    durationSeconds: 30,
    protectionRate: 0.90, // 90% zero energy, 10% normal energy
    cooldownMinutes: 5
  },

  // Section 19 & Section 41.9: Seasonal Tap Efficiency
  tapEfficiency: {
    tiers: [
      { tier: "x1.0", multiplier: 1.0, costSVE: 0, default: true },
      { tier: "x1.1", multiplier: 1.1, costSVE: 1.1 },
      { tier: "x1.2", multiplier: 1.2, costSVE: 1.2 },
      { tier: "x1.3", multiplier: 1.3, costSVE: 1.5 }
    ]
  },

  // Section 13: Temporary Boost Window
  boost: {
    durationSeconds: 30,
    rewardMultiplier: 2.0,
    freeBoostCooldownMinutes: 60
  },

  // Section 9, Section 12 & Section 41.10: Tap Streak & Combo Inactivity Resets
  streak: {
    inactivityResetSeconds: 5
  },
  combo: {
    inactivityResetSeconds: 2
  },

  // Section 10: Precision Tap
  precisionTap: {
    triggerChance: 0.04, // 4% chance to spawn target
    bonusTokens: 15
  },

  // Section 11 & Section 41.11: Mystery Tap
  mysteryTap: {
    effectiveTapMilestone: 250, // checked every 250 taps
    triggerChance: 0.005,        // 0.5% chance at milestone
    rewardSVE: 25
  },

  // Section 14 & Section 41.12: Lucky Tap & Spin Reward Table
  luckyTap: {
    thresholdTaps: 300,
    spinRewards: [
      { id: "tokens_50", label: "50 Tokens", outcome: "tokens", amount: 50, probability: 0.25, color: "#3B82F6" },
      { id: "ve_500", label: "500 VEs", outcome: "ve", amount: 500, probability: 0.00, color: "#10B981", disabled: true },
      { id: "ve_20", label: "20 VEs", outcome: "ve", amount: 20, probability: 0.05, color: "#F59E0B" },
      { id: "spins_2", label: "2 Spins", outcome: "spin", amount: 2, probability: 0.10, color: "#8B5CF6" },
      { id: "gems_10", label: "10 Gems", outcome: "gems", amount: 10, probability: 0.08, color: "#EC4899" },
      { id: "sve_100", label: "100 SVEs", outcome: "sve", amount: 100, probability: 0.12, color: "#FBBF24" },
      { id: "sve_50", label: "50 SVEs", outcome: "sve", amount: 50, probability: 0.25, color: "#F59E0B" },
      { id: "better_luck", label: "Better Luck", outcome: "none", amount: 0, probability: 0.10, color: "#64748B" },
      { id: "voucher_5", label: "₹5 Amazon Voucher", outcome: "voucher", amount: 5, probability: 0.00, color: "#06B6D4", disabled: true },
      { id: "energy_15", label: "+15 Energy", outcome: "energy", amount: 15, probability: 0.05, color: "#10B981" }
    ]
  },

  // Section 22 & Section 41.13: Tap League Leaderboard & Season Final Rewards
  league: {
    topDisplayed: 100,
    finalRewards: [
      { rankRange: [1, 1], label: "Rank #1", rewardText: "10,000 VEs + 5 Spins", rewards: { ve: 10000, spins: 5 } },
      { rankRange: [2, 2], label: "Rank #2", rewardText: "5,000 VEs + 3 Spins", rewards: { ve: 5000, spins: 3 } },
      { rankRange: [3, 3], label: "Rank #3", rewardText: "1,500 VEs + 1 Spin", rewards: { ve: 1500, spins: 1 } },
      { rankRange: [4, 10], label: "Rank #4-10", rewardText: "500 VEs + 2,500 Tokens", rewards: { ve: 500, tokens: 2500 } },
      { rankRange: [11, 25], label: "Rank #11-25", rewardText: "5,000 SVEs + 1,000 Tokens", rewards: { sve: 5000, tokens: 1000 } },
      { rankRange: [26, 50], label: "Rank #26-50", rewardText: "2,500 SVEs + 10 Gems", rewards: { sve: 2500, gems: 10 } },
      { rankRange: [51, 100], label: "Rank #51-100", rewardText: "1,000 SVEs + 500 Tokens", rewards: { sve: 1000, tokens: 500 } }
    ]
  },

  // Section 42: Demo Ad System Settings
  ads: {
    minAdTapThreshold: 15,
    maxAdTapThreshold: 40,
    rewardedEnergyBenefit: 50,
    rewardedBoostBenefitSeconds: 30,
    supportedTypes: ["interstitial", "video", "banner"]
  },

  // Section 31: Security & Anti-Bot Protection
  security: {
    minTapIntervalMs: 200, // 200 ms minimum accepted tap interval
    maxBurstTapsPerSecond: 6,
    maxConsecutiveRejectedTaps: 10
  }
};

module.exports = tapEconomy;
