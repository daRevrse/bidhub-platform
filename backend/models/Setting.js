const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Setting",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "general",
        comment: "Catégorie de paramètres (general, auction, payment, etc.)",
      },
      key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "Clé du paramètre",
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Valeur du paramètre (JSON pour les objets complexes)",
      },
      type: {
        type: DataTypes.ENUM("string", "number", "boolean", "json", "array"),
        defaultValue: "string",
        comment: "Type de données du paramètre",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Description du paramètre",
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Si true, le paramètre peut être lu par les utilisateurs",
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID de l'admin qui a modifié le paramètre",
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["category", "key"],
        },
        {
          fields: ["category"],
        },
        {
          fields: ["isPublic"],
        },
      ],
      comment: "Paramètres de configuration du système",
    }
  );
};
