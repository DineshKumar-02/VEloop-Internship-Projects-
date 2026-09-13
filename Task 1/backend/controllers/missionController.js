const Mission = require('../models/Mission');
const UserMission = require('../models/UserMission');
const DailyChallenge = require('../models/DailyChallenge');
const UserDailyChallenge = require('../models/UserDailyChallenge');
const TapState = require('../models/TapState');
const User = require('../models/User');
const rewardLedgerService = require('../services/rewardLedgerService');

class MissionController {
  /**
   * GET /api/tap/missions (PDF §29)
   */
  async getMissions(req, res) {
    try {
      const userId = req.user._id;
      const tapState = await TapState.findOne({ userId });
      const missions = await Mission.find().lean();
      const userMissions = await UserMission.find({ userId }).lean();

      const userMissionMap = new Map();
      userMissions.forEach(um => userMissionMap.set(um.missionId, um));

      const result = missions.map(mission => {
        const um = userMissionMap.get(mission.missionId);
        let progress = 0;
        let completed = false;
        let claimed = false;

        if (um) {
          progress = um.progress;
          completed = um.completed;
          claimed = !!um.claimedAt;
        } else {
          // Dynamic calculation based on current tapState
          if (mission.category === 'taps') {
            progress = tapState?.totalPhysicalTaps || 0;
          } else if (mission.category === 'combo') {
            progress = tapState?.combo || 0;
          } else if (mission.category === 'streak') {
            progress = tapState?.streak || 0;
          }
          completed = progress >= mission.target;
        }

        return {
          missionId: mission.missionId,
          type: mission.type,
          category: mission.category,
          title: mission.title,
          description: mission.description,
          target: mission.target,
          reward: mission.reward,
          rewardType: mission.rewardType,
          progress: Math.min(progress, mission.target),
          completed: progress >= mission.target,
          claimed
        };
      });

      return res.json({ success: true, missions: result });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/tap/missions/:id/claim (PDF §29)
   */
  async claimMission(req, res) {
    try {
      const userId = req.user._id;
      const missionId = req.params.id;

      const mission = await Mission.findOne({ missionId });
      if (!mission) return res.status(404).json({ error: 'Mission not found' });

      let userMission = await UserMission.findOne({ userId, missionId });
      const tapState = await TapState.findOne({ userId });

      let currentProgress = userMission ? userMission.progress : 0;
      if (mission.category === 'taps') {
        currentProgress = tapState?.totalPhysicalTaps || 0;
      }

      if (currentProgress < mission.target) {
        return res.status(400).json({ error: 'Mission target not yet reached' });
      }

      if (userMission && userMission.claimedAt) {
        return res.status(400).json({ error: 'Mission reward already claimed' });
      }

      // Record claim
      if (!userMission) {
        userMission = new UserMission({
          userId,
          missionId,
          progress: currentProgress,
          completed: true,
          claimedAt: new Date()
        });
      } else {
        userMission.completed = true;
        userMission.claimedAt = new Date();
      }
      await userMission.save();

      // Credit reward via Ledger
      const { newBalances } = await rewardLedgerService.recordTransaction({
        userId,
        source: 'mission_claim',
        type: 'credit',
        amount: mission.reward,
        currency: mission.rewardType,
        referenceId: missionId,
        notes: `Claimed Mission: ${mission.title}`
      });

      return res.json({
        success: true,
        message: `Claimed +${mission.reward} ${mission.rewardType.toUpperCase()}!`,
        balances: newBalances,
        claimedMissionId: missionId
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/tap/daily-challenge (PDF §16 & §29)
   */
  async getDailyChallenge(req, res) {
    try {
      const userId = req.user._id;
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      let challenge = await DailyChallenge.findOne({ dateKey: today });
      if (!challenge) {
        challenge = await DailyChallenge.create({
          dateKey: today,
          title: 'Daily Tap Blitz',
          description: 'Reach 250 accepted taps today',
          targetTaps: 250,
          rewardTokens: 200,
          rewardSVE: 10
        });
      }

      const tapState = await TapState.findOne({ userId });
      let userDaily = await UserDailyChallenge.findOne({ userId, dateKey: today });

      const tapsToday = userDaily ? userDaily.tapsProgress : Math.min(tapState?.totalPhysicalTaps || 0, challenge.targetTaps);
      const completed = tapsToday >= challenge.targetTaps;
      const claimed = !!userDaily?.claimedAt;

      return res.json({
        success: true,
        challenge: {
          dateKey: today,
          title: challenge.title,
          description: challenge.description,
          targetTaps: challenge.targetTaps,
          rewardTokens: challenge.rewardTokens,
          rewardSVE: challenge.rewardSVE,
          progress: tapsToday,
          completed,
          claimed
        }
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/tap/daily-challenge/claim (PDF §16 & §29)
   */
  async claimDailyChallenge(req, res) {
    try {
      const userId = req.user._id;
      const today = new Date().toISOString().split('T')[0];

      const challenge = await DailyChallenge.findOne({ dateKey: today });
      if (!challenge) return res.status(404).json({ error: 'No active challenge today' });

      let userDaily = await UserDailyChallenge.findOne({ userId, dateKey: today });
      const tapState = await TapState.findOne({ userId });

      const taps = userDaily ? userDaily.tapsProgress : (tapState?.totalPhysicalTaps || 0);
      if (taps < challenge.targetTaps) {
        return res.status(400).json({ error: 'Daily challenge target not reached' });
      }

      if (userDaily && userDaily.claimedAt) {
        return res.status(400).json({ error: 'Daily challenge already claimed today' });
      }

      if (!userDaily) {
        userDaily = new UserDailyChallenge({
          userId,
          dateKey: today,
          tapsProgress: taps,
          completed: true,
          claimedAt: new Date()
        });
      } else {
        userDaily.completed = true;
        userDaily.claimedAt = new Date();
      }
      await userDaily.save();

      // Credit tokens & SVE rewards
      await rewardLedgerService.recordTransaction({
        userId,
        source: 'daily_challenge',
        type: 'credit',
        amount: challenge.rewardTokens,
        currency: 'tokens',
        referenceId: today,
        notes: 'Daily Challenge: Tokens Reward'
      });

      const { newBalances } = await rewardLedgerService.recordTransaction({
        userId,
        source: 'daily_challenge',
        type: 'credit',
        amount: challenge.rewardSVE,
        currency: 'sve',
        referenceId: today,
        notes: 'Daily Challenge: SVE Reward'
      });

      return res.json({
        success: true,
        message: `Claimed Daily Challenge Rewards: +${challenge.rewardTokens} Tokens & +${challenge.rewardSVE} SVE!`,
        balances: newBalances
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MissionController();
