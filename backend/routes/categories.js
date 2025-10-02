// backend/routes/categories.js
const express = require("express");
const { Category, Product, Auction, sequelize } = require("../models");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const { Op } = require("sequelize");

const router = express.Router();

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

// @route   GET /api/categories
// @desc    Obtenir toutes les catégories
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { includeInactive = false, withStats = false, parentId } = req.query;

    const whereClause = {};
    if (!includeInactive) {
      whereClause.isActive = true;
    }
    if (parentId !== undefined) {
      whereClause.parentId = parentId === "null" ? null : parentId;
    }

    let categories = await Category.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "children",
          where: { isActive: true },
          required: false,
          order: [
            ["sortOrder", "ASC"],
            ["name", "ASC"],
          ],
        },
        {
          model: Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
          required: false,
        },
      ],
      order: [
        ["sortOrder", "ASC"],
        ["name", "ASC"],
      ],
    });

    // Ajouter les statistiques si demandées
    if (withStats === "true") {
      categories = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.count({
            where: { categoryId: category.id },
          });

          const activeAuctionsCount = await Auction.count({
            include: [
              {
                model: Product,
                as: "product",
                where: { categoryId: category.id },
                required: true,
              },
            ],
            where: { status: "active" },
          });

          return {
            ...category.toJSON(),
            stats: {
              productCount,
              activeAuctionsCount,
            },
          };
        })
      );
    }

    res.json({ categories });
  } catch (error) {
    console.error("Erreur récupération catégories:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/categories/tree
// @desc    Obtenir l'arbre complet des catégories
// @access  Public
router.get("/tree", async (req, res) => {
  try {
    const { includeInactive = false } = req.query;

    const whereClause = {};
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    // Récupérer toutes les catégories
    const allCategories = await Category.findAll({
      where: whereClause,
      order: [
        ["sortOrder", "ASC"],
        ["name", "ASC"],
      ],
    });

    // Construire l'arbre hiérarchique
    const buildTree = (categories, parentId = null) => {
      return categories
        .filter((cat) => cat.parentId === parentId)
        .map((cat) => ({
          ...cat.toJSON(),
          children: buildTree(categories, cat.id),
        }));
    };

    const categoryTree = buildTree(allCategories);

    res.json({ categoryTree });
  } catch (error) {
    console.error("Erreur arbre catégories:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/categories/popular
// @desc    Obtenir les catégories les plus populaires
// @access  Public
router.get("/popular", async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const popularCategories = await Category.findAll({
      attributes: [
        "id",
        "name",
        "slug",
        "icon",
        "color",
        [sequelize.fn("COUNT", sequelize.col("products.id")), "productCount"],
      ],
      include: [
        {
          model: Product,
          as: "products",
          attributes: [],
          include: [
            {
              model: Auction,
              as: "auction",
              attributes: [],
              where: { status: "active" },
              required: true,
            },
          ],
          required: false,
        },
      ],
      where: { isActive: true },
      group: ["Category.id"],
      order: [[sequelize.fn("COUNT", sequelize.col("products.id")), "DESC"]],
      limit: parseInt(limit),
      subQuery: false,
    });

    res.json({ categories: popularCategories });
  } catch (error) {
    console.error("Erreur catégories populaires:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/categories/:id
// @desc    Obtenir une catégorie par ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: "children",
          where: { isActive: true },
          required: false,
        },
        {
          model: Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    // Ajouter les statistiques
    const [productCount, activeAuctionsCount] = await Promise.all([
      Product.count({ where: { categoryId: category.id } }),
      Auction.count({
        include: [
          {
            model: Product,
            as: "product",
            where: { categoryId: category.id },
            required: true,
          },
        ],
        where: { status: "active" },
      }),
    ]);

    res.json({
      category: {
        ...category.toJSON(),
        stats: {
          productCount,
          activeAuctionsCount,
        },
      },
    });
  } catch (error) {
    console.error("Erreur récupération catégorie:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   POST /api/categories
// @desc    Créer une nouvelle catégorie
// @access  Private/Admin
router.post("/", auth, adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      icon,
      color,
      parentId,
      isActive = true,
      sortOrder = 0,
      metadata,
    } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        message: "Le nom de la catégorie est requis",
      });
    }

    // Générer le slug
    let slug = generateSlug(name);

    // Vérifier l'unicité du slug
    let counter = 1;
    let originalSlug = slug;
    while (await Category.findOne({ where: { slug } })) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    // Vérifier que la catégorie parent existe
    if (parentId) {
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        return res.status(400).json({
          message: "Catégorie parent non trouvée",
        });
      }
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description,
      icon,
      color: color || "#3B82F6",
      parentId: parentId || null,
      isActive,
      sortOrder,
      metadata: metadata ? JSON.parse(metadata) : null,
      createdBy: req.user.userId,
      updatedBy: req.user.userId,
    });

    res.status(201).json({
      message: "Catégorie créée avec succès",
      category,
    });
  } catch (error) {
    console.error("Erreur création catégorie:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400).json({
        message: "Une catégorie avec ce nom existe déjà",
      });
    } else {
      res.status(500).json({
        message: "Erreur lors de la création de la catégorie",
      });
    }
  }
});

