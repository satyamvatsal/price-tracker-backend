const axios = require("axios");
const cheerio = require("cheerio");

const fetchProductDetails = async (productURL) => {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:112.0) Gecko/20100101 Firefox/112.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edge/90.0.818.49",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.172",
    "Mozilla/5.0 (X11; Linux 6.10; aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/133.0 Safari/537.36",
  ];
  const randomUserAgent =
    userAgents[Math.floor(Math.random() * userAgents.length)];
  try {
    const response = await axios.get(productURL, {
      headers: { "User-Agent": randomUserAgent },
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const productName = $("#productTitle").text().trim();
    const imageURL = $("#landingImage").attr("src");
    const outOfStock = $("#outOfStock").length > 0;
    let currentPrice = "nil";
    if (!outOfStock) currentPrice = $(".a-price-whole").first().text().trim();
    currentPrice = parseFloat(
      currentPrice.replace(/,/g, "").replace(/\.$/, ""),
    );
    return { imageURL, productName, currentPrice };
  } catch (err) {
    console.log("error while fetching product details");
    return {};
  } finally {
  }
};
module.exports = fetchProductDetails;
