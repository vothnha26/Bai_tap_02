const connection = require('./redis.ioredis');

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
};

const prefix = process.env.NODE_ENV === 'test' ? 'bull_test' : 'bull';

module.exports = {
  connection,
  DEFAULT_JOB_OPTIONS,
  prefix,
};
