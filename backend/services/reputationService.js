const {
  Review,
  UserReputation,
  User,
  Auction,
  Badge,
  Product,
} = require("../models");
const { Op } = require("sequelize");

class ReputationService {
  // Créer un avis
  async createReview(reviewData) {
    try {
      const {
        auctionId,
        reviewerId,
        revieweeId,
        rating,
        comment,
        type,
        criteria,
      } = reviewData;

      // Vérifications de base
      if (reviewerId === revieweeId) {
        throw new Error("Impossible de s'auto-évaluer");
      }

      // Vérifier que l'enchère existe et est terminée
      const auction = await Auction.findByPk(auctionId);
      if (!auction || auction.status !== "ended") {
        throw new Error("Enchère non trouvée ou non terminée");
      }

      // Vérifier que l'utilisateur peut donner cet avis
      if (type === "buyer_to_seller") {
        if (auction.winnerId !== reviewerId) {
          throw new Error("Seul le gagnant peut évaluer le vendeur");
        }
      } else if (type === "seller_to_buyer") {
        const product = await auction.getProduct();
        if (product.sellerId !== reviewerId) {
          throw new Error("Seul le vendeur peut évaluer l'acheteur");
        }
      }

      // Vérifier qu'un avis n'existe pas déjà
      const existingReview = await Review.findOne({
        where: { auctionId, reviewerId, type },
      });

      if (existingReview) {
        throw new Error("Vous avez déjà donné un avis pour cette transaction");
      }

      // Créer l'avis
      const review = await Review.create({
        auctionId,
        reviewerId,
        revieweeId,
        rating,
        comment,
        type,
        criteria: criteria || {},
        moderationStatus: "approved", // Auto-approuvé pour l'instant
      });

      // Mettre à jour la réputation
      await this.updateUserReputation(revieweeId);

      // Vérifier et attribuer de nouveaux badges
      await this.checkAndAwardBadges(revieweeId);

      return review;
    } catch (error) {
      throw new Error(`Erreur création avis: ${error.message}`);
    }
  }

