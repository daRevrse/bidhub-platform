// backend/models/Notification.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Notification = sequelize.define(
    "Notification",
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
      type: {
        type: DataTypes.ENUM(
          "bid_placed", // Nouvelle enchère placée
          "auction_won", // Enchère gagnée
          "auction_lost", // Enchère perdue
          "auction_ending", // Enchère se termine bientôt
          "payment_received", // Paiement reçu
          "payment_required", // Paiement requis
          // "message_received", // Nouveau message
          "review_received", // Nouvel avis reçu
          "product_approved", // Produit approuvé
          "product_rejected", // Produit rejeté
          "system" // Notification système
        ),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Titre de la notification",
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "Contenu de la notification",
      },
      data: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Données additionnelles (IDs, liens, etc.)",
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high", "urgent"),
        defaultValue: "medium",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Date d'expiration de la notification",
      },
      actionUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "URL vers laquelle rediriger lors du clic",
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Image associée à la notification",
      },
    },
    {
      tableName: "notifications",
      timestamps: true,
      indexes: [
        {
          fields: ["userId", "isRead"],
        },
        {
          fields: ["userId", "type"],
        },
        {
          fields: ["createdAt"],
        },
        {
          fields: ["expiresAt"],
        },
      ],
    }
  );

  return Notification;
};
