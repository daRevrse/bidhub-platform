// backend/routes/messages.js - VERSION CORRIGÉE AVEC SOCKET.IO
const express = require("express");
const multer = require("multer");
const router = express.Router();
const auth = require("../middleware/auth");
const messagingService = require("../services/messagingService");
const NotificationService = require("../services/notificationService");

// Configuration multer pour les fichiers de messages
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/messages/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Accepter images, documents et fichiers audio
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|wav|ogg|m4a/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Type de fichier non supporté"));
    }
  },
});

// @route   GET /api/messages/conversations
// @desc    Obtenir toutes les conversations de l'utilisateur
// @access  Private
router.get("/conversations", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, search } = req.query;

    let conversations;
    if (search) {
      conversations = await messagingService.searchConversations(
        userId,
        search,
        parseInt(limit)
      );
    } else {
      conversations = await messagingService.getUserConversations(
        userId,
        parseInt(page),
        parseInt(limit)
      );
    }

    res.json({
      conversations,
      currentPage: parseInt(page),
      hasMore: conversations.length === parseInt(limit),
    });
  } catch (error) {
    console.error("Erreur récupération conversations:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/messages/conversations
// @desc    Créer ou obtenir une conversation
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
      auctionId
    );

    res.status(201).json({
      message: "Conversation créée/récupérée",
      conversation,
    });
  } catch (error) {
    console.error("Erreur création conversation:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/messages/conversations/:id
// @desc    Obtenir une conversation spécifique
// @access  Private
router.get("/conversations/:id", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversationId = req.params.id;

    const conversation = await messagingService.getConversation(
      conversationId,
      userId
    );

    res.json({ conversation });
  } catch (error) {
    console.error("Erreur récupération conversation:", error);
    res.status(400).json({ message: error.message });
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
  upload.single("file"),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const conversationId = req.params.id;
      const { content, messageType = "text", metadata, replyToId } = req.body;

      let finalContent = content;
      let finalMessageType = messageType;
      let attachments = [];

      // Traitement du fichier uploadé
      if (req.file) {
        attachments.push({
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
        });

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
        metadata ? JSON.parse(metadata) : null,
        replyToId
      );

      // ÉMETTRE VIA SOCKET.IO POUR LE TEMPS RÉEL
      if (req.io) {
        req.io
          .to(`conversation_${conversationId}`)
          .emit("new_message", message);
        console.log(
          `💬 Message diffusé via Socket.io dans conversation ${conversationId}`
        );
      }

      // Obtenir les détails de la conversation pour les notifications
      const conversation = await messagingService.getConversation(
        conversationId,
        userId
      );

      // Envoyer notification à l'autre participant
      const otherParticipantId =
        conversation.participant1Id === userId
          ? conversation.participant2Id
          : conversation.participant1Id;

      if (otherParticipantId) {
        const senderName = `${req.user.firstName} ${req.user.lastName}`;
        const preview =
          finalMessageType === "text"
            ? finalContent.length > 50
              ? finalContent.substring(0, 50) + "..."
              : finalContent
            : `[${finalMessageType === "image" ? "Image" : "Fichier"}]`;

        await NotificationService.notifyNewMessage(
          otherParticipantId,
          userId,
          senderName,
          preview,
          conversationId
        );
      }

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

    // NOTIFIER L'AUTRE PARTICIPANT VIA SOCKET.IO
    if (req.io) {
      req.io.to(`conversation_${conversationId}`).emit("messages_read", {
        conversationId,
        readById: userId,
        timestamp: new Date(),
      });
      console.log(
        `💬 Messages read notification diffusée pour conversation ${conversationId}`
      );
    }

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

    // Notifier via Socket.io
    if (req.io) {
      req.io.to(`conversation_${conversationId}`).emit("conversation_blocked", {
        conversationId,
        blockedBy: userId,
        blocked: block,
        timestamp: new Date(),
      });
    }

    res.json({
      message: block ? "Conversation bloquée" : "Conversation débloquée",
      conversation,
    });
  } catch (error) {
    console.error("Erreur blocage conversation:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/messages/conversations/:id
// @desc    Supprimer une conversation
// @access  Private
router.delete("/conversations/:id", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversationId = req.params.id;

    await messagingService.deleteConversation(conversationId, userId);

    // Notifier via Socket.io
    if (req.io) {
      req.io.to(`conversation_${conversationId}`).emit("conversation_deleted", {
        conversationId,
        deletedBy: userId,
        timestamp: new Date(),
      });
    }

    res.json({ message: "Conversation supprimée" });
  } catch (error) {
    console.error("Erreur suppression conversation:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Obtenir le nombre de messages non lus
// @access  Private
router.get("/unread-count", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const unreadCount = await messagingService.getUnreadCount(userId);

    res.json({ unreadCount });
  } catch (error) {
    console.error("Erreur comptage messages non lus:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/messages/:messageId
// @desc    Modifier un message
// @access  Private
router.put("/:messageId", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const messageId = req.params.messageId;
    const { content } = req.body;

    const updatedMessage = await messagingService.editMessage(
      messageId,
      userId,
      content
    );

    // Notifier via Socket.io
    if (req.io && updatedMessage) {
      req.io
        .to(`conversation_${updatedMessage.conversationId}`)
        .emit("message_updated", {
          message: updatedMessage,
          timestamp: new Date(),
        });
    }

    res.json({
      message: "Message modifié",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Erreur modification message:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Supprimer un message
// @access  Private
router.delete("/:messageId", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const messageId = req.params.messageId;

    const deletedMessage = await messagingService.deleteMessage(
      messageId,
      userId
    );

    // Notifier via Socket.io
    if (req.io && deletedMessage) {
      req.io
        .to(`conversation_${deletedMessage.conversationId}`)
        .emit("message_deleted", {
          messageId,
          conversationId: deletedMessage.conversationId,
          timestamp: new Date(),
        });
    }

    res.json({ message: "Message supprimé" });
  } catch (error) {
    console.error("Erreur suppression message:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/messages/search
// @desc    Rechercher dans les messages
// @access  Private
router.get("/search", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query, conversationId, page = 1, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Terme de recherche requis" });
    }

    const results = await messagingService.searchMessages(
      userId,
      query,
      conversationId,
      parseInt(page),
      parseInt(limit)
    );

    res.json(results);
  } catch (error) {
    console.error("Erreur recherche messages:", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
