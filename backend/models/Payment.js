// backend/models/Payment.js - VERSION CORRIGÉE
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Payment",
    {
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
      // AJOUTÉ - L'acheteur (gagnant de l'enchère)
      buyerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      // AJOUTÉ - Le vendeur (propriétaire du produit)
      sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      // CONSERVÉ pour compatibilité (peut être supprimé plus tard)
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Changé à true pour éviter les conflits
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
    },
    {
      tableName: "payments",
      timestamps: true,
      indexes: [
        {
          fields: ["auctionId"],
        },
        {
          fields: ["buyerId"],
        },
        {
          fields: ["sellerId"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["transactionId"],
          unique: true,
        },
      ],
    }
  );
};
