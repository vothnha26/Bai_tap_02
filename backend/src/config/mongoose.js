const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/publicast'}`);
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/publicast');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
