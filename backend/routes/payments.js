const express = require("express");
const { Payment, Auction, User } = require("../models");
const auth = require("../middleware/auth");
const mobileMoneyService = require("../services/mobileMoneyService");

const router = express.Router();

// @route   POST /api/payments/initiate
// @desc    Initier un paiement Mobile Money
// @access  Private
router.post("/initiate", auth, async (req, res) => {
  try {
    const { auctionId, provider, phoneNumber } = req.body;
    const userId = req.user.userId;

    // Vérifier que l'enchère existe et que l'utilisateur l'a remportée
    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Enchère non trouvée" });
    }

    if (auction.winnerId !== userId) {
      return res
        .status(403)
        .json({ message: "Vous n'avez pas remporté cette enchère" });
    }

    if (auction.status !== "ended") {
      return res.status(400).json({ message: "L'enchère n'est pas terminée" });
    }

    // Vérifier qu'il n'y a pas déjà un paiement en cours
    const existingPayment = await Payment.findOne({
      where: {
        auctionId,
        userId,
        status: ["pending", "completed"],
      },
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Un paiement existe déjà pour cette enchère",
        paymentId: existingPayment.id,
      });
    }

    // Valider le numéro de téléphone
    if (!mobileMoneyService.validateTogoPhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: "Numéro de téléphone invalide" });
    }

    const amount = auction.currentPrice;
    const fees = mobileMoneyService.calculateFees(amount, provider);
    const totalAmount = parseFloat(amount) + fees;

    // Créer l'enregistrement de paiement
    const payment = await Payment.create({
      auctionId,
      userId,
      amount: totalAmount,
      provider,
      phoneNumber,
      fees,
      status: "pending",
    });

    // Initier le paiement selon le provider
    let paymentResult;
    const paymentData = {
      amount: totalAmount,
      phoneNumber,
      description: `Paiement enchère BidHub #${auctionId}`,
      orderId: `auction_${auctionId}_${userId}`,
      callbackUrl: `${process.env.SERVER_URL}/api/payments/webhook/${provider}`,
    };

    if (provider === "flooz") {
      paymentResult = await mobileMoneyService.initiateFloozPayment(
        paymentData
      );
    } else if (provider === "tmoney") {
      paymentResult = await mobileMoneyService.initiateTMoneyPayment(
        paymentData
      );
    } else {
      return res.status(400).json({ message: "Provider non supporté" });
    }

    if (!paymentResult.success) {
      await payment.update({ status: "failed" });
      return res.status(400).json({
        message: "Erreur lors de l'initiation du paiement",
        error: paymentResult.error,
      });
    }

    // Mettre à jour le paiement avec les données du provider
    await payment.update({
      transactionId: paymentResult.transactionId,
      providerTransactionId: paymentResult.paymentId,
      metadata: {
        paymentUrl: paymentResult.paymentUrl,
        paymentToken: paymentResult.paymentToken,
      },
    });

    res.json({
      success: true,
      payment: {
        id: payment.id,
        transactionId: paymentResult.transactionId,
        amount: totalAmount,
        fees,
        provider,
        status: "pending",
      },
      paymentUrl: paymentResult.paymentUrl,
      message: "Paiement initié avec succès",
    });
  } catch (error) {
    console.error("Erreur initiation paiement:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   GET /api/payments/:id/status
// @desc    Vérifier le statut d'un paiement
// @access  Private
router.get("/:id/status", auth, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user.userId;

    const payment = await Payment.findOne({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      return res.status(404).json({ message: "Paiement non trouvé" });
    }

    // Vérifier le statut auprès du provider si le paiement est en attente
    if (payment.status === "pending" && payment.transactionId) {
      const statusResult = await mobileMoneyService.checkPaymentStatus(
        payment.transactionId,
        payment.provider
      );

      if (statusResult.success && statusResult.status !== payment.status) {
        // Mapper les statuts des providers vers nos statuts
        const statusMap = {
          completed: "completed",
          success: "completed",
          failed: "failed",
          cancelled: "cancelled",
          expired: "failed",
          pending: "pending",
        };

        const newStatus = statusMap[statusResult.status] || "pending";

        await payment.update({
          status: newStatus,
          completedAt: newStatus === "completed" ? new Date() : null,
        });
      }
    }

    res.json({
      id: payment.id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      fees: payment.fees,
      status: payment.status,
      provider: payment.provider,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
    });
  } catch (error) {
    console.error("Erreur vérification statut paiement:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   POST /api/payments/webhook/flooz
// @desc    Webhook pour notifications Flooz
// @access  Public (avec vérification signature)
router.post("/webhook/flooz", async (req, res) => {
  try {
    const { transaction_id, status, amount, fees, order_id, signature } =
      req.body;

    // Vérifier la signature du webhook (sécurité)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.FLOOZ_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid Flooz webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Trouver le paiement correspondant
    const payment = await Payment.findOne({
      where: { transactionId: transaction_id },
    });

    if (!payment) {
      console.error(`Payment not found for transaction: ${transaction_id}`);
      return res.status(404).json({ error: "Payment not found" });
    }

    // Mapper les statuts Flooz vers nos statuts
    const statusMap = {
      completed: "completed",
      failed: "failed",
      cancelled: "cancelled",
      pending: "pending",
    };

    const newStatus = statusMap[status] || "pending";

    // Mettre à jour le paiement
    await payment.update({
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date() : null,
      metadata: {
        ...payment.metadata,
        webhook_data: req.body,
      },
    });

    // Actions post-paiement si succès
    if (newStatus === "completed") {
      await handleSuccessfulPayment(payment);
    }

    console.log(
      `Flooz payment ${transaction_id} updated to status: ${newStatus}`
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur webhook Flooz:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// @route   POST /api/payments/webhook/tmoney
// @desc    Webhook pour notifications T-Money
// @access  Public (avec vérification signature)
router.post("/webhook/tmoney", async (req, res) => {
  try {
    const { transaction_id, status, amount, reference, hash } = req.body;

    // Vérifier le hash T-Money
    const expectedHash = crypto
      .createHash("md5")
      .update(
        transaction_id + amount + reference + process.env.TMONEY_SECRET_KEY
      )
      .digest("hex");

    if (hash !== expectedHash) {
      console.error("Invalid T-Money webhook hash");
      return res.status(401).json({ error: "Invalid hash" });
    }

    // Trouver le paiement correspondant
    const payment = await Payment.findOne({
      where: { transactionId: transaction_id },
    });

    if (!payment) {
      console.error(`Payment not found for transaction: ${transaction_id}`);
      return res.status(404).json({ error: "Payment not found" });
    }

    // Mapper les statuts T-Money
    const statusMap = {
      success: "completed",
      failed: "failed",
      cancelled: "cancelled",
      expired: "failed",
      pending: "pending",
    };

    const newStatus = statusMap[status] || "pending";

    // Mettre à jour le paiement
    await payment.update({
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date() : null,
      metadata: {
        ...payment.metadata,
        webhook_data: req.body,
      },
    });

    // Actions post-paiement si succès
    if (newStatus === "completed") {
      await handleSuccessfulPayment(payment);
    }

    console.log(
      `T-Money payment ${transaction_id} updated to status: ${newStatus}`
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur webhook T-Money:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fonction pour traiter un paiement réussi
async function handleSuccessfulPayment(payment) {
  try {
    // Récupérer l'enchère et les utilisateurs concernés
    const auction = await Auction.findByPk(payment.auctionId, {
      include: [
        {
          model: Product,
          as: "product",
          include: [
            {
              model: User,
              as: "seller",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
      ],
    });

    const buyer = await User.findByPk(payment.userId, {
      attributes: ["id", "firstName", "lastName", "email", "phone"],
    });

    if (!auction || !buyer) {
      console.error("Auction or buyer not found for payment:", payment.id);
      return;
    }

    // Marquer l'enchère comme payée
    await auction.update({
      status: "paid",
      paidAt: new Date(),
    });

    // Envoyer les notifications email
    const emailService = require("../services/emailService");

    // Notifier l'acheteur
    await emailService.sendPaymentConfirmationToBuyer(buyer, auction, payment);

    // Notifier le vendeur
    await emailService.sendPaymentNotificationToSeller(
      auction.product.seller,
      auction,
      buyer,
      payment
    );

    console.log(`✅ Payment processed successfully for auction ${auction.id}`);
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

module.exports = router;
