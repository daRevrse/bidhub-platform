// backend/socket/notificationSocket.js - GESTIONNAIRE SOCKET NOTIFICATIONS
const notificationService = require("../services/notificationService");

class NotificationSocketManager {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // userId -> socketId
    this.setupNotificationSockets();
  }

  setupNotificationSockets() {
    this.io.on("connection", (socket) => {
      // Authentification du socket
      socket.on("authenticate", (data) => {
        if (data.userId) {
          socket.userId = data.userId;
          this.userSockets.set(data.userId, socket.id);

          console.log(`🔔 User ${data.userId} connected for notifications`);

          // Envoyer les notifications non lues
          this.sendUnreadNotifications(socket.userId);
        }
      });

      // Marquer notification comme lue
      socket.on("mark_notification_read", async (notificationId) => {
        try {
          await notificationService.markAsRead(socket.userId, notificationId);
          socket.emit("notification_marked_read", { notificationId });
        } catch (error) {
          socket.emit("notification_error", "Erreur marquage notification");
        }
      });

      // Marquer toutes comme lues
      socket.on("mark_all_notifications_read", async () => {
        try {
          await notificationService.markAllAsRead(socket.userId);
          socket.emit("all_notifications_marked_read");
        } catch (error) {
          socket.emit("notification_error", "Erreur marquage notifications");
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
        limit: 10,
      });

      const socketId = this.userSockets.get(userId);
      if (socketId) {
        this.io.to(socketId).emit("unread_notifications", {
          notifications: unreadNotifications,
          count: unreadNotifications.length,
        });
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

      console.log(`🔔 Notification temps réel envoyée à user ${userId}`);
    } else {
      console.log(
        `🔔 User ${userId} non connecté, notification en DB uniquement`
      );
    }
  }

  // Envoyer notification à plusieurs utilisateurs
  sendNotificationToUsers(userIds, notification) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  // Diffuser notification système à tous les utilisateurs connectés
  broadcastSystemNotification(notification) {
    this.io.emit("system_notification", notification);
    console.log("🔔 Notification système diffusée à tous");
  }
}

module.exports = NotificationSocketManager;
