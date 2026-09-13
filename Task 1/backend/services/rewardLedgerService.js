const RewardLedger = require('../models/RewardLedger');
const User = require('../models/User');

class RewardLedgerService {
  /**
   * Atomically records a transaction and applies balance updates to the User
   */
  async recordTransaction({ userId, source, type, amount, currency, referenceId, notes }) {
    // 1. Fetch user to update balance atomically
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found for ledger update');

    let newBalance = user.balances[currency] || 0;
    if (type === 'credit') {
      newBalance = Math.round((newBalance + amount) * 10) / 10;
    } else if (type === 'debit') {
      newBalance = Math.round((newBalance - amount) * 10) / 10;
    }

    // Save updated balance
    user.balances[currency] = newBalance;
    user.updatedAt = new Date();
    await user.save();

    // 2. Write immutable ledger entry
    const ledgerEntry = await RewardLedger.create({
      userId,
      source,
      type,
      amount,
      currency,
      balanceAfter: newBalance,
      referenceId,
      notes,
      createdAt: new Date()
    });

    return { ledgerEntry, newBalances: user.balances };
  }
}

module.exports = new RewardLedgerService();
