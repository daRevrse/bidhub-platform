// backend/socket/messageSocket.js - GESTIONNAIRE SOCKET MESSAGES COMPLET
const jwt = require("jsonwebtoken");
const { Conversation, User } = require("../models");
const { Op } = require("sequelize");

class MessageSocketManager {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // userId -> socketId
    this.onlineUsers = new Set(); // Set des utilisateurs en ligne
    this.typingUsers = new Map(); // conversationId -> Set of userIds
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`💬 User connected to messaging: ${socket.id}`);

      // Authentification
      // socket.on("authenticate", async (data) => {
      //   try {
      //     let token;

      //     // Gérer les différents formats d'authentification
      //     if (typeof data === "string") {
      //       // Format: socket.emit("authenticate", "jwt_token_string")
      //       token = data;
      //     } else if (data && typeof data === "object") {
      //       if (data.token) {
      //         // Format: socket.emit("authenticate", { token: "jwt_token_string" })
      //         token = data.token;
      //       } else if (data.userId) {
      //         // Format: socket.emit("authenticate", { userId: 123 })
      //         // C'est pour les notifications, pas les messages
      //         socket.userId = data.userId;
      //         console.log(
      //           `💬 User ${data.userId} connected for messages (userId only)`
      //         );
      //         return;
      //       }
      //     }

      //     if (!token) {
      //       socket.emit("auth_error", "Token manquant");
      //       return;
      //     }

      //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //     socket.userId = decoded.userId;
      //     socket.userEmail = decoded.email;

      //     // Ajouter à la map des utilisateurs connectés
      //     this.userSockets.set(socket.userId, socket.id);
      //     this.onlineUsers.add(socket.userId);

      //     // Rejoindre toutes les conversations de l'utilisateur
      //     const conversations = await Conversation.findAll({
      //       where: {
      //         [Op.or]: [
      //           { participant1Id: socket.userId },
      //           { participant2Id: socket.userId },
      //         ],
      //       },
      //     });

      //     conversations.forEach((conv) => {
      //       socket.join(`conversation_${conv.id}`);
      //     });

      //     socket.emit("authenticated", { success: true });

      //     // Notifier les autres utilisateurs que cet utilisateur est en ligne
      //     socket.broadcast.emit("user_online", {
      //       userId: socket.userId,
      //       timestamp: new Date(),
      //     });

      //     console.log(
      //       `✅ User authenticated for messaging: ${socket.userEmail}`
      //     );
      //   } catch (error) {
      //     console.error("Erreur authentification socket message:", error);
      //     socket.emit("auth_error", "Token invalide");
      //   }
      // });

      // socket.on("authenticate", async (data) => {
      //   try {
      //     let token = data;
      //     if (typeof data === "object" && data.token) {
      //       token = data.token;
      //     }

      //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //     socket.userId = decoded.userId;
      //     this.userSockets.set(socket.userId, socket.id);

      //     socket.emit("authenticated", { success: true });

      //     console.log(`✅ User ${socket.userId} authenticated for messages`);
      //   } catch (error) {
      //     socket.emit("auth_error", "Token invalide");
      //   }
      // });

      socket.on("authenticate", async (data) => {
        try {
          let token;
          let userId;

          // GÉRER LES DEUX FORMATS
          if (typeof data === "string") {
            // Format JWT: socket.emit("authenticate", "jwt_token")
            token = data;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
          } else if (data && typeof data === "object") {
            if (data.token) {
              // Format: { token: "jwt" }
              token = data.token;
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              userId = decoded.userId;
            } else if (data.userId) {
              // Format: { userId: 123 }
              userId = data.userId;
            }
          }

          if (!userId) {
            socket.emit("auth_error", "Données d'authentification invalides");
            return;
          }

          // AUTHENTIFICATION UNIFIÉE
          socket.userId = userId;
          this.userSockets.set(userId, socket.id);
          this.onlineUsers.add(userId);

          socket.emit("authenticated", {
            success: true,
            userId,
            socketId: socket.id,
          });

          // NOTIFIER QUE L'UTILISATEUR EST EN LIGNE
          socket.broadcast.emit("user_online", {
            userId,
            timestamp: new Date(),
          });

          console.log(`✅ User ${userId} authenticated for messaging`);
        } catch (error) {
          console.error("Erreur authentification:", error);
          socket.emit("auth_error", "Token invalide");
        }
      });

      // Rejoindre une conversation spécifique
      socket.on("join_conversation", async (conversationId) => {
        if (!socket.userId) {
          socket.emit("error", "Non authentifié");
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
            socket.emit("error", "Conversation non trouvée");
            return;
          }

          socket.join(`conversation_${conversationId}`);
          socket.emit("joined_conversation", { conversationId });

          // Notifier l'autre participant de la présence
          // socket.to(`conversation_${conversationId}`).emit("user_joined", {
          //   userId: socket.userId,
          //   conversationId,
          //   timestamp: new Date(),
          // });
          // NOTIFIER SEULEMENT L'AUTRE PARTICIPANT (PAS TOUT LE MONDE)
          const otherParticipantId =
            conversation.participant1Id === socket.userId
              ? conversation.participant2Id
              : conversation.participant1Id;

          const otherSocket = this.userSockets.get(otherParticipantId);
          if (otherSocket) {
            this.io.to(otherSocket).emit("user_joined", {
              userId: socket.userId,
              conversationId,
              timestamp: new Date(),
            });
          }

          console.log(
            `💬 User ${socket.userId} joined conversation ${conversationId}`
          );
        } catch (error) {
          console.error("Erreur rejoindre conversation:", error);
          socket.emit("error", "Erreur lors de la connexion à la conversation");
        }
      });

      // Quitter une conversation
      socket.on("leave_conversation", (conversationId) => {
        socket.leave(`conversation_${conversationId}`);

        // Notifier l'autre participant
        socket.to(`conversation_${conversationId}`).emit("user_left", {
          userId: socket.userId,
          conversationId,
          timestamp: new Date(),
        });

        // Arrêter l'indicateur "en train d'écrire" si actif
        this.stopTyping(conversationId, socket.userId);

        console.log(
          `💬 User ${socket.userId} left conversation ${conversationId}`
        );
      });

      // Indicateur "en train d'écrire"
      socket.on("typing", (data) => {
        const { conversationId, isTyping } = data;

        if (!socket.userId || !conversationId) return;

        if (isTyping) {
          this.startTyping(conversationId, socket.userId);
        } else {
          this.stopTyping(conversationId, socket.userId);
        }

        // Notifier les autres participants
        socket.to(`conversation_${conversationId}`).emit("user_typing", {
          userId: socket.userId,
          conversationId,
          isTyping,
          timestamp: new Date(),
        });
      });

      // Marquer les messages comme lus
      socket.on("mark_messages_read", async (data) => {
        const { conversationId } = data;

        if (!socket.userId || !conversationId) return;

        try {
          // Notifier l'autre participant que les messages ont été lus
          socket.to(`conversation_${conversationId}`).emit("messages_read", {
            conversationId,
            readById: socket.userId,
            timestamp: new Date(),
          });

          console.log(
            `💬 Messages marked as read in conversation ${conversationId} by user ${socket.userId}`
          );
        } catch (error) {
          console.error("Erreur marquage messages lus:", error);
        }
      });

      // Obtenir la liste des utilisateurs en ligne
      socket.on("get_online_users", () => {
        const onlineUsersList = Array.from(this.onlineUsers);
        socket.emit("online_users", {
          users: onlineUsersList,
          count: onlineUsersList.length,
        });
      });

      // Obtenir le statut d'un utilisateur spécifique
      socket.on("get_user_status", (userId) => {
        const isOnline = this.onlineUsers.has(parseInt(userId));
        socket.emit("user_status", {
          userId,
          isOnline,
          lastSeen: isOnline ? null : new Date(), // Dans une vraie app, on stockerait lastSeen en DB
        });
      });

      // Signal de présence (heartbeat)
      socket.on("ping", () => {
        socket.emit("pong", { timestamp: new Date() });
      });

      // Déconnexion
      socket.on("disconnect", (reason) => {
        console.log(
          `💬 User disconnected from messaging: ${socket.id}, reason: ${reason}`
        );

        if (socket.userId) {
          // Retirer de la liste des utilisateurs connectés
          this.userSockets.delete(socket.userId);
          this.onlineUsers.delete(socket.userId);

          // Arrêter tous les indicateurs "en train d'écrire" pour cet utilisateur
          this.stopAllTypingForUser(socket.userId);

          // Notifier tous les autres utilisateurs de la déconnexion
          socket.broadcast.emit("user_offline", {
            userId: socket.userId,
            timestamp: new Date(),
          });

          console.log(`💬 User ${socket.userId} disconnected from messaging`);
        }
      });

      // Gestion des erreurs
      socket.on("error", (error) => {
        console.error(`💬 Socket error for ${socket.userId}:`, error);
      });
    });
  }

  // Gestion des indicateurs "en train d'écrire"
  startTyping(conversationId, userId) {
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }
    this.typingUsers.get(conversationId).add(userId);
  }

  stopTyping(conversationId, userId) {
    if (this.typingUsers.has(conversationId)) {
      this.typingUsers.get(conversationId).delete(userId);
      if (this.typingUsers.get(conversationId).size === 0) {
        this.typingUsers.delete(conversationId);
      }
    }
  }

  stopAllTypingForUser(userId) {
    for (const [conversationId, typingSet] of this.typingUsers.entries()) {
      if (typingSet.has(userId)) {
        typingSet.delete(userId);

        // Notifier que l'utilisateur a arrêté d'écrire
        this.io.to(`conversation_${conversationId}`).emit("user_typing", {
          userId,
          conversationId,
          isTyping: false,
          timestamp: new Date(),
        });

        if (typingSet.size === 0) {
          this.typingUsers.delete(conversationId);
        }
      }
    }
  }

  // Méthodes publiques pour envoyer des événements

  // Notifier d'un nouveau message
  // notifyNewMessage(conversationId, message) {
  //   this.io.to(`conversation_${conversationId}`).emit("new_message", {
  //     ...message,
  //     timestamp: new Date(),
  //   });
  //   console.log(
  //     `💬 Nouveau message diffusé dans conversation ${conversationId}`
  //   );
  // }

  notifyNewMessage(conversationId, message) {
    console.log(
      `💬 Notification nouveau message dans conversation ${conversationId}`
    );

    // IMPORTANT: Émettre à TOUTE LA ROOM (tous les participants)
    // Les clients filtreront eux-mêmes si nécessaire
    this.io.to(`conversation_${conversationId}`).emit("new_message", {
      ...(message.toJSON ? message.toJSON() : message),
      timestamp: new Date(),
    });

    // ÉGALEMENT: Notifier les participants hors ligne via notification système
    // Récupérer les participants de la conversation
    this.notifyOfflineParticipants(conversationId, message);
  }

  // Notifier que des messages ont été lus
  notifyMessagesRead(conversationId, readById) {
    this.io.to(`conversation_${conversationId}`).emit("messages_read", {
      conversationId,
      readById,
      timestamp: new Date(),
    });

    // AUSSI: broadcast à tous les sockets de l'utilisateur
    const socketId = this.userSockets.get(readById);
    if (socketId) {
      this.io.emit("messages_read", {
        conversationId,
        readById,
        timestamp: new Date(),
      });
    }

    console.log(
      `💬 Messages read notifiés pour conversation ${conversationId}`
    );
  }

  async notifyOfflineParticipants(conversationId, message) {
    try {
      const { Conversation } = require("../models");
      const conversation = await Conversation.findByPk(conversationId);

      if (!conversation) return;

      const participants = [
        conversation.participant1Id,
        conversation.participant2Id,
      ];

      // Trouver qui est hors ligne
      // participants.forEach((participantId) => {
      //   // Si pas l'expéditeur ET pas en ligne
      //   if (
      //     participantId !== message.senderId &&
      //     !this.isUserOnline(participantId)
      //   ) {
      //     // Créer une notification système
      //     const notificationService = require("../services/notificationService");
      //     notificationService.createNotification({
      //       userId: participantId,
      //       type: "new_message",
      //       title: "Nouveau message",
      //       message: message.content?.substring(0, 100) || "[Fichier]",
      //       data: { conversationId, messageId: message.id },
      //       priority: "medium",
      //       actionUrl: `/messages?conversation=${conversationId}`,
      //     });
      //   }
      // });
    } catch (error) {
      console.error("Erreur notification participants hors ligne:", error);
    }
  }

  // Notifier qu'un message a été modifié
  notifyMessageUpdated(conversationId, message) {
    this.io.to(`conversation_${conversationId}`).emit("message_updated", {
      ...message,
      timestamp: new Date(),
    });
  }

  // Notifier qu'un message a été supprimé
  notifyMessageDeleted(conversationId, messageId) {
    this.io.to(`conversation_${conversationId}`).emit("message_deleted", {
      messageId,
      conversationId,
      timestamp: new Date(),
    });
  }

  // Notifier qu'un utilisateur est en ligne
  notifyUserOnline(userId) {
    this.io.emit("user_online", {
      userId,
      timestamp: new Date(),
    });
  }

  // Notifier qu'un utilisateur est hors ligne
  notifyUserOffline(userId) {
    this.io.emit("user_offline", {
      userId,
      timestamp: new Date(),
    });
  }

  // Envoyer notification à un utilisateur spécifique
  sendToUser(userId, event, data) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Méthodes utilitaires

  // Obtenir le nombre d'utilisateurs connectés
  getConnectedUsersCount() {
    return this.onlineUsers.size;
  }

  // Obtenir la liste des utilisateurs en ligne
  getOnlineUsers() {
    return Array.from(this.onlineUsers);
  }

  // Vérifier si un utilisateur est en ligne
  isUserOnline(userId) {
    return this.onlineUsers.has(parseInt(userId));
  }

  // Obtenir les utilisateurs qui écrivent dans une conversation
  getTypingUsers(conversationId) {
    return this.typingUsers.has(conversationId)
      ? Array.from(this.typingUsers.get(conversationId))
      : [];
  }

  // Forcer la déconnexion d'un utilisateur
  disconnectUser(userId) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
        console.log(`💬 User ${userId} forcé à se déconnecter`);
        return true;
      }
    }
    return false;
  }

  // Diffuser un message à tous les utilisateurs connectés
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Statistiques en temps réel
  getStats() {
    return {
      connectedUsers: this.onlineUsers.size,
      activeConversations: this.typingUsers.size,
      totalTypingUsers: Array.from(this.typingUsers.values()).reduce(
        (total, set) => total + set.size,
        0
      ),
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = MessageSocketManager;
