const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Review", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    auctionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reviewerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID de l'utilisateur qui donne l'avis",
    },
    revieweeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID de l'utilisateur qui reçoit l'avis",
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
      comment: "Note sur 5",
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("buyer_to_seller", "seller_to_buyer"),
      allowNull: false,
    },
    criteria: {
      type: DataTypes.JSON,
      allowNull: true,
      comment:
        "Notes par critère (communication, rapidité, état du produit, etc.)",
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Réponse de la personne évaluée",
    },
    isReported: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    moderationStatus: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "flagged"),
      defaultValue: "pending",
    },
  });
};
