// backend/server.js - VERSION CORRIGÉE AVEC SOCKET.IO
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { sequelize, Setting } = require("./models");
const AuditService = require("./services/auditService");
const {
  auditMiddleware,
  authAuditMiddleware,
} = require("./middleware/auditMiddleware");
const AuctionSocketManager = require("./socket/auctionSocket");
const CronJobService = require("./services/cronJobs");
const MessageSocketManager = require("./socket/messageSocket");
const NotificationSocketManager = require("./socket/notificationSocket");
const notificationService = require("./services/notificationService");
const messagingService = require("./services/messagingService");

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Middlewares de base
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/uploads/messages", express.static("uploads/messages"));

// MIDDLEWARE POUR PASSER SOCKET.IO AUX ROUTES
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware d'audit pour toutes les requêtes
app.use(
  auditMiddleware({
    excludePaths: ["/api/health", "/uploads", "/socket.io", "/api/stats"],
    severity: "low",
  })
);

// Routes avec audit spécialisé
app.use("/api/auth", authAuditMiddleware, require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/auctions", require("./routes/auctions"));
app.use("/api/users", require("./routes/users"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/seller-requests", require("./routes/sellerRequests"));
// Nouvelle route statistiques (publique)
app.use("/api/stats", require("./routes/stats"));

// Routes d'administration avec audit critique
app.use(
  "/api/admin",
  auditMiddleware({
    severity: "high",
    includeBody: true,
  }),
  require("./routes/admin")
);

// Routes d'audit
app.use("/api/admin/audit-logs", require("./routes/auditLogs"));
app.use("/api/notifications", require("./routes/notifications"));

// Route de test de santé
app.get("/api/health", (req, res) => {
  res.json({
    message: "BidHub API is running!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    status: "healthy",
  });
});

// CRÉER DES NAMESPACES SÉPARÉS
// const messagesNamespace = io.of("/messages");
// const notificationsNamespace = io.of("/notifications");

// INITIALISER LES GESTIONNAIRES SOCKET.IO
const auctionSocketManager = new AuctionSocketManager(io);
// const messageSocketManager = new MessageSocketManager(messagesNamespace);
// const notificationSocketManager = new NotificationSocketManager(
//   notificationsNamespace
// );

const messageSocketManager = new MessageSocketManager(io);
const notificationSocketManager = new NotificationSocketManager(io);

// CONNECTER LE SERVICE DE NOTIFICATION AU GESTIONNAIRE SOCKET
notificationService.setSocketManager(notificationSocketManager);
messagingService.setSocketManager(messageSocketManager);

app.set("messageSocketManager", messageSocketManager);

// Fonction pour créer les paramètres par défaut
const createDefaultSettings = async () => {
  try {
    const defaultSettings = [
      { key: "site_name", value: "BidHub Togo", type: "string" },
      { key: "auction_extension_time", value: "300", type: "number" },
      { key: "max_bid_increment", value: "1000", type: "number" },
      { key: "email_notifications", value: "true", type: "boolean" },
    ];

    for (const setting of defaultSettings) {
      await Setting.findOrCreate({
        where: { key: setting.key },
        defaults: setting,
      });
    }

    console.log("✅ Default settings created/verified");
  } catch (error) {
    console.error("❌ Error creating default settings:", error);
  }
};

// Initialiser les tâches automatisées
let cronJobService;

// Démarrage du serveur
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Synchroniser la base de données avec les nouveaux modèles
    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized with new models");

    // Créer les paramètres par défaut
    await createDefaultSettings();

    // Logger le démarrage du serveur
    await AuditService.log({
      action: "SERVER_START",
      entity: "System",
      details: {
        port: PORT,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
        features: ["auctions", "stats", "realtime", "admin", "audit"],
      },
      severity: "medium",
    });

    // Initialiser les cron jobs après la connexion à la DB
    cronJobService = new CronJobService(auctionSocketManager);

    server.listen(PORT, () => {
      console.log(`🚀 BidHub server running on port ${PORT}`);
      console.log(`🔌 Socket.io server ready for real-time connections`);
      console.log(`📧 Message system enabled with real-time notifications`);
      console.log(`🔔 Notification system enabled with real-time updates`);
      console.log(`⏰ Cron jobs active for auction management`);
      console.log(`📊 Audit system active`);
      console.log(`📈 Stats API available at /api/stats`);
      console.log(`🌍 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);

    // Logger l'erreur de démarrage
    await AuditService.log({
      action: "SERVER_START_FAILED",
      entity: "System",
      details: { error: error.message },
      severity: "critical",
      success: false,
    });

    process.exit(1);
  }
};

// Gestion de l'arrêt propre du serveur
process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down gracefully...");

  // Arrêter les cron jobs
  if (cronJobService) {
    cronJobService.stopAllJobs();
  }

  // Fermer les connexions socket
  io.close();

  // Fermer la connexion à la base de données
  await sequelize.close();

  console.log("✅ Server shutdown complete");
  process.exit(0);
});

// Démarrer le serveur
startServer();
