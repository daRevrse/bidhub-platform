// backend/scripts/setup.js - Script de configuration complète
const fs = require("fs");
const path = require("path");

function createDirectories() {
  const directories = [
    "uploads",
    "uploads/products",
    "uploads/messages",
    "uploads/avatars",
    "uploads/seller-requests",
    "uploads/categories",
  ];

  console.log("📁 Création des dossiers nécessaires...");

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Dossier créé: ${dir}`);
    } else {
      console.log(`✓ Dossier existe déjà: ${dir}`);
    }
  });
}

// Exécuter le setup si appelé directement
if (require.main === module) {
  createDirectories();
  console.log(
    "\n🎉 Setup terminé ! Vous pouvez maintenant lancer la migration des catégories."
  );
  console.log(
    "Commande suivante: node backend/scripts/migrateCategoriesFromStringToTable.js"
  );
}

module.exports = { createDirectories };
