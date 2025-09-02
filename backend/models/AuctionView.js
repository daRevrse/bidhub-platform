// backend/models/AuctionView.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AuctionView = sequelize.define(
    "AuctionView",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      auctionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Auctions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "auction_views",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["userId", "auctionId"],
        },
        {
          fields: ["userId"],
        },
        {
          fields: ["auctionId"],
        },
      ],
    }
  );

  return AuctionView;
};
