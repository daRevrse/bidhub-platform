// backend/scripts/syncDatabase.js - Script pour synchroniser la DB avec les nouveaux modèles
const { sequelize, Conversation, Message, Badge } = require("../models");

async function syncDatabase() {
  try {
    console.log("🔄 Synchronisation de la base de données...");

    // Synchroniser tous les modèles
    await sequelize.sync({ alter: true });
    console.log("✅ Base de données synchronisée");

    // Créer les badges par défaut s'ils n'existent pas
    const badgeCount = await Badge.count();
    if (badgeCount === 0) {
      console.log("🏆 Création des badges par défaut...");
      const seedBadges = require("./seedBadges");
      await seedBadges();
    }

    // Créer les dossiers d'upload s'ils n'existent pas
    const fs = require("fs");
    const path = require("path");

    const uploadDirs = [
      "uploads/products",
      "uploads/messages",
      "uploads/avatars",
    ];

    uploadDirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Dossier ${dir} créé`);
      }
    });

    console.log("🎉 Synchronisation terminée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation:", error);
    process.exit(1);
  }
}

// Lancer le script si appelé directement
if (require.main === module) {
  syncDatabase().then(() => process.exit(0));
}

module.exports = syncDatabase;
