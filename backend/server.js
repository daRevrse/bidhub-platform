const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { sequelize } = require("./models");
const AuctionSocketManager = require("./socket/auctionSocket");
const CronJobService = require("./services/cronJobs");
const MessageSocketManager = require("./socket/messageSocket");

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/uploads/messages", express.static("uploads/messages"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/auctions", require("./routes/auctions"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/messages", require("./routes/messages"));

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "BidHub API is running!",
    timestamp: new Date().toISOString(),
    status: "OK",
  });
});

// Initialiser le gestionnaire de sockets
const auctionSocketManager = new AuctionSocketManager(io);
const messageSocketManager = new MessageSocketManager(io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Initialiser les tâches automatisées
let cronJobService;

// Démarrage du serveur
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    await sequelize.sync();
    console.log("✅ Database synchronized");

    // Initialiser les cron jobs après la connexion à la DB
    cronJobService = new CronJobService(auctionSocketManager);

    server.listen(PORT, () => {
      console.log(`🚀 BidHub server running on port ${PORT}`);
      console.log(`🔌 Socket.io server ready for real-time auctions`);
      console.log(`⏰ Cron jobs active for auction management`);
      console.log(`📧 Email notifications enabled`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
  }
};

// Gestion propre de l'arrêt du serveur
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  if (cronJobService) {
    cronJobService.stopAllJobs();
  }
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  if (cronJobService) {
    cronJobService.stopAllJobs();
  }
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

startServer();
