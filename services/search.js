const getEmbedding = require("./embedding");
const db = require("../db");

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

async function search(query) {
  const queryEmbedding = await getEmbedding(query);

  const [rows] = await db.execute("SELECT * FROM document_chunks");

  let scored = rows.map((row) => ({
    text: row.chunk_text,
    score: cosineSimilarity(
      queryEmbedding,
      JSON.parse(row.embedding)
    )
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}

module.exports = search;