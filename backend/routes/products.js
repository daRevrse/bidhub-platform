const express = require("express");
const { Product, User, Auction } = require("../models");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Seules les images sont autorisées"));
    }
  },
});

// @route   GET /api/products
// @desc    Obtenir tous les produits
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { category, status = "active", page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { status };
    if (category) {
      whereClause.category = category;
    }

    const products = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: Auction,
          as: "auction",
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      products: products.rows,
      totalPages: Math.ceil(products.count / limit),
      currentPage: parseInt(page),
      totalProducts: products.count,
    });
  } catch (error) {
    console.error("Erreur récupération produits:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/products/:id
// @desc    Obtenir un produit par ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "firstName", "lastName", "avatar"],
        },
        {
          model: Auction,
          as: "auction",
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.json(product);
  } catch (error) {
    console.error("Erreur récupération produit:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   POST /api/products
// @desc    Créer un nouveau produit
// @access  Private
router.post("/", auth, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, category, condition } = req.body;
    const images = req.files ? req.files.map((file) => file.filename) : [];

    const product = await Product.create({
      title,
      description,
      category,
      condition,
      images,
      sellerId: req.user.userId,
    });

    res.status(201).json({
      message: "Produit créé avec succès",
      product,
    });
  } catch (error) {
    console.error("Erreur création produit:", error);
    res.status(500).json({ message: "Erreur lors de la création du produit" });
  }
});

module.exports = router;
