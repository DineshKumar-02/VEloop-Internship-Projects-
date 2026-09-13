const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/config', (req, res) => adminController.getConfig(req, res));
router.put('/config', (req, res) => adminController.updateConfig(req, res));
router.get('/analytics', (req, res) => adminController.getAnalytics(req, res));
router.get('/bot-logs', (req, res) => adminController.getBotLogs(req, res));
router.get('/ledger', (req, res) => adminController.getLedger(req, res));
router.get('/audits', (req, res) => adminController.getAudits(req, res));

module.exports = router;
