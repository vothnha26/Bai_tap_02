require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/mongoose');
const redisClient = require('./config/redis');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Run data migration for product discounts
    const migrateDiscounts = require('./scripts/migrateDiscounts');
    await migrateDiscounts();
    
    // Run data migration for inventory
    const migrateInventory = require('./scripts/migrateInventory');
    await migrateInventory();
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};


// Handle graceful shutdown
process.on('SIGINT', async () => {
  const mongoose = require('mongoose');
  await mongoose.connection.close();
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  process.exit(0);
});

startServer();
