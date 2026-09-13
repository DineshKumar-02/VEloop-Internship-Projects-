const tapEconomy = require('../config/tapEconomy');
const User = require('../models/User');
const TapState = require('../models/TapState');
const Upgrade = require('../models/Upgrade');
const RewardLedger = require('../models/RewardLedger');

class UpgradeService {
  /**
   * Purchase Energy Capacity upgrade (PDF §41.4)
   */
  async purchaseCapacity(userId) {
    const user = await User.findById(userId);
    const tapState = await TapState.findOne({ userId });
    if (!user || !tapState) throw new Error('User or TapState not found');

    const tiers = tapEconomy.energy.capacityTiers;
    const currentMax = tapState.maxEnergy || 500;
    const currentIdx = tiers.findIndex(t => t.capacity === currentMax);

    if (currentIdx === -1 || currentIdx >= tiers.length - 1) {
      throw new Error('Maximum energy capacity already reached');
    }

    const nextTier = tiers[currentIdx + 1];
    if (user.balances.ve < nextTier.costVE) {
      throw new Error(`Insufficient VE balance. Required: ${nextTier.costVE} VE, Available: ${user.balances.ve} VE`);
    }

    // Deduct VE balance
    user.balances.ve = Math.round((user.balances.ve - nextTier.costVE) * 10) / 10;
    await user.save();

    // Upgrade capacity
    tapState.maxEnergy = nextTier.capacity;
    await tapState.save();

    // Record Upgrade & Ledger
    await Upgrade.create({
      userId,
      type: 'capacity',
      tier: `${nextTier.capacity}`,
      value: nextTier.capacity,
      cost: nextTier.costVE,
      currency: 've'
    });

    await RewardLedger.create({
      userId,
      source: 'upgrade_purchase',
      type: 'debit',
      amount: nextTier.costVE,
      currency: 've',
      balanceAfter: user.balances.ve,
      notes: `Upgraded Energy Capacity to ${nextTier.capacity}`
    });

    return { success: true, newCapacity: nextTier.capacity, newVE: user.balances.ve };
  }

  /**
   * Purchase Multitap upgrade (PDF §41.5)
   */
  async purchaseMultitap(userId, targetTier) {
    const user = await User.findById(userId);
    const tapState = await TapState.findOne({ userId });
    if (!user || !tapState) throw new Error('User or TapState not found');

    const tiers = tapEconomy.multitap.tiers;
    const selected = tiers.find(t => t.tier === targetTier);
    if (!selected || selected.costSVE === 0) {
      throw new Error('Invalid multitap tier selected');
    }

    if (user.balances.sve < selected.costSVE) {
      throw new Error(`Insufficient SVE balance. Required: ${selected.costSVE} SVE, Available: ${user.balances.sve} SVE`);
    }

    // Deduct SVE
    user.balances.sve = Math.round((user.balances.sve - selected.costSVE) * 10) / 10;
    await user.save();

    // Set multitap valid for 7 days
    const expiresAt = new Date(Date.now() + selected.durationDays * 24 * 60 * 60 * 1000);
    tapState.tapMultiplier = selected.multiplier;
    tapState.multiplierTier = selected.tier;
    tapState.multiplierExpiresAt = expiresAt;
    await tapState.save();

    await Upgrade.create({
      userId,
      type: 'multitap',
      tier: selected.tier,
      value: selected.multiplier,
      cost: selected.costSVE,
      currency: 'sve',
      expiresAt
    });

    await RewardLedger.create({
      userId,
      source: 'upgrade_purchase',
      type: 'debit',
      amount: selected.costSVE,
      currency: 'sve',
      balanceAfter: user.balances.sve,
      notes: `Purchased Multitap ${selected.tier} (Valid 7 Days)`
    });

    return { success: true, tier: selected.tier, multiplier: selected.multiplier, expiresAt, newSVE: user.balances.sve };
  }

