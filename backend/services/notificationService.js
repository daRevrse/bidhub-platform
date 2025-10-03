// backend/services/notificationService.js - SERVICE COMPLET
const { Notification, User } = require("../models");
const emailService = require("./emailService");
const { Op } = require("sequelize");

class NotificationService {
  constructor() {
    this.socketManager = null; // Sera assigné par le serveur
  }

  setSocketManager(socketManager) {
    this.socketManager = socketManager;
  }

  // Créer une notification
  async createNotification({
    userId,
    type,
    title,
    message,
    data = null,
    priority = "medium",
    actionUrl = null,
    imageUrl = null,
    expiresAt = null,
  }) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
        priority,
        actionUrl,
        imageUrl,
        expiresAt,
      });

      // Envoyer en temps réel via Socket.io
      if (this.socketManager) {
        this.socketManager.sendNotificationToUser(userId, notification);
      }

      // Envoyer email si nécessaire
      if (priority === "high" || priority === "urgent") {
        await this.sendEmailNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      console.error("Erreur création notification:", error);
      throw error;
    }
  }

  // Notifications spécifiques aux enchères

  // Nouvelle enchère placée
  async notifyBidPlaced(
    auctionId,
    bidderId,
    bidAmount,
    sellerId,
    productTitle
  ) {
    try {
      // Notifier le vendeur
      await this.createNotification({
        userId: sellerId,
        type: "bid_placed",
        title: "Nouvelle enchère !",
        message: `Une enchère de ${bidAmount} FCFA a été placée sur "${productTitle}"`,
        data: { auctionId, bidderId, bidAmount },
        priority: "medium",
        actionUrl: `/auctions/${auctionId}`,
      });

      // Notifier les autres enchérisseurs qu'ils ont été surenchéris
      await this.notifyOutbidders(auctionId, bidderId, bidAmount, productTitle);
    } catch (error) {
      console.error("Erreur notification enchère:", error);
    }
  }

  // Notifier les enchérisseurs surenchéris
  async notifyOutbidders(auctionId, newBidderId, newBidAmount, productTitle) {
    try {
      const { Bid } = require("../models");

      // Trouver les enchérisseurs précédents (sauf le nouveau)
      const previousBidders = await Bid.findAll({
        where: {
          auctionId,
          bidderId: { [Op.ne]: newBidderId },
        },
        attributes: ["bidderId"],
        group: ["bidderId"],
      });

      // Créer une notification pour chaque enchérisseur surenchéri
      for (const bid of previousBidders) {
        await this.createNotification({
          userId: bid.bidderId,
          type: "bid_placed",
          title: "Vous avez été surenchéri !",
          message: `Une nouvelle enchère de ${newBidAmount} FCFA a été placée sur "${productTitle}"`,
          data: { auctionId, newBidAmount },
          priority: "medium",
          actionUrl: `/auctions/${auctionId}`,
        });
      }
    } catch (error) {
      console.error("Erreur notification surenchère:", error);
    }
  }

  // Enchère gagnée
  async notifyAuctionWon(auctionId, winnerId, winningAmount, productTitle) {
    await this.createNotification({
      userId: winnerId,
      type: "auction_won",
      title: "Félicitations ! Vous avez gagné !",
      message: `Vous avez remporté l'enchère "${productTitle}" pour ${winningAmount} FCFA`,
      data: { auctionId, winningAmount },
      priority: "high",
      actionUrl: `/auctions/${auctionId}`,
    });
  }

  // Enchère perdue
  async notifyAuctionLost(userId, auctionId, winningAmount, productTitle) {
    await this.createNotification({
      userId,
      type: "auction_lost",
      title: "Enchère terminée",
      message: `L'enchère "${productTitle}" s'est terminée à ${winningAmount} FCFA`,
      data: { auctionId, winningAmount },
      priority: "low",
      actionUrl: `/auctions/${auctionId}`,
    });
  }

  // Enchère se termine bientôt
  async notifyAuctionEnding(auctionId, participantIds, productTitle, timeLeft) {
    for (const userId of participantIds) {
      await this.createNotification({
        userId,
        type: "auction_ending",
        title: "L'enchère se termine bientôt !",
        message: `L'enchère "${productTitle}" se termine dans ${timeLeft}`,
        data: { auctionId, timeLeft },
        priority: "medium",
        actionUrl: `/auctions/${auctionId}`,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // Expire dans 2h
      });
    }
  }

  // Nouveau message reçu
  // async notifyNewMessage(
  //   recipientId,
  //   senderId,
  //   senderName,
  //   preview,
  //   conversationId
  // ) {
  //   await this.createNotification({
  //     userId: recipientId,
  //     type: "message_received",
  //     title: "Nouveau message",
  //     message: `${senderName}: ${preview}`,
  //     data: { senderId, conversationId },
  //     priority: "medium",
  //     actionUrl: `/messages/${conversationId}`,
  //   });
  // }

  async notifyAdmins({
    type,
    title,
    message,
    data = null,
    priority = "medium",
    actionUrl = null,
    imageUrl = null,
    expiresAt = null,
  }) {
    try {
      const { User } = require("../models");

      // Récupérer tous les administrateurs
      const admins = await User.findAll({
        where: { role: "admin", isActive: true },
        attributes: ["id"],
      });

      // Créer une notification pour chaque admin
      const notifications = [];
      for (const admin of admins) {
        const notification = await this.createNotification({
          userId: admin.id,
          type,
          title,
          message,
          data,
          priority,
          actionUrl,
          imageUrl,
          expiresAt,
        });
        notifications.push(notification);
      }

      console.log(
        `📢 ${notifications.length} administrateurs notifiés: ${title}`
      );
      return notifications;
    } catch (error) {
      console.error("Erreur notification administrateurs:", error);
      throw error;
    }
  }

  async notifySellers({
    type,
    title,
    message,
    data = null,
    priority = "medium",
    actionUrl = null,
    imageUrl = null,
    expiresAt = null,
  }) {
    try {
      const { User } = require("../models");

      // Récupérer tous les vendeurs actifs
      const sellers = await User.findAll({
        where: {
          role: "seller",
          isActive: true,
          isVerified: true,
        },
        attributes: ["id"],
      });

      // Créer une notification pour chaque vendeur
      const notifications = [];
      for (const seller of sellers) {
        const notification = await this.createNotification({
          userId: seller.id,
          type,
          title,
          message,
          data,
          priority,
          actionUrl,
          imageUrl,
          expiresAt,
        });
        notifications.push(notification);
      }

      console.log(`📢 ${notifications.length} vendeurs notifiés: ${title}`);
      return notifications;
    } catch (error) {
      console.error("Erreur notification vendeurs:", error);
      throw error;
    }
  }

  async notifyUsersByRole({
    roles = [],
    type,
    title,
    message,
    data = null,
    priority = "medium",
    actionUrl = null,
    imageUrl = null,
    expiresAt = null,
  }) {
    try {
      const { User } = require("../models");

      // Récupérer les utilisateurs par rôles
      const users = await User.findAll({
        where: {
          role: roles,
          isActive: true,
        },
        attributes: ["id", "role"],
      });

      // Créer une notification pour chaque utilisateur
      const notifications = [];
      for (const user of users) {
        const notification = await this.createNotification({
          userId: user.id,
          type,
          title,
          message,
          data,
          priority,
          actionUrl,
          imageUrl,
          expiresAt,
        });
        notifications.push(notification);
      }

      console.log(
        `📢 ${notifications.length} utilisateurs notifiés (${roles.join(
          ", "
        )}): ${title}`
      );
      return notifications;
    } catch (error) {
      console.error("Erreur notification utilisateurs par rôle:", error);
      throw error;
    }
  }

  // Paiement reçu
  async notifyPaymentReceived(sellerId, amount, buyerName, productTitle) {
    await this.createNotification({
      userId: sellerId,
      type: "payment_received",
      title: "Paiement reçu !",
      message: `${buyerName} a effectué le paiement de ${amount} FCFA pour "${productTitle}"`,
      data: { amount, buyerName },
      priority: "high",
    });
  }

  // Paiement requis
  async notifyPaymentRequired(
    buyerId,
    amount,
    productTitle,
    auctionId,
    timeLimit
  ) {
    await this.createNotification({
      userId: buyerId,
      type: "payment_required",
      title: "Paiement requis",
      message: `Veuillez effectuer le paiement de ${amount} FCFA pour "${productTitle}" avant ${timeLimit}`,
      data: { amount, auctionId, timeLimit },
      priority: "urgent",
      actionUrl: `/payment/${auctionId}`,
      expiresAt: new Date(timeLimit),
    });
  }

  // Nouvel avis reçu
  async notifyReviewReceived(recipientId, reviewerName, rating, productTitle) {
    await this.createNotification({
      userId: recipientId,
      type: "review_received",
      title: "Nouvel avis reçu",
      message: `${reviewerName} a laissé un avis ${rating}⭐ pour "${productTitle}"`,
      data: { reviewerName, rating },
      priority: "low",
      actionUrl: "/profile/reviews",
    });
  }

  // Produit approuvé/rejeté
  async notifyProductStatus(sellerId, productTitle, approved, reason = null) {
    await this.createNotification({
      userId: sellerId,
      type: approved ? "product_approved" : "product_rejected",
      title: approved ? "Produit approuvé !" : "Produit rejeté",
      message: approved
        ? `Votre produit "${productTitle}" a été approuvé et est maintenant en ligne`
        : `Votre produit "${productTitle}" a été rejeté. Raison: ${reason}`,
      data: { approved, reason },
      priority: approved ? "medium" : "high",
      actionUrl: approved ? "/my-auctions" : "/create-product",
    });
  }

  // Notification système
  async notifySystem(userIds, title, message, data = null) {
    try {
      const notifications = userIds.map((userId) => ({
        userId,
        type: "system",
        title,
        message,
        data,
        priority: "medium",
      }));

      const createdNotifications = await Notification.bulkCreate(
        notifications,
        {
          returning: true,
        }
      );

      // Envoyer en temps réel
      if (this.socketManager) {
        createdNotifications.forEach((notification, index) => {
          this.socketManager.sendNotificationToUser(
            userIds[index],
            notification
          );
        });
      }
    } catch (error) {
      console.error("Erreur notification système:", error);
    }
  }

  // Diffuser notification système à tous
  async broadcastSystemNotification(title, message, data = null) {
    try {
      // Créer notification pour tous les utilisateurs
      const users = await User.findAll({ attributes: ["id"] });
      const userIds = users.map((user) => user.id);

      await this.notifySystem(userIds, title, message, data);

      // Diffuser via socket
      if (this.socketManager) {
        this.socketManager.broadcastSystemNotification({
          title,
          message,
          data,
        });
      }
    } catch (error) {
      console.error("Erreur diffusion notification système:", error);
    }
  }

  // Envoyer notification par email
  async sendEmailNotification(userId, notification) {
    try {
      const user = await User.findByPk(userId);
      if (!user || !user.emailNotifications) return;

      // Templates d'email selon le type de notification
      let subject, html;

      switch (notification.type) {
        case "auction_won":
          subject = "🎉 Vous avez gagné une enchère !";
          break;
        case "payment_required":
          subject = "💳 Paiement requis pour votre achat";
          break;
        case "bid_placed":
          subject = "🔔 Nouvelle enchère sur votre produit";
          break;
        default:
          subject = notification.title;
      }

      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">${notification.title}</h2>
          <p style="color: #4b5563; line-height: 1.6;">${
            notification.message
          }</p>
          ${
            notification.actionUrl
              ? `<a href="${process.env.CLIENT_URL}${notification.actionUrl}" 
               style="display: inline-block; background: #3b82f6; color: white; 
                      padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                      margin-top: 20px;">
              Voir les détails
            </a>`
              : ""
          }
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px;">
            BidHub Togo - Plateforme d'enchères en ligne
          </p>
        </div>
      `;

      await emailService.sendEmail(user.email, subject, html);
    } catch (error) {
      console.error("Erreur envoi email notification:", error);
    }
  }

  // Marquer une notification comme lue
  async markAsRead(userId, notificationId) {
    try {
      await Notification.update(
        { isRead: true, readAt: new Date() },
        {
          where: {
            id: notificationId,
            userId,
          },
        }
      );
    } catch (error) {
      console.error("Erreur marquage notification:", error);
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId) {
    try {
      await Notification.update(
        { isRead: true, readAt: new Date() },
        { where: { userId, isRead: false } }
      );
    } catch (error) {
      console.error("Erreur marquage toutes notifications:", error);
    }
  }

  // Obtenir le nombre de notifications non lues
  // async getUnreadCount(userId) {
  //   try {
  //     return await Notification.count({
  //       where: {
  //         userId,
  //         isRead: false,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Erreur comptage notifications:", error);
  //     return 0;
  //   }
  // }
  async getUnreadCount(userId) {
    try {
      return await Notification.count({
        where: {
          userId,
          isRead: false,
          type: {
            [Op.ne]: "new_message", // ← EXCLURE les messages
          },
        },
      });
    } catch (error) {
      console.error("Erreur comptage notifications:", error);
      return 0;
    }
  }

  // Nettoyer les anciennes notifications
  async cleanupExpiredNotifications() {
    try {
      const result = await Notification.destroy({
        where: {
          [Op.or]: [
            {
              expiresAt: {
                [Op.lt]: new Date(),
              },
            },
            {
              createdAt: {
                [Op.lt]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Plus de 30 jours
              },
              isRead: true,
            },
          ],
        },
      });

      console.log(`🧹 ${result} notifications expirées supprimées`);
    } catch (error) {
      console.error("Erreur nettoyage notifications:", error);
    }
  }
}

module.exports = new NotificationService();
