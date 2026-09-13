const User = require('../models/User');
const TapState = require('../models/TapState');

class AuthController {
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user._id);
      return res.json({ success: true, user });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async listDemoUsers(req, res) {
    try {
      const users = await User.find().limit(10).lean();
      return res.json({ success: true, users });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async switchUser(req, res) {
    try {
      const { userId } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ success: true, user });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
