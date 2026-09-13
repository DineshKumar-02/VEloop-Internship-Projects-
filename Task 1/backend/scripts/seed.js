const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const TapState = require('../models/TapState');
const TapSeason = require('../models/TapSeason');
const TapLeagueScore = require('../models/TapLeagueScore');
const Mission = require('../models/Mission');
const DailyChallenge = require('../models/DailyChallenge');
const tapEconomy = require('../config/tapEconomy');

async function seed() {
  try {
    await connectDB();
    console.log('[Seeding]: Clearing previous seed data...');

    await User.deleteMany({});
    await TapState.deleteMany({});
    await TapSeason.deleteMany({});
    await TapLeagueScore.deleteMany({});
    await Mission.deleteMany({});
    await DailyChallenge.deleteMany({});

    console.log('[Seeding]: Creating Season 1: Genesis Tap...');
    const season = await TapSeason.create({
      seasonId: 'season-1',
      name: 'Season 1: Genesis Tap',
      status: 'active',
      startAt: new Date(),
      endAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days remaining
      rewardRules: tapEconomy.league.finalRewards
    });

    console.log('[Seeding]: Creating Primary Demo User...');
    const demoUser = await User.create({
      username: 'veloop_pro_tapper',
      displayName: 'Alex Rivers (Pro Tapper)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexRivers',
      level: 12,
      experience: 1450,
      role: 'admin',
      balances: {
        ve: 350.0,
        sve: 1850.0,
        tokens: 4600,
        gems: 12.0,
        spins: 5,
        fragments: 85
      },
      currentTapSeasonId: season.seasonId
    });

    await TapState.create({
      userId: demoUser._id,
      energy: 480,
      maxEnergy: 500,
      rechargeRate: 20,
      lastEnergyAt: new Date(),
      tapMultiplier: 1,
      multiplierTier: 'x1.0',
      efficiency: 1.0,
      efficiencyTier: 'x1.0',
      streak: 8,
      combo: 14,
      totalPhysicalTaps: 2350,
      totalEffectiveTaps: 2350,
      seasonEffectiveTaps: 2350,
      luckyWindowTaps: 185 // 185/300 toward Lucky Spin
    });

    await TapLeagueScore.create({
      seasonId: season.seasonId,
      userId: demoUser._id,
      acceptedTapCount: 2350,
      updatedAt: new Date(Date.now() - 3600000)
    });

    console.log('[Seeding]: Creating Top 100 Competitive Leaderboard Users...');
    const mockNames = [
      'CryptoKing99', 'AuraTapper', 'VeloopMaster', 'NexusPrime', 'CyberStrike',
      'QuantumTap', 'PulseRider', 'GoldStriker', 'ShadowByte', 'ZenithTap',
      'SolarFlare', 'LunarEcho', 'ViperClick', 'TitanForge', 'NovaSpark',
      'HyperSpeed', 'ApexPredator', 'IronPulse', 'ElectraVolt', 'CosmicRift',
      'AlphaTapper', 'BetaBlaster', 'GammaGamer', 'DeltaDiver', 'EpsilonEdge',
      'ZetaZero', 'EtaEnergy', 'ThetaThrust', 'IotaImpact', 'KappaKnight',
      'LambdaLoop', 'MuMatrix', 'NuNebula', 'XiXenon', 'OmicronOrb',
      'PiPhoton', 'RhoRocket', 'SigmaStrike', 'TauTitan', 'UpsilonUltra',
      'PhiPhantom', 'ChiChronos', 'PsiPulse', 'OmegaOverdrive', 'BlazeRunner',
      'StormBreaker', 'FrostByte', 'ThunderClap', 'NeonRider', 'PixelHunter'
    ];

    const usersToCreate = [];
    let tapCount = 48500;

    for (let i = 0; i < 102; i++) {
      const name = i < mockNames.length ? mockNames[i] : `Tapper_${1000 + i}`;
      // Decreasing tap counts for realistic distribution
      tapCount = Math.max(150, Math.floor(tapCount * 0.96) - Math.floor(Math.random() * 80));

      const u = new User({
        username: name.toLowerCase().replace(/\s+/g, '_'),
        displayName: name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        level: Math.max(1, Math.floor(tapCount / 1500) + 1),
        balances: {
          ve: Math.floor(Math.random() * 500) + 50,
          sve: Math.floor(Math.random() * 2000) + 100,
          tokens: Math.floor(Math.random() * 8000) + 500,
          gems: Math.floor(Math.random() * 25),
          spins: Math.floor(Math.random() * 6),
          fragments: Math.floor(Math.random() * 100)
        },
        currentTapSeasonId: season.seasonId
      });
      usersToCreate.push({ user: u, taps: tapCount });
    }

    for (let i = 0; i < usersToCreate.length; i++) {
      const item = usersToCreate[i];
      await item.user.save();
      await TapLeagueScore.create({
        seasonId: season.seasonId,
        userId: item.user._id,
        acceptedTapCount: item.taps,
        updatedAt: new Date(Date.now() - (102 - i) * 120000) // staggered for tie-breaker testing
      });
    }

    console.log('[Seeding]: Creating Tap Missions (Daily & Seasonal)...');
    const missions = [
      {
        missionId: 'mission_century',
        type: 'daily',
        category: 'taps',
        title: 'Century Tapper',
        description: 'Hit 100 accepted taps in the arena',
        target: 100,
        reward: 150,
        rewardType: 'tokens'
      },
      {
        missionId: 'mission_half_k',
        type: 'daily',
        category: 'taps',
        title: '500 Tap Marathon',
        description: 'Complete 500 accepted taps today',
        target: 500,
        reward: 600,
        rewardType: 'tokens'
      },
      {
        missionId: 'mission_combo_master',
        type: 'daily',
        category: 'combo',
        title: 'Rhythm Master',
        description: 'Build an unbroken COMBO of x25 taps',
        target: 25,
        reward: 250,
        rewardType: 'tokens'
      },
      {
        missionId: 'mission_boost_activator',
        type: 'seasonal',
        category: 'boost',
        title: 'Velocity Surge',
        description: 'Activate the 30-second Boost window',
        target: 1,
        reward: 15,
        rewardType: 'sve'
      },
      {
        missionId: 'mission_precision_sniper',
        type: 'seasonal',
        category: 'precision',
        title: 'Precision Sniper',
        description: 'Accurately tap a floating precision target',
        target: 1,
        reward: 100,
        rewardType: 'tokens'
      }
    ];
    await Mission.insertMany(missions);

    console.log('[Seeding]: Creating Today Daily Challenge...');
    const today = new Date().toISOString().split('T')[0];
    await DailyChallenge.create({
      dateKey: today,
      title: 'Daily Tap Blitz',
      description: 'Reach 250 accepted taps today for instant token & SVE rewards',
      targetTaps: 250,
      rewardTokens: 200,
      rewardSVE: 10
    });

    console.log('✅ [Seed Completed Successfully]: Database populated with Season, Top 100 Leaderboard, Missions, Challenge, and Demo User.');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed Error]:', error);
    process.exit(1);
  }
}

seed();
