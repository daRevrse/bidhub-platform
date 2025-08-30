const cron = require("node-cron");
const { Auction, Product, User, Bid } = require("../models");
const { Op } = require("sequelize");
const emailService = require("./emailService");

class CronJobService {
  constructor(auctionSocketManager) {
    this.auctionSocketManager = auctionSocketManager;
    this.setupCronJobs();
  }

  setupCronJobs() {
    // Vérifier les enchères terminées toutes les minutes
    cron.schedule("* * * * *", async () => {
      await this.checkEndedAuctions();
    });

    // Envoyer les rappels de fin d'enchère (24h avant) - toutes les heures
    cron.schedule("0 * * * *", async () => {
      await this.sendEndingReminders();
    });

    // Nettoyer les anciennes données - tous les jours à 2h du matin
    cron.schedule("0 2 * * *", async () => {
      await this.cleanupOldData();
    });

    // Mettre à jour le statut des enchères - toutes les 5 minutes
    cron.schedule("*/5 * * * *", async () => {
      await this.updateAuctionStatuses();
    });

    console.log("✅ Cron jobs initialized");
  }

  // Vérifier et terminer les enchères expirées
  async checkEndedAuctions() {
    try {
      const now = new Date();

      // Trouver les enchères qui devraient être terminées mais ne le sont pas encore
      const expiredAuctions = await Auction.findAll({
        where: {
          endTime: { [Op.lte]: now },
          status: "active",
        },
        include: [
          {
            model: Product,
            as: "product",
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
            include: [
              {
                model: User,
                as: "bidder",
                attributes: ["id", "firstName", "lastName", "email", "phone"],
              },
            ],
            order: [["amount", "DESC"]],
            limit: 1,
          },
        ],
      });

      for (const auction of expiredAuctions) {
        await this.endAuction(auction);
      }

      if (expiredAuctions.length > 0) {
        console.log(`🏁 Processed ${expiredAuctions.length} ended auctions`);
      }
    } catch (error) {
      console.error("Error checking ended auctions:", error);
    }
  }

  // Terminer une enchère spécifique
  async endAuction(auction) {
    try {
      // Mettre à jour le statut de l'enchère
      await auction.update({ status: "ended" });

      // Utiliser le socket manager pour notifier les participants
      if (this.auctionSocketManager) {
        await this.auctionSocketManager.endAuction(auction.id);
      }

      // Mettre à jour le statut du produit
      await auction.product.update({ status: "sold" });

      console.log(`🏁 Auction ${auction.id} ended: "${auction.product.title}"`);
    } catch (error) {
      console.error(`Error ending auction ${auction.id}:`, error);
    }
  }

  // Envoyer des rappels 24h avant la fin des enchères
  async sendEndingReminders() {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      // Trouver les enchères qui se terminent dans 24h
      const endingSoonAuctions = await Auction.findAll({
        where: {
          endTime: {
            [Op.gte]: in24Hours,
            [Op.lte]: in25Hours,
          },
          status: "active",
        },
        include: [
          {
            model: Product,
            as: "product",
            include: [
              {
                model: User,
                as: "seller",
                attributes: ["id", "firstName", "lastName", "email"],
              },
            ],
          },
        ],
      });

      for (const auction of endingSoonAuctions) {
        await this.sendRemindersForAuction(auction);
      }

      if (endingSoonAuctions.length > 0) {
        console.log(
          `⏰ Sent ending reminders for ${endingSoonAuctions.length} auctions`
        );
      }
    } catch (error) {
      console.error("Error sending ending reminders:", error);
    }
  }

  // Envoyer des rappels aux participants d'une enchère
  async sendRemindersForAuction(auction) {
    try {
      // Obtenir tous les enchérisseurs uniques pour cette enchère
      const bidders = await User.findAll({
        include: [
          {
            model: Bid,
            as: "bids",
            where: { auctionId: auction.id },
            attributes: [],
          },
        ],
        attributes: ["id", "firstName", "lastName", "email"],
        group: ["User.id"],
      });

      if (bidders.length > 0) {
        await emailService.sendAuctionEndingReminderNotification(
          bidders,
          auction
        );
        console.log(
          `📧 Sent ending reminder to ${bidders.length} participants for auction ${auction.id}`
        );
      }
    } catch (error) {
      console.error(
        `Error sending reminders for auction ${auction.id}:`,
        error
      );
    }
  }

  // Mettre à jour le statut des enchères (programmées -> actives)
  async updateAuctionStatuses() {
    try {
      const now = new Date();

      // Activer les enchères programmées dont l'heure de début est passée
      const scheduledAuctions = await Auction.findAll({
        where: {
          startTime: { [Op.lte]: now },
          status: "scheduled",
        },
      });

      for (const auction of scheduledAuctions) {
        await auction.update({ status: "active" });
        console.log(`🚀 Auction ${auction.id} is now active`);
      }

      if (scheduledAuctions.length > 0) {
        console.log(
          `🚀 Activated ${scheduledAuctions.length} scheduled auctions`
        );
      }
    } catch (error) {
      console.error("Error updating auction statuses:", error);
    }
  }

  // Nettoyer les anciennes données (optionnel)
  async cleanupOldData() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Supprimer les enchères terminées depuis plus de 30 jours
      const deletedCount = await Auction.destroy({
        where: {
          endTime: { [Op.lt]: thirtyDaysAgo },
          status: "ended",
        },
      });

      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} old auctions`);
      }
    } catch (error) {
      console.error("Error cleaning up old data:", error);
    }
  }

  // Méthode pour arrêter tous les cron jobs
  stopAllJobs() {
    const tasks = cron.getTasks();
    tasks.forEach((task) => {
      task.stop();
    });
    console.log("⏹️ All cron jobs stopped");
  }
}

module.exports = CronJobService;
