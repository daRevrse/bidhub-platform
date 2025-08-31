const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Conversation", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    participant1Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Premier participant",
    },
    participant2Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Deuxième participant",
    },
    auctionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Enchère liée à la conversation (optionnel)",
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastMessagePreview: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    blockedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });
};
