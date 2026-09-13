const TapLeagueScore = require('../models/TapLeagueScore');
const TapSeason = require('../models/TapSeason');
const User = require('../models/User');
const tapEconomy = require('../config/tapEconomy');

class LeaderboardService {
  /**
   * Retrieves Top 100 players for active season + user's sticky rank
   */
  async getLeagueData(seasonId, currentUserId) {
    // 1. Fetch Top 100 sorted by score desc, updatedAt asc, _id asc (Tie-breaker per §41.13)
    const topScores = await TapLeagueScore.find({ seasonId })
      .sort({ acceptedTapCount: -1, updatedAt: 1, _id: 1 })
      .limit(tapEconomy.league.topDisplayed) // 100
      .populate('userId', 'username displayName avatar level')
      .lean();

    // Map top 100 with ranks and rewards
    const top100 = topScores.map((entry, index) => {
      const rank = index + 1;
      const rewardTier = this.getRewardForRank(rank);
      return {
        rank,
        scoreId: entry._id,
        userId: entry.userId?._id,
        username: entry.userId?.displayName || entry.userId?.username || 'Unknown Tapper',
        avatar: entry.userId?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=veloop',
        level: entry.userId?.level || 1,
        acceptedTapCount: entry.acceptedTapCount,
        updatedAt: entry.updatedAt,
        isTopThree: rank <= 3,
        rewardPreview: rewardTier ? rewardTier.rewardText : null
      };
    });

    // 2. Determine current user's rank
    let myRankData = null;
    if (currentUserId) {
      const userScore = await TapLeagueScore.findOne({ seasonId, userId: currentUserId }).lean();
      const currentUser = await User.findById(currentUserId).lean();

      if (userScore) {
        // Count how many players have strictly higher score OR (equal score but earlier updatedAt)
        const aheadCount = await TapLeagueScore.countDocuments({
          seasonId,
          $or: [
            { acceptedTapCount: { $gt: userScore.acceptedTapCount } },
            { 
              acceptedTapCount: userScore.acceptedTapCount, 
              updatedAt: { $lt: userScore.updatedAt } 
            }
          ]
        });

        const currentRank = aheadCount + 1;
        const rewardTier = this.getRewardForRank(currentRank);
        myRankData = {
          rank: currentRank,
          userId: currentUserId,
          username: currentUser?.displayName || currentUser?.username || 'You',
          avatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=me',
          level: currentUser?.level || 1,
          acceptedTapCount: userScore.acceptedTapCount,
          inTop100: currentRank <= 100,
          rewardPreview: rewardTier ? rewardTier.rewardText : 'Keep tapping to enter rewards tier!'
        };
      } else {
        // Not yet recorded
        myRankData = {
          rank: 'Unranked',
          userId: currentUserId,
          username: currentUser?.displayName || currentUser?.username || 'You',
          avatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=me',
          level: currentUser?.level || 1,
          acceptedTapCount: 0,
          inTop100: false,
          rewardPreview: 'Tap to join the season leaderboard!'
        };
      }
    }

    // 3. Fetch Season info
    const season = await TapSeason.findOne({ seasonId }).lean();

    return {
      season: {
        seasonId,
        name: season?.name || 'Season 1: Genesis Tap',
        status: season?.status || 'active',
        startAt: season?.startAt,
        endAt: season?.endAt,
        timeRemainingSeconds: season ? Math.max(0, Math.ceil((new Date(season.endAt).getTime() - Date.now()) / 1000)) : 0
      },
      top100,
      myRank: myRankData,
      rewardTiers: tapEconomy.league.finalRewards
    };
  }

  /**
   * Helper to map rank to season reward
   */
  getRewardForRank(rank) {
    if (!rank || rank > 100) return null;
    const tiers = tapEconomy.league.finalRewards;
    for (const tier of tiers) {
      if (rank >= tier.rankRange[0] && rank <= tier.rankRange[1]) {
        return tier;
      }
    }
    return null;
  }

  /**
   * Atomically records tap score for season
   */
  async recordTaps(seasonId, userId, effectiveCount) {
    return await TapLeagueScore.findOneAndUpdate(
      { seasonId, userId },
      { 
        $inc: { acceptedTapCount: effectiveCount },
        $set: { updatedAt: new Date() }
      },
      { upsert: true, new: true }
    );
  }
}

module.exports = new LeaderboardService();
