// backend/routes/sellerRequests.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const { SellerRequest, User, Category } = require("../models");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const NotificationService = require("../services/notificationService");
const EmailService = require("../services/emailService");

const router = express.Router();

// Configuration multer pour les documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/seller-requests/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Type de fichier non supporté"));
    }
  },
});

// @route   POST /api/seller-requests
// @desc    Créer une nouvelle demande de vendeur
// @access  Private
router.post(
  "/",
  auth,
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "businessDocument", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        businessName,
        businessType,
        businessDescription,
        businessAddress,
        businessPhone,
        businessEmail,
        experienceDescription,
        categoriesOfInterest,
        expectedMonthlyVolume,
      } = req.body;

      // Vérifier si l'utilisateur a déjà une demande en cours
      const existingRequest = await SellerRequest.findOne({
        where: {
          userId: req.user.userId,
          status: "pending",
        },
      });

      if (existingRequest) {
        return res.status(400).json({
          message: "Vous avez déjà une demande en cours de traitement",
        });
      }

      // Vérifier si l'utilisateur est déjà vendeur
      const user = await User.findByPk(req.user.userId);
      if (user.role === "seller" || user.role === "admin") {
        return res.status(400).json({
          message: "Vous êtes déjà autorisé à vendre",
        });
      }

      // Traiter les fichiers uploadés
      const idDocument = req.files?.idDocument?.[0]?.filename || null;
      const businessDocument =
        req.files?.businessDocument?.[0]?.filename || null;

      // Créer la demande
      const sellerRequest = await SellerRequest.create({
        userId: req.user.userId,
        businessName,
        businessType,
        businessDescription,
        businessAddress,
        businessPhone,
        businessEmail,
        idDocument,
        businessDocument,
        experienceDescription,
        categoriesOfInterest: categoriesOfInterest
          ? JSON.parse(categoriesOfInterest)
          : null,
        expectedMonthlyVolume,
        status: "pending",
        submittedAt: new Date(),
      });

      // Notifier les administrateurs
      await NotificationService.notifyAdmins({
        type: "seller_request_submitted",
        title: "Nouvelle demande de vendeur",
        message: `${user.firstName} ${user.lastName} a soumis une demande pour devenir vendeur`,
        data: { requestId: sellerRequest.id, userId: user.id },
      });

      res.status(201).json({
        message: "Demande soumise avec succès",
        request: sellerRequest,
      });
    } catch (error) {
      console.error("Erreur création demande vendeur:", error);
      res.status(500).json({
        message: "Erreur lors de la soumission de la demande",
        error: error.message,
      });
    }
  }
);

