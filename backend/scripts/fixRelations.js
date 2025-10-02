// backend/scripts/fixAssociations.js - Script pour vérifier les associations
const { sequelize } = require("../models");

async function testAssociations() {
  try {
    console.log("🔍 Test des associations...");

    // Test de synchronisation des modèles
    await sequelize.sync({ alter: true });
    console.log("✅ Synchronisation des modèles réussie");

    console.log("\n📋 Associations configurées :");

    // Lister toutes les associations pour vérification
    const models = sequelize.models;

    Object.keys(models).forEach((modelName) => {
      const model = models[modelName];
      const associations = Object.keys(model.associations);

      if (associations.length > 0) {
        console.log(`\n${modelName}:`);
        associations.forEach((assoc) => {
          const association = model.associations[assoc];
          console.log(
            `  - ${assoc} (${association.associationType}) -> ${association.target.name}`
          );
        });
      }
    });

    console.log("\n✅ Toutes les associations sont correctes !");
  } catch (error) {
    console.error("❌ Erreur dans les associations:", error.message);

    if (error.message.includes("Naming collision")) {
      console.log("\n💡 Solution suggérée:");
      console.log(
        "Il y a encore un conflit de nommage. Vérifiez les associations dans models/index.js"
      );
    }

    throw error;
  }
}

// Exécuter le test si appelé directement
if (require.main === module) {
  testAssociations()
    .then(() => {
      console.log("\n🎉 Test terminé avec succès !");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Échec du test:", error);
      process.exit(1);
    });
}

module.exports = { testAssociations };
