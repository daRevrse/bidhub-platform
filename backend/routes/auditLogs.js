const express = require("express");
const { AuditLog, User } = require("../models");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const AuditService = require("../services/auditService");
const { Op } = require("sequelize");
const router = express.Router();

// @route   GET /api/admin/audit-logs
// @desc    Obtenir les logs d'audit avec filtres
// @access  Private/Admin
router.get("/", auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId = null,
      action = null,
      entity = null,
      severity = null,
      success = null,
      startDate = null,
      endDate = null,
    } = req.query;

    const result = await AuditService.getLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      userId,
      action,
      entity,
      severity,
      success: success !== null ? success === "true" : null,
      startDate,
      endDate,
    });

    res.json(result);
  } catch (error) {
    console.error("Erreur récupération logs audit:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/audit-logs/stats
// @desc    Obtenir les statistiques des logs d'audit
// @access  Private/Admin
router.get("/stats", auth, adminAuth, async (req, res) => {
  try {
    const stats = await AuditService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Erreur récupération stats audit:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/audit-logs/:id
// @desc    Obtenir les détails d'un log spécifique
// @access  Private/Admin
router.get("/:id", auth, adminAuth, async (req, res) => {
  try {
    const logId = req.params.id;

    const auditLog = await AuditLog.findByPk(logId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
          required: false,
        },
      ],
    });

    if (!auditLog) {
      return res.status(404).json({ message: "Log d'audit non trouvé" });
    }

    res.json(auditLog);
  } catch (error) {
    console.error("Erreur récupération détails log audit:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/audit-logs/user/:userId
// @desc    Obtenir les logs d'un utilisateur spécifique
// @access  Private/Admin
router.get("/user/:userId", auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await AuditService.getLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      userId: parseInt(userId),
    });

    res.json(result);
  } catch (error) {
    console.error("Erreur récupération logs utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/audit-logs/entity/:entity/:entityId
// @desc    Obtenir les logs d'une entité spécifique
// @access  Private/Admin
router.get("/entity/:entity/:entityId", auth, adminAuth, async (req, res) => {
  try {
    const { entity, entityId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const logs = await AuditLog.findAndCountAll({
      where: {
        entity,
        entityId: parseInt(entityId),
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      logs: logs.rows,
      totalPages: Math.ceil(logs.count / limit),
      currentPage: parseInt(page),
      totalLogs: logs.count,
    });
  } catch (error) {
    console.error("Erreur récupération logs entité:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/audit-logs/actions/summary
// @desc    Obtenir un résumé des actions par type
// @access  Private/Admin
router.get("/actions/summary", auth, adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let whereClause = {};

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const actionsSummary = await AuditLog.findAll({
      where: whereClause,
      attributes: [
        "action",
        [AuditLog.sequelize.fn("COUNT", AuditLog.sequelize.col("id")), "count"],
        [
          AuditLog.sequelize.fn(
            "COUNT",
            AuditLog.sequelize.literal("CASE WHEN success = false THEN 1 END")
          ),
          "failures",
        ],
      ],
      group: ["action"],
      order: [[AuditLog.sequelize.literal("count"), "DESC"]],
      limit: 20,
    });

    const severitySummary = await AuditLog.findAll({
      where: whereClause,
      attributes: [
        "severity",
        [AuditLog.sequelize.fn("COUNT", AuditLog.sequelize.col("id")), "count"],
      ],
      group: ["severity"],
      order: [["severity", "ASC"]],
    });

    res.json({
      actions: actionsSummary,
      severity: severitySummary,
    });
  } catch (error) {
    console.error("Erreur récupération résumé actions:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   POST /api/admin/audit-logs/cleanup
// @desc    Nettoyer les anciens logs d'audit
// @access  Private/Admin
router.post("/cleanup", auth, adminAuth, async (req, res) => {
  try {
    const { daysToKeep = 365 } = req.body;
    const deletedCount = await AuditService.cleanOldLogs(daysToKeep);

    // Logger cette action de nettoyage
    await AuditService.logAdminAction(
      req.user.userId,
      "CLEANUP_AUDIT_LOGS",
      "AuditLog",
      null,
      { daysToKeep, deletedCount },
      req.ip,
      req.get("User-Agent")
    );

    res.json({
      message: "Nettoyage des logs terminé",
      deletedCount,
    });
  } catch (error) {
    console.error("Erreur nettoyage logs:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/audit-logs/export
// @desc    Exporter les logs d'audit en CSV
// @access  Private/Admin
router.get("/export", auth, adminAuth, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      severity,
      action,
      entity,
      format = "csv",
    } = req.query;

    let whereClause = {};

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    if (severity) whereClause.severity = severity;
    if (action) whereClause.action = action;
    if (entity) whereClause.entity = entity;

    const logs = await AuditLog.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "email"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10000, // Limiter l'export pour éviter les problèmes de mémoire
    });

    if (format === "csv") {
      // Générer CSV
      const csv = generateCSV(logs);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="audit_logs_${
          new Date().toISOString().split("T")[0]
        }.csv"`
      );

      // Logger l'export
      await AuditService.logAdminAction(
        req.user.userId,
        "EXPORT_AUDIT_LOGS",
        "AuditLog",
        null,
        { format, logsCount: logs.length },
        req.ip,
        req.get("User-Agent")
      );

      res.send(csv);
    } else {
      res.json(logs);
    }
  } catch (error) {
    console.error("Erreur export logs:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// @route   GET /api/admin/audit-logs/timeline
// @desc    Obtenir une timeline des événements
// @access  Private/Admin
router.get("/timeline", auth, adminAuth, async (req, res) => {
  try {
    const { days = 7, severity = null } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let whereClause = {
      createdAt: { [Op.gte]: startDate },
    };

    if (severity) {
      whereClause.severity = severity;
    }

    const timeline = await AuditLog.findAll({
      where: whereClause,
      attributes: [
        [
          AuditLog.sequelize.fn("DATE", AuditLog.sequelize.col("createdAt")),
          "date",
        ],
        "severity",
        [AuditLog.sequelize.fn("COUNT", AuditLog.sequelize.col("id")), "count"],
      ],
      group: [
        AuditLog.sequelize.fn("DATE", AuditLog.sequelize.col("createdAt")),
        "severity",
      ],
      order: [
        [
          AuditLog.sequelize.fn("DATE", AuditLog.sequelize.col("createdAt")),
          "ASC",
        ],
        ["severity", "ASC"],
      ],
    });

    res.json(timeline);
  } catch (error) {
    console.error("Erreur récupération timeline:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Fonction utilitaire pour générer du CSV
function generateCSV(logs) {
  const headers = [
    "Date",
    "Utilisateur",
    "Action",
    "Entité",
    "Entité ID",
    "Gravité",
    "Succès",
    "Adresse IP",
    "Message d'erreur",
  ];

  let csv = headers.join(",") + "\n";

  logs.forEach((log) => {
    const row = [
      `"${log.createdAt}"`,
      `"${
        log.user ? `${log.user.firstName} ${log.user.lastName}` : "Système"
      }"`,
      `"${log.action}"`,
      `"${log.entity}"`,
      log.entityId || "",
      `"${log.severity}"`,
      log.success ? "Oui" : "Non",
      `"${log.ipAddress || ""}"`,
      `"${log.errorMessage || ""}"`,
    ];
    csv += row.join(",") + "\n";
  });

  return csv;
}

module.exports = router;
