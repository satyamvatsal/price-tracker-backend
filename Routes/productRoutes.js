const express = require("express");
const Product = require("../models/Product");
const { authMiddleware } = require("../middlewares/authMiddleware");
const cheerio = require("cheerio");
const axios = require("axios");
const { exec } = require("child_process");

const router = express.Router();

router.post("/add", authMiddleware, async (req, res) => {
  const { productURL, triggerPrice } = req.body;
  try {
    const originalTriggerPrice = triggerPrice;
    const updatedTriggerPrice = triggerPrice;
    const product = await Product.create({
      productURL,
      originalTriggerPrice,
      updatedTriggerPrice,
      createdBy: req.user.id,
    });
    res.status(201).json({ product, message: "Price Trigger added" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error adding product" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  console.log("delete");
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
        createdBy: req.user.id,
      },
    });
    if (!product) {
      return res
        .status(404)
        .json({ error: "Product not found or not authorized to delete" });
    }
    await product.destroy();
    return res.status(200).json({ message: "Product deleted Successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error deleting product" });
  }
});
router.patch("/:id", authMiddleware, async (req, res) => {
  console.log("patch");
  const id = req.params.id;
  const { productURL, triggerPrice } = req.body;
  try {
    const product = await Product.findOne({
      where: {
        id,
        createdBy: req.user.id,
      },
    });
    if (!product) {
      res.status(401).json({ mesage: "Unauthorized to update" });
    }
    await Product.update(
      {
        productURL,
        originalTriggerPrice: triggerPrice,
        updatedTriggerPrice: triggerPrice,
      },
      { where: { id } },
    );
    res.status(200).json({ message: "Updated Product successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/get-details", authMiddleware, async (req, res) => {
  const { productURL } = req.body;
  if (!productURL) {
    return res.status(400).json({ error: "URL is required" });
  }
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
    console.log(productURL);
    const { data } = await axios.get("https://www.youtube.com/");
    console.log(data);
    const $ = cheerio.load(data);
    const currentPrice = $(".a-price-whole").first().text().trim();
    const title = $("#productTitle").text().trim();
    const imageURL = $("#landingImage").attr("src");
    return res.status(200).json({ title, imageURL, currentPrice });
  } catch (err) {
    if (err.request) console.log("Request Sent");
    console.log(`Response ${err.response}`);
    console.log("Message: ", err.message);
    return res.status(500).json({ error: "Failed to get product details" });
  }
});

module.exports = router;
