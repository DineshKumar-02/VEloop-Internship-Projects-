const express = require('express');
const router = express.Router();

const tapController = require('../controllers/tapController');
const upgradeController = require('../controllers/upgradeController');
const missionController = require('../controllers/missionController');
const luckyController = require('../controllers/luckyController');
const leagueController = require('../controllers/leagueController');
const seasonController = require('../controllers/seasonController');
const adController = require('../controllers/adController');
const authMiddleware = require('../middleware/auth');

// All tap routes require auth
router.use(authMiddleware);

// Core Tap Interactions (PDF §29)
router.get('/state', (req, res) => tapController.getState(req, res));
router.post('/', (req, res) => tapController.processTap(req, res));
router.get('/history', (req, res) => tapController.getHistory(req, res));
router.post('/boost/activate', (req, res) => tapController.activateBoost(req, res));

// Upgrades & Boosters
router.post('/upgrade', (req, res) => upgradeController.purchaseUpgrade(req, res));
router.post('/energy-bank/purchase', (req, res) => upgradeController.purchaseEnergyBank(req, res));
router.post('/shield/purchase', (req, res) => upgradeController.purchaseShield(req, res));

// Missions & Challenges
router.get('/missions', (req, res) => missionController.getMissions(req, res));
router.post('/missions/:id/claim', (req, res) => missionController.claimMission(req, res));
router.get('/daily-challenge', (req, res) => missionController.getDailyChallenge(req, res));
router.post('/daily-challenge/claim', (req, res) => missionController.claimDailyChallenge(req, res));

// Lucky Tap & Wheel
router.get('/lucky', (req, res) => luckyController.getStatus(req, res));
router.post('/lucky/spin', (req, res) => luckyController.executeSpin(req, res));

// Leaderboard & Seasons
router.get('/league', (req, res) => leagueController.getLeaderboard(req, res));
router.get('/season', (req, res) => seasonController.getSeason(req, res));
router.post('/season/rollover', (req, res) => seasonController.rolloverSeason(req, res));

// Ads System
router.get('/ads/config', (req, res) => adController.getConfig(req, res));
router.post('/ads/event', (req, res) => adController.trackEvent(req, res));
router.post('/ads/claim-reward', (req, res) => adController.claimReward(req, res));

module.exports = router;
