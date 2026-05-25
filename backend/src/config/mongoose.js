const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const defaultUri = 'mongodb://root:root_password@127.0.0.1:27017/baitap04_mongodb?authSource=admin';
    const mongoUri = process.env.MONGODB_URI || defaultUri;
    
    console.log(`Connecting to MongoDB...`);
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
