// backend/models/Category.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: "Nom de la catégorie",
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: "Slug URL-friendly de la catégorie",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Description de la catégorie",
      },
      icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Nom de l'icône pour l'affichage",
      },
      color: {
        type: DataTypes.STRING(7),
        allowNull: true,
        defaultValue: "#3B82F6",
        comment: "Couleur hexadécimale pour l'affichage",
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "categories",
          key: "id",
        },
        onDelete: "SET NULL",
        comment: "ID de la catégorie parent pour sous-catégories",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Si la catégorie est active/visible",
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Ordre d'affichage",
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Métadonnées supplémentaires (attributs spécifiques, etc.)",
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
        comment: "ID de l'admin qui a créé la catégorie",
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
        comment: "ID de l'admin qui a modifié la catégorie",
      },
    },
    {
      tableName: "categories",
      timestamps: true,
      indexes: [
        {
          fields: ["slug"],
          unique: true,
        },
        {
          fields: ["parentId"],
        },
        {
          fields: ["isActive"],
        },
        {
          fields: ["sortOrder"],
        },
      ],
      comment: "Catégories d'enchères",
    }
  );
};
