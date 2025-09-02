const { AuditLog } = require("../models");

class AuditService {
  /**
   * Enregistrer une action dans le journal d'audit
   * @param {Object} options - Options pour l'audit
   * @param {number} options.userId - ID de l'utilisateur
   * @param {string} options.action - Type d'action
   * @param {string} options.entity - Entité concernée
   * @param {number} options.entityId - ID de l'entité
   * @param {Object} options.oldValues - Anciennes valeurs
   * @param {Object} options.newValues - Nouvelles valeurs
   * @param {string} options.ipAddress - Adresse IP
   * @param {string} options.userAgent - User agent
   * @param {Object} options.details - Détails supplémentaires
   * @param {string} options.severity - Niveau de gravité
   * @param {boolean} options.success - Succès de l'action
   * @param {string} options.errorMessage - Message d'erreur
   */
  static async log({
    userId = null,
    action,
    entity,
    entityId = null,
    oldValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null,
    details = null,
    severity = "low",
    success = true,
    errorMessage = null,
  }) {
    try {
      await AuditLog.create({
        userId,
        action,
        entity,
        entityId,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
        details,
        severity,
        success,
        errorMessage,
      });
    } catch (error) {
      console.error("Erreur enregistrement audit log:", error);
      // Ne pas lancer d'erreur pour éviter d'interrompre le processus principal
    }
  }

  /**
   * Logger une connexion utilisateur
   */
  static async logLogin(
    userId,
    ipAddress,
    userAgent,
    success = true,
    errorMessage = null
  ) {
    await this.log({
      userId,
      action: "LOGIN",
      entity: "User",
      entityId: userId,
      ipAddress,
      userAgent,
      severity: success ? "low" : "medium",
      success,
      errorMessage,
    });
  }

  /**
   * Logger une déconnexion utilisateur
   */
  static async logLogout(userId, ipAddress, userAgent) {
    await this.log({
      userId,
      action: "LOGOUT",
      entity: "User",
      entityId: userId,
      ipAddress,
      userAgent,
      severity: "low",
    });
  }

  /**
   * Logger une création d'entité
   */
  static async logCreate(
    userId,
    entity,
    entityId,
    newValues,
    ipAddress,
    userAgent,
    details = null
  ) {
    await this.log({
      userId,
      action: "CREATE",
      entity,
      entityId,
      newValues,
      ipAddress,
      userAgent,
      details,
      severity: "medium",
    });
  }

  /**
   * Logger une mise à jour d'entité
   */
  static async logUpdate(
    userId,
    entity,
    entityId,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
    details = null
  ) {
    await this.log({
      userId,
      action: "UPDATE",
      entity,
      entityId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      details,
      severity: "medium",
    });
  }

  /**
   * Logger une suppression d'entité
   */
  static async logDelete(
    userId,
    entity,
    entityId,
    oldValues,
    ipAddress,
    userAgent,
    details = null
  ) {
    await this.log({
      userId,
      action: "DELETE",
      entity,
      entityId,
      oldValues,
      ipAddress,
      userAgent,
      details,
      severity: "high",
    });
  }

  /**
   * Logger une action administrateur
   */
  static async logAdminAction(
    userId,
    action,
    entity,
    entityId,
    details,
    ipAddress,
    userAgent
  ) {
    await this.log({
      userId,
      action: `ADMIN_${action}`,
      entity,
      entityId,
      ipAddress,
      userAgent,
      details,
      severity: "high",
    });
  }

  /**
   * Logger une tentative d'accès non autorisé
   */
  static async logUnauthorizedAccess(
    userId,
    action,
    entity,
    ipAddress,
    userAgent,
    details
  ) {
    await this.log({
      userId,
      action: "UNAUTHORIZED_ACCESS",
      entity,
      ipAddress,
      userAgent,
      details: {
        attemptedAction: action,
        ...details,
      },
      severity: "critical",
      success: false,
      errorMessage: "Tentative d'accès non autorisé",
    });
  }

  /**
   * Logger un changement de paramètres système
   */
  static async logSettingsChange(
    userId,
    category,
    oldSettings,
    newSettings,
    ipAddress,
    userAgent
  ) {
    await this.log({
      userId,
      action: "SETTINGS_CHANGE",
      entity: "Settings",
      oldValues: oldSettings,
      newValues: newSettings,
      ipAddress,
      userAgent,
      details: { category },
      severity: "high",
    });
  }

  /**
   * Logger une action sur une enchère
   */
  static async logAuctionAction(
    userId,
    action,
    auctionId,
    details,
    ipAddress,
    userAgent
  ) {
    const severity =
      action === "BID" ? "low" : action === "WIN" ? "medium" : "high";

    await this.log({
      userId,
      action: `AUCTION_${action}`,
      entity: "Auction",
      entityId: auctionId,
      ipAddress,
      userAgent,
      details,
      severity,
    });
  }

  /**
   * Logger une transaction de paiement
   */
  static async logPayment(
    userId,
    action,
    paymentId,
    amount,
    method,
    success,
    errorMessage,
    ipAddress,
    userAgent
  ) {
    await this.log({
      userId,
      action: `PAYMENT_${action}`,
      entity: "Payment",
      entityId: paymentId,
      ipAddress,
      userAgent,
      details: {
        amount,
        method,
      },
      severity: success ? "medium" : "high",
      success,
      errorMessage,
    });
  }

  /**
   * Obtenir les logs d'audit avec filtres
   */
  static async getLogs({
    page = 1,
    limit = 50,
    userId = null,
    action = null,
    entity = null,
    severity = null,
    success = null,
    startDate = null,
    endDate = null,
  }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (severity) where.severity = severity;
    if (success !== null) where.success = success;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const logs = await AuditLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: require("../models").User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
          required: false,
        },
      ],
    });

    return {
      logs: logs.rows,
      totalPages: Math.ceil(logs.count / limit),
      currentPage: parseInt(page),
      totalLogs: logs.count,
    };
  }

  /**
   * Obtenir les statistiques des logs d'audit
   */
  static async getStats() {
    const [totalLogs, criticalLogs, failedActions, recentActivity] =
      await Promise.all([
        AuditLog.count(),
        AuditLog.count({ where: { severity: "critical" } }),
        AuditLog.count({ where: { success: false } }),
        AuditLog.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Dernières 24h
            },
          },
        }),
      ]);

    return {
      totalLogs,
      criticalLogs,
      failedActions,
      recentActivity,
    };
  }

  /**
   * Nettoyer les anciens logs (à exécuter périodiquement)
   */
  static async cleanOldLogs(daysToKeep = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await AuditLog.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate,
        },
        severity: {
          [Op.in]: ["low", "medium"], // Garder les logs critiques et high plus longtemps
        },
      },
    });

    await this.log({
      action: "CLEANUP_LOGS",
      entity: "AuditLog",
      details: {
        deletedCount,
        cutoffDate: cutoffDate.toISOString(),
      },
      severity: "medium",
    });

    return deletedCount;
  }
}

module.exports = AuditService;
