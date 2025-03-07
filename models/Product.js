const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");
const User = require("./User");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  productURL: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isURL: true,
    },
  },
  productName: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageURL: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isURL: true,
    },
  },
  currentPrice: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  originalTriggerPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  updatedTriggerPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
});

Product.belongsTo(User, { foreignKey: "createdBy" });
module.exports = Product;
