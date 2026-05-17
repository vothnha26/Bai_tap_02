const User = require('../models/User');

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findById(id) {
    return await User.findById(id);
  }

  async createUser(userData, accountData) {
    const user = new User({
      ...userData,
      accounts: accountData
    });
    return await user.save();
  }

  async updateStatus(email, status, verifiedAt) {
    return await User.findOneAndUpdate(
      { email },
      { status, verifiedAt },
      { new: true }
    );
  }

  async updateLocalPassword(email, passwordHash) {
    return await User.findOneAndUpdate(
      { 
        email, 
        'accounts.provider': 'LOCAL' 
      },
      { 
        $set: { 'accounts.$.passwordHash': passwordHash } 
      },
      { new: true }
    );
  }

  /**
   * Get user with password hash for login
   */
  async findByEmailWithPassword(email) {
    const user = await User.findOne({ email });

    if (user && user.accounts && user.accounts.length > 0) {
      const localAccount = user.accounts.find(acc => acc.provider === 'LOCAL');
      const userObj = user.toJSON();
      return {
        ...userObj,
        passwordHash: localAccount?.passwordHash || null
      };
    }

    return user ? user.toJSON() : null;
  }

  /**
   * Update user profile (fullName, avatarUrl)
   */
  async updateProfile(userId, profileData) {
    return await User.findByIdAndUpdate(userId, profileData, { new: true });
  }
}

module.exports = new UserRepository();
