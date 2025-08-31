// backend/routes/reviews.js - Routes pour les avis et réputation
const express = require("express");
const { Review, UserReputation, User, Auction, Product } = require("../models");
const auth = require("../middleware/auth");
const reputationService = require("../services/reputationService");

const router = express.Router();

// @route   POST /api/reviews
// @desc    Créer un avis
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { auctionId, revieweeId, rating, comment, type, criteria } = req.body;

    const reviewerId = req.user.userId;

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

    const review = await reputationService.createReview({
      auctionId,
      reviewerId,
      revieweeId,
      rating,
      comment,
      type,
      criteria,
    });

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
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Obtenir les avis d'un utilisateur
// @access  Public
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { type = "received", page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const result = await reputationService.getUserReviews(userId, {
      type,
      limit: parseInt(limit),
      offset,
    });

    res.json({
      reviews: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(result.count / limit),
        totalReviews: result.count,
        hasNext: offset + result.rows.length < result.count,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Erreur récupération avis:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/reviews/reputation/:userId
// @desc    Obtenir la réputation d'un utilisateur
// @access  Public
router.get("/reputation/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const reputation = await UserReputation.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "avatar", "createdAt"],
        },
      ],
    });

    if (!reputation) {
      // Créer une réputation vide pour les nouveaux utilisateurs
      const user = await User.findByPk(userId, {
        attributes: ["id", "firstName", "lastName", "avatar", "createdAt"],
      });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      return res.json({
        userId,
        overallRating: 0,
        totalReviews: 0,
        sellerRating: 0,
        sellerReviews: 0,
        buyerRating: 0,
        buyerReviews: 0,
        trustLevel: "new",
        badges: [],
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        user,
      });
    }

    res.json(reputation);
  } catch (error) {
    console.error("Erreur récupération réputation:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/reviews/auction/:auctionId/eligibility
// @desc    Vérifier si l'utilisateur peut donner un avis pour une enchère
// @access  Private
router.get("/auction/:auctionId/eligibility", auth, async (req, res) => {
  try {
    const auctionId = req.params.auctionId;
    const userId = req.user.userId;

    // Récupérer l'enchère avec le produit
    const auction = await Auction.findByPk(auctionId, {
      include: [
        {
          model: Product,
          as: "product",
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
    res.status(500).json({ message: "Erreur serveur" });
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

    await review.update({ response });

    res.json({
      message: "Réponse ajoutée avec succès",
      response,
    });
  } catch (error) {
    console.error("Erreur ajout réponse:", error);
    res.status(500).json({ message: "Erreur serveur" });
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

    if (!reason) {
      return res.status(400).json({ message: "Raison du signalement requise" });
    }

    await reputationService.reportReview(reviewId, reporterId, reason);

    res.json({ message: "Avis signalé avec succès" });
  } catch (error) {
    console.error("Erreur signalement avis:", error);
    res.status(400).json({ message: error.message });
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
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
