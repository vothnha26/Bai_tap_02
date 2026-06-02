const connection = require('./src/config/redis.ioredis');

async function testRedis() {
  console.log('Connecting to Redis...');
  try {
    const res = await connection.ping();
    console.log('Redis Ping Response:', res);
    process.exit(0);
  } catch (err) {
    console.error('Redis connection failed:', err);
    process.exit(1);
  }
}

testRedis();
