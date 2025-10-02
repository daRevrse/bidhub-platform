// backend/scripts/migrateCategoriesFromStringToTable.js
const { sequelize, Category, Product } = require("../models");

// Fonction utilitaire pour générer un slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, "") // Supprimer les caractères spéciaux
    .replace(/\s+/g, "-") // Remplacer les espaces par des tirets
    .replace(/-+/g, "-") // Supprimer les tirets multiples
    .trim("-"); // Supprimer les tirets en début et fin
};

// Catégories par défaut avec leurs métadonnées
const defaultCategories = [
  {
    name: "Électronique",
    description:
      "Smartphones, ordinateurs, électroménager et tous les produits électroniques",
    icon: "DevicePhoneMobileIcon",
    color: "#3B82F6",
    sortOrder: 1,
  },
  {
    name: "Véhicules",
    description: "Voitures, motos, vélos et tous types de véhicules",
    icon: "TruckIcon",
    color: "#DC2626",
    sortOrder: 2,
  },
  {
    name: "Mode et Accessoires",
    description: "Vêtements, chaussures, sacs et accessoires de mode",
    icon: "SparklesIcon",
    color: "#EC4899",
    sortOrder: 3,
  },
  {
    name: "Maison et Jardin",
    description: "Meubles, décoration, jardinage et équipements pour la maison",
    icon: "HomeIcon",
    color: "#10B981",
    sortOrder: 4,
  },
  {
    name: "Art et Antiquités",
    description: "Œuvres d'art, antiquités, objets de collection",
    icon: "PaintBrushIcon",
    color: "#7C2D12",
    sortOrder: 5,
  },
  {
    name: "Sports et Loisirs",
    description: "Équipements sportifs, jeux, hobbies et loisirs",
    icon: "Trophy",
    color: "#F59E0B",
    sortOrder: 6,
  },
  {
    name: "Livres et Médias",
    description: "Livres, films, musique et médias numériques",
    icon: "BookOpenIcon",
    color: "#6366F1",
    sortOrder: 7,
  },
  {
    name: "Bijoux et Montres",
    description: "Bijoux, montres et accessoires précieux",
    icon: "GemIcon",
    color: "#A855F7",
    sortOrder: 8,
  },
  {
    name: "Instruments de Musique",
    description: "Instruments de musique et équipements audio",
    icon: "MusicalNoteIcon",
    color: "#059669",
    sortOrder: 9,
  },
  {
    name: "Autres",
    description: "Autres catégories et produits divers",
    icon: "EllipsisHorizontalIcon",
    color: "#6B7280",
    sortOrder: 10,
  },
];

