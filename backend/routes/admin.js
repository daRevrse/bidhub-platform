// backend/routes/admin.js - Routes pour l'administration
const express = require("express");
const { User, Product, Auction, Bid } = require("../models");
const { Op } = require("sequelize");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Obtenir les statistiques générales
// @access  Private/Admin
router.get("/stats", auth, adminAuth, async (req, res) => {
  try {
    // Statistiques utilisateurs
    const totalUsers = await User.count();
    const newUsersThisMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ),
        },
      },
    });

    // Statistiques enchères
    const totalAuctions = await Auction.count();
    const activeAuctions = await Auction.count({
      where: { status: "active" },
    });
    const endedAuctions = await Auction.count({
      where: { status: "ended" },
    });

    // Statistiques financières
    const totalVolumeResult = await Auction.sum("currentPrice", {
      where: { status: "ended" },
    });
    const totalVolume = totalVolumeResult || 0;
    const totalCommissions = totalVolume * 0.05; // 5% de commission

    // Statistiques produits
    const totalProducts = await Product.count();
    const activeProducts = await Product.count({
      where: { status: "active" },
    });

    // Top catégories
    const topCategories = await Product.findAll({
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

    res.json({
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
      },
      auctions: {
        total: totalAuctions,
        active: activeAuctions,
        ended: endedAuctions,
      },
      finance: {
        totalVolume,
        totalCommissions,
        averageValue: totalAuctions > 0 ? totalVolume / endedAuctions : 0,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
      },
      topCategories,
      // Données compatibles avec le frontend existant
      totalUsers,
      activeAuctions,
      totalVolume,
      totalCommissions,
    });
  } catch (error) {
    console.error("Erreur récupération stats admin:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/admin/recent-auctions
// @desc    Obtenir les enchères récentes
// @access  Private/Admin
router.get("/recent-auctions", auth, adminAuth, async (req, res) => {
  try {
    const recentAuctions = await Auction.findAll({
      include: [
        {
          model: Product,
          as: "product",
          include: [
            {
              model: User,
              as: "seller",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json(recentAuctions);
  } catch (error) {
    console.error("Erreur récupération enchères récentes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/admin/recent-users
// @desc    Obtenir les utilisateurs récents
// @access  Private/Admin
router.get("/recent-users", auth, adminAuth, async (req, res) => {
  try {
    const recentUsers = await User.findAll({
      attributes: ["id", "firstName", "lastName", "email", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json(recentUsers);
  } catch (error) {
    console.error("Erreur récupération utilisateurs récents:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/admin/users
// @desc    Obtenir tous les utilisateurs avec pagination
// @access  Private/Admin
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", role = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Recherche par nom ou email
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filtrer par rôle
    if (role) {
      whereClause.role = role;
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
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
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Mettre à jour le statut d'un utilisateur
// @access  Private/Admin
router.put("/users/:id/status", auth, adminAuth, async (req, res) => {
  try {
    const { isVerified, role } = req.body;
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const updates = {};
    if (typeof isVerified === "boolean") updates.isVerified = isVerified;
    if (role && ["user", "seller", "admin"].includes(role)) updates.role = role;

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
      },
    });
  } catch (error) {
    console.error("Erreur mise à jour statut utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
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
    if (status) whereClause.status = status;

    const includeClause = [
      {
        model: Product,
        as: "product",
        include: [
          {
            model: User,
            as: "seller",
            attributes: ["id", "firstName", "lastName"],
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
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   PUT /api/admin/auctions/:id/status
// @desc    Mettre à jour le statut d'une enchère
// @access  Private/Admin
router.put("/auctions/:id/status", auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const auctionId = req.params.id;

    if (!["scheduled", "active", "ended", "cancelled"].includes(status)) {
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
    console.error("Erreur mise à jour statut enchère:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/admin/reports/sales
// @desc    Rapport des ventes
// @access  Private/Admin
router.get("/reports/sales", auth, adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = { status: "ended" };
    if (startDate && endDate) {
      whereClause.endTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const salesData = await Auction.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["title", "category"],
        },
        {
          model: Bid,
          as: "bids",
          order: [["amount", "DESC"]],
          limit: 1,
          include: [
            {
              model: User,
              as: "bidder",
              attributes: ["firstName", "lastName"],
            },
          ],
        },
      ],
      order: [["endTime", "DESC"]],
    });

    const totalSales = salesData.reduce(
      (sum, auction) => sum + parseFloat(auction.currentPrice),
      0
    );
    const totalCommissions = totalSales * 0.05;

    res.json({
      sales: salesData,
      summary: {
        totalSales,
        totalCommissions,
        salesCount: salesData.length,
        averageSale: salesData.length > 0 ? totalSales / salesData.length : 0,
      },
    });
  } catch (error) {
    console.error("Erreur génération rapport ventes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
