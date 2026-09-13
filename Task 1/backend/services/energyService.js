const tapEconomy = require('../config/tapEconomy');

class EnergyService {
  /**
   * Regenerates energy based purely on elapsed timestamps (PDF §5 & §41)
   * Client requests do NOT drive the rate; timestamps do.
   */
  regenerateEnergy(tapState) {
    const now = new Date();
    const config = tapEconomy.energy;

    // 1. Normal Energy Regeneration
    const lastEnergyAt = tapState.lastEnergyAt ? new Date(tapState.lastEnergyAt) : now;
    const elapsedMs = now.getTime() - lastEnergyAt.getTime();
    const rechargeIntervalMs = config.rechargeIntervalMs; // 20 min = 1,200,000 ms

    if (elapsedMs >= rechargeIntervalMs && tapState.energy < tapState.maxEnergy) {
      const intervals = Math.floor(elapsedMs / rechargeIntervalMs);
      const energyToAdd = intervals * (tapState.rechargeRate || config.baseRechargeRate);
      tapState.energy = Math.min(tapState.maxEnergy, tapState.energy + energyToAdd);
      tapState.lastEnergyAt = new Date(lastEnergyAt.getTime() + intervals * rechargeIntervalMs);
    } else if (tapState.energy >= tapState.maxEnergy) {
      tapState.lastEnergyAt = now;
    }

    // 2. Check 3-Day Energy Bank (PDF §17 & §41.7)
    if (tapState.energyBank && tapState.energyBank.active) {
      const bankExpiresAt = new Date(tapState.energyBank.expiresAt);
      if (now >= bankExpiresAt) {
        // Expiry: Remaining bank energy is lost
        tapState.energyBank.active = false;
        tapState.energyBank.current = 0;
        tapState.energyBank.capacity = 0;
        tapState.energyBank.purchasesCount = 0;
      } else if (tapState.energyBank.current < tapState.energyBank.capacity) {
        // Bank recharge: +20 energy every 120 minutes
        const lastBankRecharge = tapState.energyBank.lastRechargeAt 
          ? new Date(tapState.energyBank.lastRechargeAt) 
          : now;
        const bankElapsed = now.getTime() - lastBankRecharge.getTime();
        const bankIntervalMs = tapEconomy.energyBank.rechargeIntervalMs;

        if (bankElapsed >= bankIntervalMs) {
          const bankIntervals = Math.floor(bankElapsed / bankIntervalMs);
          const bankToAdd = bankIntervals * tapEconomy.energyBank.rechargeAmount;
          tapState.energyBank.current = Math.min(
            tapState.energyBank.capacity, 
            tapState.energyBank.current + bankToAdd
          );
          tapState.energyBank.lastRechargeAt = new Date(lastBankRecharge.getTime() + bankIntervals * bankIntervalMs);
        }
      }
    }

    // 3. Check Energy Shield Active Status (PDF §18 & §41.8)
    if (tapState.energyShield && tapState.energyShield.active) {
      const shieldExpiresAt = new Date(tapState.energyShield.expiresAt);
      if (now >= shieldExpiresAt) {
        tapState.energyShield.active = false;
      }
    }

    // 4. Check Multitap Expiry (PDF §7 & §41.5)
    if (tapState.multiplierExpiresAt && now >= new Date(tapState.multiplierExpiresAt)) {
      tapState.tapMultiplier = 1;
      tapState.multiplierTier = 'x1.0';
      tapState.multiplierExpiresAt = null;
    }

    // 5. Check Boost Expiry (PDF §13)
    if (tapState.boost && tapState.boost.active) {
      if (now >= new Date(tapState.boost.expiresAt)) {
        tapState.boost.active = false;
      }
    }

    // 6. Check Efficiency Expiry (PDF §19 & §41.9)
    if (tapState.efficiencyExpiresAt && now >= new Date(tapState.efficiencyExpiresAt)) {
      tapState.efficiency = 1.0;
      tapState.efficiencyTier = 'x1.0';
      tapState.efficiencyExpiresAt = null;
    }

    return tapState;
  }

  /**
   * Calculates energy consumption for a tap interaction,
   * accounting for Energy Shield and Energy Bank priority.
   */
  calculateConsumption(tapState, effectiveCount) {
    let requiredEnergy = effectiveCount;
    let shieldProtected = false;

    // Energy Shield logic: 90% chance 0 energy, 10% normal energy (PDF §41.8)
    if (tapState.energyShield && tapState.energyShield.active) {
      const roll = Math.random();
      if (roll < tapEconomy.energyShield.protectionRate) { // 0.90
        requiredEnergy = 0;
        shieldProtected = true;
      }
    }

    const totalAvailable = (tapState.energy || 0) + 
      (tapState.energyBank && tapState.energyBank.active ? tapState.energyBank.current : 0);

    if (requiredEnergy > totalAvailable) {
      return {
        success: false,
        reason: 'NOT_ENOUGH_ENERGY',
        available: totalAvailable,
        required: requiredEnergy
      };
    }

    // Consume from Energy Bank FIRST (PDF §41.7)
    let consumedFromBank = 0;
    let consumedFromNormal = 0;

    if (tapState.energyBank && tapState.energyBank.active && tapState.energyBank.current > 0) {
      consumedFromBank = Math.min(tapState.energyBank.current, requiredEnergy);
      tapState.energyBank.current -= consumedFromBank;
      requiredEnergy -= consumedFromBank;
    }

    if (requiredEnergy > 0) {
      consumedFromNormal = requiredEnergy;
      tapState.energy -= consumedFromNormal;
    }

    return {
      success: true,
      shieldProtected,
      consumedFromBank,
      consumedFromNormal,
      totalConsumed: consumedFromBank + consumedFromNormal
    };
  }

  /**
   * Computes remaining seconds until next recharge
   */
  getTimeUntilNextRecharge(tapState) {
    if (tapState.energy >= tapState.maxEnergy) return 0;
    const now = Date.now();
    const last = tapState.lastEnergyAt ? new Date(tapState.lastEnergyAt).getTime() : now;
    const elapsed = now - last;
    const interval = tapEconomy.energy.rechargeIntervalMs;
    const remainingMs = Math.max(0, interval - (elapsed % interval));
    return Math.ceil(remainingMs / 1000);
  }
}

module.exports = new EnergyService(); 