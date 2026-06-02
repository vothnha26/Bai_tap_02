const userRepository = require('../../repositories/user.repository');

class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    // Remove accounts info for security
    const userProfile = user.toJSON();
    delete userProfile.accounts;
    return userProfile;
  }

  async updateProfile(userId, updateData) {
    const allowedFields = ['fullName', 'avatarUrl', 'phone', 'address'];
    const filteredData = {};
    
    // Only allow specific fields to be updated
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      const error = new Error('No valid fields provided for update');
      error.status = 400;
      throw error;
    }

    const updatedUser = await userRepository.updateProfile(userId, filteredData);
    if (!updatedUser) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const userProfile = updatedUser.toJSON();
    delete userProfile.accounts;
    return userProfile;
  }
}

module.exports = new UserService();
