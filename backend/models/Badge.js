const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  return sequelize.define("Badge", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: "#3B82F6",
    },
    criteria: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: "Critères d'obtention du badge",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    rarity: {
      type: DataTypes.ENUM("common", "uncommon", "rare", "epic", "legendary"),
      defaultValue: "common",
    },
  });
};
