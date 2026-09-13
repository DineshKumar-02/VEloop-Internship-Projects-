const TapSeason = require('../models/TapSeason');
const TapLeagueScore = require('../models/TapLeagueScore');
const TapState = require('../models/TapState');
const leaderboardService = require('../services/leaderboardService');
const rewardLedgerService = require('../services/rewardLedgerService');
const tapEconomy = require('../config/tapEconomy');

class SeasonController {
  /**
   * GET /api/tap/season (PDF §29)
   */
  async getSeason(req, res) {
    try {
      let season = await TapSeason.findOne({ status: 'active' });
      if (!season) {
        // Create initial season if missing
        season = await TapSeason.create({
          seasonId: 'season-1',
          name: 'Season 1: Genesis Tap',
          status: 'active',
          startAt: new Date(),
          endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
      }

      const countdownSec = Math.max(0, Math.ceil((new Date(season.endAt).getTime() - Date.now()) / 1000));
      return res.json({
        success: true,
        season: {
          seasonId: season.seasonId,
          name: season.name,
          status: season.status,
          startAt: season.startAt,
          endAt: season.endAt,
          countdownSeconds: countdownSec,
          rewardTiers: tapEconomy.league.finalRewards
        }
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/tap/season/rollover (PDF §41.13)
   * Freeze scoring -> calculate ranks -> distribute rewards -> archive -> activate next season -> reset efficiency
   */
  async rolloverSeason(req, res) {
    try {
      const activeSeason = await TapSeason.findOne({ status: 'active' });
      if (!activeSeason) return res.status(400).json({ error: 'No active season to rollover' });

      // 1. Freeze active season
      activeSeason.status = 'frozen';
      await activeSeason.save();

      // 2. Fetch top 100 and distribute rewards
      const topScores = await TapLeagueScore.find({ seasonId: activeSeason.seasonId })
        .sort({ acceptedTapCount: -1, updatedAt: 1, _id: 1 })
        .limit(100);

      const distributed = [];
      for (let i = 0; i < topScores.length; i++) {
        const rank = i + 1;
        const entry = topScores[i];
        const rewardTier = leaderboardService.getRewardForRank(rank);

        if (rewardTier && rewardTier.rewards) {
          for (const [curr, amt] of Object.entries(rewardTier.rewards)) {
            await rewardLedgerService.recordTransaction({
              userId: entry.userId,
              source: 'season_reward',
              type: 'credit',
              amount: amt,
              currency: curr === 'spins' ? 'spins' : curr,
              referenceId: `${activeSeason.seasonId}_rank_${rank}`,
              notes: `Tap League Season Reward (Rank #${rank}): +${amt} ${curr}`
            });
          }
          distributed.push({ rank, userId: entry.userId, rewards: rewardTier.rewards });
        }
      }

      // 3. Reset seasonal Tap Efficiency for all players
      await TapState.updateMany({}, {
        $set: {
          efficiency: 1.0,
          efficiencyTier: 'x1.0',
          efficiencyExpiresAt: null,
          seasonEffectiveTaps: 0
        }
      });

      // 4. Archive old season
      activeSeason.status = 'archived';
      await activeSeason.save();

      // 5. Create and activate next season
      const nextNum = parseInt(activeSeason.seasonId.replace('season-', '')) + 1 || 2;
      const newSeasonId = `season-${nextNum}`;
      const newSeason = await TapSeason.create({
        seasonId: newSeasonId,
        name: `Season ${nextNum}: Velocity Surge`,
        status: 'active',
        startAt: new Date(),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      return res.json({
        success: true,
        archivedSeason: activeSeason.seasonId,
        newSeason: newSeason.seasonId,
        distributedWinnersCount: distributed.length
      });
    } catch (error) {
      console.error('[Season Rollover Error]:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SeasonController();
