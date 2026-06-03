const User = require('../models/User');
const { ERROR_MESSAGES } = require('../utils/constants');

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

  /**
   * Add a new address to user's address list
   */
  async addAddress(userId, addressData) {
    const user = await User.findById(userId);
    if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

    // If first address, it must be default
    const isFirst = !user.addresses || user.addresses.length === 0;
    const shouldBeDefault = isFirst || addressData.isDefault === true;

    if (shouldBeDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      ...addressData,
      isDefault: shouldBeDefault
    });

    await user.save();
    return user.addresses;
  }

  /**
   * Update an existing address
   */
  async updateAddress(userId, addressId, addressData) {
    const user = await User.findById(userId);
    if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

    const address = user.addresses.id(addressId);
    if (!address) throw new Error(ERROR_MESSAGES.ADDRESS_NOT_FOUND);

    const shouldBeDefault = addressData.isDefault === true;

    if (shouldBeDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== addressId.toString()) {
          addr.isDefault = false;
        }
      });
    }

    // Update fields (district/districtCode removed — VN admin reform 2025)
    const fields = ['street', 'province', 'provinceCode', 'ward', 'wardCode', 'fullText', 'phone', 'coordinates', 'isDefault'];
    fields.forEach(field => {
      if (addressData[field] !== undefined) {
        address.set(field, addressData[field]);
      }
    });

    address.isDefault = shouldBeDefault;

    await user.save();
    return user.addresses;
  }

  /**
   * Delete an address
   */
  async deleteAddress(userId, addressId) {
    const user = await User.findById(userId);
    if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

    const address = user.addresses.id(addressId);
    if (!address) throw new Error(ERROR_MESSAGES.ADDRESS_NOT_FOUND);

    const wasDefault = address.isDefault;
    user.addresses.pull(addressId);

    // If the deleted address was default, promote the first remaining one to default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return user.addresses;
  }

  /**
   * Set specific address as default
   */
  async setDefaultAddress(userId, addressId) {
    const user = await User.findById(userId);
    if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

    const address = user.addresses.id(addressId);
    if (!address) throw new Error(ERROR_MESSAGES.ADDRESS_NOT_FOUND);

    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === addressId.toString();
    });

    await user.save();
    return user.addresses;
  }
}

module.exports = new UserRepository();


