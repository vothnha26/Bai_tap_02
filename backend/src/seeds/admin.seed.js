const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');
const connectDB = require('../config/mongoose');

async function seedAdmin() {
  try {
    await connectDB();

    const adminEmail = 'admin@shopvn.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin account already exists.');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('admin123456', 10);

    const adminUser = new User({
      email: adminEmail,
      fullName: 'System Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
      verifiedAt: new Date(),
      accounts: [{
        provider: 'LOCAL',
        passwordHash: passwordHash
      }]
    });

    await adminUser.save();
    console.log('-----------------------------------------------');
    console.log('Admin account created successfully!');
    console.log('Email: admin@shopvn.com');
    console.log('Password: admin123456');
    console.log('-----------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
