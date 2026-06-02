const userService = require('../services/user/user.service');

class UserController {
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const profile = await userService.getProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json({ message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updatedProfile = await userService.updateProfile(userId, req.body);
      res.status(200).json({
        message: 'Cập nhật thông tin thành công',
        user: updatedProfile
      });
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json({ message: error.message });
    }
  }
}

module.exports = new UserController();
