const express = require("express");
const auth = require("../middleware/auth");
const {
  Auction,
  Product,
  User,
  Bid,
  AuctionView,
  UserFavorite,
} = require("../models");
const { Op } = require("sequelize");
const notificationService = require("../services/notificationService");

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
// router.get("/:id", async (req, res) => {
//   try {
//     const auction = await Auction.findByPk(req.params.id, {
//       include: [
//         {
//           model: Product,
//           as: "product",
//           include: [
//             {
//               model: User,
//               as: "seller",
//               attributes: ["id", "firstName", "lastName", "avatar"],
//             },
//           ],
//         },
//         {
//           model: Bid,
//           as: "bids",
//           include: [
//             {
//               model: User,
//               as: "bidder",
//               attributes: ["id", "firstName", "lastName"],
//             },
//           ],
//           order: [["amount", "DESC"]],
//           limit: 10,
//         },
//       ],
//     });

//     if (!auction) {
//       return res.status(404).json({ message: "Enchère non trouvée" });
//     }

//     res.json(auction);
//   } catch (error) {
//     console.error("Erreur récupération enchère:", error);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// });

// @route   POST /api/auctions
// @desc    Créer une nouvelle enchère pour un produit
// @access  Private
// router.post("/", auth, async (req, res) => {
//   try {
//     const { productId, startingPrice, reservePrice, startTime, endTime } =
//       req.body;

//     // Vérifier que le produit appartient à l'utilisateur
//     const product = await Product.findOne({
//       where: { id: productId, sellerId: req.user.userId },
//     });

//     if (!product) {
//       return res
//         .status(404)
//         .json({ message: "Produit non trouvé ou non autorisé" });
//     }

//     // Vérifier qu'il n'y a pas déjà d'enchère pour ce produit
//     const existingAuction = await Auction.findOne({ where: { productId } });
//     if (existingAuction) {
//       return res
//         .status(400)
//         .json({ message: "Une enchère existe déjà pour ce produit" });
//     }

//     const auction = await Auction.create({
//       productId,
//       startingPrice,
//       currentPrice: startingPrice,
//       reservePrice,
//       startTime: new Date(startTime),
//       endTime: new Date(endTime),
//     });

//     // Mettre à jour le statut du produit
//     await product.update({ status: "active" });

//     res.status(201).json({
//       message: "Enchère créée avec succès",
//       auction,
//     });
//   } catch (error) {
//     console.error("Erreur création enchère:", error);
//     res
//       .status(500)
//       .json({ message: "Erreur lors de la création de l'enchère" });
//   }
// });

// @route   POST /api/auctions/:id/bid
// @desc    Placer une offre sur une enchère
// @access  Private
// router.post("/:id/bid", auth, async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const auctionId = req.params.id;

//     const auction = await Auction.findByPk(auctionId, {
//       include: [
//         {
//           model: Product,
//           as: "product",
//         },
//       ],
//     });

//     if (!auction) {
//       return res.status(404).json({ message: "Enchère non trouvée" });
//     }

//     // Vérifications
//     if (auction.status !== "active") {
//       return res
//         .status(400)
//         .json({ message: "Cette enchère n'est pas active" });
//     }

//     if (new Date() > auction.endTime) {
//       return res.status(400).json({ message: "Cette enchère est terminée" });
//     }

//     if (amount <= auction.currentPrice) {
//       return res.status(400).json({
//         message: `L'offre doit être supérieure à ${auction.currentPrice} FCFA`,
//       });
//     }

//     if (auction.product.sellerId === req.user.userId) {
//       return res.status(400).json({
//         message: "Vous ne pouvez pas enchérir sur votre propre produit",
//       });
//     }

//     // Créer l'offre
//     const bid = await Bid.create({
//       auctionId,
//       bidderId: req.user.userId,
//       amount,
//     });

//     // Mettre à jour le prix courant de l'enchère
//     await auction.update({ currentPrice: amount });

//     res.status(201).json({
//       message: "Offre placée avec succès",
//       bid,
//     });
//   } catch (error) {
//     console.error("Erreur placement offre:", error);
//     res.status(500).json({ message: "Erreur lors du placement de l'offre" });
//   }
// });

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

