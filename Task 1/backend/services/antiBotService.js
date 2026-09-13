const tapEconomy = require('../config/tapEconomy');
const TapEvent = require('../models/TapEvent');

class AntiBotService {
  constructor() {
    // In-memory sliding window cache for rapid burst analysis
    // userId -> Array of timestamps [t1, t2, ...]
    this.userTapWindows = new Map();
    // In-memory set for processed requestId caching
    this.seenRequestIds = new Set();
    // Suspicious pattern log
    this.botViolations = [];
  }

  /**
   * Validates tap against 200ms lock, replay, and abnormal burst anomalies
   */
  async validateTap(userId, requestId, lastTapAt) {
    const now = Date.now();
    const minInterval = tapEconomy.security.minTapIntervalMs; // 200 ms

    // 1. Replay attack prevention via requestId
    if (this.seenRequestIds.has(requestId)) {
      this.logViolation(userId, 'DUPLICATE_REQUEST_ID', `Replayed requestId: ${requestId}`);
      return { valid: false, code: 'DUPLICATE_REQUEST_ID', message: 'Duplicate tap request detected' };
    }

    // Check DB for requestId in case server rebooted
    const existingEvent = await TapEvent.findOne({ requestId }).lean();
    if (existingEvent) {
      this.seenRequestIds.add(requestId);
      this.logViolation(userId, 'DUPLICATE_REQUEST_ID_DB', `Replayed requestId in DB: ${requestId}`);
      return { valid: false, code: 'DUPLICATE_REQUEST_ID', message: 'Duplicate tap request detected' };
    }

    // 2. Minimum 200 ms interval check against server authoritative lastTapAt
    if (lastTapAt) {
      const lastTapTime = new Date(lastTapAt).getTime();
      const intervalMs = now - lastTapTime;
      if (intervalMs < minInterval) {
        this.logViolation(userId, 'TAP_TOO_FAST', `Interval was ${intervalMs}ms (< 200ms)`);
        return { 
          valid: false, 
          code: 'TAP_TOO_FAST', 
          message: 'Tap too fast. Please respect the 200ms interaction window.',
          intervalMs 
        };
      }
    }

    // 3. Sliding window burst rate analysis (Reject > 6 taps in 1000 ms)
    const timestamps = this.userTapWindows.get(userId.toString()) || [];
    const oneSecAgo = now - 1000;
    const recentTimestamps = timestamps.filter(t => t > oneSecAgo);

    if (recentTimestamps.length >= tapEconomy.security.maxBurstTapsPerSecond) {
      this.logViolation(userId, 'BURST_ANOMALY', `Burst exceeded: ${recentTimestamps.length} taps/sec`);
      return {
        valid: false,
        code: 'BURST_LIMIT_EXCEEDED',
        message: 'Abnormal tap rate detected. Please slow down.'
      };
    }

    // 4. Record this valid tap in memory cache
    recentTimestamps.push(now);
    this.userTapWindows.set(userId.toString(), recentTimestamps);
    this.seenRequestIds.add(requestId);

    // Prune seen requestIds if cache gets too large (keep last 10,000)
    if (this.seenRequestIds.size > 10000) {
      const it = this.seenRequestIds.values();
      for (let i = 0; i < 2000; i++) {
        this.seenRequestIds.delete(it.next().value);
      }
    }

    return { valid: true };
  }

  logViolation(userId, type, details) {
    const entry = {
      userId: userId.toString(),
      type,
      details,
      timestamp: new Date()
    };
    this.botViolations.unshift(entry);
    if (this.botViolations.length > 500) {
      this.botViolations.pop();
    }
    console.warn(`[Anti-Bot Violation]: User=${userId}, Type=${type}, Details=${details}`);
  }

  getViolations(limit = 50) {
    return this.botViolations.slice(0, limit);
  }
}

module.exports = new AntiBotService();
