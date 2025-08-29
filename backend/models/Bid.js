const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Bid", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    auctionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bidderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });
};
