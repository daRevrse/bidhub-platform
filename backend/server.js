// backend/server.js - VERSION MISE À JOUR AVEC ROUTES STATS
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { sequelize } = require("./models");
const AuditService = require("./services/auditService");
const {
  auditMiddleware,
  authAuditMiddleware,
} = require("./middleware/auditMiddleware");
const AuctionSocketManager = require("./socket/auctionSocket");
const CronJobService = require("./services/cronJobs");
const MessageSocketManager = require("./socket/messageSocket");
const NotificationSocketManager = require("./socket/notificationSocket");
const NotificationService = require("./services/notificationService");

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

// Middlewares de base
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/uploads/messages", express.static("uploads/messages"));

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
    status: "OK",
    version: "2.0.0",
    features: {
      auctions: "active",
      payments: "active",
      messaging: "active",
      admin: "active",
      stats: "active",
      realtime: "active",
    },
  });
});

// Fonction pour créer les paramètres par défaut
const createDefaultSettings = async () => {
  try {
    const { Setting } = require("./models");

    const defaultSettings = [
      { key: "site_name", value: "BidHub", category: "general" },
      {
        key: "site_description",
        value: "Plateforme d'enchères en ligne au Togo",
        category: "general",
      },
      { key: "commission_rate", value: "5", category: "financial" },
      { key: "min_bid_increment", value: "500", category: "auctions" },
      { key: "max_auction_duration", value: "30", category: "auctions" },
      { key: "email_notifications", value: "true", category: "notifications" },
      { key: "sms_notifications", value: "true", category: "notifications" },
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

// Initialiser le gestionnaire de sockets
const auctionSocketManager = new AuctionSocketManager(io);
const messageSocketManager = new MessageSocketManager(io);

const notificationSocketManager = new NotificationSocketManager(io);
NotificationService.setSocketManager(notificationSocketManager);

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
      console.log(`🔌 Socket.io server ready for real-time auctions`);
      console.log(`⏰ Cron jobs active for auction management`);
      console.log(`📧 Email notifications enabled`);
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
      errorMessage: error.message,
    });

    process.exit(1);
  }
};

// Gestion gracieuse de l'arrêt du serveur
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");

  await AuditService.log({
    action: "SERVER_SHUTDOWN",
    entity: "System",
    details: { reason: "SIGTERM" },
    severity: "medium",
  });

  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully");

  await AuditService.log({
    action: "SERVER_SHUTDOWN",
    entity: "System",
    details: { reason: "SIGINT" },
    severity: "medium",
  });

  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});

// Gestion des erreurs non capturées
process.on("uncaughtException", async (error) => {
  console.error("❌ Uncaught Exception:", error);

  await AuditService.log({
    action: "UNCAUGHT_EXCEPTION",
    entity: "System",
    details: {
      error: error.message,
      stack: error.stack,
    },
    severity: "critical",
    success: false,
    errorMessage: error.message,
  });

  process.exit(1);
});

process.on("unhandledRejection", async (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);

  await AuditService.log({
    action: "UNHANDLED_REJECTION",
    entity: "System",
    details: {
      reason: reason?.toString(),
      promise: promise?.toString(),
    },
    severity: "critical",
    success: false,
    errorMessage: reason?.toString(),
  });
});

// Démarrer le serveur
startServer();

module.exports = app;
