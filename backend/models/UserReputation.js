const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  return sequelize.define("UserReputation", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    // Statistiques générales
    overallRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      validate: { min: 0, max: 5 },
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Statistiques par rôle
    sellerRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    sellerReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    buyerRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    buyerReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Statistiques détaillées
    ratingDistribution: {
      type: DataTypes.JSON,
      defaultValue: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    },
    averageCriteria: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: "Moyennes par critère (communication, rapidité, etc.)",
    },
    // Badges et récompenses
    badges: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: "Liste des badges obtenus",
    },
    trustLevel: {
      type: DataTypes.ENUM("new", "bronze", "silver", "gold", "platinum"),
      defaultValue: "new",
    },
    // Statistiques d'activité
    totalSales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalPurchases: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    averageResponseTime: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      comment: "Temps de réponse moyen en heures",
    },
    lastActivityAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
};
