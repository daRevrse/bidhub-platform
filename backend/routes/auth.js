const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { User } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

// Configuration du service d'email (à adapter selon votre fournisseur)
const transporter = nodemailer.createTransport({
  service: "gmail", // ou autre service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @route   POST /api/auth/register
// @desc    Inscription d'un nouvel utilisateur
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json({
      message: "Compte créé avec succès",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erreur inscription:", error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
  }
});

// @route   POST /api/auth/login
// @desc    Connexion utilisateur
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erreur connexion:", error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
});

// @route   GET /api/auth/me
// @desc    Obtenir les informations de l'utilisateur connecté
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Erreur récupération utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   POST /api/auth/reset-password-request
// @desc    Demande de réinitialisation de mot de passe
// @access  Public
router.post("/reset-password-request", async (req, res) => {
  try {
    const { email } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      return res.json({
        message:
          "Si cet email existe dans notre base de données, vous recevrez un lien de réinitialisation",
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token dans la base de données
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpiry: resetTokenExpiry,
    });

    // Créer le lien de réinitialisation
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Réinitialisation de votre mot de passe - BidHub",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${user.firstName}</strong>,</p>
              
              <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte BidHub.</p>
              
              <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important :</strong>
                <ul>
                  <li>Ce lien est valide pendant 1 heure seulement</li>
                  <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                  <li>Pour votre sécurité, ne partagez jamais ce lien</li>
                </ul>
              </div>
              
              <p>Si le bouton ne fonctionne pas, copiez et collez cette URL dans votre navigateur :</p>
              <p style="word-break: break-all; color: #667eea;"><small>${resetUrl}</small></p>
              
              <p>Besoin d'aide ? Contactez notre équipe support.</p>
              
              <p>Cordialement,<br><strong>L'équipe BidHub</strong></p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    res.json({
      message:
        "Si cet email existe dans notre base de données, vous recevrez un lien de réinitialisation",
    });
  } catch (error) {
    console.error("Erreur demande réinitialisation:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de l'envoi de l'email" });
  }
});

// @route   GET /api/auth/reset-password/:token
// @desc    Vérifier la validité du token de réinitialisation
// @access  Public
router.get("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Rechercher l'utilisateur avec ce token valide
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: {
          [require("sequelize").Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token de réinitialisation invalide ou expiré",
      });
    }

    res.json({ message: "Token valide" });
  } catch (error) {
    console.error("Erreur validation token:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Réinitialiser le mot de passe
// @access  Public
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validation du mot de passe
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Rechercher l'utilisateur avec ce token valide
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: {
          [require("sequelize").Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token de réinitialisation invalide ou expiré",
      });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Mettre à jour le mot de passe et supprimer le token
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
    });

    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error("Erreur réinitialisation:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la réinitialisation" });
  }
});

module.exports = router;