// @route   PUT /api/categories/:id
// @desc    Mettre à jour une catégorie
// @access  Private/Admin
router.put("/:id", auth, adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      icon,
      color,
      parentId,
      isActive,
      sortOrder,
      metadata,
    } = req.body;

    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    const updates = { updatedBy: req.user.userId };

    if (name && name.trim() !== category.name) {
      updates.name = name.trim();
      updates.slug = generateSlug(name);

      // Vérifier l'unicité du nouveau slug
      let counter = 1;
      let originalSlug = updates.slug;
      while (
        await Category.findOne({
          where: {
            slug: updates.slug,
            id: { [Op.ne]: category.id },
          },
        })
      ) {
        updates.slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }

    if (description !== undefined) updates.description = description;
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;
    if (isActive !== undefined) updates.isActive = isActive;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    if (metadata !== undefined) {
      updates.metadata = metadata ? JSON.parse(metadata) : null;
    }

    // Gestion du parent
    if (parentId !== undefined) {
      if (parentId === null || parentId === "") {
        updates.parentId = null;
      } else {
        // Vérifier que ce n'est pas une boucle
        if (parseInt(parentId) === category.id) {
          return res.status(400).json({
            message: "Une catégorie ne peut pas être son propre parent",
          });
        }

        // Vérifier que la catégorie parent existe
        const parentCategory = await Category.findByPk(parentId);
        if (!parentCategory) {
          return res.status(400).json({
            message: "Catégorie parent non trouvée",
          });
        }

        updates.parentId = parentId;
      }
    }

    await category.update(updates);

    const updatedCategory = await Category.findByPk(category.id, {
      include: [
        {
          model: Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
        {
          model: Category,
          as: "children",
          where: { isActive: true },
          required: false,
        },
      ],
    });

    res.json({
      message: "Catégorie mise à jour avec succès",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Erreur mise à jour catégorie:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Supprimer une catégorie
// @access  Private/Admin
router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    // Vérifier s'il y a des produits dans cette catégorie
    const productCount = await Product.count({
      where: { categoryId: category.id },
    });

    if (productCount > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer: ${productCount} produit(s) utilisent cette catégorie`,
      });
    }

    // Vérifier s'il y a des sous-catégories
    const childrenCount = await Category.count({
      where: { parentId: category.id },
    });

    if (childrenCount > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer: cette catégorie a ${childrenCount} sous-catégorie(s)`,
      });
    }

    await category.destroy();

    res.json({ message: "Catégorie supprimée avec succès" });
  } catch (error) {
    console.error("Erreur suppression catégorie:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   PUT /api/categories/:id/toggle-status
// @desc    Activer/désactiver une catégorie
// @access  Private/Admin
router.put("/:id/toggle-status", auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    await category.update({
      isActive: !category.isActive,
      updatedBy: req.user.userId,
    });

    res.json({
      message: `Catégorie ${category.isActive ? "activée" : "désactivée"}`,
      category,
    });
  } catch (error) {
    console.error("Erreur changement statut catégorie:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   PUT /api/categories/reorder
// @desc    Réorganiser l'ordre des catégories
// @access  Private/Admin
router.put("/reorder", auth, adminAuth, async (req, res) => {
  try {
    const { categories } = req.body; // [{id, sortOrder}, ...]

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        message: "Format de données invalide",
      });
    }

    // Mettre à jour l'ordre de chaque catégorie
    await Promise.all(
      categories.map((cat) =>
        Category.update(
          { sortOrder: cat.sortOrder, updatedBy: req.user.userId },
          { where: { id: cat.id } }
        )
      )
    );

    res.json({ message: "Ordre des catégories mis à jour" });
  } catch (error) {
    console.error("Erreur réorganisation catégories:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
