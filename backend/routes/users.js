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
      include: [
        {
          model: Product,
          as: "products",
          where: { status: "active" },
          required: false,
          limit: 6,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: Auction,
              as: "auction",
              attributes: ["id", "currentPrice", "status", "endDate"],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Calculer les statistiques de l'utilisateur
    const stats = await Promise.all([
      // Nombre total de produits vendus
      Product.count({
        where: { sellerId: userId, status: "sold" },
      }),

      // Nombre de produits actifs
      Product.count({
        where: { sellerId: userId, status: "active" },
      }),

      // Nombre d'enchères remportées (en tant qu'acheteur)
      Auction.count({
        include: [
          {
            model: Bid,
            as: "bids",
            where: { userId: userId },
            attributes: [],
          },
        ],
        where: {
          status: "ended",
          winnerId: userId,
        },
      }),

      // Note moyenne des avis reçus
      Review.findOne({
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
      }),
    ]);

    const userProfile = {
      ...user.toJSON(),
      stats: {
        productsSold: stats[0],
        productsActive: stats[1],
        auctionsWon: stats[2],
        averageRating: parseFloat(stats[3]?.averageRating || 0).toFixed(1),
        totalReviews: parseInt(stats[3]?.totalReviews || 0),
      },
    };

    res.json(userProfile);
  } catch (error) {
    console.error("Erreur récupération profil public:", error);
    res.status(500).json({ message: "Erreur serveur" });
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
    // Cette route nécessiterait l'ajout de multer pour la gestion des fichiers
    // Pour l'instant, on retourne une erreur appropriée
    res.status(501).json({
      message: "Upload d'avatar non implémenté. Veuillez configurer multer.",
    });
  } catch (error) {
    console.error("Erreur upload avatar:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
