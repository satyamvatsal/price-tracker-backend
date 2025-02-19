const { sequelize } = require("../database");
const { DataTypes } = require("sequelize");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    fcmToken: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "Users" },
);

module.exports = User;
