const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Auction",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      startingPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currentPrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      reservePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("scheduled", "active", "ended", "cancelled"),
        defaultValue: "scheduled",
      },
      winnerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      tableName: "auctions",
      timestamps: true,
      indexes: [
        {
          fields: ["status"],
        },
        {
          fields: ["endTime"],
        },
        {
          fields: ["startTime"],
        },
        {
          fields: ["productId"],
        },
      ],
    }
  );
};
