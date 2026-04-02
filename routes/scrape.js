const express = require("express");
const router = express.Router();
const scrapeQueue = require("../queue/queue");

router.post("/", async (req, res) => {
  const { url } = req.body;

  await scrapeQueue.add("scrapeJob", { url });

  res.json({ message: "Job added to queue" });
});

module.exports = router;