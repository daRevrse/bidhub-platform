const express = require("express");
const { Auction, Product, User, Bid } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/auctions
// @desc    Obtenir toutes les enchères actives
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { status = "active", page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const auctions = await Auction.findAndCountAll({
      where: { status },
      include: [
        {
          model: Product,
          as: "product",
          include: [
            {
              model: User,
              as: "seller",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["endTime", "ASC"]],
    });

    res.json({
      auctions: auctions.rows,
      totalPages: Math.ceil(auctions.count / limit),
      currentPage: parseInt(page),
      totalAuctions: auctions.count,
    });
  } catch (error) {
    console.error("Erreur récupération enchères:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/auctions/:id
// @desc    Obtenir une enchère par ID avec ses offres
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: "product",
          include: [
            {
              model: User,
              as: "seller",
              attributes: ["id", "firstName", "lastName", "avatar"],
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
              attributes: ["id", "firstName", "lastName"],
            },
          ],
          order: [["amount", "DESC"]],
          limit: 10,
        },
      ],
    });

    if (!auction) {
      return res.status(404).json({ message: "Enchère non trouvée" });
    }

    res.json(auction);
  } catch (error) {
    console.error("Erreur récupération enchère:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   POST /api/auctions
// @desc    Créer une nouvelle enchère pour un produit
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { productId, startingPrice, reservePrice, startTime, endTime } =
      req.body;

    // Vérifier que le produit appartient à l'utilisateur
    const product = await Product.findOne({
      where: { id: productId, sellerId: req.user.userId },
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: "Produit non trouvé ou non autorisé" });
    }

    // Vérifier qu'il n'y a pas déjà d'enchère pour ce produit
    const existingAuction = await Auction.findOne({ where: { productId } });
    if (existingAuction) {
      return res
        .status(400)
        .json({ message: "Une enchère existe déjà pour ce produit" });
    }

    const auction = await Auction.create({
      productId,
      startingPrice,
      currentPrice: startingPrice,
      reservePrice,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    // Mettre à jour le statut du produit
    await product.update({ status: "active" });

    res.status(201).json({
      message: "Enchère créée avec succès",
      auction,
    });
  } catch (error) {
    console.error("Erreur création enchère:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'enchère" });
  }
});

// @route   POST /api/auctions/:id/bid
// @desc    Placer une offre sur une enchère
// @access  Private
router.post("/:id/bid", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const auctionId = req.params.id;

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

    // Vérifications
    if (auction.status !== "active") {
      return res
        .status(400)
        .json({ message: "Cette enchère n'est pas active" });
    }

    if (new Date() > auction.endTime) {
      return res.status(400).json({ message: "Cette enchère est terminée" });
    }

    if (amount <= auction.currentPrice) {
      return res.status(400).json({
        message: `L'offre doit être supérieure à ${auction.currentPrice} FCFA`,
      });
    }

    if (auction.product.sellerId === req.user.userId) {
      return res.status(400).json({
        message: "Vous ne pouvez pas enchérir sur votre propre produit",
      });
    }

    // Créer l'offre
    const bid = await Bid.create({
      auctionId,
      bidderId: req.user.userId,
      amount,
    });

    // Mettre à jour le prix courant de l'enchère
    await auction.update({ currentPrice: amount });

    res.status(201).json({
      message: "Offre placée avec succès",
      bid,
    });
  } catch (error) {
    console.error("Erreur placement offre:", error);
    res.status(500).json({ message: "Erreur lors du placement de l'offre" });
  }
});

// @route   POST /api/auctions/:id/view
// @desc    Marquer une enchère comme vue
// @access  Private
router.post("/:id/view", auth, async (req, res) => {
  try {
    const auctionId = req.params.id;
    const userId = req.user.userId;
    const { AuctionView } = require("../models");

    // Vérifier que l'enchère existe
    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Enchère non trouvée" });
    }

    // Vérifier si l'utilisateur a déjà vu cette enchère
    const existingView = await AuctionView.findOne({
      where: {
        userId: userId,
        auctionId: auctionId,
      },
    });

    if (!existingView) {
      // Créer une nouvelle vue
      await AuctionView.create({
        userId: userId,
        auctionId: auctionId,
      });

      // Incrémenter le compteur de vues de l'enchère
      await auction.increment("views", { by: 1 });
    }

    res.json({ message: "Vue enregistrée" });
  } catch (error) {
    console.error("Erreur enregistrement vue:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
