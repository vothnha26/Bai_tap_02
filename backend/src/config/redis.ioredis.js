let connection;
const logger = require('../utils/logger');

if (process.env.USE_MEMORY_REDIS === 'true') {
  connection = {
    flushdb: async () => 'OK',
    quit: async () => {},
    disconnect: async () => {},
    on: () => {},
  };
} else {
  const IORedis = require('ioredis');
  connection = new IORedis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null, // Required for BullMQ
  });

  connection.on('error', (err) => {
    logger.error('BullMQ Redis Connection Error:', err);
  });
}

module.exports = connection;
