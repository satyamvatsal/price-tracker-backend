const Product = require("../models/Product");
const Users = require("../models/User");
const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");
const sendMail = require("./mail");
const { Expo } = require("expo-server-sdk");
const expo = new Expo();
const User = require("../models/User");
const fetchProductDetails = require("./getProductDetails");

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

const priceTrackerJob = () => {
  const job = cron.schedule("* * * * *", async () => {
    console.log("Running scheduled price check...");
    try {
      const products = await Product.findAll();
      const priceChecks = products.map(async (product) => {
        const response = await fetchProductDetails(product.productURL);
        let { productName, imageURL, currentPrice } = response;
        if (!product.imageURL) product.imageURL = imageURL;
        if (!product.productName) product.productName = productName;
        if (currentPrice) {
          currentPrice = parseFloat(
            currentPrice.replace(/,/g, "").replace(/\.$/, ""),
          );
          product.currentPrice = currentPrice;
        }
        console.log(`\n${imageURL}\n${productName}\n${currentPrice}\n`);
        if (currentPrice && currentPrice <= product.updatedTriggerPrice) {
          console.log(
            `🔔 ALERT: Price for ${product.productName} has dropped to ${currentPrice} (Trigger: ${product.updatedTriggerPrice})`,
          );
          try {
            const user = await Users.findOne({
              where: { id: product.createdBy },
              attributes: ["fcmToken"],
            });
            const title = "🔥 Price Drop Alert!";
            const message = `Great news! The price of ${product.productName} has dropped to ₹${currentPrice}. Check it out now!`;
            await sendPushNotification(
              user.fcmToken,
              title,
              message,
              product.productURL,
            );
            product.updatedTriggerPrice = currentPrice - 1;
          } catch (err) {
            console.log(err);
          }
        }
        const updatedProduct = await product.save();
        console.log(updatedProduct);
      });

      await Promise.all(priceChecks);
    } catch (error) {
      console.error("Error in scheduled task:", error.message);
    }
  });
  job.start();
};

module.exports = priceTrackerJob;