  /**
   * Purchase Recharge Speed upgrade (PDF §41.6)
   */
  async purchaseRechargeSpeed(userId) {
    const user = await User.findById(userId);
    const tapState = await TapState.findOne({ userId });
    if (!user || !tapState) throw new Error('User or TapState not found');

    const tiers = tapEconomy.rechargeSpeed.tiers;
    const currentRate = tapState.rechargeRate || 20;
    const currentIdx = tiers.findIndex(t => t.rate === currentRate);

    if (currentIdx === -1 || currentIdx >= tiers.length - 1) {
      throw new Error('Maximum recharge speed reached');
    }

    const nextTier = tiers[currentIdx + 1];
    if (user.balances.tokens < nextTier.costTokens) {
      throw new Error(`Insufficient Tokens. Required: ${nextTier.costTokens} Tokens, Available: ${user.balances.tokens}`);
    }

    // Deduct tokens
    user.balances.tokens -= nextTier.costTokens;
    await user.save();

    tapState.rechargeRate = nextTier.rate;
    await tapState.save();

    await Upgrade.create({
      userId,
      type: 'rechargeSpeed',
      tier: `Tier ${nextTier.tier}`,
      value: nextTier.rate,
      cost: nextTier.costTokens,
      currency: 'tokens'
    });

    await RewardLedger.create({
      userId,
      source: 'upgrade_purchase',
      type: 'debit',
      amount: nextTier.costTokens,
      currency: 'tokens',
      balanceAfter: user.balances.tokens,
      notes: `Upgraded Recharge Speed to +${nextTier.rate}/20m`
    });

    return { success: true, newRate: nextTier.rate, newTokens: user.balances.tokens };
  }

  /**
   * Purchase Tap Efficiency (PDF §41.9)
   */
  async purchaseEfficiency(userId, targetTier, seasonEndDate) {
    const user = await User.findById(userId);
    const tapState = await TapState.findOne({ userId });
    if (!user || !tapState) throw new Error('User or TapState not found');

    const tiers = tapEconomy.tapEfficiency.tiers;
    const selected = tiers.find(t => t.tier === targetTier);
    if (!selected || selected.costSVE === 0) {
      throw new Error('Invalid efficiency tier selected');
    }

    if (user.balances.sve < selected.costSVE) {
      throw new Error(`Insufficient SVE balance. Required: ${selected.costSVE} SVE`);
    }

    user.balances.sve = Math.round((user.balances.sve - selected.costSVE) * 10) / 10;
    await user.save();

    const expiresAt = seasonEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    tapState.efficiency = selected.multiplier;
    tapState.efficiencyTier = selected.tier;
    tapState.efficiencyExpiresAt = expiresAt;
    await tapState.save();

    await Upgrade.create({
      userId,
      type: 'efficiency',
      tier: selected.tier,
      value: selected.multiplier,
      cost: selected.costSVE,
      currency: 'sve',
      expiresAt
    });

    await RewardLedger.create({
      userId,
      source: 'upgrade_purchase',
      type: 'debit',
      amount: selected.costSVE,
      currency: 'sve',
      balanceAfter: user.balances.sve,
      notes: `Purchased Tap Efficiency ${selected.tier} (Valid for Season)`
    });

    return { success: true, tier: selected.tier, multiplier: selected.multiplier, expiresAt, newSVE: user.balances.sve };
  }

