// backend/server.js - MISE À JOUR AVEC AUDIT
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
    excludePaths: ["/api/health", "/uploads", "/socket.io"],
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

// Routes d'administration avec audit critique
app.use(
  "/api/admin",
  auditMiddleware({
    severity: "high",
    includeBody: true,
  }),
  require("./routes/admin")
);

// Nouvelles routes d'audit
app.use("/api/admin/audit-logs", require("./routes/auditLogs"));

// Route de test de santé
app.get("/api/health", (req, res) => {
  res.json({
    message: "BidHub API is running!",
    timestamp: new Date().toISOString(),
    status: "OK",
    version: "2.0.0",
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
  }
};

// Fonction pour créer les paramètres par défaut
const createDefaultSettings = async () => {
  const { Setting } = require("./models");

  const defaultSettings = [
    // Paramètres généraux
    { category: "general", key: "siteName", value: "BidHub", type: "string" },
    {
      category: "general",
      key: "siteDescription",
      value: "Plateforme d'enchères en ligne au Togo",
      type: "string",
    },
    {
      category: "general",
      key: "contactEmail",
      value: "contact@bidhub.tg",
      type: "string",
    },
    {
      category: "general",
      key: "supportEmail",
      value: "support@bidhub.tg",
      type: "string",
    },
    {
      category: "general",
      key: "maintenanceMode",
      value: "false",
      type: "boolean",
    },
    {
      category: "general",
      key: "registrationEnabled",
      value: "true",
      type: "boolean",
    },

    // Paramètres d'enchères
    {
      category: "auction",
      key: "minBidIncrement",
      value: "100",
      type: "number",
    },
    {
      category: "auction",
      key: "maxAuctionDuration",
      value: "30",
      type: "number",
    },
    { category: "auction", key: "commissionRate", value: "10", type: "number" },
    {
      category: "auction",
      key: "autoExtendTime",
      value: "300",
      type: "number",
    },
    {
      category: "auction",
      key: "maxImagesPerProduct",
      value: "5",
      type: "number",
    },
    {
      category: "auction",
      key: "bidderVerificationRequired",
      value: "false",
      type: "boolean",
    },

    // Paramètres de paiement
    {
      category: "payment",
      key: "floozEnabled",
      value: "true",
      type: "boolean",
    },
    {
      category: "payment",
      key: "tmoneyEnabled",
      value: "true",
      type: "boolean",
    },
    {
      category: "payment",
      key: "minPaymentAmount",
      value: "500",
      type: "number",
    },
    {
      category: "payment",
      key: "maxPaymentAmount",
      value: "5000000",
      type: "number",
    },
    {
      category: "payment",
      key: "paymentTimeout",
      value: "600",
      type: "number",
    },
    {
      category: "payment",
      key: "autoRefundEnabled",
      value: "true",
      type: "boolean",
    },

    // Paramètres de notifications
    {
      category: "notification",
      key: "emailNotificationsEnabled",
      value: "true",
      type: "boolean",
    },
    {
      category: "notification",
      key: "smsNotificationsEnabled",
      value: "false",
      type: "boolean",
    },
    {
      category: "notification",
      key: "auctionEndReminder",
      value: "3600",
      type: "number",
    },
    {
      category: "notification",
      key: "bidNotifications",
      value: "true",
      type: "boolean",
    },
    {
      category: "notification",
      key: "systemNotifications",
      value: "true",
      type: "boolean",
    },

    // Paramètres de sécurité
    {
      category: "security",
      key: "maxLoginAttempts",
      value: "5",
      type: "number",
    },
    {
      category: "security",
      key: "accountLockoutDuration",
      value: "1800",
      type: "number",
    },
    {
      category: "security",
      key: "passwordMinLength",
      value: "8",
      type: "number",
    },
    {
      category: "security",
      key: "requireEmailVerification",
      value: "true",
      type: "boolean",
    },
    {
      category: "security",
      key: "twoFactorEnabled",
      value: "false",
      type: "boolean",
    },
    {
      category: "security",
      key: "sessionTimeout",
      value: "7200",
      type: "number",
    },
  ];

  for (const setting of defaultSettings) {
    await Setting.findOrCreate({
      where: { category: setting.category, key: setting.key },
      defaults: setting,
    });
  }

  console.log("✅ Default settings created/verified");
};

// Gestion propre de l'arrêt du serveur
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");

  await AuditService.log({
    action: "SERVER_SHUTDOWN",
    entity: "System",
    details: { signal: "SIGTERM" },
    severity: "medium",
  });

  if (cronJobService) {
    cronJobService.stopAllJobs();
  }
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully");

  await AuditService.log({
    action: "SERVER_SHUTDOWN",
    entity: "System",
    details: { signal: "SIGINT" },
    severity: "medium",
  });

  if (cronJobService) {
    cronJobService.stopAllJobs();
  }
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

// Gestion des erreurs non capturées
process.on("uncaughtException", async (error) => {
  console.error("❌ Uncaught Exception:", error);

  await AuditService.log({
    action: "UNCAUGHT_EXCEPTION",
    entity: "System",
    details: { error: error.message, stack: error.stack },
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
    details: { reason: reason?.message || reason, promise: promise.toString() },
    severity: "critical",
    success: false,
    errorMessage: reason?.message || "Unhandled promise rejection",
  });
});

startServer();
