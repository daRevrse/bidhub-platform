// backend/models/Product.js - VERSION MISE À JOUR AVEC CATEGORYID
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 200],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [10, 5000],
        },
      },
      // ANCIEN CHAMP - Gardé pour compatibilité pendant la migration
      category: {
        type: DataTypes.STRING,
        allowNull: true, // Changé à true pour permettre la migration
        comment: "Ancien champ catégorie - sera supprimé après migration",
      },
      // NOUVEAU CHAMP - Référence vers la table categories
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Sera changé à false après migration
        references: {
          model: "categories",
          key: "id",
        },
        onDelete: "RESTRICT", // Empêche la suppression d'une catégorie utilisée
        comment: "Référence vers la table categories",
      },
      condition: {
        type: DataTypes.ENUM("new", "like_new", "good", "fair", "poor"),
        allowNull: false,
        defaultValue: "good",
      },
      images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        get() {
          const rawValue = this.getDataValue("images");
          if (!rawValue) return [];
          if (typeof rawValue === "string") {
            try {
              return JSON.parse(rawValue);
            } catch (e) {
              return [];
            }
          }
          return Array.isArray(rawValue) ? rawValue : [];
        },
        set(value) {
          if (Array.isArray(value)) {
            this.setDataValue("images", value);
          } else if (typeof value === "string") {
            try {
              this.setDataValue("images", JSON.parse(value));
            } catch (e) {
              this.setDataValue("images", []);
            }
          } else {
            this.setDataValue("images", []);
          }
        },
      },
      sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "active",
          "sold",
          "cancelled",
          "pending_approval"
        ),
        defaultValue: "draft",
      },
      // Nouveaux champs pour enrichir le modèle
      specifications: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Spécifications techniques du produit",
      },
      brand: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Marque du produit",
      },
      model: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Modèle du produit",
      },
      weight: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        comment: "Poids en kg",
      },
      dimensions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Dimensions (longueur, largeur, hauteur) en cm",
      },
      isFeature: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Produit mis en avant",
      },
      viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Nombre de vues du produit",
      },
      reportCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Nombre de signalements",
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Métadonnées supplémentaires",
      },
    },
    {
      tableName: "products",
      timestamps: true,
      indexes: [
        {
          fields: ["sellerId"],
        },
        {
          fields: ["categoryId"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["category"], // Index sur ancien champ pour compatibilité
        },
        {
          fields: ["isFeature"],
        },
        {
          fields: ["brand"],
        },
        {
          fields: ["createdAt"],
        },
      ],
      comment: "Produits mis aux enchères",
    }
  );
};
