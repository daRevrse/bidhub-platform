const AuditService = require("../services/auditService");

/**
 * Middleware pour auditer automatiquement les requêtes d'administration
 */
const auditMiddleware = (options = {}) => {
  const {
    action = null,
    entity = null,
    severity = "medium",
    excludePaths = [],
    includeBody = false,
  } = options;

  return async (req, res, next) => {
    // Ignorer certains chemins
    if (excludePaths.some((path) => req.path.includes(path))) {
      return next();
    }

    // Sauvegarder la méthode send originale
    const originalSend = res.send;

    // Override de la méthode send pour capturer la réponse
    res.send = function (body) {
      res.send = originalSend;

      // Extraire les informations de la requête
      const userId = req.user?.userId || null;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get("User-Agent");

      // Déterminer l'action et l'entité si non spécifiées
      const auditAction = action || getActionFromRequest(req);
      const auditEntity = entity || getEntityFromRequest(req);

      // Déterminer le succès basé sur le code de statut
      const success = res.statusCode < 400;

      // Extraire les détails
      const details = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        ...(includeBody && req.body && { requestBody: req.body }),
        query: req.query,
        params: req.params,
      };

      // Logger l'action de manière asynchrone
      setImmediate(() => {
        AuditService.log({
          userId,
          action: auditAction,
          entity: auditEntity,
          ipAddress,
          userAgent,
          details,
          severity: success ? severity : "high",
          success,
          errorMessage: success ? null : extractErrorMessage(body),
        });
      });

      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Détermine l'action basée sur la requête HTTP
 */
function getActionFromRequest(req) {
  const method = req.method.toLowerCase();
  const path = req.path.toLowerCase();

  // Actions spécifiques basées sur les routes
  if (path.includes("/users") && path.includes("/status"))
    return "UPDATE_USER_STATUS";
  if (path.includes("/users") && path.includes("/verify")) return "VERIFY_USER";
  if (path.includes("/users") && path.includes("/bulk-action"))
    return "BULK_USER_ACTION";
  if (path.includes("/auctions") && path.includes("/status"))
    return "UPDATE_AUCTION_STATUS";
  if (path.includes("/settings")) return "UPDATE_SETTINGS";
  if (path.includes("/system-health")) return "CHECK_SYSTEM_HEALTH";

  // Actions génériques basées sur la méthode HTTP
  switch (method) {
    case "get":
      return "VIEW";
    case "post":
      return "CREATE";
    case "put":
      return "UPDATE";
    case "patch":
      return "UPDATE";
    case "delete":
      return "DELETE";
    default:
      return "UNKNOWN";
  }
}

/**
 * Détermine l'entité basée sur la requête
 */
function getEntityFromRequest(req) {
  const path = req.path.toLowerCase();

  if (path.includes("/users")) return "User";
  if (path.includes("/auctions")) return "Auction";
  if (path.includes("/products")) return "Product";
  if (path.includes("/payments")) return "Payment";
  if (path.includes("/reviews")) return "Review";
  if (path.includes("/settings")) return "Settings";
  if (path.includes("/stats")) return "Statistics";
  if (path.includes("/analytics")) return "Analytics";

  return "System";
}

/**
 * Extrait le message d'erreur du body de réponse
 */
function extractErrorMessage(body) {
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      return parsed.message || parsed.error || null;
    } catch (e) {
      return body.substring(0, 500); // Limiter la taille
    }
  }

  if (typeof body === "object" && body.message) {
    return body.message;
  }

  return null;
}

/**
 * Middleware spécifique pour les actions d'administration critiques
 */
const criticalAuditMiddleware = auditMiddleware({
  severity: "critical",
  includeBody: true,
});

/**
 * Middleware pour auditer les connexions/déconnexions
 */
const authAuditMiddleware = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    res.send = originalSend;

    const success = res.statusCode < 400;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");

    if (req.path.includes("/login")) {
      setImmediate(() => {
        AuditService.logLogin(
          req.body.email || null,
          ipAddress,
          userAgent,
          success,
          success ? null : extractErrorMessage(body)
        );
      });
    } else if (req.path.includes("/logout")) {
      setImmediate(() => {
        AuditService.logLogout(req.user?.userId || null, ipAddress, userAgent);
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Middleware pour auditer les actions sur les enchères
 */
const auctionAuditMiddleware = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    res.send = originalSend;

    const success = res.statusCode < 400;
    const userId = req.user?.userId || null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");

    let action = "UNKNOWN";
    if (req.path.includes("/bid")) action = "BID";
    else if (req.method === "POST") action = "CREATE";
    else if (req.method === "PUT") action = "UPDATE";
    else if (req.method === "DELETE") action = "DELETE";

    if (success && action !== "UNKNOWN") {
      setImmediate(() => {
        AuditService.logAuctionAction(
          userId,
          action,
          req.params.id || req.params.auctionId,
          {
            method: req.method,
            path: req.path,
            body: req.body,
          },
          ipAddress,
          userAgent
        );
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Middleware pour auditer les paiements
 */
const paymentAuditMiddleware = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    res.send = originalSend;

    const success = res.statusCode < 400;
    const userId = req.user?.userId || null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");

    let action = "UNKNOWN";
    if (req.path.includes("/process")) action = "PROCESS";
    else if (req.path.includes("/refund")) action = "REFUND";
    else if (req.path.includes("/cancel")) action = "CANCEL";

    if (action !== "UNKNOWN") {
      setImmediate(() => {
        AuditService.logPayment(
          userId,
          action,
          req.params.id || req.params.paymentId,
          req.body.amount,
          req.body.method,
          success,
          success ? null : extractErrorMessage(body),
          ipAddress,
          userAgent
        );
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

module.exports = {
  auditMiddleware,
  criticalAuditMiddleware,
  authAuditMiddleware,
  auctionAuditMiddleware,
  paymentAuditMiddleware,
};
