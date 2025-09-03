// backend/routes/notifications.js - VERSION COMPLÈTE
const express = require("express");
const router = express.Router();
const { Notification, User } = require("../models");
const auth = require("../middleware/auth");
const NotificationService = require("../services/notificationService");
const { Op } = require("sequelize");

// @route   GET /api/notifications
// @desc    Obtenir les notifications de l'utilisateur
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, unreadOnly = false, type } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Construire les conditions de recherche
    const whereConditions = {
      userId: req.user.userId,
    };

    if (unreadOnly === "true") {
      whereConditions.isRead = false;
    }

    if (type) {
      whereConditions.type = type;
    }

    // Supprimer les notifications expirées avant la requête
    await Notification.destroy({
      where: {
        userId: req.user.userId,
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });

    // Récupérer les notifications
    const notifications = await Notification.findAndCountAll({
      where: whereConditions,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    // Compter les notifications non lues
    const unreadCount = await Notification.count({
      where: {
        userId: req.user.userId,
        isRead: false,
      },
    });

    res.json({
      notifications: notifications.rows,
      totalCount: notifications.count,
      unreadCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(notifications.count / parseInt(limit)),
      hasMore: parseInt(page) * parseInt(limit) < notifications.count,
    });
  } catch (error) {
    console.error("Erreur récupération notifications:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Obtenir le nombre de notifications non lues
// @access  Private
router.get("/unread-count", auth, async (req, res) => {
  try {
    const unreadCount = await NotificationService.getUnreadCount(
      req.user.userId
    );
    res.json({ unreadCount });
  } catch (error) {
    console.error("Erreur comptage notifications non lues:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/notifications/:id
// @desc    Obtenir une notification spécifique
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    res.json({ notification });
  } catch (error) {
    console.error("Erreur récupération notification:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Marquer une notification comme lue
// @access  Private
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    if (!notification.isRead) {
      await notification.update({
        isRead: true,
        readAt: new Date(),
      });

      // Notifier via Socket.io si disponible
      if (req.io) {
        req.io.to(`user_${req.user.userId}`).emit("notification_marked_read", {
          notificationId: notification.id,
          timestamp: new Date(),
        });
      }
    }

    res.json({
      message: "Notification marquée comme lue",
      notification,
    });
  } catch (error) {
    console.error("Erreur marquage notification:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Marquer toutes les notifications comme lues
// @access  Private
router.put("/mark-all-read", auth, async (req, res) => {
  try {
    const result = await Notification.update(
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        where: {
          userId: req.user.userId,
          isRead: false,
        },
      }
    );

    // Notifier via Socket.io si disponible
    if (req.io) {
      req.io
        .to(`user_${req.user.userId}`)
        .emit("all_notifications_marked_read", {
          timestamp: new Date(),
        });
    }

    res.json({
      message: "Toutes les notifications marquées comme lues",
      updatedCount: result[0],
    });
  } catch (error) {
    console.error("Erreur marquage toutes notifications:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Supprimer une notification
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    await notification.destroy();

    // Notifier via Socket.io si disponible
    if (req.io) {
      req.io.to(`user_${req.user.userId}`).emit("notification_deleted", {
        notificationId: req.params.id,
        timestamp: new Date(),
      });
    }

    res.json({ message: "Notification supprimée" });
  } catch (error) {
    console.error("Erreur suppression notification:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   DELETE /api/notifications
// @desc    Supprimer toutes les notifications lues
// @access  Private
router.delete("/", auth, async (req, res) => {
  try {
    const result = await Notification.destroy({
      where: {
        userId: req.user.userId,
        isRead: true,
      },
    });

    res.json({
      message: "Notifications lues supprimées",
      deletedCount: result,
    });
  } catch (error) {
    console.error("Erreur suppression notifications:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/notifications/types
// @desc    Obtenir les types de notifications disponibles
// @access  Private
router.get("/types", auth, async (req, res) => {
  try {
    const types = [
      { value: "bid_placed", label: "Nouvelle enchère placée", icon: "🔨" },
      { value: "auction_won", label: "Enchère gagnée", icon: "🏆" },
      { value: "auction_lost", label: "Enchère perdue", icon: "😔" },
      {
        value: "auction_ending",
        label: "Enchère se termine bientôt",
        icon: "⏰",
      },
      { value: "payment_received", label: "Paiement reçu", icon: "💰" },
      { value: "payment_required", label: "Paiement requis", icon: "💳" },
      { value: "message_received", label: "Nouveau message", icon: "💬" },
      { value: "review_received", label: "Nouvel avis reçu", icon: "⭐" },
      { value: "product_approved", label: "Produit approuvé", icon: "✅" },
      { value: "product_rejected", label: "Produit rejeté", icon: "❌" },
      { value: "system", label: "Notification système", icon: "🔔" },
    ];

    res.json({ types });
  } catch (error) {
    console.error("Erreur récupération types notifications:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/notifications/stats
// @desc    Obtenir les statistiques des notifications
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Statistiques générales
    const totalCount = await Notification.count({
      where: { userId },
    });

    const unreadCount = await Notification.count({
      where: { userId, isRead: false },
    });

    const readCount = totalCount - unreadCount;

    // Statistiques par type
    const typeStats = await Notification.findAll({
      where: { userId },
      attributes: [
        "type",
        [
          Notification.sequelize.fn("COUNT", Notification.sequelize.col("id")),
          "count",
        ],
        [
          Notification.sequelize.fn(
            "SUM",
            Notification.sequelize.literal(
              "CASE WHEN isRead = false THEN 1 ELSE 0 END"
            )
          ),
          "unreadCount",
        ],
      ],
      group: ["type"],
      raw: true,
    });

    // Statistiques par priorité
    const priorityStats = await Notification.findAll({
      where: { userId },
      attributes: [
        "priority",
        [
          Notification.sequelize.fn("COUNT", Notification.sequelize.col("id")),
          "count",
        ],
      ],
      group: ["priority"],
      raw: true,
    });

    // Activité récente (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Notification.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
      attributes: [
        [
          Notification.sequelize.fn(
            "DATE",
            Notification.sequelize.col("createdAt")
          ),
          "date",
        ],
        [
          Notification.sequelize.fn("COUNT", Notification.sequelize.col("id")),
          "count",
        ],
      ],
      group: [
        Notification.sequelize.fn(
          "DATE",
          Notification.sequelize.col("createdAt")
        ),
      ],
      order: [
        [
          Notification.sequelize.fn(
            "DATE",
            Notification.sequelize.col("createdAt")
          ),
          "DESC",
        ],
      ],
      raw: true,
    });

    res.json({
      overview: {
        total: totalCount,
        unread: unreadCount,
        read: readCount,
        readRate:
          totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0,
      },
      byType: typeStats,
      byPriority: priorityStats,
      recentActivity,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur récupération stats notifications:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   POST /api/notifications/test
// @desc    Créer une notification de test (développement uniquement)
// @access  Private
router.post("/test", auth, async (req, res) => {
  try {
    // Seulement en développement
    if (process.env.NODE_ENV === "production") {
      return res
        .status(403)
        .json({
          message: "Fonctionnalité disponible uniquement en développement",
        });
    }

    const { type = "system", title, message, priority = "medium" } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Titre et message requis" });
    }

    const notification = await NotificationService.createNotification({
      userId: req.user.userId,
      type,
      title,
      message,
      priority,
      data: { test: true, createdAt: new Date() },
    });

    res.status(201).json({
      message: "Notification de test créée",
      notification,
    });
  } catch (error) {
    console.error("Erreur création notification test:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   PUT /api/notifications/settings
// @desc    Mettre à jour les préférences de notifications
// @access  Private
router.put("/settings", auth, async (req, res) => {
  try {
    const {
      emailNotifications = true,
      pushNotifications = true,
      auctionNotifications = true,
      messageNotifications = true,
      paymentNotifications = true,
      marketingNotifications = false,
    } = req.body;

    // Mise à jour des préférences utilisateur
    const { User } = require("../models");
    await User.update(
      {
        emailNotifications,
        pushNotifications,
        auctionNotifications,
        messageNotifications,
        paymentNotifications,
        marketingNotifications,
      },
      {
        where: { id: req.user.userId },
      }
    );

    res.json({
      message: "Préférences de notifications mises à jour",
      settings: {
        emailNotifications,
        pushNotifications,
        auctionNotifications,
        messageNotifications,
        paymentNotifications,
        marketingNotifications,
      },
    });
  } catch (error) {
    console.error("Erreur mise à jour préférences notifications:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/notifications/settings
// @desc    Obtenir les préférences de notifications
// @access  Private
router.get("/settings", auth, async (req, res) => {
  try {
    const { User } = require("../models");
    const user = await User.findByPk(req.user.userId, {
      attributes: [
        "emailNotifications",
        "pushNotifications",
        "auctionNotifications",
        "messageNotifications",
        "paymentNotifications",
        "marketingNotifications",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({
      settings: {
        emailNotifications: user.emailNotifications ?? true,
        pushNotifications: user.pushNotifications ?? true,
        auctionNotifications: user.auctionNotifications ?? true,
        messageNotifications: user.messageNotifications ?? true,
        paymentNotifications: user.paymentNotifications ?? true,
        marketingNotifications: user.marketingNotifications ?? false,
      },
    });
  } catch (error) {
    console.error("Erreur récupération préférences notifications:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
