// backend/models/index.js - VERSION CORRIGÉE COMPLÈTE
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
const Notification = require("./Notification")(sequelize);

// NOUVEAUX MODÈLES
const Category = require("./Category")(sequelize);
const SellerRequest = require("./SellerRequest")(sequelize);

// ======= RELATIONS DE BASE =======

// Relations User/Product
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

// ======= RELATIONS REVIEW =======
User.hasMany(Review, {
  foreignKey: "reviewerId",
  as: "givenReviews",
  onDelete: "CASCADE",
});

User.hasMany(Review, {
  foreignKey: "revieweeId",
  as: "receivedReviews",
  onDelete: "CASCADE",
});

Review.belongsTo(User, {
  foreignKey: "reviewerId",
  as: "reviewer",
});

Review.belongsTo(User, {
  foreignKey: "revieweeId",
  as: "reviewee",
});

Auction.hasMany(Review, { foreignKey: "auctionId", as: "reviews" });
Review.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

// ======= RELATIONS REPUTATION =======
User.hasOne(UserReputation, { foreignKey: "userId", as: "reputation" });
UserReputation.belongsTo(User, { foreignKey: "userId", as: "user" });

// ======= RELATIONS BADGE =======
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

// ======= RELATIONS CONVERSATION/MESSAGE =======
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

User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });

Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  as: "messages",
});
Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

Message.hasMany(Message, {
  foreignKey: "replyToId",
  as: "replies",
  onDelete: "SET NULL",
});
Message.belongsTo(Message, {
  foreignKey: "replyToId",
  as: "replyTo",
});

// ======= RELATIONS FAVORITES (CORRIGÉES) =======
User.hasMany(UserFavorite, { foreignKey: "userId", as: "userFavorites" });
UserFavorite.belongsTo(User, { foreignKey: "userId", as: "user" });

Auction.hasMany(UserFavorite, {
  foreignKey: "auctionId",
  as: "auctionFavorites",
});
UserFavorite.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

// ======= RELATIONS AUCTION VIEWS (CORRIGÉES) =======
User.hasMany(AuctionView, { foreignKey: "userId", as: "userViews" });
AuctionView.belongsTo(User, { foreignKey: "userId", as: "user" });

Auction.hasMany(AuctionView, { foreignKey: "auctionId", as: "auctionViews" });
AuctionView.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

// ======= RELATIONS NOTIFICATION =======
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

// ======= NOUVELLES RELATIONS CATEGORY (CORRIGÉES) =======
Category.hasMany(Category, {
  foreignKey: "parentId",
  as: "children",
  onDelete: "SET NULL",
});
Category.belongsTo(Category, {
  foreignKey: "parentId",
  as: "parent",
});

// Relations Product/Category - ATTENTION: nom d'association modifié pour éviter conflit
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "productCategory",
});

// ======= RELATIONS SELLER REQUEST =======
User.hasMany(SellerRequest, { foreignKey: "userId", as: "sellerRequests" });
SellerRequest.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(SellerRequest, {
  foreignKey: "reviewedBy",
  as: "reviewedSellerRequests",
});
SellerRequest.belongsTo(User, {
  foreignKey: "reviewedBy",
  as: "reviewer",
});

// ======= RELATIONS TRAÇABILITÉ =======
User.hasMany(Setting, { foreignKey: "updatedBy", as: "updatedSettings" });
Setting.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

User.hasMany(Category, { foreignKey: "createdBy", as: "createdCategories" });
User.hasMany(Category, { foreignKey: "updatedBy", as: "updatedCategories" });
Category.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Category.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

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
  Notification,
  Category,
  SellerRequest,
};
