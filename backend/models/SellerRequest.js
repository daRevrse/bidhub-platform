// backend/models/SellerRequest.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "SellerRequest",
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
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        comment: "ID de l'utilisateur demandant à devenir vendeur",
      },
      businessName: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "Nom de l'entreprise (optionnel)",
      },
      businessType: {
        type: DataTypes.ENUM("individual", "company", "association", "other"),
        allowNull: false,
        defaultValue: "individual",
        comment: "Type d'activité",
      },
      businessDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "Description de l'activité de vente",
      },
      businessAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Adresse de l'activité",
      },
      businessPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "Téléphone professionnel",
      },
      businessEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Email professionnel",
      },
      idDocument: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Chemin vers la pièce d'identité scannée",
      },
      businessDocument: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Chemin vers le document d'activité (registre commerce, etc.)",
      },
      experienceDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Description de l'expérience dans la vente",
      },
      categoriesOfInterest: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Catégories de produits que le vendeur souhaite proposer",
      },
      expectedMonthlyVolume: {
        type: DataTypes.ENUM("1-10", "11-50", "51-100", "100+"),
        allowNull: true,
        comment: "Volume mensuel estimé de ventes",
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
        comment: "Statut de la demande",
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "Date de soumission de la demande",
      },
      reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Date de traitement de la demande",
      },
      reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
        comment: "ID de l'admin qui a traité la demande",
      },
      adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Notes internes de l'administrateur",
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Raison du rejet si applicable",
      },
      followUpNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Notes de suivi ou recommandations",
      },
      requestType: {
        type: DataTypes.ENUM("upgrade_to_seller", "seller_verification"),
        allowNull: false,
        defaultValue: "upgrade_to_seller",
        comment: "Type de demande",
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Métadonnées supplémentaires",
      },
    },
    {
      tableName: "seller_requests",
      timestamps: true,
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["submittedAt"],
        },
        {
          fields: ["reviewedBy"],
        },
        {
          fields: ["requestType"],
        },
      ],
      comment: "Demandes de changement de type de compte vers vendeur",
    }
  );
};
