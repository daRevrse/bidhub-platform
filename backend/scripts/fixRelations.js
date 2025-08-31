const { sequelize } = require("../models");

async function fixRelations() {
  try {
    console.log("🔧 Correction des relations de base de données...");

    // Supprimer et recréer les tables si nécessaire
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    // Supprimer les tables de messagerie si elles existent avec de mauvaises relations
    await sequelize.query("DROP TABLE IF EXISTS Messages;");
    await sequelize.query("DROP TABLE IF EXISTS Conversations;");

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

    // Recréer avec les bonnes relations
    await sequelize.sync({ force: false });

    console.log("✅ Relations corrigées");
  } catch (error) {
    console.error("❌ Erreur correction relations:", error);
  }
}

if (process.argv.includes("--fix-relations")) {
  fixRelations().then(() => process.exit(0));
}
