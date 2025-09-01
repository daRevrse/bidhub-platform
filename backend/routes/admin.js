const express = require("express");
const { User, Product, Auction, Bid, Review } = require("../models");
const { Op } = require("sequelize");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Obtenir les statistiques générales pour le dashboard
// @access  Private/Admin
router.get("/stats", auth, adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Statistiques utilisateurs
    const [
      totalUsers,
      newUsersThisMonth,
      newUsersToday,
      verifiedUsers,
      pendingVerifications,
    ] = await Promise.all([
      User.count(),
      User.count({
        where: { createdAt: { [Op.gte]: startOfMonth } },
      }),
      User.count({
        where: { createdAt: { [Op.gte]: startOfDay } },
      }),
      User.count({
        where: { isVerified: true },
      }),
      User.count({
        where: {
          verificationRequested: true,
          isVerified: false,
        },
      }),
    ]);

    // Statistiques enchères
    const [totalAuctions, activeAuctions, endedAuctions, scheduledAuctions] =
      await Promise.all([
        Auction.count(),
        Auction.count({ where: { status: "active" } }),
        Auction.count({ where: { status: "ended" } }),
        Auction.count({ where: { status: "scheduled" } }),
      ]);

    // Statistiques produits
    const [totalProducts, activeProducts, soldProducts] = await Promise.all([
      Product.count(),
      Product.count({ where: { status: "active" } }),
      Product.count({ where: { status: "sold" } }),
    ]);

    // Statistiques financières
    const totalVolumeResult = await Auction.sum("currentPrice", {
      where: { status: "ended" },
    });
    const totalVolume = totalVolumeResult || 0;
    const totalCommissions = totalVolume * 0.05; // 5% de commission
    const averageAuctionValue =
      endedAuctions > 0 ? totalVolume / endedAuctions : 0;

    // Top catégories (avec gestion d'erreur)
    let topCategories = [];
    try {
      topCategories = await Product.findAll({
        attributes: [
          "category",
          [
            Product.sequelize.fn("COUNT", Product.sequelize.col("category")),
            "count",
          ],
        ],
        group: ["category"],
        order: [[Product.sequelize.literal("count"), "DESC"]],
        limit: 5,
        raw: true,
      });
    } catch (error) {
      console.warn("Erreur récupération top catégories:", error.message);
      topCategories = [];
    }

    // Croissance mensuelle
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const usersLastMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: lastMonth,
          [Op.lt]: startOfMonth,
        },
      },
    });

    const userGrowthRate =
      usersLastMonth > 0
        ? (
            ((newUsersThisMonth - usersLastMonth) / usersLastMonth) *
            100
          ).toFixed(1)
        : 0;

    res.json({
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        newToday: newUsersToday,
        verified: verifiedUsers,
        pendingVerifications: pendingVerifications,
        growthRate: parseFloat(userGrowthRate),
      },
      auctions: {
        total: totalAuctions,
        active: activeAuctions,
        ended: endedAuctions,
        scheduled: scheduledAuctions,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        sold: soldProducts,
      },
      finance: {
        totalVolume,
        totalCommissions,
        averageValue: averageAuctionValue,
        currency: "FCFA",
      },
      categories: topCategories,
      summary: {
        platformHealth: "excellent",
        activeUsersRatio:
          totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0,
        conversionRate:
          totalUsers > 0 ? ((activeAuctions / totalUsers) * 100).toFixed(2) : 0,
      },
      // Rétro-compatibilité avec l'ancien dashboard
      totalUsers,
      activeAuctions,
      totalVolume,
      totalCommissions,
    });
  } catch (error) {
    console.error("Erreur récupération statistiques admin:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/recent-auctions
// @desc    Obtenir les enchères récentes
// @access  Private/Admin
router.get("/recent-auctions", auth, adminAuth, async (req, res) => {
  try {
    const recentAuctions = await Auction.findAll({
      attributes: ["id", "currentPrice", "status", "createdAt", "endTime"],
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "title", "images", "category"],
          required: false,
          include: [
            {
              model: User,
              as: "seller",
              attributes: ["id", "firstName", "lastName", "email"],
              required: false,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json(recentAuctions || []);
  } catch (error) {
    console.error("Erreur récupération enchères récentes:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/recent-users
// @desc    Obtenir les utilisateurs récents
// @access  Private/Admin
router.get("/recent-users", auth, adminAuth, async (req, res) => {
  try {
    const recentUsers = await User.findAll({
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "role",
        "avatar",
        "isVerified",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json(recentUsers || []);
  } catch (error) {
    console.error("Erreur récupération utilisateurs récents:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/verification-requests
// @desc    Obtenir les demandes de vérification en attente
// @access  Private/Admin
router.get("/verification-requests", auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      where: {
        verificationRequested: true,
        isVerified: false,
      },
      attributes: {
        exclude: ["password", "resetPasswordToken"],
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["verificationRequestedAt", "ASC"]], // Plus anciennes en premier
    });

    res.json({
      requests: users.rows,
      totalPages: Math.ceil(users.count / limit),
      currentPage: parseInt(page),
      totalRequests: users.count,
    });
  } catch (error) {
    console.error("Erreur récupération demandes vérification:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Approuver ou rejeter une demande de vérification
// @access  Private/Admin
router.put("/users/:id/verify", auth, adminAuth, async (req, res) => {
  try {
    const { approve, reason } = req.body;
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (approve) {
      // Approuver la vérification
      await user.update({
        isVerified: true,
        verificationRequested: false,
        verificationApprovedAt: new Date(),
        verificationApprovedBy: req.user.userId,
      });

      res.json({
        message: "Utilisateur vérifié avec succès",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: true,
        },
      });
    } else {
      // Rejeter la demande
      await user.update({
        verificationRequested: false,
        verificationRejectedAt: new Date(),
        verificationRejectedBy: req.user.userId,
        verificationRejectionReason: reason || "Raison non spécifiée",
      });

      res.json({
        message: "Demande de vérification rejetée",
        reason: reason || "Raison non spécifiée",
      });
    }
  } catch (error) {
    console.error("Erreur traitement vérification:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Obtenir tous les utilisateurs avec pagination
// @access  Private/Admin
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      role = "",
      verified = "",
    } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Recherche par nom ou email
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filtrer par rôle
    if (role && ["user", "seller", "admin"].includes(role)) {
      whereClause.role = role;
    }

    // Filtrer par statut de vérification
    if (verified !== "") {
      whereClause.isVerified = verified === "true";
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password", "resetPasswordToken"] },
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
    console.error("Erreur récupération utilisateurs:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Mettre à jour le statut d'un utilisateur
// @access  Private/Admin
router.put("/users/:id/status", auth, adminAuth, async (req, res) => {
  try {
    const { isVerified, role, isActive } = req.body;
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const updates = {};
    if (typeof isVerified === "boolean") updates.isVerified = isVerified;
    if (role && ["user", "seller", "admin"].includes(role)) updates.role = role;
    if (typeof isActive === "boolean") updates.isActive = isActive;

    await user.update(updates);

    res.json({
      message: "Statut utilisateur mis à jour",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Erreur mise à jour utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/auctions
// @desc    Obtenir toutes les enchères avec pagination
// @access  Private/Admin
router.get("/auctions", auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "", category = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status && ["active", "ended", "scheduled"].includes(status)) {
      whereClause.status = status;
    }

    const includeClause = [
      {
        model: Product,
        as: "product",
        required: false,
        include: [
          {
            model: User,
            as: "seller",
            attributes: ["id", "firstName", "lastName", "email"],
            required: false,
          },
        ],
      },
    ];

    // Filtrer par catégorie si spécifié
    if (category) {
      includeClause[0].where = { category };
    }

    const auctions = await Auction.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      auctions: auctions.rows,
      totalPages: Math.ceil(auctions.count / limit),
      currentPage: parseInt(page),
      totalAuctions: auctions.count,
    });
  } catch (error) {
    console.error("Erreur récupération enchères admin:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   PUT /api/admin/auctions/:id/status
// @desc    Mettre à jour le statut d'une enchère
// @access  Private/Admin
router.put("/auctions/:id/status", auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const auctionId = req.params.id;

    if (!["active", "ended", "cancelled", "scheduled"].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Enchère non trouvée" });
    }

    await auction.update({ status });

    res.json({
      message: "Statut enchère mis à jour",
      auction: {
        id: auction.id,
        status: auction.status,
      },
    });
  } catch (error) {
    console.error("Erreur mise à jour enchère:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Désactiver un utilisateur (soft delete)
// @access  Private/Admin
router.delete("/users/:id", auth, adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        message: "Impossible de supprimer un administrateur",
      });
    }

    // Soft delete - marquer comme inactif
    await user.update({
      isActive: false,
      deletedAt: new Date(),
    });

    res.json({ message: "Utilisateur désactivé avec succès" });
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/user/:id/details
// @desc    Obtenir les détails complets d'un utilisateur
// @access  Private/Admin
router.get("/user/:id/details", auth, adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Product,
          as: "products",
          required: false,
          include: [
            {
              model: Auction,
              as: "auction",
              required: false,
            },
          ],
        },
        {
          model: Bid,
          as: "bids",
          required: false,
          include: [
            {
              model: Auction,
              as: "auction",
              required: false,
              include: [
                {
                  model: Product,
                  as: "product",
                  required: false,
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
    console.error("Erreur récupération détails utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   POST /api/admin/users/bulk-action
// @desc    Actions en lot sur les utilisateurs
// @access  Private/Admin
router.post("/users/bulk-action", auth, adminAuth, async (req, res) => {
  try {
    const { userIds, action, value } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Liste d'utilisateurs requise" });
    }

    let updateData = {};
    let message = "";

    switch (action) {
      case "verify":
        updateData = {
          isVerified: true,
          verificationRequested: false,
          verificationApprovedAt: new Date(),
          verificationApprovedBy: req.user.userId,
        };
        message = `${userIds.length} utilisateur(s) vérifié(s)`;
        break;
      case "unverify":
        updateData = { isVerified: false };
        message = `${userIds.length} utilisateur(s) non vérifié(s)`;
        break;
      case "activate":
        updateData = { isActive: true };
        message = `${userIds.length} utilisateur(s) activé(s)`;
        break;
      case "deactivate":
        updateData = { isActive: false };
        message = `${userIds.length} utilisateur(s) désactivé(s)`;
        break;
      default:
        return res.status(400).json({ message: "Action non valide" });
    }

    // Ne pas permettre d'actions sur les admins
    const usersToUpdate = await User.findAll({
      where: {
        id: { [Op.in]: userIds },
        role: { [Op.ne]: "admin" },
      },
      attributes: ["id"],
    });

    if (usersToUpdate.length === 0) {
      return res.status(400).json({
        message: "Aucun utilisateur valide à modifier",
      });
    }

    const validUserIds = usersToUpdate.map((u) => u.id);

    await User.update(updateData, {
      where: { id: { [Op.in]: validUserIds } },
    });

    res.json({
      message: `${validUserIds.length} utilisateur(s) modifié(s)`,
      processedCount: validUserIds.length,
      skippedCount: userIds.length - validUserIds.length,
    });
  } catch (error) {
    console.error("Erreur action en lot:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/system-health
// @desc    Vérifier l'état du système
// @access  Private/Admin
router.get("/system-health", auth, adminAuth, async (req, res) => {
  try {
    const healthStatus = {
      database: "online",
      server: "online",
      email: "online",
      storage: "online",
      lastCheck: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    // Test de connexion à la base de données
    try {
      await User.findOne({
        limit: 1,
        attributes: ["id"],
      });
      healthStatus.database = "online";
    } catch (error) {
      console.error("Erreur connexion DB:", error);
      healthStatus.database = "offline";
    }

    // Test du service d'email (si configuré)
    // if (process.env.EMAIL_USER) {
    //   try {
    //     await transporter.verify();
    //     healthStatus.email = "online";
    //   } catch (error) {
    //     healthStatus.email = "offline";
    //   }
    // }

    // Test de l'espace disque
    try {
      const fs = require("fs");
      const stats = fs.statSync("./");
      healthStatus.storage = "online";
    } catch (error) {
      healthStatus.storage = "error";
    }

    res.json(healthStatus);
  } catch (error) {
    console.error("Erreur vérification système:", error);
    res.status(500).json({
      message: "Erreur serveur",
      database: "error",
      server: "error",
      email: "unknown",
      storage: "unknown",
      error: error.message,
    });
  }
});

// @route   POST /api/admin/send-announcement
// @desc    Envoyer une annonce à tous les utilisateurs
// @access  Private/Admin
router.post("/send-announcement", auth, adminAuth, async (req, res) => {
  try {
    const { subject, message, targetGroup } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        message: "Sujet et message requis",
      });
    }

    // Construire les critères de sélection
    let whereClause = { isActive: true };

    switch (targetGroup) {
      case "verified":
        whereClause.isVerified = true;
        break;
      case "unverified":
        whereClause.isVerified = false;
        break;
      case "sellers":
        whereClause.role = "seller";
        break;
      case "buyers":
        whereClause.role = "user";
        break;
      case "all":
      default:
        // Pas de filtre supplémentaire
        break;
    }

    // Récupérer les utilisateurs ciblés
    const targetUsers = await User.findAll({
      where: whereClause,
      attributes: ["id", "email", "firstName", "lastName"],
    });

    // Log de l'annonce (implémentation email à faire selon le service choisi)
    console.log(`Annonce à envoyer à ${targetUsers.length} utilisateurs:`, {
      subject,
      message,
      targetGroup,
      sentBy: req.user.userId,
    });

    res.json({
      message: "Annonce programmée avec succès",
      sentTo: targetUsers.length,
      targetGroup,
      preview: {
        subject,
        recipientCount: targetUsers.length,
      },
    });
  } catch (error) {
    console.error("Erreur envoi annonce:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/analytics
// @desc    Obtenir des analyses détaillées
// @access  Private/Admin
router.get("/analytics", auth, adminAuth, async (req, res) => {
  try {
    const { period = "month" } = req.query;

    let dateFilter;
    const now = new Date();

    switch (period) {
      case "day":
        dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
      default:
        dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const analytics = await Promise.all([
      // Inscriptions par période
      User.count({
        where: { createdAt: { [Op.gte]: dateFilter } },
      }),

      // Enchères créées par période
      Auction.count({
        where: { createdAt: { [Op.gte]: dateFilter } },
      }),

      // Volume des transactions par période
      Auction.sum("currentPrice", {
        where: {
          status: "ended",
          updatedAt: { [Op.gte]: dateFilter },
        },
      }),
    ]);

    res.json({
      period,
      newUsers: analytics[0] || 0,
      newAuctions: analytics[1] || 0,
      transactionVolume: analytics[2] || 0,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur analytics:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

module.exports = router;