  /**
   * Purchase Energy Bank (PDF §41.7)
   */
  async purchaseEnergyBank(userId) {
    const user = await User.findById(userId);
    const tapState = await TapState.findOne({ userId });
    if (!user || !tapState) throw new Error('User or TapState not found');

    const config = tapEconomy.energyBank;
    const now = new Date();

    // Check if bank is currently active or expired
    let bank = tapState.energyBank || { active: false, purchasesCount: 0, capacity: 0, current: 0 };
    if (bank.active && bank.expiresAt && now >= new Date(bank.expiresAt)) {
      // Expired: reset cycle
      bank = { active: false, purchasesCount: 0, capacity: 0, current: 0, expiresAt: null, lastRechargeAt: null };
    }

    if (bank.purchasesCount >= config.maxPurchasesPerCycle) {
      throw new Error('Maximum 2 Energy Bank purchases reached for this 3-day cycle');
    }

    const costVE = bank.purchasesCount === 0 ? config.purchase1CostVE : config.purchase2CostVE; // 100 VE or 500 VE
    if (user.balances.ve < costVE) {
      throw new Error(`Insufficient VE balance. Required: ${costVE} VE, Available: ${user.balances.ve} VE`);
    }

    // Deduct VE
    user.balances.ve = Math.round((user.balances.ve - costVE) * 10) / 10;
    await user.save();

    // Apply Bank purchase
    if (!bank.active) {
      bank.active = true;
      bank.capacity = config.initialCapacity; // 500
      bank.current = config.initialCapacity;
      bank.purchasesCount = 1;
      bank.expiresAt = new Date(now.getTime() + config.validityDurationMs); // 3 days
      bank.lastRechargeAt = now;
    } else {
      // Second purchase: add 500 capacity, up to 1000 total, duration not extended
      bank.capacity = Math.min(config.maxCapacity, bank.capacity + 500);
      bank.current = Math.min(bank.capacity, bank.current + 500);
      bank.purchasesCount = 2;
    }

    tapState.energyBank = bank;
    await tapState.save();

    await Upgrade.create({
      userId,
      type: 'energyBank',
      tier: `Purchase #${bank.purchasesCount}`,
      value: bank.capacity,
      cost: costVE,
      currency: 've',
      expiresAt: bank.expiresAt
    });

    await RewardLedger.create({
      userId,
      source: 'energy_bank_purchase',
      type: 'debit',
      amount: costVE,
      currency: 've',
      balanceAfter: user.balances.ve,
      notes: `Purchased Energy Bank (${bank.capacity} Energy Reserve, Valid 3 Days)`
    });

    return { success: true, bank: tapState.energyBank, newVE: user.balances.ve };
  }

  /**
   * Purchase Energy Shield (PDF §41.8)
   */
  async purchaseEnergyShield(userId) {
    const user = await User.findById(userId);
    const tapState = await TapState.findOne({ userId });
    if (!user || !tapState) throw new Error('User or TapState not found');

    const config = tapEconomy.energyShield;
    const now = new Date();

    // Check active
    if (tapState.energyShield && tapState.energyShield.active) {
      if (now < new Date(tapState.energyShield.expiresAt)) {
        throw new Error('Energy Shield is already active');
      }
    }

    // Check cooldown (5 minutes after use)
    if (tapState.energyShield && tapState.energyShield.cooldownUntil) {
      if (now < new Date(tapState.energyShield.cooldownUntil)) {
        const remainingSec = Math.ceil((new Date(tapState.energyShield.cooldownUntil).getTime() - now.getTime()) / 1000);
        throw new Error(`Energy Shield is on cooldown. Try again in ${remainingSec} seconds`);
      }
    }

    if (user.balances.ve < config.costVE) {
      throw new Error(`Insufficient VE balance. Required: ${config.costVE} VE`);
    }

    // Deduct VE
    user.balances.ve = Math.round((user.balances.ve - config.costVE) * 10) / 10;
    await user.save();

    const expiresAt = new Date(now.getTime() + config.durationSeconds * 1000);
    const cooldownUntil = new Date(expiresAt.getTime() + config.cooldownMinutes * 60 * 1000);

    tapState.energyShield = {
      active: true,
      expiresAt,
      cooldownUntil
    };
    await tapState.save();

    await Upgrade.create({
      userId,
      type: 'energyShield',
      tier: '30s Shield',
      value: 0.90,
      cost: config.costVE,
      currency: 've',
      expiresAt
    });

    await RewardLedger.create({
      userId,
      source: 'shield_purchase',
      type: 'debit',
      amount: config.costVE,
      currency: 've',
      balanceAfter: user.balances.ve,
      notes: 'Activated 30-second Energy Shield (90% Protection)'
    });

    return { success: true, shield: tapState.energyShield, newVE: user.balances.ve };
  }
}

module.exports = new UpgradeService();
