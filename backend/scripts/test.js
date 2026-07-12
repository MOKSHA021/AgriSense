// backend/testScraper.js
const { scrapeVegetablePrices } = require("./services/scraper");

scrapeVegetablePrices("Telangana", "Tomato").then((res) => {
  console.log("Total results:", res.length);
  console.log("Data:", JSON.stringify(res, null, 2));
});
