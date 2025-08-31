const express = require("express");
const { Conversation, Message, User, Auction, Product } = require("../models");
const { Op } = require("sequelize");
const auth = require("../middleware/auth");
const messagingService = require("../services/messagingService");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configuration multer pour les pièces jointes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/messages/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "msg-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Type de fichier non autorisé"));
    }
  },
});

// @route   GET /api/messages/conversations
// @desc    Obtenir les conversations de l'utilisateur
// @access  Private
router.get("/conversations", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const result = await messagingService.getUserConversations(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    console.error("Erreur récupération conversations:", error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/messages/conversations
// @desc    Créer une nouvelle conversation
// @access  Private
router.post("/conversations", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { participantId, auctionId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: "ID du participant requis" });
    }

    if (participantId === userId) {
      return res
        .status(400)
        .json({
          message: "Impossible de créer une conversation avec soi-même",
        });
    }

    const conversation = await messagingService.getOrCreateConversation(
      userId,
      participantId,
      auctionId || null
    );

    res.json({
      message: "Conversation créée ou récupérée",
      conversation,
    });
  } catch (error) {
    console.error("Erreur création conversation:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/messages/conversations/:id
// @desc    Obtenir les détails d'une conversation
// @access  Private
router.get("/conversations/:id", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversationId = req.params.id;

    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: [
        {
          model: User,
          as: "participant1",
          attributes: ["id", "firstName", "lastName", "avatar"],
        },
        {
          model: User,
          as: "participant2",
          attributes: ["id", "firstName", "lastName", "avatar"],
        },
        {
          model: Auction,
          as: "auction",
          required: false,
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["title", "images"],
            },
          ],
        },
      ],
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation non trouvée" });
    }

    const otherParticipant =
      conversation.participant1Id === userId
        ? conversation.participant2
        : conversation.participant1;

    res.json({
      ...conversation.toJSON(),
      otherParticipant,
    });
  } catch (error) {
    console.error("Erreur récupération conversation:", error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/conversations/:id/messages
// @desc    Obtenir les messages d'une conversation
// @access  Private
router.get("/conversations/:id/messages", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversationId = req.params.id;
    const { page = 1, limit = 50 } = req.query;

    const result = await messagingService.getMessages(
      conversationId,
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    console.error("Erreur récupération messages:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/messages/conversations/:id/messages
// @desc    Envoyer un message
// @access  Private
router.post(
  "/conversations/:id/messages",
  auth,
  upload.single("attachment"),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const conversationId = req.params.id;
      const { content, messageType = "text", replyToId, metadata } = req.body;

      if (!content && !req.file) {
        return res.status(400).json({ message: "Contenu ou fichier requis" });
      }

      let attachments = null;
      let finalContent = content;
      let finalMessageType = messageType;

      // Gérer les pièces jointes
      if (req.file) {
        attachments = [req.file.filename];
        finalMessageType = req.file.mimetype.startsWith("image/")
          ? "image"
          : "file";
        finalContent = finalContent || req.file.originalname;
      }

      const message = await messagingService.sendMessage(
        conversationId,
        userId,
        finalContent,
        finalMessageType,
        attachments,
        metadata ? JSON.parse(metadata) : null
      );

      // Émettre via Socket.io pour le temps réel
      req.io?.to(`conversation_${conversationId}`).emit("new_message", message);

      res.status(201).json({
        message: "Message envoyé",
        data: message,
      });
    } catch (error) {
      console.error("Erreur envoi message:", error);
      res.status(400).json({ message: error.message });
    }
  }
);

// @route   PUT /api/messages/conversations/:id/read
// @desc    Marquer les messages comme lus
// @access  Private
router.put("/conversations/:id/read", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversationId = req.params.id;

    await messagingService.markAsRead(conversationId, userId);

    // Notifier l'autre participant via Socket.io
    req.io?.to(`conversation_${conversationId}`).emit("messages_read", {
      conversationId,
      readById: userId,
    });

    res.json({ message: "Messages marqués comme lus" });
  } catch (error) {
    console.error("Erreur marquage lecture:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/messages/conversations/:id/block
// @desc    Bloquer/débloquer une conversation
// @access  Private
router.put("/conversations/:id/block", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversationId = req.params.id;
    const { block = true } = req.body;

    const conversation = await messagingService.blockConversation(
      conversationId,
      userId,
      block
    );

    res.json({
      message: block ? "Conversation bloquée" : "Conversation débloquée",
      conversation,
    });
  } catch (error) {
    console.error("Erreur blocage conversation:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/messages/search
// @desc    Rechercher des conversations ou utilisateurs
// @access  Private
router.get("/search", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { q: query, type = "conversations" } = req.query;

    if (!query || query.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Requête trop courte (min 2 caractères)" });
    }

    let results = [];

    if (type === "conversations") {
      results = await messagingService.searchConversations(
        userId,
        query.trim()
      );
    } else if (type === "users") {
      // Rechercher des utilisateurs pour démarrer de nouvelles conversations
      const users = await User.findAll({
        where: {
          id: { [Op.ne]: userId }, // Exclure l'utilisateur actuel
          [Op.or]: [
            { firstName: { [Op.like]: `%${query.trim()}%` } },
            { lastName: { [Op.like]: `%${query.trim()}%` } },
            { email: { [Op.like]: `%${query.trim()}%` } },
          ],
        },
        attributes: ["id", "firstName", "lastName", "avatar"],
        limit: 10,
      });
      results = users;
    }

    res.json({ results });
  } catch (error) {
    console.error("Erreur recherche messages:", error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Obtenir le nombre total de messages non lus
// @access  Private
router.get("/unread-count", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const unreadCount = await Message.count({
      include: [
        {
          model: Conversation,
          as: "conversation",
          where: {
            [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
          },
        },
      ],
      where: {
        senderId: { [Op.ne]: userId },
        isRead: false,
      },
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error("Erreur comptage messages non lus:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
