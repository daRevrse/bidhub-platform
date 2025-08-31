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

// Import des nouveaux modèles de messagerie
const Conversation = require("./Conversation")(sequelize);
const Message = require("./Message")(sequelize);

// Relations existantes
User.hasMany(Product, { foreignKey: "sellerId", as: "products" });
Product.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

Product.hasOne(Auction, { foreignKey: "productId", as: "auction" });
Auction.belongsTo(Product, { foreignKey: "productId", as: "product" });

Auction.hasMany(Bid, { foreignKey: "auctionId", as: "bids" });
Bid.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

User.hasMany(Bid, { foreignKey: "bidderId", as: "bids" });
Bid.belongsTo(User, { foreignKey: "bidderId", as: "bidder" });

// Relations Payment
User.hasMany(Payment, { foreignKey: "userId", as: "payments" });
Payment.belongsTo(User, { foreignKey: "userId", as: "user" });

Auction.hasMany(Payment, { foreignKey: "auctionId", as: "payments" });
Payment.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

// Relations Review
User.hasMany(Review, { foreignKey: "reviewerId", as: "reviewsGiven" });
User.hasMany(Review, { foreignKey: "revieweeId", as: "reviewsReceived" });
Review.belongsTo(User, { foreignKey: "reviewerId", as: "reviewer" });
Review.belongsTo(User, { foreignKey: "revieweeId", as: "reviewee" });

Auction.hasMany(Review, { foreignKey: "auctionId", as: "reviews" });
Review.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

// Relations UserReputation
User.hasOne(UserReputation, { foreignKey: "userId", as: "reputation" });
UserReputation.belongsTo(User, { foreignKey: "userId", as: "user" });

// Relations Conversation - CORRECTION ICI
User.hasMany(Conversation, {
  foreignKey: "participant1Id",
  as: "conversations1",
});
User.hasMany(Conversation, {
  foreignKey: "participant2Id",
  as: "conversations2",
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
};
