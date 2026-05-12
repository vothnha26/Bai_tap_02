require('dotenv').config();
const app = require('./app');
const prisma = require('./config/prisma');
const redisClient = require('./config/redis');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Optional: Test DB connection
    await prisma.$connect();
    console.log('Successfully connected to Database');

    // Redis connection is handled in config/redis.js (auto-connect)
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  process.exit(0);
});

startServer();