// @route   GET /api/seller-requests/my-request
// @desc    Obtenir la demande actuelle de l'utilisateur
// @access  Private
router.get("/my-request", auth, async (req, res) => {
  try {
    const request = await SellerRequest.findOne({
      where: { userId: req.user.userId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["firstName", "lastName"],
        },
      ],
    });

    res.json({ request });
  } catch (error) {
    console.error("Erreur récupération demande:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/seller-requests
// @desc    Obtenir toutes les demandes (admin seulement)
// @access  Private/Admin
router.get("/", auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, businessType, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (businessType) whereClause.businessType = businessType;

    const includeClause = [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "phone"],
      },
      {
        model: User,
        as: "reviewer",
        attributes: ["firstName", "lastName"],
        required: false,
      },
    ];

    // Ajout de la recherche
    if (search) {
      includeClause[0].where = {
        [require("sequelize").Op.or]: [
          { firstName: { [require("sequelize").Op.like]: `%${search}%` } },
          { lastName: { [require("sequelize").Op.like]: `%${search}%` } },
          { email: { [require("sequelize").Op.like]: `%${search}%` } },
        ],
      };
    }

    const requests = await SellerRequest.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["submittedAt", "DESC"]],
    });

    res.json({
      requests: requests.rows,
      totalPages: Math.ceil(requests.count / limit),
      currentPage: parseInt(page),
      totalRequests: requests.count,
    });
  } catch (error) {
    console.error("Erreur récupération demandes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/seller-requests/:id
// @desc    Obtenir une demande spécifique
// @access  Private/Admin
router.get("/:id", auth, adminAuth, async (req, res) => {
  try {
    const request = await SellerRequest.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "avatar",
            "address",
            "city",
            "country",
            "createdAt",
          ],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["firstName", "lastName"],
        },
      ],
    });

    if (!request) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    res.json({ request });
  } catch (error) {
    console.error("Erreur récupération demande:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   PUT /api/seller-requests/:id/approve
// @desc    Approuver une demande de vendeur
// @access  Private/Admin
router.put("/:id/approve", auth, adminAuth, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const requestId = req.params.id;

    const sellerRequest = await SellerRequest.findByPk(requestId, {
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });

    if (!sellerRequest) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    if (sellerRequest.status !== "pending") {
      return res.status(400).json({
        message: "Cette demande a déjà été traitée",
      });
    }

    // Mettre à jour la demande
    await sellerRequest.update({
      status: "approved",
      reviewedAt: new Date(),
      reviewedBy: req.user.userId,
      adminNotes,
    });

    // Promouvoir l'utilisateur au rôle de vendeur
    await sellerRequest.user.update({
      role: "seller",
    });

    // Notifier l'utilisateur
    await NotificationService.create({
      userId: sellerRequest.userId,
      type: "seller_request_approved",
      title: "Demande de vendeur approuvée",
      message:
        "Félicitations ! Votre demande pour devenir vendeur a été approuvée. Vous pouvez maintenant créer des enchères.",
      data: { requestId },
    });

    // Envoyer un email
    try {
      await EmailService.sendSellerRequestApproval(
        sellerRequest.user,
        sellerRequest
      );
    } catch (emailError) {
      console.error("Erreur envoi email:", emailError);
    }

    res.json({
      message: "Demande approuvée avec succès",
      request: sellerRequest,
    });
  } catch (error) {
    console.error("Erreur approbation demande:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   PUT /api/seller-requests/:id/reject
// @desc    Rejeter une demande de vendeur
// @access  Private/Admin
router.put("/:id/reject", auth, adminAuth, async (req, res) => {
  try {
    const { rejectionReason, adminNotes } = req.body;
    const requestId = req.params.id;

    if (!rejectionReason) {
      return res.status(400).json({
        message: "La raison du rejet est requise",
      });
    }

    const sellerRequest = await SellerRequest.findByPk(requestId, {
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });

    if (!sellerRequest) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    if (sellerRequest.status !== "pending") {
      return res.status(400).json({
        message: "Cette demande a déjà été traitée",
      });
    }

    // Mettre à jour la demande
    await sellerRequest.update({
      status: "rejected",
      reviewedAt: new Date(),
      reviewedBy: req.user.userId,
      rejectionReason,
      adminNotes,
    });

    // Notifier l'utilisateur
    await NotificationService.createNotification({
      userId: sellerRequest.userId,
      type: "seller_request_rejected",
      title: "Demande de vendeur rejetée",
      message: `Votre demande pour devenir vendeur a été rejetée. Raison: ${rejectionReason}`,
      data: { requestId, rejectionReason },
      priority: "high",
      actionUrl: "/become-seller",
    });

    // Envoyer un email
    try {
      await EmailService.sendSellerRequestRejection(
        sellerRequest.user,
        sellerRequest
      );
    } catch (emailError) {
      console.error("Erreur envoi email:", emailError);
    }

    res.json({
      message: "Demande rejetée",
      request: sellerRequest,
    });
  } catch (error) {
    console.error("Erreur rejet demande:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/seller-requests/stats
// @desc    Obtenir les statistiques des demandes
// @access  Private/Admin
router.get("/stats", auth, adminAuth, async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      SellerRequest.count(),
      SellerRequest.count({ where: { status: "pending" } }),
      SellerRequest.count({ where: { status: "approved" } }),
      SellerRequest.count({ where: { status: "rejected" } }),
    ]);

    // Statistiques par type d'activité
    const businessTypeStats = await SellerRequest.findAll({
      attributes: [
        "businessType",
        [
          require("sequelize").fn(
            "COUNT",
            require("sequelize").col("businessType")
          ),
          "count",
        ],
      ],
      group: ["businessType"],
      raw: true,
    });

    // Demandes récentes (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRequests = await SellerRequest.count({
      where: {
        submittedAt: {
          [require("sequelize").Op.gte]: sevenDaysAgo,
        },
      },
    });

    res.json({
      total,
      pending,
      approved,
      rejected,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0,
      businessTypeStats,
      recentRequests,
    });
  } catch (error) {
    console.error("Erreur statistiques demandes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
