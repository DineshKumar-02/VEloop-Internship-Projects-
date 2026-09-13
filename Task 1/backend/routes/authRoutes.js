const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, (req, res) => authController.getMe(req, res));
router.get('/demo-users', (req, res) => authController.listDemoUsers(req, res));
router.post('/switch-user', (req, res) => authController.switchUser(req, res));

module.exports = router;
