const userRepository = require('../repositories/user.repository');
const { ERROR_MESSAGES } = require('../utils/constants');

class UserAddressController {
  /**
   * Get all addresses of current user
   */
  async getAddresses(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
      }

      res.status(200).json({ addresses: user.addresses || [] });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a new address
   */
  async addAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const { street, province, provinceCode, ward, wardCode, fullText, isDefault, coordinates, phone } = req.body;

      if (!street || !province || !provinceCode || !ward || !wardCode || !fullText) {
        return res.status(400).json({ message: ERROR_MESSAGES.INVALID_ADDRESS_DATA });
      }

      const addresses = await userRepository.addAddress(userId, {
        street,
        province,
        provinceCode,
        ward,
        wardCode,
        fullText,
        isDefault,
        coordinates,
        phone
      });

      res.status(201).json({ addresses });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an address
   */
  async updateAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;
      const { street, province, provinceCode, ward, wardCode, fullText, isDefault, coordinates, phone } = req.body;

      if (!street || !province || !provinceCode || !ward || !wardCode || !fullText) {
        return res.status(400).json({ message: ERROR_MESSAGES.INVALID_ADDRESS_DATA });
      }

      const addresses = await userRepository.updateAddress(userId, addressId, {
        street,
        province,
        provinceCode,
        ward,
        wardCode,
        fullText,
        isDefault,
        coordinates,
        phone
      });

      res.status(200).json({ addresses });
    } catch (error) {
      if (error.message === ERROR_MESSAGES.ADDRESS_NOT_FOUND) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Delete an address
   */
  async deleteAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;

      const addresses = await userRepository.deleteAddress(userId, addressId);
      res.status(200).json({ addresses });
    } catch (error) {
      if (error.message === ERROR_MESSAGES.ADDRESS_NOT_FOUND) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;

      const addresses = await userRepository.setDefaultAddress(userId, addressId);
      res.status(200).json({ addresses });
    } catch (error) {
      if (error.message === ERROR_MESSAGES.ADDRESS_NOT_FOUND) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new UserAddressController();
