// backend/server.js - Point d'entrée principal
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize } = require("./models");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/auctions", require("./routes/auctions"));
app.use("/api/users", require("./routes/users"));

// Route de test
app.get("/", (req, res) => {
  res.json({ message: "BidHub API is running!" });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    await sequelize.sync();
    console.log("✅ Database synchronized");

    app.listen(PORT, () => {
      console.log(`🚀 BidHub server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
  }
};

startServer();
