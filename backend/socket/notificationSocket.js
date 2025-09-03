// backend/socket/notificationSocket.js - GESTIONNAIRE SOCKET NOTIFICATIONS COMPLET
const notificationService = require("../services/notificationService");

class NotificationSocketManager {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // userId -> socketId
    this.setupNotificationSockets();
  }

  setupNotificationSockets() {
    this.io.on("connection", (socket) => {
      console.log(`🔔 Socket connected for notifications: ${socket.id}`);

      // Authentification du socket pour les notifications
      socket.on("authenticate", (data) => {
        if (data && data.userId) {
          socket.userId = data.userId;
          this.userSockets.set(data.userId, socket.id);

          console.log(`🔔 User ${data.userId} authenticated for notifications`);

          // Envoyer les notifications non lues à la connexion
          this.sendUnreadNotifications(socket.userId);
        }
      });

      // Marquer notification comme lue
      socket.on("mark_notification_read", async (notificationId) => {
        if (!socket.userId) {
          socket.emit("notification_error", "Non authentifié");
          return;
        }

        try {
          await notificationService.markAsRead(socket.userId, notificationId);
          socket.emit("notification_marked_read", { notificationId });
          console.log(
            `🔔 Notification ${notificationId} marquée comme lue pour user ${socket.userId}`
          );
        } catch (error) {
          console.error("Erreur marquage notification:", error);
          socket.emit("notification_error", "Erreur marquage notification");
        }
      });

      // Marquer toutes comme lues
      socket.on("mark_all_notifications_read", async () => {
        if (!socket.userId) {
          socket.emit("notification_error", "Non authentifié");
          return;
        }

        try {
          await notificationService.markAllAsRead(socket.userId);
          socket.emit("all_notifications_marked_read");
          console.log(
            `🔔 Toutes les notifications marquées comme lues pour user ${socket.userId}`
          );
        } catch (error) {
          console.error("Erreur marquage toutes notifications:", error);
          socket.emit("notification_error", "Erreur marquage notifications");
        }
      });

      // Obtenir le nombre de notifications non lues
      socket.on("get_unread_count", async () => {
        if (!socket.userId) {
          socket.emit("notification_error", "Non authentifié");
          return;
        }

        try {
          const count = await notificationService.getUnreadCount(socket.userId);
          socket.emit("unread_count", { count });
        } catch (error) {
          console.error("Erreur comptage notifications:", error);
          socket.emit("notification_error", "Erreur comptage notifications");
        }
      });

      // Déconnexion
      socket.on("disconnect", () => {
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
          console.log(
            `🔔 User ${socket.userId} disconnected from notifications`
          );
        }
      });

      // Gestion des erreurs de socket
      socket.on("error", (error) => {
        console.error(`🔔 Socket error for ${socket.userId}:`, error);
      });
    });
  }

  // Envoyer notifications non lues à la connexion
  async sendUnreadNotifications(userId) {
    try {
      const { Notification } = require("../models");

      const unreadNotifications = await Notification.findAll({
        where: {
          userId,
          isRead: false,
        },
        order: [["createdAt", "DESC"]],
        limit: 10, // Limiter à 10 pour éviter l'overload
      });

      const socketId = this.userSockets.get(userId);
      if (socketId && unreadNotifications.length > 0) {
        this.io.to(socketId).emit("unread_notifications", {
          notifications: unreadNotifications,
          count: unreadNotifications.length,
        });

        console.log(
          `🔔 ${unreadNotifications.length} notifications non lues envoyées à user ${userId}`
        );
      }
    } catch (error) {
      console.error("Erreur envoi notifications non lues:", error);
    }
  }

  // Envoyer notification en temps réel à un utilisateur
  sendNotificationToUser(userId, notification) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit("new_notification", notification);
      console.log(
        `🔔 Notification temps réel envoyée à user ${userId}: ${notification.title}`
      );
    } else {
      console.log(
        `🔔 User ${userId} non connecté, notification sauvegardée en DB uniquement`
      );
    }
  }

  // Envoyer notification à plusieurs utilisateurs
  sendNotificationToUsers(userIds, notification) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, notification);
    });
    console.log(`🔔 Notification envoyée à ${userIds.length} utilisateurs`);
  }

  // Diffuser notification système à tous les utilisateurs connectés
  broadcastSystemNotification(notification) {
    // Envoyer à tous les sockets connectés
    this.io.emit("system_notification", notification);
    console.log(
      `🔔 Notification système diffusée à ${this.userSockets.size} utilisateurs connectés`
    );
  }

  // Envoyer notification à une salle spécifique (ex: enchère)
  sendNotificationToRoom(room, notification) {
    this.io.to(room).emit("room_notification", notification);
    console.log(`🔔 Notification envoyée à la salle ${room}`);
  }

  // Obtenir le nombre d'utilisateurs connectés
  getConnectedUsersCount() {
    return this.userSockets.size;
  }

  // Obtenir la liste des utilisateurs connectés
  getConnectedUsers() {
    return Array.from(this.userSockets.keys());
  }

  // Vérifier si un utilisateur est connecté
  isUserConnected(userId) {
    return this.userSockets.has(userId);
  }

  // Forcer la déconnexion d'un utilisateur
  disconnectUser(userId) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
        console.log(`🔔 User ${userId} forcé à se déconnecter`);
      }
    }
  }

  // Statistiques des notifications en temps réel
  async getNotificationStats() {
    try {
      const { Notification } = require("../models");
      const stats = await Notification.findAll({
        attributes: [
          "type",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
          [
            sequelize.fn(
              "AVG",
              sequelize.literal("CASE WHEN isRead = true THEN 1 ELSE 0 END")
            ),
            "readRate",
          ],
        ],
        group: ["type"],
        raw: true,
      });

      return {
        connectedUsers: this.userSockets.size,
        notificationTypes: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erreur statistiques notifications:", error);
      return {
        connectedUsers: this.userSockets.size,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = NotificationSocketManager;
