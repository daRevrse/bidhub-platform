// backend/models/index.js - VERSION COMPLÈTEMENT CORRIGÉE
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "bidhub_db",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);

// Import des modèles existants
const User = require("./User")(sequelize);
const Product = require("./Product")(sequelize);
const Auction = require("./Auction")(sequelize);
const Bid = require("./Bid")(sequelize);
const Payment = require("./Payment")(sequelize);
const Review = require("./Review")(sequelize);
const UserReputation = require("./UserReputation")(sequelize);
const Badge = require("./Badge")(sequelize);
const Conversation = require("./Conversation")(sequelize);
const Message = require("./Message")(sequelize);
const Setting = require("./Setting")(sequelize);
const AuditLog = require("./AuditLog")(sequelize);
const UserFavorite = require("./UserFavorite")(sequelize);
const AuctionView = require("./AuctionView")(sequelize);

// NOUVEAU: Import du modèle Notification
const Notification = require("./Notification")(sequelize);

// Relations de base Product/User
User.hasMany(Product, { foreignKey: "sellerId", as: "products" });
Product.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

// Relations Product/Auction
Product.hasOne(Auction, { foreignKey: "productId", as: "auction" });
Auction.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Relations Auction/Bid
Auction.hasMany(Bid, { foreignKey: "auctionId", as: "bids" });
Bid.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

User.hasMany(Bid, { foreignKey: "bidderId", as: "bids" });
Bid.belongsTo(User, { foreignKey: "bidderId", as: "bidder" });

// Relations Payment
User.hasMany(Payment, { foreignKey: "buyerId", as: "purchases" });
User.hasMany(Payment, { foreignKey: "sellerId", as: "sales" });
Payment.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });
Payment.belongsTo(User, { foreignKey: "sellerId", as: "seller" });
Payment.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

Auction.hasMany(Payment, { foreignKey: "auctionId", as: "payments" });

// RELATIONS REVIEW CORRIGÉES (LE PROBLÈME ÉTAIT ICI)
// Un utilisateur peut donner plusieurs avis (reviewer)
User.hasMany(Review, {
  foreignKey: "reviewerId",
  as: "givenReviews",
  onDelete: "CASCADE",
});

// Un utilisateur peut recevoir plusieurs avis (reviewee - CORRECTION: revieweeId au lieu de reviewedUserId)
User.hasMany(Review, {
  foreignKey: "revieweeId", // ← CHANGÉ DE reviewedUserId à revieweeId
  as: "receivedReviews",
  onDelete: "CASCADE",
});

// Relation inverse : un avis appartient à un revieweur
Review.belongsTo(User, {
  foreignKey: "reviewerId",
  as: "reviewer",
});

// Relation inverse : un avis appartient à un reviewé (CORRECTION)
Review.belongsTo(User, {
  foreignKey: "revieweeId", // ← CHANGÉ DE reviewedUserId à revieweeId
  as: "reviewee", // ← CHANGÉ DE reviewedUser à reviewee
});

// Une enchère peut avoir plusieurs avis
Auction.hasMany(Review, {
  foreignKey: "auctionId",
  as: "reviews",
  onDelete: "CASCADE",
});

// Un avis appartient à une enchère
Review.belongsTo(Auction, {
  foreignKey: "auctionId",
  as: "auction",
});

// Relations UserReputation
User.hasOne(UserReputation, { foreignKey: "userId", as: "reputation" });
UserReputation.belongsTo(User, { foreignKey: "userId", as: "user" });

// Relations Badge (Many-to-Many)
User.belongsToMany(Badge, {
  through: "UserBadges",
  foreignKey: "userId",
  otherKey: "badgeId",
  as: "badges",
});
Badge.belongsToMany(User, {
  through: "UserBadges",
  foreignKey: "badgeId",
  otherKey: "userId",
  as: "users",
});

// Relations Conversation
User.hasMany(Conversation, {
  foreignKey: "participant1Id",
  as: "conversationsAsParticipant1",
});
User.hasMany(Conversation, {
  foreignKey: "participant2Id",
  as: "conversationsAsParticipant2",
});
Conversation.belongsTo(User, {
  foreignKey: "participant1Id",
  as: "participant1",
});
Conversation.belongsTo(User, {
  foreignKey: "participant2Id",
  as: "participant2",
});

Auction.hasMany(Conversation, { foreignKey: "auctionId", as: "conversations" });
Conversation.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

// Relations Message
User.hasMany(Message, { foreignKey: "senderId", as: "messages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });

Conversation.hasMany(Message, { foreignKey: "conversationId", as: "messages" });
Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

// Relation pour les réponses aux messages
Message.hasMany(Message, { foreignKey: "replyToId", as: "replies" });
Message.belongsTo(Message, { foreignKey: "replyToId", as: "replyTo" });

// Relations AuditLog
User.hasMany(AuditLog, { foreignKey: "userId", as: "auditLogs" });
AuditLog.belongsTo(User, { foreignKey: "userId", as: "user" });

// Relations UserFavorite
User.hasMany(UserFavorite, { foreignKey: "userId", as: "favorites" });
UserFavorite.belongsTo(User, { foreignKey: "userId", as: "user" });

Auction.hasMany(UserFavorite, { foreignKey: "auctionId", as: "favoritedBy" });
UserFavorite.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

// Relations AuctionView
User.hasMany(AuctionView, { foreignKey: "userId", as: "views" });
AuctionView.belongsTo(User, { foreignKey: "userId", as: "user" });

Auction.hasMany(AuctionView, { foreignKey: "auctionId", as: "viewedBy" });
AuctionView.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

// NOUVELLES RELATIONS - Notification
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = {
  sequelize,
  User,
  Product,
  Auction,
  Bid,
  Payment,
  Review,
  UserReputation,
  Badge,
  Conversation,
  Message,
  Setting,
  AuditLog,
  UserFavorite,
  AuctionView,
  Notification, // NOUVEAU
};
