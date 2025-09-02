// backend/routes/reviews.js - VERSION CORRIGÉE SANS REPUTATION SERVICE
const express = require("express");
const { Review, User, Auction, Product, Badge } = require("../models");
const auth = require("../middleware/auth");
const { Op } = require("sequelize");

const router = express.Router();

// @route   GET /api/reviews/user/:userId
// @desc    Obtenir les avis d'un utilisateur
// @access  Public
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { type = "received", page = 1, limit = 10 } = req.query;

    console.log(
      `Récupération des avis pour utilisateur ${userId}, type: ${type}`
    );

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Construire la condition WHERE selon le type
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

    // Ajouter les conditions de modération
    whereClause.moderationStatus = "approved";
    whereClause.isPublic = true;

    const reviews = await Review.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "firstName", "lastName", "avatar"],
          required: false,
        },
        {
          model: User,
          as: "reviewee",
          attributes: ["id", "firstName", "lastName", "avatar"],
          required: false,
        },
        {
          model: Auction,
          as: "auction",
          attributes: ["id", "endTime", "currentPrice"],
          required: false,
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "title", "images"],
              required: false,
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    console.log(`Trouvé ${reviews.count} avis`);

    res.json({
      reviews: reviews.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(reviews.count / parseInt(limit)),
        totalReviews: reviews.count,
        hasNext: offset + reviews.rows.length < reviews.count,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Erreur récupération avis:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/reviews/reputation/:userId
// @desc    Obtenir la réputation d'un utilisateur
// @access  Public
router.get("/reputation/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    console.log(`Calcul réputation pour utilisateur ${userId}`);

    // Récupérer l'utilisateur
    const user = await User.findByPk(userId, {
      attributes: ["id", "firstName", "lastName", "avatar", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Récupérer tous les avis reçus
    const reviews = await Review.findAll({
      where: {
        revieweeId: userId,
        moderationStatus: "approved",
        isPublic: true,
      },
      attributes: ["rating", "type", "createdAt"],
    });

    if (reviews.length === 0) {
      return res.json({
        userId,
        overallRating: 0,
        totalReviews: 0,
        sellerRating: 0,
        sellerReviews: 0,
        buyerRating: 0,
        buyerReviews: 0,
        trustLevel: "new",
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        user,
      });
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

    // Niveau de confiance
    let trustLevel = "new";
    if (totalReviews < 5) trustLevel = "new";
    else if (overallRating >= 4.8 && totalReviews >= 50)
      trustLevel = "platinum";
    else if (overallRating >= 4.5 && totalReviews >= 25) trustLevel = "gold";
    else if (overallRating >= 4.0 && totalReviews >= 10) trustLevel = "silver";
    else if (overallRating >= 3.5) trustLevel = "bronze";

    res.json({
      userId,
      overallRating: Math.round(overallRating * 100) / 100,
      totalReviews,
      sellerRating: Math.round(sellerRating * 100) / 100,
      sellerReviews: sellerReviews.length,
      buyerRating: Math.round(buyerRating * 100) / 100,
      buyerReviews: buyerReviews.length,
      trustLevel,
      ratingDistribution,
      user,
    });
  } catch (error) {
    console.error("Erreur récupération réputation:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/reviews
// @desc    Créer un avis
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { auctionId, revieweeId, rating, comment, type, criteria } = req.body;
    const reviewerId = req.user.userId;

    console.log(
      `Création avis: ${reviewerId} -> ${revieweeId}, auction: ${auctionId}`
    );

    // Validation des données
    if (!auctionId || !revieweeId || !rating || !type) {
      return res.status(400).json({
        message:
          "Données manquantes (auctionId, revieweeId, rating, type requis)",
      });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "La note doit être entre 1 et 5" });
    }

    if (!["buyer_to_seller", "seller_to_buyer"].includes(type)) {
      return res.status(400).json({ message: "Type d'avis invalide" });
    }

    if (reviewerId === revieweeId) {
      return res.status(400).json({ message: "Impossible de s'auto-évaluer" });
    }

    // Vérifier que l'enchère existe et est terminée
    const auction = await Auction.findByPk(auctionId, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["sellerId"],
        },
      ],
    });

    if (!auction) {
      return res.status(404).json({ message: "Enchère non trouvée" });
    }

    if (auction.status !== "ended") {
      return res
        .status(400)
        .json({ message: "L'enchère doit être terminée pour donner un avis" });
    }

    // Vérifier les droits selon le type d'avis
    if (type === "buyer_to_seller") {
      if (auction.winnerId !== reviewerId) {
        return res
          .status(403)
          .json({ message: "Seul le gagnant peut évaluer le vendeur" });
      }
      if (auction.product.sellerId !== revieweeId) {
        return res.status(400).json({ message: "ID du vendeur incorrect" });
      }
    } else if (type === "seller_to_buyer") {
      if (auction.product.sellerId !== reviewerId) {
        return res
          .status(403)
          .json({ message: "Seul le vendeur peut évaluer l'acheteur" });
      }
      if (auction.winnerId !== revieweeId) {
        return res.status(400).json({ message: "ID de l'acheteur incorrect" });
      }
    }

    // Vérifier qu'un avis n'existe pas déjà
    const existingReview = await Review.findOne({
      where: { auctionId, reviewerId, type },
    });

    if (existingReview) {
      return res.status(400).json({
        message: "Vous avez déjà donné un avis pour cette transaction",
      });
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
      moderationStatus: "approved",
    });

    console.log(`Avis créé avec succès: ${review.id}`);

    res.status(201).json({
      message: "Avis créé avec succès",
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        type: review.type,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    console.error("Erreur création avis:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/reviews/auction/:auctionId/eligibility
// @desc    Vérifier si l'utilisateur peut donner un avis pour une enchère
// @access  Private
router.get("/auction/:auctionId/eligibility", auth, async (req, res) => {
  try {
    const auctionId = req.params.auctionId;
    const userId = req.user.userId;

    console.log(
      `Vérification éligibilité avis pour enchère ${auctionId}, utilisateur ${userId}`
    );

    // Récupérer l'enchère avec le produit
    const auction = await Auction.findByPk(auctionId, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["sellerId", "title"],
        },
      ],
    });

    if (!auction) {
      return res.status(404).json({ message: "Enchère non trouvée" });
    }

    if (auction.status !== "ended") {
      return res.json({
        canReviewSeller: false,
        canReviewBuyer: false,
        reason: "Enchère non terminée",
      });
    }

    const isWinner = auction.winnerId === userId;
    const isSeller = auction.product.sellerId === userId;

    if (!isWinner && !isSeller) {
      return res.json({
        canReviewSeller: false,
        canReviewBuyer: false,
        reason: "Vous n'avez pas participé à cette transaction",
      });
    }

    // Vérifier les avis existants
    const existingReviews = await Review.findAll({
      where: { auctionId, reviewerId: userId },
      attributes: ["type"],
    });

    const hasReviewedSeller = existingReviews.some(
      (r) => r.type === "buyer_to_seller"
    );
    const hasReviewedBuyer = existingReviews.some(
      (r) => r.type === "seller_to_buyer"
    );

    res.json({
      canReviewSeller: isWinner && !hasReviewedSeller,
      canReviewBuyer: isSeller && !hasReviewedBuyer,
      isWinner,
      isSeller,
      auction: {
        id: auction.id,
        title: auction.product.title,
        endedAt: auction.endTime,
      },
    });
  } catch (error) {
    console.error("Erreur vérification éligibilité:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   PUT /api/reviews/:id/response
// @desc    Répondre à un avis
// @access  Private
router.put("/:id/response", auth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { response } = req.body;
    const userId = req.user.userId;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({ message: "Réponse requise" });
    }

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Avis non trouvé" });
    }

    // Seule la personne évaluée peut répondre
    if (review.revieweeId !== userId) {
      return res
        .status(403)
        .json({ message: "Non autorisé à répondre à cet avis" });
    }

    if (review.response) {
      return res.status(400).json({ message: "Une réponse existe déjà" });
    }

    await review.update({
      response: response.trim(),
      responseDate: new Date(),
    });

    res.json({
      message: "Réponse ajoutée avec succès",
      response: response.trim(),
    });
  } catch (error) {
    console.error("Erreur ajout réponse:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/reviews/:id/report
// @desc    Signaler un avis inapproprié
// @access  Private
router.post("/:id/report", auth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { reason } = req.body;
    const reporterId = req.user.userId;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: "Raison du signalement requise" });
    }

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Avis non trouvé" });
    }

    if (review.reviewerId === reporterId) {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas signaler votre propre avis" });
    }

    await review.update({
      isReported: true,
      moderationStatus: "flagged",
      moderationNotes: `Signalé par utilisateur ${reporterId}: ${reason.trim()}`,
    });

    console.log(
      `⚠️ Avis ${reviewId} signalé par utilisateur ${reporterId} - Raison: ${reason}`
    );

    res.json({ message: "Avis signalé avec succès" });
  } catch (error) {
    console.error("Erreur signalement avis:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/reviews/badges
// @desc    Obtenir la liste des badges disponibles
// @access  Public
router.get("/badges", async (req, res) => {
  try {
    const badges = await Badge.findAll({
      where: { isActive: true },
      attributes: ["id", "name", "description", "icon", "color", "rarity"],
      order: [
        ["rarity", "DESC"],
        ["name", "ASC"],
      ],
    });

    res.json(badges);
  } catch (error) {
    console.error("Erreur récupération badges:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
