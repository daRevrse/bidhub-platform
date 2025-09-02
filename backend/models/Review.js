// backend/models/Review.js - VERSION CORRIGÉE
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Review = sequelize.define(
    "Review",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      reviewerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        comment: "Utilisateur qui donne l'avis",
      },
      revieweeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        comment: "Utilisateur qui reçoit l'avis",
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
        comment: "Note de 1 à 5 étoiles",
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Commentaire textuel de l'avis",
      },
      type: {
        type: DataTypes.ENUM("buyer_to_seller", "seller_to_buyer"),
        allowNull: false,
        comment: "Type d'évaluation selon le rôle",
      },
      criteria: {
        type: DataTypes.JSON,
        allowNull: true,
        comment:
          "Évaluation détaillée par critères (communication, qualité, etc.)",
      },
      response: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Réponse de l'utilisateur évalué",
      },
      responseDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isHelpful: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Nombre d'utilisateurs qui ont trouvé l'avis utile",
      },
      isReported: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      moderationStatus: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "flagged"),
        defaultValue: "approved",
      },
      moderationNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment:
          "Si false, l'avis n'est visible que par les parties concernées",
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Métadonnées supplémentaires",
      },
    },
    {
      tableName: "reviews",
      timestamps: true,
      indexes: [
        {
          fields: ["reviewerId"],
        },
        {
          fields: ["revieweeId"],
        },
        {
          fields: ["auctionId"],
        },
        {
          fields: ["rating"],
        },
        {
          fields: ["moderationStatus"],
        },
        {
          unique: true,
          fields: ["auctionId", "reviewerId", "type"],
          name: "unique_review_per_auction_reviewer_type",
        },
      ],
    }
  );

  return Review;
};
