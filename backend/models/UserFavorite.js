// backend/models/UserFavorite.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserFavorite = sequelize.define(
    "UserFavorite",
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
      tableName: "user_favorites",
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

  return UserFavorite;
};
