const { Queue } = require("bullmq");
const IORedis = require("ioredis");

// ✅ Use REDIS_URL (Upstash)
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null
});

const scrapeQueue = new Queue("scrapeQueue", { connection });

module.exports = scrapeQueue;