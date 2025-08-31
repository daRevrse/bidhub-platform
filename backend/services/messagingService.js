const { Conversation, Message, User, Auction, Product } = require("../models");
const { Op } = require("sequelize");

class MessagingService {
  // Obtenir ou créer une conversation entre deux utilisateurs
  async getOrCreateConversation(userId1, userId2, auctionId = null) {
    try {
      // Ordonner les IDs pour éviter les doublons
      const [participant1Id, participant2Id] = [userId1, userId2].sort(
        (a, b) => a - b
      );

      // Chercher une conversation existante
      let conversation = await Conversation.findOne({
        where: {
          participant1Id,
          participant2Id,
          ...(auctionId && { auctionId }),
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
          ...(auctionId
            ? [
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
              ]
            : []),
        ],
      });

      // Créer une nouvelle conversation si elle n'existe pas
      if (!conversation) {
        conversation = await Conversation.create({
          participant1Id,
          participant2Id,
          auctionId,
        });

        // Recharger avec les relations
        conversation = await Conversation.findByPk(conversation.id, {
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
            ...(auctionId
              ? [
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
                ]
              : []),
          ],
        });
      }

      return conversation;
    } catch (error) {
      throw new Error(`Erreur création conversation: ${error.message}`);
    }
  }

  // Envoyer un message
  async sendMessage(
    conversationId,
    senderId,
    content,
    messageType = "text",
    attachments = null,
    metadata = null
  ) {
    try {
      // Vérifier que l'utilisateur participe à la conversation
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        throw new Error("Conversation non trouvée");
      }

      if (
        conversation.participant1Id !== senderId &&
        conversation.participant2Id !== senderId
      ) {
        throw new Error("Vous ne participez pas à cette conversation");
      }

      if (conversation.isBlocked) {
        throw new Error("Cette conversation est bloquée");
      }

      // Créer le message
      const message = await Message.create({
        conversationId,
        senderId,
        content,
        messageType,
        attachments,
        metadata,
      });

      // Mettre à jour la conversation
      await conversation.update({
        lastMessageAt: new Date(),
        lastMessagePreview:
          messageType === "text"
            ? content.substring(0, 100)
            : `${messageType} message`,
      });

      // Récupérer le message avec les relations
      const fullMessage = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["id", "firstName", "lastName", "avatar"],
          },
        ],
      });

      return fullMessage;
    } catch (error) {
      throw new Error(`Erreur envoi message: ${error.message}`);
    }
  }

  // Obtenir les messages d'une conversation
  async getMessages(conversationId, userId, page = 1, limit = 50) {
    try {
      // Vérifier que l'utilisateur participe à la conversation
      const conversation = await Conversation.findByPk(conversationId);
      if (
        !conversation ||
        (conversation.participant1Id !== userId &&
          conversation.participant2Id !== userId)
      ) {
        throw new Error("Accès refusé à cette conversation");
      }

      const offset = (page - 1) * limit;

      const messages = await Message.findAndCountAll({
        where: { conversationId },
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["id", "firstName", "lastName", "avatar"],
          },
          {
            model: Message,
            as: "replyTo",
            required: false,
            include: [
              {
                model: User,
                as: "sender",
                attributes: ["firstName", "lastName"],
              },
            ],
          },
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      return {
        messages: messages.rows.reverse(), // Ordre chronologique
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(messages.count / limit),
          totalMessages: messages.count,
          hasNext: offset + messages.rows.length < messages.count,
        },
      };
    } catch (error) {
      throw new Error(`Erreur récupération messages: ${error.message}`);
    }
  }

  // Marquer les messages comme lus
  async markAsRead(conversationId, userId) {
    try {
      await Message.update(
        {
          isRead: true,
          readAt: new Date(),
        },
        {
          where: {
            conversationId,
            senderId: { [Op.ne]: userId }, // Messages des autres
            isRead: false,
          },
        }
      );

      return true;
    } catch (error) {
      throw new Error(`Erreur marquage lecture: ${error.message}`);
    }
  }

  // Obtenir les conversations d'un utilisateur
  async getUserConversations(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const conversations = await Conversation.findAndCountAll({
        where: {
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
        limit,
        offset,
        order: [["lastMessageAt", "DESC"]],
      });

      // Compter les messages non lus pour chaque conversation
      const conversationsWithUnread = await Promise.all(
        conversations.rows.map(async (conv) => {
          const unreadCount = await Message.count({
            where: {
              conversationId: conv.id,
              senderId: { [Op.ne]: userId },
              isRead: false,
            },
          });

          return {
            ...conv.toJSON(),
            unreadCount,
            otherParticipant:
              conv.participant1Id === userId
                ? conv.participant2
                : conv.participant1,
          };
        })
      );

      return {
        conversations: conversationsWithUnread,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(conversations.count / limit),
          totalConversations: conversations.count,
        },
      };
    } catch (error) {
      throw new Error(`Erreur récupération conversations: ${error.message}`);
    }
  }

  // Bloquer/débloquer une conversation
  async blockConversation(conversationId, userId, block = true) {
    try {
      const conversation = await Conversation.findByPk(conversationId);
      if (
        !conversation ||
        (conversation.participant1Id !== userId &&
          conversation.participant2Id !== userId)
      ) {
        throw new Error("Conversation non trouvée");
      }

      await conversation.update({
        isBlocked: block,
        blockedById: block ? userId : null,
      });

      return conversation;
    } catch (error) {
      throw new Error(`Erreur blocage conversation: ${error.message}`);
    }
  }

  // Rechercher des conversations
  async searchConversations(userId, query, limit = 10) {
    try {
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
        },
        include: [
          {
            model: User,
            as: "participant1",
            attributes: ["id", "firstName", "lastName"],
            where:
              userId !== Conversation.sequelize.col("participant1Id")
                ? {
                    [Op.or]: [
                      { firstName: { [Op.like]: `%${query}%` } },
                      { lastName: { [Op.like]: `%${query}%` } },
                    ],
                  }
                : undefined,
          },
          {
            model: User,
            as: "participant2",
            attributes: ["id", "firstName", "lastName"],
            where:
              userId !== Conversation.sequelize.col("participant2Id")
                ? {
                    [Op.or]: [
                      { firstName: { [Op.like]: `%${query}%` } },
                      { lastName: { [Op.like]: `%${query}%` } },
                    ],
                  }
                : undefined,
          },
        ],
        limit,
      });

      return conversations.map((conv) => ({
        ...conv.toJSON(),
        otherParticipant:
          conv.participant1Id === userId
            ? conv.participant2
            : conv.participant1,
      }));
    } catch (error) {
      throw new Error(`Erreur recherche conversations: ${error.message}`);
    }
  }

  // Créer un message système (notifications automatiques)
  async createSystemMessage(conversationId, content, metadata = null) {
    try {
      const message = await Message.create({
        conversationId,
        senderId: null, // Message système
        content,
        messageType: "system",
        metadata,
        isRead: true,
      });

      return message;
    } catch (error) {
      throw new Error(`Erreur message système: ${error.message}`);
    }
  }
}

module.exports = new MessagingService();
