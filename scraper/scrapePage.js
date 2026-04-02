const { chromium } = require("playwright");

const proxies = [
  null,
  // "http://user:pass@ip:port"
];

async function scrapePage(url) {
  const proxy = proxies[Math.floor(Math.random() * proxies.length)];

  const browser = await chromium.launch({
    headless: true,
    proxy: proxy ? { server: proxy } : undefined
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
  });

  const page = await context.newPage();

  await page.goto(url, { waitUntil: "domcontentloaded" });

  await page.waitForTimeout(Math.random() * 3000 + 1000);

  // scroll like human
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });

  const text = await page.evaluate(() => document.body.innerText);

  const links = await page.$$eval("a", (as) =>
    as.map((a) => a.href).filter((href) => href.startsWith("http"))
  );

  await browser.close();

  return { text, links };
}

module.exports = scrapePage;