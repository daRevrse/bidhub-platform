const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Message", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    messageType: {
      type: DataTypes.ENUM("text", "image", "system", "offer", "location"),
      defaultValue: "text",
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "URLs des fichiers joints",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    replyToId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID du message auquel on répond",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Données supplémentaires (coordonnées, propositions, etc.)",
    },
  });
};
