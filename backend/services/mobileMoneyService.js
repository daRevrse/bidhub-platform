const axios = require("axios");
const crypto = require("crypto");

class MobileMoneyService {
  constructor() {
    this.floozConfig = {
      baseUrl: process.env.FLOOZ_API_URL || "https://api.flooz.africa/v1",
      clientId: process.env.FLOOZ_CLIENT_ID,
      clientSecret: process.env.FLOOZ_CLIENT_SECRET,
      merchantCode: process.env.FLOOZ_MERCHANT_CODE,
    };

    this.tmoneyConfig = {
      baseUrl: process.env.TMONEY_API_URL || "https://api.tmoney.tg/v1",
      apiKey: process.env.TMONEY_API_KEY,
      merchantId: process.env.TMONEY_MERCHANT_ID,
    };
  }

  // Générer un ID de transaction unique
  generateTransactionId() {
    return (
      "BH_" +
      Date.now() +
      "_" +
      crypto.randomBytes(4).toString("hex").toUpperCase()
    );
  }

  // Initier un paiement Flooz
  async initiateFloozPayment(paymentData) {
    try {
      const { amount, phoneNumber, description, orderId, callbackUrl } =
        paymentData;

      const transactionId = this.generateTransactionId();

      const payload = {
        merchant_code: this.floozConfig.merchantCode,
        amount: parseFloat(amount),
        currency: "XOF", // Franc CFA
        phone_number: this.formatPhoneNumber(phoneNumber),
        description,
        order_id: orderId,
        transaction_id: transactionId,
        callback_url: callbackUrl,
        return_url: process.env.CLIENT_URL + "/payment/return",
      };

      const response = await axios.post(
        `${this.floozConfig.baseUrl}/payments/initiate`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${await this.getFloozAccessToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        transactionId,
        paymentId: response.data.payment_id,
        paymentUrl: response.data.payment_url,
        provider: "flooz",
      };
    } catch (error) {
      console.error(
        "Erreur paiement Flooz:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.message || "Erreur lors du paiement Flooz",
      };
    }
  }

  // Initier un paiement T-Money
  async initiateTMoneyPayment(paymentData) {
    try {
      const { amount, phoneNumber, description, orderId, callbackUrl } =
        paymentData;

      const transactionId = this.generateTransactionId();

      const payload = {
        amount: parseFloat(amount),
        currency: "XOF",
        phone: this.formatPhoneNumber(phoneNumber),
        description,
        reference: orderId,
        transaction_id: transactionId,
        webhook_url: callbackUrl,
        success_url: process.env.CLIENT_URL + "/payment/success",
        cancel_url: process.env.CLIENT_URL + "/payment/cancel",
      };

      const response = await axios.post(
        `${this.tmoneyConfig.baseUrl}/payments`,
        payload,
        {
          headers: {
            "X-API-Key": this.tmoneyConfig.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        transactionId,
        paymentId: response.data.payment_id,
        paymentToken: response.data.token,
        provider: "tmoney",
      };
    } catch (error) {
      console.error(
        "Erreur paiement T-Money:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error:
          error.response?.data?.message || "Erreur lors du paiement T-Money",
      };
    }
  }

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(transactionId, provider) {
    try {
      if (provider === "flooz") {
        return await this.checkFloozPaymentStatus(transactionId);
      } else if (provider === "tmoney") {
        return await this.checkTMoneyPaymentStatus(transactionId);
      } else {
        throw new Error("Provider non supporté");
      }
    } catch (error) {
      console.error("Erreur vérification statut:", error);
      return {
        success: false,
        status: "error",
        error: error.message,
      };
    }
  }

  // Vérifier statut Flooz
  async checkFloozPaymentStatus(transactionId) {
    const response = await axios.get(
      `${this.floozConfig.baseUrl}/payments/status/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${await this.getFloozAccessToken()}`,
        },
      }
    );

    return {
      success: true,
      status: response.data.status, // pending, completed, failed, cancelled
      transactionId,
      amount: response.data.amount,
      fees: response.data.fees,
      provider: "flooz",
    };
  }

  // Vérifier statut T-Money
  async checkTMoneyPaymentStatus(transactionId) {
    const response = await axios.get(
      `${this.tmoneyConfig.baseUrl}/payments/${transactionId}`,
      {
        headers: {
          "X-API-Key": this.tmoneyConfig.apiKey,
        },
      }
    );

    return {
      success: true,
      status: response.data.status, // pending, success, failed, expired
      transactionId,
      amount: response.data.amount,
      provider: "tmoney",
    };
  }

  // Obtenir un token d'accès Flooz
  async getFloozAccessToken() {
    try {
      // Vérifier si on a un token valide en cache
      if (this.floozToken && this.floozTokenExpiry > Date.now()) {
        return this.floozToken;
      }

      const response = await axios.post(
        `${this.floozConfig.baseUrl}/auth/token`,
        {
          client_id: this.floozConfig.clientId,
          client_secret: this.floozConfig.clientSecret,
          grant_type: "client_credentials",
        }
      );

      this.floozToken = response.data.access_token;
      this.floozTokenExpiry = Date.now() + response.data.expires_in * 1000;

      return this.floozToken;
    } catch (error) {
      throw new Error("Erreur authentification Flooz: " + error.message);
    }
  }

  // Formater le numéro de téléphone
  formatPhoneNumber(phoneNumber) {
    // Supprimer tous les espaces et caractères non numériques
    let phone = phoneNumber.replace(/\D/g, "");

    // Ajouter le code pays si manquant
    if (phone.startsWith("9") && phone.length === 8) {
      phone = "228" + phone; // Code Togo
    } else if (
      phone.startsWith("229") ||
      phone.startsWith("22890") ||
      phone.startsWith("22891") ||
      phone.startsWith("22892") ||
      phone.startsWith("22893") ||
      phone.startsWith("22894") ||
      phone.startsWith("22895") ||
      phone.startsWith("22896") ||
      phone.startsWith("22897") ||
      phone.startsWith("22898") ||
      phone.startsWith("22899")
    ) {
      phone = phone; // Déjà formaté
    }

    return phone;
  }

  // Calculer les frais de transaction
  calculateFees(amount, provider) {
    // Frais approximatifs basés sur les tarifs actuels
    const fees = {
      flooz: {
        rate: 0.025, // 2.5%
        min: 50, // 50 FCFA minimum
        max: 5000, // 5000 FCFA maximum
      },
      tmoney: {
        rate: 0.02, // 2%
        min: 100, // 100 FCFA minimum
        max: 5000, // 5000 FCFA maximum
      },
    };

    const config = fees[provider];
    if (!config) return 0;

    const calculatedFee = amount * config.rate;
    return Math.max(config.min, Math.min(calculatedFee, config.max));
  }

  // Valider un numéro de téléphone togolais
  validateTogoPhoneNumber(phoneNumber) {
    const phone = this.formatPhoneNumber(phoneNumber);

    // Vérifier les préfixes valides du Togo
    const validPrefixes = [
      "22890",
      "22891",
      "22892",
      "22893", // Moov
      "22870",
      "22871",
      "22872",
      "22873",
      "22879", // Togocel
      "22896",
      "22897",
      "22898",
      "22899", // Autres opérateurs
    ];

    return (
      validPrefixes.some((prefix) => phone.startsWith(prefix)) &&
      phone.length === 11
    );
  }
}

module.exports = new MobileMoneyService();
