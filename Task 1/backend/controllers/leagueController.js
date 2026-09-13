const leaderboardService = require('../services/leaderboardService');
const User = require('../models/User');

class LeagueController {
  /**
   * GET /api/tap/league (PDF §22, §23 & §29)
   */
  async getLeaderboard(req, res) {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
      const seasonId = user?.currentTapSeasonId || 'season-1';

      const leagueData = await leaderboardService.getLeagueData(seasonId, userId);
      return res.json({ success: true, ...leagueData });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new LeagueController();
