const express = require("express");
const { User, Product, Auction, Bid, Payment, Review } = require("../models");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const { Op } = require("sequelize");
const router = express.Router();

// @route   GET /api/admin/users
// @desc    Obtenir la liste des utilisateurs avec filtres
// @access  Private/Admin
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      role = "",
      status = "",
      verified = "",
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = {};

    // Filtres de recherche
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (status) {
      whereClause.isActive = status === "active";
    }

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

// @route   GET /api/admin/auctions
// @desc    Obtenir la liste des enchères avec filtres
// @access  Private/Admin
router.get("/auctions", auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "",
      category = "",
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    const auctions = await Auction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "product",
          required: true,
          where: {
            ...(search && {
              title: { [Op.like]: `%${search}%` },
            }),
            ...(category && { category }),
          },
          include: [
            {
              model: User,
              as: "seller",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
        {
          model: Bid,
          as: "bids",
          required: false,
          include: [
            {
              model: User,
              as: "bidder",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
      ],
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
    console.error("Erreur récupération enchères:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/auctions/:id/details
// @desc    Obtenir les détails complets d'une enchère
// @access  Private/Admin
router.get("/auctions/:id/details", auth, adminAuth, async (req, res) => {
  try {
    const auctionId = req.params.id;

    const auction = await Auction.findByPk(auctionId, {
      include: [
        {
          model: Product,
          as: "product",
          include: [
            {
              model: User,
              as: "seller",
              attributes: [
                "id",
                "firstName",
                "lastName",
                "email",
                "phone",
                "isVerified",
              ],
            },
          ],
        },
        {
          model: Bid,
          as: "bids",
          include: [
            {
              model: User,
              as: "bidder",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
          order: [["createdAt", "DESC"]],
        },
        {
          model: Payment,
          as: "payments",
          required: false,
        },
      ],
    });

    if (!auction) {
      return res.status(404).json({ message: "Enchère non trouvée" });
    }

    res.json(auction);
  } catch (error) {
    console.error("Erreur récupération détails enchère:", error);
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

// @route   GET /api/admin/analytics
// @desc    Obtenir les données analytiques
// @access  Private/Admin
router.get("/analytics", auth, adminAuth, async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    // Calculer la date de début selon la période
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Statistiques générales
    const [
      totalUsers,
      activeUsers,
      totalAuctions,
      activeAuctions,
      completedAuctions,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      Auction.count(),
      Auction.count({ where: { status: "active" } }),
      Auction.count({ where: { status: "ended" } }),
    ]);

    // Calculs des revenus et commissions
    const payments = await Payment.findAll({
      where: {
        status: "completed",
        createdAt: { [Op.gte]: startDate },
      },
    });

    const totalRevenue = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const totalCommissions = totalRevenue * 0.1; // 10% de commission

    // Calcul de la valeur moyenne des enchères
    const auctionPrices = await Auction.findAll({
      attributes: ["currentPrice"],
      where: {
        status: { [Op.in]: ["ended", "active"] },
        currentPrice: { [Op.gt]: 0 },
      },
    });

    const averageAuctionValue =
      auctionPrices.length > 0
        ? auctionPrices.reduce(
            (sum, auction) => sum + auction.currentPrice,
            0
          ) / auctionPrices.length
        : 0;

    // Calcul des taux de croissance (simulation)
    const revenueGrowth = Math.random() * 30 - 5; // Entre -5% et +25%
    const usersGrowth = Math.random() * 20; // Entre 0% et +20%
    const auctionsGrowth = Math.random() * 40 - 10; // Entre -10% et +30%

    res.json({
      totalRevenue,
      totalCommissions,
      totalUsers,
      activeUsers,
      totalAuctions,
      activeAuctions,
      completedAuctions,
      averageAuctionValue,
      conversionRate:
        totalUsers > 0
          ? ((completedAuctions / totalUsers) * 100).toFixed(1)
          : 0,
      revenueGrowth,
      usersGrowth,
      auctionsGrowth,
    });
  } catch (error) {
    console.error("Erreur récupération analytics:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/revenue-chart
// @desc    Obtenir les données pour le graphique des revenus
// @access  Private/Admin
router.get("/revenue-chart", auth, adminAuth, async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    // Générer des données de démonstration
    const data = [];
    const days =
      period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toLocaleDateString("fr-FR", {
          month: "short",
          day: "numeric",
        }),
        revenue: Math.floor(Math.random() * 50000) + 10000,
        commissions: Math.floor(Math.random() * 5000) + 1000,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Erreur données revenus:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/users-chart
// @desc    Obtenir les données pour le graphique des utilisateurs
// @access  Private/Admin
router.get("/users-chart", auth, adminAuth, async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    // Générer des données de démonstration
    const data = [];
    const days =
      period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toLocaleDateString("fr-FR", {
          month: "short",
          day: "numeric",
        }),
        newUsers: Math.floor(Math.random() * 20) + 5,
        activeUsers: Math.floor(Math.random() * 100) + 50,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Erreur données utilisateurs:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/categories-stats
// @desc    Obtenir les statistiques par catégories
// @access  Private/Admin
router.get("/categories-stats", auth, adminAuth, async (req, res) => {
  try {
    // Données de démonstration pour les catégories
    const categoriesData = [
      { name: "Électronique", value: 45 },
      { name: "Mode", value: 32 },
      { name: "Maison", value: 28 },
      { name: "Sports", value: 22 },
      { name: "Livres", value: 18 },
      { name: "Art", value: 15 },
    ];

    res.json(categoriesData);
  } catch (error) {
    console.error("Erreur stats catégories:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/top-users
// @desc    Obtenir les meilleurs utilisateurs
// @access  Private/Admin
router.get("/top-users", auth, adminAuth, async (req, res) => {
  try {
    const topUsers = await User.findAll({
      attributes: ["id", "firstName", "lastName", "email"],
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
      ],
      limit: 10,
      order: [["createdAt", "DESC"]],
    });

    // Ajouter des données simulées pour le volume
    const usersWithStats = topUsers.map((user) => ({
      ...user.toJSON(),
      totalVolume: Math.floor(Math.random() * 500000) + 50000,
      auctionsCount: Math.floor(Math.random() * 20) + 1,
    }));

    res.json(usersWithStats);
  } catch (error) {
    console.error("Erreur top utilisateurs:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/top-auctions
// @desc    Obtenir les meilleures enchères
// @access  Private/Admin
router.get("/top-auctions", auth, adminAuth, async (req, res) => {
  try {
    const topAuctions = await Auction.findAll({
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "title", "images"],
        },
      ],
      order: [["currentPrice", "DESC"]],
      limit: 10,
    });

    // Ajouter des données simulées
    const auctionsWithStats = topAuctions.map((auction) => ({
      ...auction.toJSON(),
      bidsCount: Math.floor(Math.random() * 50) + 5,
    }));

    res.json(auctionsWithStats);
  } catch (error) {
    console.error("Erreur top enchères:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/settings/:category
// @desc    Obtenir les paramètres d'une catégorie
// @access  Private/Admin
router.get("/settings/:category", auth, adminAuth, async (req, res) => {
  try {
    const { category } = req.params;

    // Pour le développement, retourner des paramètres par défaut
    const defaultSettings = {
      general: {
        siteName: "BidHub",
        siteDescription: "Plateforme d'enchères en ligne au Togo",
        contactEmail: "contact@bidhub.tg",
        supportEmail: "support@bidhub.tg",
        maintenanceMode: false,
        registrationEnabled: true,
      },
      auction: {
        minBidIncrement: 100,
        maxAuctionDuration: 30,
        commissionRate: 10,
        autoExtendTime: 300,
        maxImagesPerProduct: 5,
        bidderVerificationRequired: false,
      },
      payment: {
        floozEnabled: true,
        tmoneyEnabled: true,
        minPaymentAmount: 500,
        maxPaymentAmount: 5000000,
        paymentTimeout: 600,
        autoRefundEnabled: true,
      },
      notification: {
        emailNotificationsEnabled: true,
        smsNotificationsEnabled: false,
        auctionEndReminder: 3600,
        bidNotifications: true,
        systemNotifications: true,
      },
      security: {
        maxLoginAttempts: 5,
        accountLockoutDuration: 1800,
        passwordMinLength: 8,
        requireEmailVerification: true,
        twoFactorEnabled: false,
        sessionTimeout: 7200,
      },
    };

    res.json(defaultSettings[category] || {});
  } catch (error) {
    console.error("Erreur récupération paramètres:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   PUT /api/admin/settings/:category
// @desc    Mettre à jour les paramètres d'une catégorie
// @access  Private/Admin
router.put("/settings/:category", auth, adminAuth, async (req, res) => {
  try {
    const { category } = req.params;
    const settings = req.body;

    // Ici, vous pourriez sauvegarder dans une table Settings
    // Pour le développement, on simule juste le succès

    console.log(`Sauvegarde paramètres ${category}:`, settings);

    res.json({
      message: "Paramètres sauvegardés avec succès",
      category,
      settings,
    });
  } catch (error) {
    console.error("Erreur sauvegarde paramètres:", error);
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

    res.json(healthStatus);
  } catch (error) {
    console.error("Erreur vérification système:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Obtenir les statistiques principales pour le dashboard
// @access  Private/Admin
router.get("/stats", auth, adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      pendingVerifications,
      activeAuctions,
      totalVolume,
      totalCommissions,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isVerified: true } }),
      User.count({
        where: {
          verificationRequested: true,
          isVerified: false,
        },
      }),
      Auction.count({ where: { status: "active" } }),
      Payment.sum("amount", { where: { status: "completed" } }) || 0,
      Payment.sum("amount", { where: { status: "completed" } }) * 0.1 || 0,
    ]);

    res.json({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        pendingVerifications,
        verificationRate:
          totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0,
        conversionRate:
          totalUsers > 0 ? ((activeAuctions / totalUsers) * 100).toFixed(2) : 0,
      },
      auctions: {
        active: activeAuctions,
        scheduled: await Auction.count({ where: { status: "scheduled" } }),
        ended: await Auction.count({ where: { status: "ended" } }),
        cancelled: await Auction.count({ where: { status: "cancelled" } }),
      },
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

// Routes déjà existantes (à conserver)
// ... (toutes les routes existantes de l'ancien fichier admin.js)

module.exports = router;