async function migrateCategoriesFromStringToTable() {
  const transaction = await sequelize.transaction();

  try {
    console.log("🔄 Début de la migration des catégories...");

    // 1. Synchroniser les nouveaux modèles
    console.log("📝 Synchronisation des modèles...");
    await sequelize.sync({ alter: true });

    // 2. Créer les catégories par défaut
    console.log("📦 Création des catégories par défaut...");
    const createdCategories = {};

    for (const categoryData of defaultCategories) {
      const slug = generateSlug(categoryData.name);

      const [category] = await Category.findOrCreate({
        where: { name: categoryData.name },
        defaults: {
          ...categoryData,
          slug,
          isActive: true,
          createdBy: 1, // Admin par défaut
          updatedBy: 1,
        },
        transaction,
      });

      createdCategories[categoryData.name] = category;
      console.log(`✅ Catégorie "${categoryData.name}" créée/trouvée`);
    }

    // 3. Migrer les produits existants
    console.log("🔄 Migration des produits existants...");

    const products = await Product.findAll({
      where: {
        category: { [require("sequelize").Op.ne]: null },
        categoryId: null, // Seulement les produits qui n'ont pas encore de categoryId
      },
      transaction,
    });

    console.log(`📊 ${products.length} produits à migrer`);

    let migratedCount = 0;
    let unmatchedCategories = new Set();

    for (const product of products) {
      const oldCategory = product.category;
      const matchingCategory = createdCategories[oldCategory];

      if (matchingCategory) {
        await product.update(
          { categoryId: matchingCategory.id },
          { transaction }
        );
        migratedCount++;
      } else {
        unmatchedCategories.add(oldCategory);

        // Créer une nouvelle catégorie pour les catégories non reconnues
        const slug = generateSlug(oldCategory);
        let finalSlug = slug;
        let counter = 1;

        // Assurer l'unicité du slug
        while (
          await Category.findOne({ where: { slug: finalSlug }, transaction })
        ) {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }

        const newCategory = await Category.create(
          {
            name: oldCategory,
            slug: finalSlug,
            description: `Catégorie créée automatiquement lors de la migration`,
            icon: "EllipsisHorizontalIcon",
            color: "#6B7280",
            isActive: true,
            sortOrder: 100,
            createdBy: 1,
            updatedBy: 1,
          },
          { transaction }
        );

        await product.update({ categoryId: newCategory.id }, { transaction });

        createdCategories[oldCategory] = newCategory;
        migratedCount++;
        console.log(`🆕 Nouvelle catégorie créée: "${oldCategory}"`);
      }
    }

    // 4. Afficher le résumé de la migration
    console.log("\n📊 Résumé de la migration:");
    console.log(`✅ ${migratedCount} produits migrés`);
    console.log(
      `📦 ${Object.keys(createdCategories).length} catégories au total`
    );

    if (unmatchedCategories.size > 0) {
      console.log(
        `🆕 Nouvelles catégories créées: ${Array.from(unmatchedCategories).join(
          ", "
        )}`
      );
    }

    // 5. Valider la migration
    console.log("\n🔍 Validation de la migration...");

    const productsWithoutCategoryId = await Product.count({
      where: {
        category: { [require("sequelize").Op.ne]: null },
        categoryId: null,
      },
      transaction,
    });

    if (productsWithoutCategoryId > 0) {
      throw new Error(
        `❌ ${productsWithoutCategoryId} produits n'ont pas été migrés`
      );
    }

    // 6. Créer un index pour l'amélioration des performances
    console.log("🔧 Création des index de performance...");
    try {
      await sequelize.query(
        `
        CREATE INDEX IF NOT EXISTS idx_products_category_id 
        ON products(categoryId)
      `,
        { transaction }
      );
      console.log("✅ Index créé sur products.categoryId");
    } catch (error) {
      console.log("⚠️  Index déjà existant ou erreur:", error.message);
    }

    await transaction.commit();
    console.log("\n🎉 Migration terminée avec succès !");
    console.log("\n⚠️  ÉTAPES SUIVANTES RECOMMANDÉES:");
    console.log("1. Tester l'application pour vérifier que tout fonctionne");
    console.log(
      "2. Une fois confirmé, supprimer la colonne 'category' des produits"
    );
    console.log("3. Mettre à jour le champ categoryId pour être NON NULL");

    return {
      success: true,
      migratedProducts: migratedCount,
      totalCategories: Object.keys(createdCategories).length,
      newCategories: Array.from(unmatchedCategories),
    };
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Erreur lors de la migration:", error);
    throw error;
  }
}

// Script pour nettoyer après la migration (à exécuter après validation)
async function cleanupAfterMigration() {
  const transaction = await sequelize.transaction();

  try {
    console.log("🧹 Nettoyage post-migration...");

    // 1. Rendre categoryId obligatoire
    console.log("📝 Mise à jour du schéma - categoryId obligatoire...");
    await sequelize.query(
      `
      ALTER TABLE products 
      MODIFY COLUMN categoryId INT NOT NULL
    `,
      { transaction }
    );

    // 2. Supprimer l'ancienne colonne category (optionnel - commenté pour sécurité)
    /*
    console.log("🗑️  Suppression de l'ancienne colonne category...");
    await sequelize.query(`
      ALTER TABLE products 
      DROP COLUMN category
    `, { transaction });
    */

    await transaction.commit();
    console.log("✅ Nettoyage terminé");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Erreur lors du nettoyage:", error);
    throw error;
  }
}

// Script pour créer les dossiers nécessaires
function createUploadDirectories() {
  const fs = require("fs");
  const path = require("path");

  const directories = ["uploads/seller-requests", "uploads/categories"];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Dossier créé: ${dir}`);
    }
  });
}

// Exécution du script si appelé directement
if (require.main === module) {
  (async () => {
    try {
      // Créer les dossiers nécessaires
      createUploadDirectories();

      // Exécuter la migration
      const result = await migrateCategoriesFromStringToTable();

      console.log("\n📋 Résultats de la migration:");
      console.log(JSON.stringify(result, null, 2));

      process.exit(0);
    } catch (error) {
      console.error("💥 Échec de la migration:", error);
      process.exit(1);
    }
  })();
}

module.exports = {
  migrateCategoriesFromStringToTable,
  cleanupAfterMigration,
  createUploadDirectories,
};
