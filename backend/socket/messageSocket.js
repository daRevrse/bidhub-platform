const jwt = require("jsonwebtoken");
const { Conversation } = require("../models");
const { Op } = require("sequelize");

class MessageSocketManager {
  constructor(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`💬 User connected to messaging: ${socket.id}`);

      // Authentification
      socket.on("authenticate", async (token) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.userId = decoded.userId;
          socket.userEmail = decoded.email;

          // Rejoindre toutes les conversations de l'utilisateur
          const conversations = await Conversation.findAll({
            where: {
              [Op.or]: [
                { participant1Id: socket.userId },
                { participant2Id: socket.userId },
              ],
            },
          });

          conversations.forEach((conv) => {
            socket.join(`conversation_${conv.id}`);
          });

          socket.emit("authenticated", { success: true });
          console.log(
            `✅ User authenticated for messaging: ${socket.userEmail}`
          );
        } catch (error) {
          socket.emit("auth_error", "Invalid token");
        }
      });

      // Rejoindre une conversation spécifique
      socket.on("join_conversation", async (conversationId) => {
        if (!socket.userId) {
          socket.emit("error", "Not authenticated");
          return;
        }

        try {
          const conversation = await Conversation.findOne({
            where: {
              id: conversationId,
              [Op.or]: [
                { participant1Id: socket.userId },
                { participant2Id: socket.userId },
              ],
            },
          });

          if (!conversation) {
            socket.emit("error", "Conversation not found");
            return;
          }

          socket.join(`conversation_${conversationId}`);
          socket.emit("joined_conversation", { conversationId });

          // Notifier l'autre participant de la présence
          socket.to(`conversation_${conversationId}`).emit("user_online", {
            userId: socket.userId,
            conversationId,
          });
        } catch (error) {
          socket.emit("error", "Error joining conversation");
        }
      });

      // Quitter une conversation
      socket.on("leave_conversation", (conversationId) => {
        socket.leave(`conversation_${conversationId}`);

        // Notifier l'autre participant
        socket.to(`conversation_${conversationId}`).emit("user_offline", {
          userId: socket.userId,
          conversationId,
        });
      });

      // Indicateur "en train d'écrire"
      socket.on("typing", (data) => {
        const { conversationId, isTyping } = data;

        socket.to(`conversation_${conversationId}`).emit("user_typing", {
          userId: socket.userId,
          conversationId,
          isTyping,
        });
      });

      // Déconnexion
      socket.on("disconnect", () => {
        console.log(`💬 User disconnected from messaging: ${socket.id}`);

        // Notifier toutes les conversations de la déconnexion
        if (socket.userId) {
          socket.broadcast.emit("user_disconnected", {
            userId: socket.userId,
          });
        }
      });
    });
  }

  // Envoyer une notification de nouveau message
  notifyNewMessage(conversationId, message) {
    this.io.to(`conversation_${conversationId}`).emit("new_message", message);
  }

  // Notifier qu'un utilisateur est en ligne
  notifyUserOnline(userId) {
    this.io.emit("user_online", { userId });
  }

  // Notifier qu'un utilisateur est hors ligne
  notifyUserOffline(userId) {
    this.io.emit("user_offline", { userId });
  }
}

module.exports = MessageSocketManager;
