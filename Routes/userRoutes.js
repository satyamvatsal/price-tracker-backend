const express = require("express");
const { authMiddleware, checkRole } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const Product = require("../models/Product");

const router = express.Router();

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(404).json({ error: "User not Found" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ error: "User not verified." });
    }
    const products = await Product.findAll({
      where: { createdBy: req.user.id },
    });
    return res.status(200).json({ user, products });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error Fetching profile data" });
  }
});
router.get("/admin", authMiddleware, checkRole("admin"), (req, res) => {
  res.json({ message: "Welcome admin" });
});

module.exports = router;
