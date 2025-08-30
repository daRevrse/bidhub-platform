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

// Import des modèles
const User = require("./User")(sequelize);
const Product = require("./Product")(sequelize);
const Auction = require("./Auction")(sequelize);
const Bid = require("./Bid")(sequelize);
const Payment = require("./Payment")(sequelize);

// Relations entre les modèles
User.hasMany(Product, { foreignKey: "sellerId", as: "products" });
Product.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

Product.hasOne(Auction, { foreignKey: "productId", as: "auction" });
Auction.belongsTo(Product, { foreignKey: "productId", as: "product" });

Auction.hasMany(Bid, { foreignKey: "auctionId", as: "bids" });
Bid.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

User.hasMany(Bid, { foreignKey: "bidderId", as: "bids" });
Bid.belongsTo(User, { foreignKey: "bidderId", as: "bidder" });

User.hasMany(Payment, { foreignKey: "userId", as: "payments" });
Payment.belongsTo(User, { foreignKey: "userId", as: "user" });

Auction.hasMany(Payment, { foreignKey: "auctionId", as: "payments" });
Payment.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

module.exports = {
  sequelize,
  User,
  Product,
  Auction,
  Bid,
  Payment,
};
