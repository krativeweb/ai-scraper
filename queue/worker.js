require("dotenv").config(); // ✅ IMPORTANT

const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const crawl = require("../scraper/crawler");
const getEmbedding = require("../services/embedding");
const db = require("../db");

// ✅ FIXED REDIS CONFIG
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const worker = new Worker(
  "scrapeQueue",
  async (job) => {
    try {
      const { url } = job.data;

      console.log("Processing:", url);

      const pages = await crawl(url, 2);

      for (const page of pages) {
        // ✅ insert document
        const [docRes] = await db.execute(
          "INSERT INTO documents (file_name) VALUES (?)",
          [page.url]
        );

        const docId = docRes.insertId;

        const chunks = page.text.match(/.{1,1500}/g) || [];

        for (const chunk of chunks) {
          const embedding = await getEmbedding(chunk);

          await db.execute(
            `INSERT INTO document_chunks 
             (document_id, chunk_text, embedding) 
             VALUES (?, ?, ?)`,
            [docId, chunk, JSON.stringify(embedding)]
          );
        }

        console.log("Saved:", page.url);
      }

      return { success: true };
    } catch (err) {
      console.error("Worker Error:", err);
      throw err; // important for BullMQ retries
    }
  },
  {
    connection,

    // 🔥 OPTIONAL (but recommended)
    concurrency: 3 // process 3 jobs parallel
  }
);

// ✅ EVENTS (VERY IMPORTANT FOR DEBUGGING)
worker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.log(`❌ Job failed: ${job.id}`, err.message);
});

console.log("🚀 Worker started...");