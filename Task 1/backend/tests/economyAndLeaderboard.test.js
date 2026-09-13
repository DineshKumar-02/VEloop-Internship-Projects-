const tapRewardService = require('../services/tapRewardService');
const leaderboardService = require('../services/leaderboardService');
const tapEconomy = require('../config/tapEconomy');

describe('Economy Probabilities & Leaderboard Mechanics (PDF §4, §22, §39, §41)', () => {
  test('tap rewards fall into configured probability distributions', () => {
    const counts = { sve: 0, ve: 0, spin: 0, gems: 0, tokens: 0 };
    const sampleSize = 10000;

    for (let i = 0; i < sampleSize; i++) {
      const roll = tapRewardService.rollTapReward({ boostActive: false, efficiencyMultiplier: 1.0 });
      counts[roll.type] = (counts[roll.type] || 0) + 1;

      if (roll.type === 've') {
        expect(roll.amount).toBeGreaterThanOrEqual(0.6);
        expect(roll.amount).toBeLessThanOrEqual(1.7);
        // Assert 1 decimal place
        expect(roll.amount.toString()).toMatch(/^\d+(\.\d)?$/);
      } else if (roll.type === 'gems') {
        expect([0.5, 0.8, 1.0, 1.2, 2.0]).toContain(roll.amount);
      } else if (roll.type === 'tokens') {
        expect(roll.amount).toBeGreaterThanOrEqual(5);
        expect(roll.amount).toBeLessThanOrEqual(100);
      }
    }

    // Expected ~60% SVE, ~20% VE, ~13% Tokens, ~5% Gems, ~2% Spins
    const sveRatio = counts.sve / sampleSize;
    const veRatio = counts.ve / sampleSize;
    const tokensRatio = counts.tokens / sampleSize;
    const gemsRatio = counts.gems / sampleSize;
    const spinRatio = counts.spin / sampleSize;

    expect(sveRatio).toBeGreaterThan(0.55);
    expect(sveRatio).toBeLessThan(0.65);

    expect(veRatio).toBeGreaterThan(0.16);
    expect(veRatio).toBeLessThan(0.24);

    expect(tokensRatio).toBeGreaterThan(0.10);
    expect(tokensRatio).toBeLessThan(0.16);

    expect(gemsRatio).toBeGreaterThan(0.03);
    expect(gemsRatio).toBeLessThan(0.07);

    expect(spinRatio).toBeGreaterThan(0.01);
    expect(spinRatio).toBeLessThan(0.035);
  });

  test('correct season rewards mapped by rank', () => {
    const rank1 = leaderboardService.getRewardForRank(1);
    expect(rank1.rewardText).toBe('10,000 VEs + 5 Spins');

    const rank2 = leaderboardService.getRewardForRank(2);
    expect(rank2.rewardText).toBe('5,000 VEs + 3 Spins');

    const rank3 = leaderboardService.getRewardForRank(3);
    expect(rank3.rewardText).toBe('1,500 VEs + 1 Spin');

    const rank50 = leaderboardService.getRewardForRank(50);
    expect(rank50.rewardText).toBe('2,500 SVEs + 10 Gems');
  });

  test('lucky spin wheel outcomes conform to 100% total probability table', () => {
    const totalProb = tapEconomy.luckyTap.spinRewards.reduce((sum, item) => sum + item.probability, 0);
    expect(Math.round(totalProb * 100) / 100).toBe(1.0);
  });
});
