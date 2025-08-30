const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Payment", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    auctionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "XOF",
    },
    provider: {
      type: DataTypes.ENUM("flooz", "tmoney", "cash"),
      allowNull: false,
    },
    providerTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "completed",
        "failed",
        "cancelled",
        "refunded"
      ),
      defaultValue: "pending",
    },
    fees: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
};
