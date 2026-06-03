const OrderHandler = require('./OrderHandler');
const userRepository = require('../../../repositories/user.repository');

class AddressResolutionHandler extends OrderHandler {
  async handle(context) {
    const { userId, orderInfo } = context;
    const { addressId, newAddress } = orderInfo;

    let resolvedAddress = null;
    let resolvedPhone = null;

    if (addressId) {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      const address = user.addresses.id(addressId);
      if (!address) {
        throw new Error('Địa chỉ không tồn tại');
      }

      resolvedAddress = {
        province: address.province,
        district: address.district || '',
        ward: address.ward,
        street: address.street,
        coordinates: address.coordinates || { lat: 0, lng: 0 }
      };
      resolvedPhone = address.phone;
    } else if (newAddress) {
      resolvedAddress = {
        province: newAddress.province,
        district: newAddress.district || '',
        ward: newAddress.ward,
        street: newAddress.street,
        coordinates: newAddress.coordinates || { lat: 0, lng: 0 }
      };
      resolvedPhone = newAddress.phone;
    } else {
      // Fallback for old clients/tests
      resolvedAddress = orderInfo.shippingAddress;
      resolvedPhone = orderInfo.phone;
    }

    if (!resolvedAddress) {
      throw new Error('Vui lòng cung cấp địa chỉ giao hàng');
    }
    if (!resolvedPhone) {
      throw new Error('Vui lòng cung cấp số điện thoại nhận hàng');
    }

    // Attach to context for subsequent handlers
    context.shippingAddress = resolvedAddress;
    context.phone = resolvedPhone;

    return await super.handle(context);
  }
}

module.exports = AddressResolutionHandler;