// @route   GET /api/auctions
// @desc    Obtenir les enchères avec filtres avancés
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      status = "active",
      page = 1,
      limit = 12,
      featured = false,
      category = "",
      search = "",
      sortBy = "endTime",
      sortOrder = "ASC",
      priceMin = "",
      priceMax = "",
      condition = "",
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = {};
    let productWhereClause = {};

    // Filtrage par statut
    if (status) {
      whereClause.status = status;
    }

    // Filtrage par prix
    if (priceMin || priceMax) {
      whereClause.currentPrice = {};
      if (priceMin) whereClause.currentPrice[Op.gte] = parseFloat(priceMin);
      if (priceMax) whereClause.currentPrice[Op.lte] = parseFloat(priceMax);
    }

    // Filtrage des produits
    if (category) {
      productWhereClause.category = category;
    }
    if (condition) {
      productWhereClause.condition = condition;
    }
    if (search) {
      productWhereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Si "featured" est demandé, on prend les enchères avec le plus d'activité
    if (featured === "true") {
      // Simuler des enchères "featured" en prenant celles avec le plus de vues/offres
      whereClause[Op.or] = [
        { views: { [Op.gte]: 10 } }, // Plus de 10 vues
        { "$bids.id$": { [Op.not]: null } }, // Qui ont des offres
      ];
    }

    // Configuration du tri
    let orderClause = [];
    const validSortFields = {
      endTime: "endTime",
      currentPrice: "currentPrice",
      createdAt: "createdAt",
      views: "views",
    };

    if (validSortFields[sortBy]) {
      orderClause.push([validSortFields[sortBy], sortOrder.toUpperCase()]);
    } else {
      orderClause.push(["endTime", "ASC"]); // Tri par défaut
    }

    const auctions = await Auction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "product",
          where:
            Object.keys(productWhereClause).length > 0
              ? productWhereClause
              : undefined,
          include: [
            {
              model: User,
              as: "seller",
              attributes: [
                "id",
                "firstName",
                "lastName",
                "avatar",
                "isVerified",
              ],
            },
          ],
        },
        {
          model: Bid,
          as: "bids",
          required: featured === "true" ? false : false, // Pour compter les bids
          separate: false, // Important pour les agrégations
          limit: 1,
          order: [["amount", "DESC"]],
        },
      ],
      distinct: true, // Important pour éviter les doublons avec les JOINs
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: orderClause,
      subQuery: false, // Performance optimization
    });

    // Ajouter des informations calculées pour chaque enchère
    const enhancedAuctions = await Promise.all(
      auctions.rows.map(async (auction) => {
        const auctionData = auction.toJSON();

        // Compter le nombre total d'offres
        const bidCount = await Bid.count({ where: { auctionId: auction.id } });

        // Calculer le temps restant
        const now = new Date();
        const endTime = new Date(auction.endTime);
        const timeRemainingMs = endTime - now;

        let timeRemaining = null;
        if (timeRemainingMs > 0) {
          const days = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60)
          );

          if (days > 0) {
            timeRemaining = `${days}j ${hours}h`;
          } else if (hours > 0) {
            timeRemaining = `${hours}h ${minutes}min`;
          } else {
            timeRemaining = `${minutes}min`;
          }
        } else {
          timeRemaining = "Terminée";
        }

        return {
          ...auctionData,
          bidCount,
          timeRemaining,
          isEnding: timeRemainingMs > 0 && timeRemainingMs < 2 * 60 * 60 * 1000, // Termine dans moins de 2h
          // Ajouter un indicateur de popularité pour le frontend
          popularity: Math.min(100, (auction.views || 0) + bidCount * 5),
        };
      })
    );

    res.json({
      auctions: enhancedAuctions,
      totalPages: Math.ceil(auctions.count / limit),
      currentPage: parseInt(page),
      totalAuctions: auctions.count,
      hasNextPage: page < Math.ceil(auctions.count / limit),
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("Erreur récupération enchères:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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
              attributes: [
                "id",
                "firstName",
                "lastName",
                "avatar",
                "isVerified",
                "createdAt",
              ],
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
              attributes: ["id", "firstName", "lastName", "avatar"],
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

    // Incrémenter le compteur de vues
    await auction.increment("views", { by: 1 });

    // Calculer des statistiques supplémentaires
    const totalBids = await Bid.count({ where: { auctionId: auction.id } });
    const uniqueBidders = await Bid.count({
      where: { auctionId: auction.id },
      distinct: true,
      col: "bidderId",
    });

    const auctionData = auction.toJSON();
    auctionData.stats = {
      totalBids,
      uniqueBidders,
      views: auction.views || 0,
    };

    res.json(auctionData);
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
      startTime: startTime || new Date(),
      endTime,
      status: "active",
      views: 0,
    });

    // Récupérer l'enchère créée avec les relations
    const createdAuction = await Auction.findByPk(auction.id, {
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
    });

    res.status(201).json({
      message: "Enchère créée avec succès",
      auction: createdAuction,
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
    const userId = req.user.userId;

    // Vérifier que l'enchère existe et est active
    const auction = await Auction.findByPk(auctionId, {
      include: [
        {
          model: Product,
          as: "product",
          include: [
            {
              model: User,
              as: "seller",
              attributes: ["id"],
            },
          ],
        },
      ],
    });

    if (!auction) {
      return res.status(404).json({ message: "Enchère non trouvée" });
    }

    if (auction.status !== "active") {
      return res
        .status(400)
        .json({ message: "Cette enchère n'est plus active" });
    }

    // Vérifier que l'utilisateur n'est pas le vendeur
    if (auction.product.seller.id === userId) {
      return res.status(400).json({
        message: "Vous ne pouvez pas enchérir sur votre propre produit",
      });
    }

    // Vérifier que l'offre est supérieure à l'offre actuelle
    if (amount <= auction.currentPrice) {
      return res.status(400).json({
        message: `L'offre doit être supérieure à ${auction.currentPrice} FCFA`,
      });
    }

    // Vérifier que l'enchère n'est pas terminée
    if (new Date() > new Date(auction.endTime)) {
      return res.status(400).json({ message: "Cette enchère est terminée" });
    }

    // Créer l'offre
    const bid = await Bid.create({
      auctionId,
      bidderId: userId,
      amount,
    });

    // Mettre à jour le prix courant de l'enchère
    await auction.update({ currentPrice: amount });

    await notificationService.notifyBidPlaced(
      auctionId,
      req.user.userId, // ID du nouvel enchérisseur
      amount, // Montant de l'enchère
      auction.product.sellerId, // ID du vendeur
      auction.product.title // Titre du produit
    );

    // Récupérer l'offre créée avec les relations
    const createdBid = await Bid.findByPk(bid.id, {
      include: [
        {
          model: User,
          as: "bidder",
          attributes: ["id", "firstName", "lastName", "avatar"],
        },
      ],
    });

    res.status(201).json({
      message: "Offre placée avec succès",
      bid: createdBid,
      newCurrentPrice: amount,
    });
  } catch (error) {
    console.error("Erreur placement offre:", error);
    res.status(500).json({ message: "Erreur lors du placement de l'offre" });
  }
});

