const { Queue } = require('bullmq');
const { connection, DEFAULT_JOB_OPTIONS, prefix } = require('../../config/bullmq');

const reviewQueue = new Queue('review_queue', {
  connection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
  prefix,
});

module.exports = reviewQueue;
