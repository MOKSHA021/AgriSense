// services/todayPriceRatesScraper.js
const puppeteer = require("puppeteer");
const cheerio   = require("cheerio");

const scrapeVegetablePrices = async (state, commodity) => {
  console.log(`[Scraper] Launching browser for: ${state}, ${commodity}`);

  // ── Direct URL — no form submit needed! ──
  const stateSlug = state.trim().replace(/ /g, "-");
  const url       = `https://market.todaypricerates.com/${stateSlug}-vegetables-price`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });

    const html = await page.content();
    console.log(`[Scraper] HTML length: ${html.length}`);

    const $       = cheerio.load(html);
    const results = [];

    // Table: col0=Name, col1=Unit, col2=MandiPrice+trend, col3=RetailRange
    $("table#customers tbody tr").each((i, row) => {
      const cols    = $(row).find("td");
      if (cols.length < 4) return;

      const cropName = $(cols[0]).text().trim();
      if (!cropName) return;

      // Filter by commodity (case-insensitive)
      if (!cropName.toLowerCase().includes(commodity.toLowerCase())) return;

      const unit = $(cols[1]).text().trim();

      // col2: "₹ 18 ▼ 2.6%"  — strip span to get mandi price
      const col2text    = $(cols[2]).clone().find("span").remove().end().text().trim();
      const mandiPrice  = parseFloat(col2text.replace(/[^\d.]/g, "")) || 0;

      // trend from span
      const trendText   = $(cols[2]).find("span").text().trim();
      const changeMatch = trendText.match(/([\d.]+)%/);
      const priceChange = changeMatch ? parseFloat(changeMatch[1]) : null;
      const trend       = trendText.includes("▼") ? "down"
                        : trendText.includes("▲") ? "up"
                        : "stable";

      // col3: "₹ 22 - 27"
      const retailText = $(cols[3]).text().trim();
      const retailNums = [...retailText.matchAll(/[\d.]+/g)].map((m) => parseFloat(m[0]));
      const minPrice   = retailNums[0] || mandiPrice;
      const maxPrice   = retailNums[1] || mandiPrice;

      results.push({
        commodity:   cropName,
        unit,
        mandiPrice,            // wholesale mandi price
        minPrice,              // retail min
        maxPrice,              // retail max
        modalPrice:  mandiPrice,
        priceChange,
        trend,
        date:        new Date().toLocaleDateString("en-IN"),
        state,
        source:      "todaypricerates",
      });
    });

    console.log(`[Scraper] Found: ${results.length} results for "${commodity}"`);
    return results;

  } catch (err) {
    console.error("[Scraper] Error:", err.message);
    return [];
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeVegetablePrices };
