const logger = require('../utils/logger');
const { createClient } = require('redis');

const createMemoryRedisClient = () => {
  const store = new Map();

  const getRecord = (key) => {
    const record = store.get(key);
    if (!record) return null;
    if (record.expiresAt && record.expiresAt <= Date.now()) {
      store.delete(key);
      return null;
    }
    return record;
  };

  return {
    isOpen: true,
    on: () => {},
    connect: async () => {},
    get: async (key) => {
      const record = getRecord(key);
      return record ? record.value : null;
    },
    set: async (key, value, options = {}) => {
      const ttl = options.EX ? options.EX * 1000 : null;
      store.set(key, {
        value: String(value),
        expiresAt: ttl ? Date.now() + ttl : null
      });
      return 'OK';
    },
    setEx: async (key, seconds, value) => {
      store.set(key, {
        value: String(value),
        expiresAt: Date.now() + seconds * 1000
      });
      return 'OK';
    },
    incr: async (key) => {
      const record = getRecord(key);
      const nextValue = (parseInt(record?.value, 10) || 0) + 1;
      store.set(key, {
        value: String(nextValue),
        expiresAt: record?.expiresAt || null
      });
      return nextValue;
    },
    expire: async (key, seconds) => {
      const record = getRecord(key);
      if (!record) return 0;
      record.expiresAt = Date.now() + seconds * 1000;
      store.set(key, record);
      return 1;
    },
    ttl: async (key) => {
      const record = getRecord(key);
      if (!record) return -2;
      if (!record.expiresAt) return -1;
      return Math.max(0, Math.ceil((record.expiresAt - Date.now()) / 1000));
    },
    del: async (...keys) => {
      let deleted = 0;
      keys.forEach((key) => {
        if (store.delete(key)) deleted += 1;
      });
      return deleted;
    },
    lPush: async (key, value) => {
      const record = getRecord(key) || { value: [] };
      const list = Array.isArray(record.value) ? record.value : [];
      list.unshift(String(value));
      store.set(key, { value: list, expiresAt: null });
      return list.length;
    },
    brPop: async (key, timeout) => {
      const poll = () => {
        const record = getRecord(key);
        if (record && Array.isArray(record.value) && record.value.length > 0) {
          const value = record.value.pop();
          store.set(key, { value: record.value, expiresAt: null });
          return { key, element: value };
        }
        return null;
      };

      const start = Date.now();
      while (timeout === 0 || Date.now() - start < timeout * 1000) {
        const result = poll();
        if (result) return result;
        await new Promise(resolve => setTimeout(resolve, 100));
        if (timeout !== 0 && Date.now() - start >= timeout * 1000) break;
      }
      return null;
    },
    lLen: async (key) => {
      const record = getRecord(key);
      if (record && Array.isArray(record.value)) {
        return record.value.length;
      }
      return 0;
    },
    flushDb: async () => {
      store.clear();
      return 'OK';
    },
    quit: async () => {},
    disconnect: async () => {}
  };
};

if (process.env.USE_MEMORY_REDIS === 'true') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('In-memory Redis fallback is NOT allowed in production. Provide a real Redis instance.');
  }
  logger.warn('Using in-memory Redis fallback. Data will be lost on restart and inconsistency occurs with multi-process. Do not use this in production.');
  module.exports = createMemoryRedisClient();
} else {
  const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`
  });

  redisClient.on('error', (err) => {
    if (process.env.NODE_ENV !== 'test') {
      logger.error('Redis Client Error', err);
    }
  });

  const connectRedis = async () => {
    if (process.env.NODE_ENV !== 'test' && !redisClient.isOpen) {
      try {
        await redisClient.connect();
        logger.info('Connected to Redis');
      } catch (err) {
        logger.error('Could not connect to Redis', err);
      }
    }
  };

  connectRedis();

  module.exports = redisClient;
}
