const { Queue } = require('bullmq');
const { connection, DEFAULT_JOB_OPTIONS, prefix } = require('../../config/bullmq');

const rewardQueue = new Queue('reward_queue', {
  connection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
  prefix,
});

module.exports = rewardQueue;
