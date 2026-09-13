/**
 * VELoop Tap & Earn API Client
 * Automatically generates unique requestIds, injects user auth, and parses errors
 */

export const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

class TapApiClient {
  constructor() {
    let url = import.meta.env.VITE_API_BASE_URL;
    if (!url) {
      // In development fallback to local backend; in production build fallback to live Render backend
      url = import.meta.env.DEV ? 'http://localhost:4500/api' : 'https://veloop-tap-backend.onrender.com/api';
    }
    if (url && url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    this.baseUrl = url;
    this.activeUserId = null; // Can be set when switching profiles
  }

  setUserId(id) {
    this.activeUserId = id;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.activeUserId ? { 'x-veloop-user-id': this.activeUserId } : {}),
      ...(options.headers || {})
    };

    const config = {
      ...options,
      headers
    };

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP error ${res.status}`);
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  // Tap Endpoints
  async getState() {
    return this.request('/tap/state');
  }

  async processTap({ requestId, physicalCount = 1, isPrecisionTap = false }) {
    return this.request('/tap', {
      method: 'POST',
      body: JSON.stringify({
        requestId: requestId || generateRequestId(),
        physicalCount,
        isPrecisionTap
      })
    });
  }

  async getHistory() {
    return this.request('/tap/history');
  }

  async activateBoost() {
    return this.request('/tap/boost/activate', { method: 'POST' });
  }

  async purchaseUpgrade(type, tier) {
    return this.request('/tap/upgrade', {
      method: 'POST',
      body: JSON.stringify({ type, tier })
    });
  }

  async purchaseEnergyBank() {
    return this.request('/tap/energy-bank/purchase', { method: 'POST' });
  }

  async purchaseShield() {
    return this.request('/tap/shield/purchase', { method: 'POST' });
  }

  // Missions & Daily Challenge
  async getMissions() {
    return this.request('/tap/missions');
  }

  async claimMission(missionId) {
    return this.request(`/tap/missions/${missionId}/claim`, { method: 'POST' });
  }

  async getDailyChallenge() {
    return this.request('/tap/daily-challenge');
  }

  async claimDailyChallenge() {
    return this.request('/tap/daily-challenge/claim', { method: 'POST' });
  }

  // Lucky Tap
  async getLuckyStatus() {
    return this.request('/tap/lucky');
  }

  async spinWheel(requestId) {
    return this.request('/tap/lucky/spin', {
      method: 'POST',
      body: JSON.stringify({ requestId: requestId || generateRequestId() })
    });
  }

  // League & Season
  async getLeague() {
    return this.request('/tap/league');
  }

  async getSeason() {
    return this.request('/tap/season');
  }

  async rolloverSeason() {
    return this.request('/tap/season/rollover', { method: 'POST' });
  }

  // Ads
  async trackAdEvent(payload) {
    return this.request('/tap/ads/event', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async claimAdReward(benefitType) {
    return this.request('/tap/ads/claim-reward', {
      method: 'POST',
      body: JSON.stringify({ benefitType })
    });
  }

  // Admin
  async getAdminAnalytics() {
    return this.request('/admin/analytics');
  }

  async getAdminConfig() {
    return this.request('/admin/config');
  }

  async updateAdminConfig(path, value, reason) {
    return this.request('/admin/config', {
      method: 'PUT',
      body: JSON.stringify({ path, value, reason })
    });
  }

  async getAdminBotLogs() {
    return this.request('/admin/bot-logs');
  }

  async getAdminLedger(currency, type) {
    const params = new URLSearchParams();
    if (currency) params.append('currency', currency);
    if (type) params.append('type', type);
    return this.request(`/admin/ledger?${params.toString()}`);
  }

  // Auth / Switch
  async getDemoUsers() {
    return this.request('/auth/demo-users');
  }
}

export const tapApi = new TapApiClient();
export default tapApi;
