const express = require("express");
const { User, Product, Auction, Bid, Review } = require("../models");
const auth = require("../middleware/auth");
const { Op } = require("sequelize");

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Obtenir le profil de l'utilisateur connecté
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Product,
          as: "products",
          include: [
            {
              model: Auction,
              as: "auction",
            },
          ],
        },
        {
          model: Bid,
          as: "bids",
          include: [
            {
              model: Auction,
              as: "auction",
              include: [
                {
                  model: Product,
                  as: "product",
                },
              ],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (error) {
    console.error("Erreur récupération profil:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/users/public/:userId
// @desc    Obtenir le profil public d'un utilisateur
// @access  Public
router.get("/public/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "firstName",
        "lastName",
        "role",
        "avatar",
        "bio",
        "city",
        "country",
        "createdAt",
        "isVerified",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Récupérer les produits actifs séparément pour éviter les erreurs d'association
    let products = [];
    try {
      const productsResult = await Product.findAll({
        where: { sellerId: userId, status: "active" },
        limit: 6,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: Auction,
            as: "auction",
            attributes: ["id", "currentPrice", "status", "endDate"],
            required: false,
          },
        ],
      });
      products = productsResult || [];
    } catch (productError) {
      console.warn("Erreur récupération produits:", productError);
      // Continue sans les produits si erreur
    }

    // Calculer les statistiques de l'utilisateur
    const stats = await Promise.all([
      // Nombre total de produits vendus
      Product.count({
        where: { sellerId: userId, status: "sold" },
      }).catch(() => 0),

      // Nombre de produits actifs
      Product.count({
        where: { sellerId: userId, status: "active" },
      }).catch(() => 0),

      // Nombre d'enchères remportées (approximatif)
      Bid.count({
        where: { userId: userId },
      }).catch(() => 0),

      // Note moyenne des avis reçus (si le modèle Review existe)
      (async () => {
        try {
          const reviewResult = await Review.findOne({
            attributes: [
              [
                Review.sequelize.fn("AVG", Review.sequelize.col("rating")),
                "averageRating",
              ],
              [
                Review.sequelize.fn("COUNT", Review.sequelize.col("id")),
                "totalReviews",
              ],
            ],
            where: { revieweeId: userId },
            raw: true,
          });
          return reviewResult;
        } catch (error) {
          return { averageRating: 0, totalReviews: 0 };
        }
      })(),
    ]);

    const userProfile = {
      ...user.toJSON(),
      products: products,
      stats: {
        productsSold: stats[0] || 0,
        productsActive: stats[1] || 0,
        auctionsParticipated: stats[2] || 0,
        averageRating: parseFloat(stats[3]?.averageRating || 0).toFixed(1),
        totalReviews: parseInt(stats[3]?.totalReviews || 0),
      },
    };

    res.json(userProfile);
  } catch (error) {
    console.error("Erreur récupération profil public:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Mettre à jour le profil utilisateur
// @access  Private
router.put("/profile", auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, city, country } = req.body;

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Validation des données
    const updates = {};
    if (firstName) updates.firstName = firstName.trim();
    if (lastName) updates.lastName = lastName.trim();
    if (phone) updates.phone = phone.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (city) updates.city = city.trim();
    if (country) updates.country = country.trim();

    await user.update(updates);

    res.json({
      message: "Profil mis à jour avec succès",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        bio: user.bio,
        city: user.city,
        country: user.country,
      },
    });
  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
});

// @route   GET /api/users/search
// @desc    Rechercher des utilisateurs publics
// @access  Public
router.get("/search", async (req, res) => {
  try {
    const { q = "", role = "", page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      isActive: true,
    };

    // Recherche par nom
    if (q) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${q}%` } },
        { lastName: { [Op.iLike]: `%${q}%` } },
      ];
    }

    // Filtre par rôle
    if (role && ["user", "seller"].includes(role)) {
      whereClause.role = role;
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: [
        "id",
        "firstName",
        "lastName",
        "role",
        "avatar",
        "city",
        "country",
        "createdAt",
        "isVerified",
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      users: users.rows,
      totalPages: Math.ceil(users.count / limit),
      currentPage: parseInt(page),
      totalUsers: users.count,
    });
  } catch (error) {
    console.error("Erreur recherche utilisateurs:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/users/:userId/reviews
// @desc    Obtenir les avis d'un utilisateur
// @access  Public
router.get("/:userId/reviews", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = await Review.findAndCountAll({
      where: { revieweeId: userId },
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "firstName", "lastName", "avatar"],
        },
        {
          model: Auction,
          as: "auction",
          attributes: ["id"],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "title", "images"],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      reviews: reviews.rows,
      totalPages: Math.ceil(reviews.count / limit),
      currentPage: parseInt(page),
      totalReviews: reviews.count,
    });
  } catch (error) {
    console.error("Erreur récupération avis:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload de l'avatar utilisateur
// @access  Private
router.post("/upload-avatar", auth, async (req, res) => {
  try {
    const multer = require("multer");
    const path = require("path");
    const fs = require("fs");

    // Configuration de multer
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "../uploads/avatars");
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
          null,
          `avatar-${req.user.userId}-${uniqueSuffix}${path.extname(
            file.originalname
          )}`
        );
      },
    });

    const fileFilter = (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Seules les images sont autorisées"), false);
      }
    };

    const upload = multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }).single("avatar");

    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier fourni" });
      }

      try {
        const user = await User.findByPk(req.user.userId);
        if (!user) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Supprimer l'ancien avatar s'il existe
        if (user.avatar) {
          const oldAvatarPath = path.join(
            __dirname,
            "../uploads/avatars",
            path.basename(user.avatar)
          );
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        }

        // Mettre à jour l'URL de l'avatar
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        await user.update({ avatar: avatarUrl });

        res.json({
          message: "Avatar mis à jour avec succès",
          avatarUrl: avatarUrl,
        });
      } catch (error) {
        console.error("Erreur sauvegarde avatar:", error);
        res.status(500).json({ message: "Erreur lors de la sauvegarde" });
      }
    });
  } catch (error) {
    console.error("Erreur upload avatar:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   DELETE /api/users/remove-avatar
// @desc    Supprimer l'avatar utilisateur
// @access  Private
router.delete("/remove-avatar", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Supprimer le fichier physique
    if (user.avatar) {
      const fs = require("fs");
      const path = require("path");
      const avatarPath = path.join(
        __dirname,
        "../uploads/avatars",
        path.basename(user.avatar)
      );
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Mettre à jour la base de données
    await user.update({ avatar: null });

    res.json({ message: "Avatar supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression avatar:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   POST /api/users/request-verification
// @desc    Demander la vérification du compte
// @access  Private
router.post("/request-verification", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Votre compte est déjà vérifié" });
    }

    // Vérifier si une demande n'est pas déjà en cours
    if (user.verificationRequested) {
      return res.status(400).json({
        message: "Une demande de vérification est déjà en cours",
      });
    }

    // Marquer la demande comme en cours
    await user.update({
      verificationRequested: true,
      verificationRequestedAt: new Date(),
    });

    // Envoyer un email de notification aux admins (optionnel)
    // ... code pour envoyer l'email ...

    res.json({
      message: "Demande de vérification envoyée avec succès",
    });
  } catch (error) {
    console.error("Erreur demande vérification:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
