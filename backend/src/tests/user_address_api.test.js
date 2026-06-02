// Mock auth middleware before importing app
const mockAuth = (req, res, next) => {
  req.user = { id: mockUserId };
  next();
};

jest.mock('../middlewares/auth.middleware', () => ({
  verifyAuth: mockAuth
}));

const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const User = require('../models/User');
const { ERROR_MESSAGES } = require('../utils/constants');

// Create an express app for testing routes
const app = express();
app.use(express.json());

// Set mockUserId
let mockUserId;
const testEmail = 'address_api_test@example.com';

// Add user routes
const userRoutes = require('../routes/user.routes');
app.use('/api/users', userRoutes);

// Error handler middleware to mock standard app error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});

describe('User Address API Endpoints', () => {
  beforeAll(async () => {
    const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/shop_auth_test?authSource=admin';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }
    
    // Clear user if exists
    await User.deleteOne({ email: testEmail });
    
    const user = new User({
      fullName: 'Address API User',
      email: testEmail,
      status: 'ACTIVE',
      accounts: [{ provider: 'LOCAL', passwordHash: 'hash' }]
    });
    const savedUser = await user.save();
    mockUserId = savedUser._id.toString();
  });

  afterAll(async () => {
    await User.deleteOne({ email: testEmail });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear addresses
    await User.findByIdAndUpdate(mockUserId, { $set: { addresses: [] } });
  });

  const testAddress = {
    street: '456 Đường XYZ',
    province: 'Hà Nội',
    provinceCode: '01',
    ward: 'Phường Tràng Tiền',
    wardCode: '00001',
    fullText: '456 Đường XYZ, Phường Tràng Tiền, Hoàn Kiếm, Hà Nội',
    isDefault: true
  };

  it('POST /api/users/addresses -> should create an address', async () => {
    const res = await request(app)
      .post('/api/users/addresses')
      .send(testAddress);

    expect(res.statusCode).toBe(201);
    expect(res.body.addresses).toBeDefined();
    expect(res.body.addresses.length).toBe(1);
    expect(res.body.addresses[0].street).toBe(testAddress.street);
  });

  it('GET /api/users/addresses -> should return all addresses', async () => {
    // Add an address first
    await request(app)
      .post('/api/users/addresses')
      .send(testAddress);

    const res = await request(app)
      .get('/api/users/addresses');

    expect(res.statusCode).toBe(200);
    expect(res.body.addresses.length).toBe(1);
    expect(res.body.addresses[0].street).toBe(testAddress.street);
  });

  it('PUT /api/users/addresses/:addressId -> should update the address', async () => {
    const postRes = await request(app)
      .post('/api/users/addresses')
      .send(testAddress);

    const addressId = postRes.body.addresses[0]._id;

    const res = await request(app)
      .put(`/api/users/addresses/${addressId}`)
      .send({
        ...testAddress,
        street: '789 Đường Updated'
      });

    expect(res.statusCode).toBe(200);
    const updated = res.body.addresses.find(a => a._id === addressId);
    expect(updated.street).toBe('789 Đường Updated');
  });

  it('PATCH /api/users/addresses/:addressId/default -> should set default', async () => {
    // Add 1st
    const res1 = await request(app).post('/api/users/addresses').send(testAddress);
    // Add 2nd
    const res2 = await request(app).post('/api/users/addresses').send({
      ...testAddress,
      street: 'Address 2',
      isDefault: false
    });

    const addr2Id = res2.body.addresses.find(a => a.street === 'Address 2')._id;

    const res = await request(app)
      .patch(`/api/users/addresses/${addr2Id}/default`);

    expect(res.statusCode).toBe(200);
    const addr2 = res.body.addresses.find(a => a.street === 'Address 2');
    expect(addr2.isDefault).toBe(true);
  });

  it('DELETE /api/users/addresses/:addressId -> should delete address', async () => {
    const postRes = await request(app)
      .post('/api/users/addresses')
      .send(testAddress);

    const addressId = postRes.body.addresses[0]._id;

    const res = await request(app)
      .delete(`/api/users/addresses/${addressId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.addresses.length).toBe(0);
  });
});