  // Mettre à jour la réputation d'un utilisateur
  async updateUserReputation(userId) {
    try {
      // Récupérer tous les avis pour cet utilisateur
      const reviews = await Review.findAll({
        where: { revieweeId: userId, moderationStatus: "approved" },
      });

      if (reviews.length === 0) {
        return;
      }

      // Calculer les statistiques
      const totalReviews = reviews.length;
      const overallRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

      // Séparer par type
      const sellerReviews = reviews.filter((r) => r.type === "buyer_to_seller");
      const buyerReviews = reviews.filter((r) => r.type === "seller_to_buyer");

      const sellerRating =
        sellerReviews.length > 0
          ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) /
            sellerReviews.length
          : 0;

      const buyerRating =
        buyerReviews.length > 0
          ? buyerReviews.reduce((sum, r) => sum + r.rating, 0) /
            buyerReviews.length
          : 0;

      // Distribution des notes
      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach((review) => {
        ratingDistribution[review.rating]++;
      });

      // Moyennes par critères
      const averageCriteria = {};
      const criteriaCount = {};

      reviews.forEach((review) => {
        if (review.criteria) {
          Object.entries(review.criteria).forEach(([key, value]) => {
            if (typeof value === "number" && value >= 1 && value <= 5) {
              if (!averageCriteria[key]) {
                averageCriteria[key] = 0;
                criteriaCount[key] = 0;
              }
              averageCriteria[key] += value;
              criteriaCount[key]++;
            }
          });
        }
      });

      Object.keys(averageCriteria).forEach((key) => {
        averageCriteria[key] = averageCriteria[key] / criteriaCount[key];
      });

      // Déterminer le niveau de confiance
      const trustLevel = this.calculateTrustLevel(overallRating, totalReviews);

      // Mettre à jour ou créer la réputation
      await UserReputation.upsert({
        userId,
        overallRating: Math.round(overallRating * 100) / 100,
        totalReviews,
        sellerRating: Math.round(sellerRating * 100) / 100,
        sellerReviews: sellerReviews.length,
        buyerRating: Math.round(buyerRating * 100) / 100,
        buyerReviews: buyerReviews.length,
        ratingDistribution,
        averageCriteria,
        trustLevel,
      });
    } catch (error) {
      console.error("Erreur mise à jour réputation:", error);
    }
  }

  // Calculer le niveau de confiance
  calculateTrustLevel(rating, totalReviews) {
    if (totalReviews < 5) return "new";
    if (rating >= 4.8 && totalReviews >= 50) return "platinum";
    if (rating >= 4.5 && totalReviews >= 25) return "gold";
    if (rating >= 4.0 && totalReviews >= 10) return "silver";
    if (rating >= 3.5) return "bronze";
    return "new";
  }

  // Vérifier et attribuer des badges
  async checkAndAwardBadges(userId) {
    try {
      const user = await User.findByPk(userId);
      const reputation = await UserReputation.findOne({ where: { userId } });

      if (!user || !reputation) return;

      // Récupérer tous les badges actifs
      const availableBadges = await Badge.findAll({
        where: { isActive: true },
      });

      // Vérifier chaque badge
      for (const badge of availableBadges) {
        const hasEarned = await this.checkBadgeCriteria(
          user,
          reputation,
          badge.criteria
        );

        if (hasEarned && !reputation.badges.some((b) => b.id === badge.id)) {
          // Ajouter le badge
          const updatedBadges = [
            ...reputation.badges,
            {
              id: badge.id,
              name: badge.name,
              earnedAt: new Date(),
              icon: badge.icon,
              color: badge.color,
            },
          ];

          await reputation.update({ badges: updatedBadges });

          // Envoyer notification (à implémenter)
          console.log(
            `🏆 Badge '${badge.name}' attribué à l'utilisateur ${userId}`
          );
        }
      }
    } catch (error) {
      console.error("Erreur attribution badges:", error);
    }
  }

  // Vérifier les critères d'un badge
  async checkBadgeCriteria(user, reputation, criteria) {
    try {
      // Exemples de critères de badges
      const checks = {
        minRating: reputation.overallRating >= (criteria.minRating || 0),
        minReviews: reputation.totalReviews >= (criteria.minReviews || 0),
        minSales: reputation.totalSales >= (criteria.minSales || 0),
        minPurchases: reputation.totalPurchases >= (criteria.minPurchases || 0),
        trustLevel: criteria.trustLevel
          ? reputation.trustLevel === criteria.trustLevel
          : true,
        accountAge: criteria.accountAge
          ? new Date() - user.createdAt >=
            criteria.accountAge * 24 * 60 * 60 * 1000
          : true,
      };

      // Tous les critères doivent être satisfaits
      return Object.values(checks).every((check) => check);
    } catch (error) {
      return false;
    }
  }

  // Obtenir les avis d'un utilisateur
  async getUserReviews(userId, options = {}) {
    const {
      type = "all", // 'all', 'received', 'given'
      limit = 10,
      offset = 0,
      includeResponses = true,
    } = options;

    let whereClause = {};

    if (type === "received") {
      whereClause.revieweeId = userId;
    } else if (type === "given") {
      whereClause.reviewerId = userId;
    } else {
      whereClause = {
        [Op.or]: [{ revieweeId: userId }, { reviewerId: userId }],
      };
    }

    const reviews = await Review.findAndCountAll({
      where: {
        ...whereClause,
        moderationStatus: "approved",
        isPublic: true,
      },
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "firstName", "lastName", "avatar"],
        },
        {
          model: User,
          as: "reviewee",
          attributes: ["id", "firstName", "lastName", "avatar"],
        },
        {
          model: Auction,
          as: "auction",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["title", "images"],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return reviews;
  }

  // Signaler un avis
  async reportReview(reviewId, reporterId, reason) {
    try {
      const review = await Review.findByPk(reviewId);
      if (!review) {
        throw new Error("Avis non trouvé");
      }

      await review.update({
        isReported: true,
        moderationStatus: "flagged",
      });

      // Log du signalement (à améliorer avec une table dédiée)
      console.log(
        `⚠️ Avis ${reviewId} signalé par utilisateur ${reporterId} - Raison: ${reason}`
      );

      return true;
    } catch (error) {
      throw new Error(`Erreur signalement: ${error.message}`);
    }
  }
}

module.exports = new ReputationService();