// @route   POST /api/auctions/:id/favorite
// @desc    Ajouter/retirer une enchère des favoris
// @access  Private
router.post("/:id/favorite", auth, async (req, res) => {
  try {
    const auctionId = req.params.id;
    const userId = req.user.userId;

    // Vérifier que l'enchère existe
    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Enchère non trouvée" });
    }

    // Vérifier si elle est déjà en favoris
    const existingFavorite = await UserFavorite.findOne({
      where: { userId, auctionId },
    });

    if (existingFavorite) {
      // Retirer des favoris
      await existingFavorite.destroy();
      res.json({ message: "Enchère retirée des favoris", isFavorite: false });
    } else {
      // Ajouter aux favoris
      await UserFavorite.create({ userId, auctionId });
      res.json({ message: "Enchère ajoutée aux favoris", isFavorite: true });
    }
  } catch (error) {
    console.error("Erreur gestion favoris:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/auctions/:id/similar
// @desc    Obtenir des enchères similaires
// @access  Public
router.get("/:id/similar", async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id, {
      include: [{ model: Product, as: "product" }],
    });

    if (!auction) {
      return res.status(404).json({ message: "Enchère non trouvée" });
    }

    // Trouver des enchères similaires par catégorie
    const similarAuctions = await Auction.findAll({
      where: {
        id: { [Op.ne]: auction.id }, // Exclure l'enchère actuelle
        status: "active",
      },
      include: [
        {
          model: Product,
          as: "product",
          where: {
            category: auction.product.category,
          },
          include: [
            {
              model: User,
              as: "seller",
              attributes: ["id", "firstName", "lastName", "avatar"],
            },
          ],
        },
      ],
      limit: 6,
      order: [["createdAt", "DESC"]],
    });

    res.json(similarAuctions);
  } catch (error) {
    console.error("Erreur enchères similaires:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/auctions/categories/list
// @desc    Obtenir la liste des catégories avec compteurs
// @access  Public
router.get("/categories/list", async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: [
        "category",
        [
          require("sequelize").fn(
            "COUNT",
            require("sequelize").col("category")
          ),
          "count",
        ],
      ],
      include: [
        {
          model: Auction,
          as: "auction",
          where: { status: "active" },
          required: true,
          attributes: [],
        },
      ],
      group: ["category"],
      order: [
        [
          require("sequelize").fn(
            "COUNT",
            require("sequelize").col("category")
          ),
          "DESC",
        ],
      ],
    });

    const categoryList = categories.map((cat) => ({
      name: cat.category,
      count: parseInt(cat.get("count")),
      slug: cat.category.toLowerCase().replace(/\s+/g, "-"),
    }));

    res.json(categoryList);
  } catch (error) {
    console.error("Erreur liste catégories:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
