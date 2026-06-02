const mongoose = require('mongoose');
const User = require('../models/User');
const userRepository = require('../repositories/user.repository');

describe('User Address Repository', () => {
  let userId;
  const testEmail = 'address_test@example.com';

  beforeAll(async () => {
    const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/shop_auth_test?authSource=admin';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }
    
    // Clear user if exists
    await User.deleteOne({ email: testEmail });
    
    const user = new User({
      fullName: 'Address Test User',
      email: testEmail,
      status: 'ACTIVE',
      accounts: [{ provider: 'LOCAL', passwordHash: 'hash' }]
    });
    const savedUser = await user.save();
    userId = savedUser._id;
  });

  afterAll(async () => {
    await User.deleteOne({ email: testEmail });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear addresses before each test
    await User.findByIdAndUpdate(userId, { $set: { addresses: [] } });
  });

  it('should add a new address and set default if it is the first address', async () => {
    const addressData = {
      street: '123 Đường ABC',
      province: 'Hồ Chí Minh',
      provinceCode: '79',
      ward: 'Phường 1',
      wardCode: '26734',
      fullText: '123 Đường ABC, Phường 1, Quận 1, Hồ Chí Minh',
      isDefault: false // should be overridden to true since it's the first one
    };

    const addresses = await userRepository.addAddress(userId, addressData);
    expect(addresses.length).toBe(1);
    expect(addresses[0].street).toBe(addressData.street);
    expect(addresses[0].isDefault).toBe(true);
  });

  it('should add a new address and reset others if isDefault is true', async () => {
    // Add first address (will be default)
    await userRepository.addAddress(userId, {
      street: 'Address 1',
      province: 'Hồ Chí Minh',
      provinceCode: '79',
      ward: 'Phường 1',
      wardCode: '26734',
      fullText: 'Address 1, Hồ Chí Minh',
      isDefault: true
    });

    // Add second address with isDefault = true
    const addresses = await userRepository.addAddress(userId, {
      street: 'Address 2',
      province: 'Hồ Chí Minh',
      provinceCode: '79',
      ward: 'Phường 2',
      wardCode: '26735',
      fullText: 'Address 2, Hồ Chí Minh',
      isDefault: true
    });

    expect(addresses.length).toBe(2);
    const addr1 = addresses.find(a => a.street === 'Address 1');
    const addr2 = addresses.find(a => a.street === 'Address 2');
    
    expect(addr1.isDefault).toBe(false);
    expect(addr2.isDefault).toBe(true);
  });

  it('should update address details successfully', async () => {
    const addresses = await userRepository.addAddress(userId, {
      street: 'Address to update',
      province: 'Hồ Chí Minh',
      provinceCode: '79',
      ward: 'Phường 1',
      wardCode: '26734',
      fullText: 'Address to update, Hồ Chí Minh',
      isDefault: true
    });

    const addressId = addresses[0]._id;

    const updatedAddresses = await userRepository.updateAddress(userId, addressId, {
      street: 'Updated Address Street',
      province: 'Hồ Chí Minh',
      provinceCode: '79',
      ward: 'Phường 1',
      wardCode: '26734',
      fullText: 'Updated Address Street, Hồ Chí Minh',
      isDefault: true
    });

    expect(updatedAddresses[0].street).toBe('Updated Address Street');
  });

  it('should set an address as default and reset others', async () => {
    const addr1List = await userRepository.addAddress(userId, {
      street: 'Address 1',
      province: 'Hồ Chí Minh',
      provinceCode: '79',
      ward: 'Phường 1',
      wardCode: '26734',
      fullText: 'Address 1, Hồ Chí Minh',
      isDefault: true
    });
    
    const addr2List = await userRepository.addAddress(userId, {
      street: 'Address 2',
      province: 'Hồ Chí Minh',
      provinceCode: '79',
      ward: 'Phường 2',
      wardCode: '26735',
      fullText: 'Address 2, Hồ Chí Minh',
      isDefault: false
    });

    const addr2Id = addr2List.find(a => a.street === 'Address 2')._id;

    const updated = await userRepository.setDefaultAddress(userId, addr2Id);
    const addr1 = updated.find(a => a.street === 'Address 1');
    const addr2 = updated.find(a => a.street === 'Address 2');

    expect(addr1.isDefault).toBe(false);
    expect(addr2.isDefault).toBe(true);
  });

  it('should delete address and make the remaining first address default if the deleted one was default', async () => {
    const list1 = await userRepository.addAddress(userId, {
      street: 'Address 1',
      province: 'Hồ Chí Minh',
      provinceCode: '79',
      ward: 'Phường 1',
      wardCode: '26734',
      fullText: 'Address 1, Hồ Chí Minh',
      isDefault: true
    });
    
    const list2 = await userRepository.addAddress(userId, {
      street: 'Address 2',
      province: 'Hồ Chí Minh',
      provinceCode: '79',
      ward: 'Phường 2',
      wardCode: '26735',
      fullText: 'Address 2, Hồ Chí Minh',
      isDefault: false
    });

    const addr1Id = list2.find(a => a.street === 'Address 1')._id;

    const updated = await userRepository.deleteAddress(userId, addr1Id);
    expect(updated.length).toBe(1);
    expect(updated[0].street).toBe('Address 2');
    expect(updated[0].isDefault).toBe(true); // Promoted to default
  });
});
