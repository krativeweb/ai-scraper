require("dotenv").config();
const express = require("express");

const scrapeRoute = require("./routes/scrape");
const chatRoute = require("./routes/chat");

const app = express();

app.use(express.json());

app.use("/api/scrape", scrapeRoute);
app.use("/api/chat", chatRoute);

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});