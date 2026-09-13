const energyService = require('../services/energyService');
const antiBotService = require('../services/antiBotService');
const tapRewardService = require('../services/tapRewardService');
const tapEconomy = require('../config/tapEconomy');
const mongoose = require('mongoose');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://127.0.0.1:27017/veloop_tap_earn');
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});


describe('Energy System & Anti-Bot Service Tests (PDF §5, §31, §39)', () => {
  describe('Energy Timestamp-Based Regeneration', () => {
    test('regenerates +20 energy after 20 minutes offline', () => {
      const twentyMinAgo = new Date(Date.now() - 20 * 60 * 1000);
      const tapState = {
        energy: 100,
        maxEnergy: 500,
        rechargeRate: 20,
        lastEnergyAt: twentyMinAgo
      };

      const regenerated = energyService.regenerateEnergy(tapState);
      expect(regenerated.energy).toBe(120);
    });

    test('regenerates multiple intervals after long offline period', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 3 intervals
      const tapState = {
        energy: 100,
        maxEnergy: 500,
        rechargeRate: 20,
        lastEnergyAt: oneHourAgo
      };

      const regenerated = energyService.regenerateEnergy(tapState);
      expect(regenerated.energy).toBe(160); // 100 + 3 * 20
    });

    test('never exceeds max energy capacity cap', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const tapState = {
        energy: 480,
        maxEnergy: 500,
        rechargeRate: 20,
        lastEnergyAt: tenDaysAgo
      };

      const regenerated = energyService.regenerateEnergy(tapState);
      expect(regenerated.energy).toBe(500);
    });
  });

  describe('Anti-Bot & Interaction Lock', () => {
    const dummyUserId = '507f1f77bcf86cd799439011';

    test('rejects taps faster than 200 ms interval', async () => {
      const lastTapJustNow = new Date(Date.now() - 50); // only 50ms ago!
      const check = await antiBotService.validateTap(dummyUserId, 'req_fast_1', lastTapJustNow);

      expect(check.valid).toBe(false);
      expect(check.code).toBe('TAP_TOO_FAST');
    });

    test('accepts taps meeting 200 ms interval', async () => {
      const lastTapAllowed = new Date(Date.now() - 250); // 250ms ago
      const check = await antiBotService.validateTap(dummyUserId, 'req_valid_1', lastTapAllowed);

      expect(check.valid).toBe(true);
    });

    test('rejects duplicate requestId (replay protection)', async () => {
      const reqId = 'unique_req_test_replay_99';
      // First attempt
      const check1 = await antiBotService.validateTap(dummyUserId, reqId, new Date(Date.now() - 500));
      expect(check1.valid).toBe(true);

      // Duplicate attempt with same reqId
      const check2 = await antiBotService.validateTap(dummyUserId, reqId, new Date(Date.now() - 500));
      expect(check2.valid).toBe(false);
      expect(check2.code).toBe('DUPLICATE_REQUEST_ID');
    });
  });

  describe('Temporary Boost, Multiplier & Shield Expiries', () => {
    test('expires 30-second boost after duration has passed', () => {
      const pastExpiry = new Date(Date.now() - 5000); // expired 5 seconds ago
      const tapState = {
        energy: 200,
        maxEnergy: 500,
        boost: { active: true, expiresAt: pastExpiry }
      };

      energyService.regenerateEnergy(tapState);
      expect(tapState.boost.active).toBe(false);
    });

    test('expires 7-day multitap after duration has passed', () => {
      const pastExpiry = new Date(Date.now() - 1000);
      const tapState = {
        energy: 200,
        maxEnergy: 500,
        tapMultiplier: 3,
        multiplierExpiresAt: pastExpiry
      };

      energyService.regenerateEnergy(tapState);
      expect(tapState.tapMultiplier).toBe(1);
    });

    test('energy shield protects 90% taps without energy deduction', () => {
      const activeShield = {
        active: true,
        expiresAt: new Date(Date.now() + 20000)
      };

      let protectedCount = 0;
      for (let i = 0; i < 1000; i++) {
        const state = { energy: 100, energyBank: null, energyShield: activeShield };
        const res = energyService.calculateConsumption(state, 1);
        if (res.shieldProtected) protectedCount++;
      }

      // Expected ~90% (850 to 950)
      expect(protectedCount).toBeGreaterThan(830);
      expect(protectedCount).toBeLessThan(970);
    });
  });

  describe('Lucky Tap Threshold Gating (PDF §14)', () => {
    test('lucky tap is not eligible below 300 taps', () => {
      const threshold = tapEconomy.luckyTap.thresholdTaps; // 300
      expect(299 < threshold).toBe(true);
      expect(300 >= threshold).toBe(true);
    });
  });
});
