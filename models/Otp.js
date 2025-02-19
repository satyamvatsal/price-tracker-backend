const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const OTP = sequelize.define("OTP", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = OTP;
