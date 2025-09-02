const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AuditLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID de l'utilisateur qui a effectué l'action",
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "Type d'action (CREATE, UPDATE, DELETE, LOGIN, etc.)",
      },
      entity: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Entité concernée (User, Auction, Product, etc.)",
      },
      entityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID de l'entité concernée",
      },
      oldValues: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Anciennes valeurs avant modification",
      },
      newValues: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Nouvelles valeurs après modification",
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: "Adresse IP de l'utilisateur",
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "User agent du navigateur",
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Détails supplémentaires de l'action",
      },
      severity: {
        type: DataTypes.ENUM("low", "medium", "high", "critical"),
        defaultValue: "low",
        comment: "Niveau de gravité de l'action",
      },
      success: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Si l'action a réussi ou échoué",
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Message d'erreur si l'action a échoué",
      },
    },
    {
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["action"],
        },
        {
          fields: ["entity", "entityId"],
        },
        {
          fields: ["createdAt"],
        },
        {
          fields: ["severity"],
        },
        {
          fields: ["success"],
        },
      ],
      comment: "Journal d'audit des actions sur la plateforme",
    }
  );
};
