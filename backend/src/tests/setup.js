process.env.USE_MEMORY_REDIS = 'true';

if (process.env.USE_MEMORY_REDIS === 'true') {
  const EventEmitter = require('events');

  // Map lưu trữ các worker đã đăng ký theo tên queue
  const registeredWorkers = new Map();

  class MockQueue {
    constructor(name, options) {
      this.name = name;
    }

    async add(jobName, data) {
      const job = {
        id: `mock-job-${Date.now()}-${Math.random()}`,
        name: jobName,
        data,
      };

      // Tìm worker tương ứng và chạy processor bất đồng bộ
      const worker = registeredWorkers.get(this.name);
      if (worker) {
        setTimeout(async () => {
          try {
            const result = await worker.processor(job);
            worker.emit('completed', job, result);
          } catch (err) {
            worker.emit('failed', job, err);
          }
        }, 10);
      }
      return job;
    }

    async close() {}
  }

  class MockWorker extends EventEmitter {
    constructor(name, processor, options) {
      super();
      this.name = name;
      this.processor = processor;
      registeredWorkers.set(name, this);
    }

    async waitUntilReady() {
      return Promise.resolve();
    }

    async close() {
      registeredWorkers.delete(this.name);
      return Promise.resolve();
    }
  }

  jest.mock('bullmq', () => ({
    Queue: MockQueue,
    Worker: MockWorker,
  }));

  jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => {
      return {
        flushdb: async () => 'OK',
        quit: async () => {},
        on: () => {},
        disconnect: async () => {},
      };
    });
  });
}
