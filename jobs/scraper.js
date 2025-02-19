const Product = require("../models/Product");
const Users = require("../models/User");
const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");
const sendMail = require("./mail");
const { Expo } = require("expo-server-sdk");
const expo = new Expo();
const User = require("../models/User");

async function sendPushNotification(expoPushToken, title, message, url) {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error("Invalid Expo Push Token:", expoPushToken);
    return;
  }

  const messages = [
    {
      to: expoPushToken,
      sound: "default",
      title: title,
      body: message,
      data: { url },
    },
  ];

  try {
    const ticket = await expo.sendPushNotificationsAsync(messages);
    console.log("Notification sent:", ticket);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

const getProductPrice = async (productURL) => {
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
    const { data } = await axios.get(productURL, {
      headers: { "User-Agent": randomUserAgent },
    });
    const $ = cheerio.load(data);
    const priceWhole = $(".a-price-whole").first().text().trim();
    if (priceWhole) {
      return priceWhole;
    } else {
      throw new Error("Price not found on the page");
    }
  } catch (err) {
    throw new Error("Error to retrieve price");
  }
};

const priceTrackerJob = () => {
  const job = cron.schedule("*/10 * * * *", async () => {
    console.log("Running scheduled price check...");
    try {
      const products = await Product.findAll();
      const priceChecks = products.map(async (product) => {
        const currentPriceString = await getProductPrice(product.productURL);
        const currentPrice = parseFloat(currentPriceString.replace(/,/g, ""));
        console.log(currentPrice);
        if (currentPrice && currentPrice <= product.updatedTriggerPrice) {
          console.log(
            `🔔 ALERT: Price for ${product.productURL} has dropped to ${currentPrice} (Trigger: ${product.updatedTriggerPrice})`,
          );
          try {
            const user = await Users.findOne({
              where: { id: product.createdBy },
              attributes: ["fcmToken"],
            });
            const title = "🔥 Price Drop Alert!";
            const message = `Great news! The price of ${product.productURL} has dropped to ₹${currentPrice}. Check it out now!`;
            await sendPushNotification(
              user.fcmToken,
              title,
              message,
              product.productURL,
            );
            await Product.update(
              { updatedTriggerPrice: currentPrice - 1 },
              { where: { id: product.id } },
            );
          } catch (err) {
            console.log(err);
          }
        }
      });

      await Promise.all(priceChecks);
    } catch (error) {
      console.error("Error in scheduled task:", error.message);
    }
  });
  job.start();
};

module.exports = priceTrackerJob;
