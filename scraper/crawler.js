const scrapePage = require("./scrapePage");

const visited = new Set();

async function crawl(url, depth = 2) {
  if (depth === 0 || visited.has(url)) return [];

  visited.add(url);

  const { text, links } = await scrapePage(url);

  let results = [{ url, text }];

  for (const link of links.slice(0, 5)) {
    const sub = await crawl(link, depth - 1);
    results = results.concat(sub);
  }

  return results;
}

module.exports = crawl;