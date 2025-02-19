const express = require("express");
const Product = require("../models/Product");
const { authMiddleware } = require("../middlewares/authMiddleware");
const cheerio = require("cheerio");
const axios = require("axios");
const { exec } = require("child_process");
const fetchProductDetails = require("../jobs/getProductDetails");

const router = express.Router();

router.post("/add", authMiddleware, async (req, res) => {
  const { productURL, triggerPrice } = req.body;
  try {
    const originalTriggerPrice = triggerPrice;
    const updatedTriggerPrice = triggerPrice;
    const response = await fetchProductDetails(productURL);
    const { productName, imageURL, currentPrice } = response;
    const product = await Product.create({
      productURL,
      originalTriggerPrice,
      updatedTriggerPrice,
      productName,
      imageURL,
      currentPrice,
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
    if (productURL !== product.productURL) {
      return res.status(400).json({ error: "Product URL cannot be changed." });
    }
    await Product.update(
      {
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

module.exports = router;
