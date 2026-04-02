const express = require("express");
const router = express.Router();
const search = require("../services/search");
const axios = require("axios");

router.post("/", async (req, res) => {
  const { message } = req.body;

  const results = await search(message);

  const context = results.map((r) => r.text).join("\n\n");

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "Answer using provided context only"
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${message}`
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );

  res.json({
    answer: response.data.choices[0].message.content
  });
});

module.exports = router;