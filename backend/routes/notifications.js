// backend/routes/notifications.js
const express = require("express");
const router = express.Router();
const { Notification, User } = require("../models");
const auth = require("../middleware/auth");
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

    // Supprimer les notifications expirées
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
    });
  } catch (error) {
    console.error("Erreur récupération notifications:", error);
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

    await notification.update({
      isRead: true,
      readAt: new Date(),
    });

    res.json({ message: "Notification marquée comme lue" });
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
    await Notification.update(
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

    res.json({ message: "Toutes les notifications marquées comme lues" });
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
    res.json({ message: "Notification supprimée" });
  } catch (error) {
    console.error("Erreur suppression notification:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   DELETE /api/notifications/clear-all
// @desc    Supprimer toutes les notifications lues
// @access  Private
router.delete("/clear-all", auth, async (req, res) => {
  try {
    await Notification.destroy({
      where: {
        userId: req.user.userId,
        isRead: true,
      },
    });

    res.json({ message: "Notifications lues supprimées" });
  } catch (error) {
    console.error("Erreur suppression toutes notifications:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/notifications/stats
// @desc    Obtenir les statistiques des notifications
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const stats = await Notification.findAll({
      where: { userId: req.user.userId },
      attributes: ["type", [Notification.sequelize.fn("COUNT", "*"), "count"]],
      group: ["type"],
      raw: true,
    });

    const unreadCount = await Notification.count({
      where: {
        userId: req.user.userId,
        isRead: false,
      },
    });

    const totalCount = await Notification.count({
      where: { userId: req.user.userId },
    });

    res.json({
      byType: stats,
      unreadCount,
      totalCount,
    });
  } catch (error) {
    console.error("Erreur stats notifications:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
