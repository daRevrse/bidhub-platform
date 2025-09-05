const { Conversation, Message, User, Auction, Product } = require("../models");
const { Op } = require("sequelize");

class MessagingService {
  constructor() {
    this.socketManager = null; // Sera assigné par le serveur
  }

  setSocketManager(socketManager) {
    this.socketManager = socketManager;
  }

  // Corriger createOrGetConversation :
  async createOrGetConversation(
    participant1Id,
    participant2Id,
    auctionId = null
  ) {
    try {
      // Assurer l'ordre des participants pour éviter les doublons
      const [userId1, userId2] = [participant1Id, participant2Id].sort(
        (a, b) => a - b
      );

      let conversation = await Conversation.findOne({
        where: {
          participant1Id: userId1,
          participant2Id: userId2,
          ...(auctionId ? { auctionId } : {}),
        },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participant1Id: userId1,
          participant2Id: userId2,
          auctionId,
        });
      }

      return conversation;
    } catch (error) {
      throw new Error(`Erreur création conversation: ${error.message}`);
    }
  }
  // Obtenir ou créer une conversation entre deux utilisateurs
  // async getOrCreateConversation(userId1, userId2, auctionId = null) {
  //   try {
  //     // Ordonner les IDs pour éviter les doublons
  //     const [participant1Id, participant2Id] = [userId1, userId2].sort(
  //       (a, b) => a - b
  //     );

  //     // Chercher une conversation existante
  //     let conversation = await Conversation.findOne({
  //       where: {
  //         participant1Id,
  //         participant2Id,
  //         ...(auctionId && { auctionId }),
  //       },
  //       include: [
  //         {
  //           model: User,
  //           as: "participant1",
  //           attributes: ["id", "firstName", "lastName", "avatar"],
  //         },
  //         {
  //           model: User,
  //           as: "participant2",
  //           attributes: ["id", "firstName", "lastName", "avatar"],
  //         },
  //         ...(auctionId
  //           ? [
  //               {
  //                 model: Auction,
  //                 as: "auction",
  //                 include: [
  //                   {
  //                     model: Product,
  //                     as: "product",
  //                     attributes: ["title", "images"],
  //                   },
  //                 ],
  //               },
  //             ]
  //           : []),
  //       ],
  //     });

  //     // Créer une nouvelle conversation si elle n'existe pas
  //     if (!conversation) {
  //       conversation = await Conversation.create({
  //         participant1Id,
  //         participant2Id,
  //         auctionId,
  //       });

  //       // Recharger avec les relations
  //       conversation = await Conversation.findByPk(conversation.id, {
  //         include: [
  //           {
  //             model: User,
  //             as: "participant1",
  //             attributes: ["id", "firstName", "lastName", "avatar"],
  //           },
  //           {
  //             model: User,
  //             as: "participant2",
  //             attributes: ["id", "firstName", "lastName", "avatar"],
  //           },
  //           ...(auctionId
  //             ? [
  //                 {
  //                   model: Auction,
  //                   as: "auction",
  //                   include: [
  //                     {
  //                       model: Product,
  //                       as: "product",
  //                       attributes: ["title", "images"],
  //                     },
  //                   ],
  //                 },
  //               ]
  //             : []),
  //         ],
  //       });
  //     }

  //     return conversation;
  //   } catch (error) {
  //     throw new Error(`Erreur création conversation: ${error.message}`);
  //   }
  // }

  async getOrCreateConversation(
    participant1Id,
    participant2Id,
    auctionId = null
  ) {
    try {
      const p1Id = parseInt(participant1Id);
      const p2Id = parseInt(participant2Id);

      if (isNaN(p1Id) || isNaN(p2Id)) {
        throw new Error("IDs de participants invalides");
      }

      if (p1Id === p2Id) {
        throw new Error("Impossible de créer une conversation avec soi-même");
      }

      // Assurer l'ordre des participants pour éviter les doublons
      const [userId1, userId2] = [p1Id, p2Id].sort((a, b) => a - b);

      // Vérifier que les utilisateurs existent
      const [user1, user2] = await Promise.all([
        User.findByPk(userId1, { attributes: ["id", "firstName", "lastName"] }),
        User.findByPk(userId2, { attributes: ["id", "firstName", "lastName"] }),
      ]);

      if (!user1 || !user2) {
        throw new Error("Un ou plusieurs participants n'existent pas");
      }

      const whereClause = {
        participant1Id: userId1,
        participant2Id: userId2,
      };

      if (auctionId) {
        whereClause.auctionId = parseInt(auctionId);
      }

      let conversation = await Conversation.findOne({
        where: whereClause,
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

      if (!conversation) {
        conversation = await Conversation.create({
          participant1Id: userId1,
          participant2Id: userId2,
          auctionId: auctionId ? parseInt(auctionId) : null,
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

        console.log(`💬 Nouvelle conversation créée: ${conversation.id}`);
      }

      return conversation;
    } catch (error) {
      console.error("❌ Erreur getOrCreateConversation:", error);
      throw new Error(`Erreur création conversation: ${error.message}`);
    }
  }

  // Obtenir une conversation spécifique
  async getConversation(conversationId, userId) {
    try {
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
                attributes: ["id", "title", "images"],
              },
            ],
          },
        ],
      });

      if (!conversation) {
        throw new Error("Conversation non trouvée");
      }

      return conversation;
    } catch (error) {
      throw new Error(`Erreur récupération conversation: ${error.message}`);
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
  // async getMessages(conversationId, userId, page = 1, limit = 50) {
  //   try {
  //     // Vérifier que l'utilisateur participe à la conversation
  //     const conversation = await Conversation.findByPk(conversationId);
  //     if (
  //       !conversation ||
  //       (conversation.participant1Id !== userId &&
  //         conversation.participant2Id !== userId)
  //     ) {
  //       throw new Error("Accès refusé à cette conversation");
  //     }

  //     if (conversation.isBlocked && conversation.blockedById !== userId) {
  //       throw new Error("Accès refusé - Conversation bloquée");
  //     }

  //     const offset = (page - 1) * limit;

  //     const messages = await Message.findAndCountAll({
  //       where: { conversationId },
  //       include: [
  //         {
  //           model: User,
  //           as: "sender",
  //           attributes: ["id", "firstName", "lastName", "avatar"],
  //         },
  //         {
  //           model: Message,
  //           as: "replyTo",
  //           required: false,
  //           include: [
  //             {
  //               model: User,
  //               as: "sender",
  //               attributes: ["firstName", "lastName"],
  //             },
  //           ],
  //         },
  //       ],
  //       limit,
  //       offset,
  //       order: [["createdAt", "DESC"]],
  //     });

  //     return {
  //       messages: messages.rows.reverse(), // Ordre chronologique
  //       pagination: {
  //         currentPage: page,
  //         totalPages: Math.ceil(messages.count / limit),
  //         totalMessages: messages.count,
  //         hasNext: offset + messages.rows.length < messages.count,
  //       },
  //     };
  //   } catch (error) {
  //     throw new Error(`Erreur récupération messages: ${error.message}`);
  //   }
  // }

  async getMessages(conversationId, userId, page = 1, limit = 50) {
    try {
      // VALIDATION DES PARAMÈTRES
      if (!conversationId || !userId) {
        throw new Error("ID de conversation et utilisateur requis");
      }

      // Convertir en nombres si nécessaire
      const convId = parseInt(conversationId);
      const userIdNum = parseInt(userId);

      if (isNaN(convId) || isNaN(userIdNum)) {
        throw new Error("IDs de conversation ou utilisateur invalides");
      }

      console.log(
        `📨 Récupération messages pour conversation ${convId}, utilisateur ${userIdNum}`
      );

      // Vérifier que l'utilisateur participe à la conversation
      const conversation = await Conversation.findByPk(convId, {
        attributes: ["id", "participant1Id", "participant2Id", "isBlocked"],
      });

      if (!conversation) {
        throw new Error("Conversation non trouvée");
      }

      // Vérification d'accès améliorée
      const hasAccess =
        conversation.participant1Id === userIdNum ||
        conversation.participant2Id === userIdNum;

      if (!hasAccess) {
        console.log(
          `❌ Accès refusé: user ${userIdNum} n'est pas participant de conversation ${convId}`
        );
        console.log(
          `Participants: ${conversation.participant1Id}, ${conversation.participant2Id}`
        );
        throw new Error("Accès refusé à cette conversation");
      }

      const offset = (page - 1) * limit;

      const messages = await Message.findAndCountAll({
        where: { conversationId: convId },
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["id", "firstName", "lastName", "avatar"],
            required: false, // Au cas où l'utilisateur serait supprimé
          },
          {
            model: Message,
            as: "replyTo",
            required: false,
            attributes: [
              "id",
              "content",
              "messageType",
              "attachments",
              "senderId",
              "isRead",
              "createdAt",
            ],
            include: [
              {
                model: User,
                as: "sender",
                attributes: ["firstName", "lastName"],
                required: false,
              },
            ],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
      });

      console.log(
        `📨 Trouvé ${messages.count} messages pour conversation ${convId}`
      );

      return {
        messages: messages.rows.reverse(), // Ordre chronologique
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(messages.count / limit),
          totalMessages: messages.count,
          hasNext: offset + messages.rows.length < messages.count,
        },
      };
    } catch (error) {
      console.error(`❌ Erreur getMessages:`, error);
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
  // async getUserConversations(userId, page = 1, limit = 20) {
  //   try {
  //     const offset = (page - 1) * limit;

  //     const conversations = await Conversation.findAndCountAll({
  //       where: {
  //         [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
  //       },
  //       include: [
  //         {
  //           model: User,
  //           as: "participant1",
  //           attributes: ["id", "firstName", "lastName", "avatar"],
  //         },
  //         {
  //           model: User,
  //           as: "participant2",
  //           attributes: ["id", "firstName", "lastName", "avatar"],
  //         },
  //         {
  //           model: Auction,
  //           as: "auction",
  //           required: false,
  //           include: [
  //             {
  //               model: Product,
  //               as: "product",
  //               attributes: ["title", "images"],
  //             },
  //           ],
  //         },
  //       ],
  //       limit,
  //       offset,
  //       order: [["lastMessageAt", "DESC"]],
  //     });

  //     // Compter les messages non lus pour chaque conversation
  //     const conversationsWithUnread = await Promise.all(
  //       conversations.rows.map(async (conv) => {
  //         const unreadCount = await Message.count({
  //           where: {
  //             conversationId: conv.id,
  //             senderId: { [Op.ne]: userId },
  //             isRead: false,
  //           },
  //         });

  //         return {
  //           ...conv.toJSON(),
  //           unreadCount,
  //           otherParticipant:
  //             conv.participant1Id === userId
  //               ? conv.participant2
  //               : conv.participant1,
  //         };
  //       })
  //     );

  //     return {
  //       conversations: conversationsWithUnread,
  //       pagination: {
  //         currentPage: page,
  //         totalPages: Math.ceil(conversations.count / limit),
  //         totalConversations: conversations.count,
  //       },
  //     };
  //   } catch (error) {
  //     throw new Error(`Erreur récupération conversations: ${error.message}`);
  //   }
  // }

  async getUserConversations(userId, page = 1, limit = 20) {
    try {
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum)) {
        throw new Error("ID utilisateur invalide");
      }

      const offset = (page - 1) * limit;

      console.log(
        `📋 Récupération conversations pour utilisateur ${userIdNum}`
      );

      const conversations = await Conversation.findAndCountAll({
        where: {
          [Op.or]: [
            { participant1Id: userIdNum },
            { participant2Id: userIdNum },
          ],
        },
        include: [
          {
            model: User,
            as: "participant1",
            attributes: ["id", "firstName", "lastName", "avatar"],
            required: false,
          },
          {
            model: User,
            as: "participant2",
            attributes: ["id", "firstName", "lastName", "avatar"],
            required: false,
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
                required: false,
              },
            ],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["lastMessageAt", "DESC"]],
      });

      // Compter les messages non lus pour chaque conversation
      const conversationsWithUnread = await Promise.all(
        conversations.rows.map(async (conv) => {
          try {
            const unreadCount = await Message.count({
              where: {
                conversationId: conv.id,
                senderId: { [Op.ne]: userIdNum },
                isRead: false,
              },
            });

            // Récupérer le dernier message
            const lastMessage = await Message.findOne({
              where: { conversationId: conv.id },
              order: [["createdAt", "DESC"]],
              attributes: [
                "id",
                "content",
                "messageType",
                "attachments",
                "senderId",
                "isRead",
                "createdAt",
              ],
              include: [
                {
                  model: User,
                  as: "sender",
                  attributes: ["id", "firstName", "lastName"],
                  required: false,
                },
              ],
            });

            return {
              ...conv.toJSON(),
              unreadCount,
              lastMessage,
              otherParticipant:
                conv.participant1Id === userIdNum
                  ? conv.participant2
                  : conv.participant1,
            };
          } catch (error) {
            console.error(`Erreur traitement conversation ${conv.id}:`, error);
            return {
              ...conv.toJSON(),
              unreadCount: 0,
              lastMessage: null,
              otherParticipant:
                conv.participant1Id === userIdNum
                  ? conv.participant2
                  : conv.participant1,
            };
          }
        })
      );

      console.log(
        `📋 Trouvé ${conversations.count} conversations pour utilisateur ${userIdNum}`
      );

      // RETOURNER STRUCTURE COHÉRENTE
      return {
        conversations: conversationsWithUnread,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(conversations.count / limit),
          totalConversations: conversations.count,
        },
      };
    } catch (error) {
      console.error("❌ Erreur getUserConversations:", error);
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

  // Obtenir le nombre de messages non lus pour un utilisateur
  // async getUnreadCount(userId) {
  //   try {
  //     const unreadCount = await Message.count({
  //       where: {
  //         isRead: false,
  //       },
  //       include: [
  //         {
  //           model: Conversation,
  //           as: "conversation",
  //           where: {
  //             [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
  //           },
  //           required: true,
  //         },
  //       ],
  //     });

  //     return unreadCount;
  //   } catch (error) {
  //     console.error("Erreur comptage messages non lus:", error);
  //     return 0;
  //   }
  // }

  async getUnreadCount(userId) {
    try {
      const unreadCount = await Message.count({
        where: {
          isRead: false,
          senderId: { [Op.ne]: userId }, // exclure les messages envoyés par l'utilisateur
        },
        include: [
          {
            model: Conversation,
            as: "conversation",
            where: {
              [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
            },
            required: true,
          },
        ],
      });

      return unreadCount;
    } catch (error) {
      console.error("Erreur comptage messages non lus:", error);
      return 0;
    }
  }
}

module.exports = new MessagingService();
