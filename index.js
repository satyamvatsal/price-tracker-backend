require("dotenv").config();
const express = require("express");
const { sequelize } = require("./database");
const authRoutes = require("./Routes/authRoutes");
const userRoutes = require("./Routes/userRoutes");
const productRoutes = require("./Routes/productRoutes");
const priceTrackerJob = require("./jobs/scraper");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/product", productRoutes);

priceTrackerJob();
const port = 8070;
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("PostgreSQL connected!");
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  })
  .catch((err) => console.log(err));
