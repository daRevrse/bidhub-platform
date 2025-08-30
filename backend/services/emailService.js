// backend/services/emailService.js - Service d'envoi d'emails
const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailService {
  //   constructor() {
  //     // Configuration pour un service d'email (exemple avec Gmail)
  //     this.transporter = nodemailer.createTransporter({
  //       service: "gmail",
  //       auth: {
  //         user: process.env.EMAIL_USER,
  //         pass: process.env.EMAIL_PASS, // Mot de passe d'application Gmail
  //       },
  //     });

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Mot de passe d’application Gmail
      },
    });

    // Alternative pour un serveur SMTP local ou service comme SendGrid
    /*
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    */
  }

  //   async sendEmail(to, subject, htmlContent, textContent = "") {
  //     try {
  //       const mailOptions = {
  //         from: `"BidHub Togo" <${process.env.EMAIL_USER}>`,
  //         to: to,
  //         subject: subject,
  //         text: textContent,
  //         html: htmlContent,
  //       };

  //       const result = await this.transporter.sendMail(mailOptions);
  //       console.log(`✅ Email sent to ${to}: ${subject}`);
  //       return result;
  //     } catch (error) {
  //       console.error(`❌ Failed to send email to ${to}:`, error);
  //       throw error;
  //     }
  //   }

  async sendEmail(to, subject, htmlContent, textContent = "") {
    try {
      const mailOptions = {
        from: `"BidHub Togo" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email envoyé à ${to}: ${subject}`);
      return result;
    } catch (error) {
      console.error(`❌ Erreur envoi email à ${to}:`, error);
      throw error;
    }
  }

  // Template pour une nouvelle offre
  async sendNewBidNotification(seller, auction, bid, bidder) {
    const subject = `Nouvelle offre sur "${
      auction.product.title
    }" - ${this.formatPrice(bid.amount)}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nouvelle offre - BidHub</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🎉 Nouvelle offre sur votre produit !</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
          <h2 style="color: #667eea; margin-top: 0;">Bonjour ${
            seller.firstName
          },</h2>
          
          <p>Excellente nouvelle ! Une nouvelle offre a été placée sur votre produit :</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${
              auction.product.title
            }</h3>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              <strong>Nouvelle offre :</strong> <span style="color: #28a745; font-weight: bold; font-size: 18px;">${this.formatPrice(
                bid.amount
              )}</span>
            </p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              <strong>Enchérisseur :</strong> ${bidder.firstName} ${
      bidder.lastName[0]
    }.
            </p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              <strong>Date :</strong> ${new Date(bid.timestamp).toLocaleString(
                "fr-FR"
              )}
            </p>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1976d2;">📊 Résumé de l'enchère</h4>
            <p style="margin: 5px 0;"><strong>Prix de départ :</strong> ${this.formatPrice(
              auction.startingPrice
            )}</p>
            <p style="margin: 5px 0;"><strong>Prix actuel :</strong> <strong style="color: #28a745;">${this.formatPrice(
              auction.currentPrice
            )}</strong></p>
            <p style="margin: 5px 0;"><strong>Fin de l'enchère :</strong> ${new Date(
              auction.endTime
            ).toLocaleString("fr-FR")}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/auction/${auction.id}" 
               style="background: #667eea; color: white; text-decoration: none; padding: 12px 25px; border-radius: 25px; font-weight: bold; display: inline-block;">
              Voir l'enchère en direct
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          
          <div style="font-size: 12px; color: #666; text-align: center;">
            <p>Ceci est un email automatique de BidHub Togo.<br>
            Pour vous désabonner ou modifier vos préférences, <a href="${
              process.env.CLIENT_URL
            }/profile">cliquez ici</a>.</p>
            <p style="margin-top: 15px;">
              <strong>BidHub</strong> - La première plateforme d'enchères au Togo<br>
              📧 contact@bidhub.tg | 📱 +228 90 00 00 00
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(seller.email, subject, html);
  }

  // Template pour enchère terminée (gagnant)
  async sendAuctionWonNotification(winner, auction, winningBid) {
    const subject = `🎉 Félicitations ! Vous avez remporté "${auction.product.title}"`;

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🏆 Félicitations ${
            winner.firstName
          } !</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Vous avez remporté l'enchère !</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
          <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${
              auction.product.title
            }</h3>
            <p style="margin: 5px 0; font-size: 16px;">
              <strong>Prix final :</strong> <span style="color: #28a745; font-weight: bold; font-size: 20px;">${this.formatPrice(
                winningBid.amount
              )}</span>
            </p>
            <p style="margin: 5px 0; color: #666;">Enchère terminée le ${new Date(
              auction.endTime
            ).toLocaleString("fr-FR")}</p>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">📋 Prochaines étapes</h4>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Effectuez le paiement dans les <strong>48 heures</strong></li>
              <li>Le vendeur vous contactera pour organiser la livraison</li>
              <li>Récupérez votre produit selon les modalités convenues</li>
              <li>Laissez un avis sur votre expérience BidHub</li>
            </ol>
          </div>

          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #155724;">💳 Informations de paiement</h4>
            <p style="margin: 5px 0;"><strong>Montant total :</strong> ${this.formatPrice(
              winningBid.amount
            )}</p>
            <p style="margin: 5px 0;"><strong>Commission BidHub (5%) :</strong> ${this.formatPrice(
              winningBid.amount * 0.05
            )}</p>
            <p style="margin: 5px 0;"><strong>Montant vendeur :</strong> ${this.formatPrice(
              winningBid.amount * 0.95
            )}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/auction/${auction.id}" 
               style="background: #28a745; color: white; text-decoration: none; padding: 12px 25px; border-radius: 25px; font-weight: bold; display: inline-block; margin-right: 10px;">
              Voir les détails
            </a>
            <a href="${process.env.CLIENT_URL}/profile" 
               style="background: #667eea; color: white; text-decoration: none; padding: 12px 25px; border-radius: 25px; font-weight: bold; display: inline-block;">
              Mon profil
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(winner.email, subject, html);
  }

  // Template pour enchère terminée (vendeur)
  async sendAuctionSoldNotification(seller, auction, winner, winningBid) {
    const subject = `✅ Votre produit "${auction.product.title}" a été vendu !`;

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #17a2b8 0%, #6610f2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">💰 Vente réussie !</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre produit a trouvé acquéreur</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
          <h2 style="color: #17a2b8; margin-top: 0;">Bonjour ${
            seller.firstName
          },</h2>
          
          <p>Excellente nouvelle ! Votre produit a été vendu avec succès :</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${
              auction.product.title
            }</h3>
            <p style="margin: 5px 0; font-size: 16px;">
              <strong>Prix de vente :</strong> <span style="color: #28a745; font-weight: bold; font-size: 20px;">${this.formatPrice(
                winningBid.amount
              )}</span>
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Acheteur :</strong> ${winner.firstName} ${winner.lastName}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Email :</strong> ${winner.email}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Téléphone :</strong> ${winner.phone}
            </p>
          </div>

          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #155724;">💰 Récapitulatif financier</h4>
            <p style="margin: 5px 0;"><strong>Prix de vente :</strong> ${this.formatPrice(
              winningBid.amount
            )}</p>
            <p style="margin: 5px 0;"><strong>Commission BidHub (5%) :</strong> -${this.formatPrice(
              winningBid.amount * 0.05
            )}</p>
            <p style="margin: 5px 0; padding-top: 10px; border-top: 1px solid #c3e6cb;">
              <strong>Montant à recevoir :</strong> <span style="color: #28a745; font-weight: bold; font-size: 18px;">${this.formatPrice(
                winningBid.amount * 0.95
              )}</span>
            </p>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">📋 Prochaines étapes</h4>
            <ol style="margin: 0; padding-left: 20px;">
              <li>L'acheteur doit effectuer le paiement dans les 48h</li>
              <li>Contactez l'acheteur pour organiser la livraison</li>
              <li>Une fois la transaction terminée, vous recevrez votre paiement</li>
              <li>N'oubliez pas de laisser un avis sur l'acheteur</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/create-product" 
               style="background: #28a745; color: white; text-decoration: none; padding: 12px 25px; border-radius: 25px; font-weight: bold; display: inline-block; margin-right: 10px;">
              Vendre un autre produit
            </a>
            <a href="${process.env.CLIENT_URL}/profile" 
               style="background: #667eea; color: white; text-decoration: none; padding: 12px 25px; border-radius: 25px; font-weight: bold; display: inline-block;">
              Mon profil
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(seller.email, subject, html);
  }

  // Template pour rappel fin d'enchère (24h avant)
  async sendAuctionEndingReminderNotification(participants, auction) {
    const subject = `⏰ Plus que 24h ! "${auction.product.title}" se termine bientôt`;

    for (const participant of participants) {
      const html = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">⏰ Dernière chance !</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">L'enchère se termine dans moins de 24h</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #ff6b6b; margin-top: 0;">Bonjour ${
              participant.firstName
            },</h2>
            
            <p>L'enchère à laquelle vous participez se termine bientôt :</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ff6b6b; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${
                auction.product.title
              }</h3>
              <p style="margin: 5px 0; font-size: 16px;">
                <strong>Prix actuel :</strong> <span style="color: #28a745; font-weight: bold; font-size: 18px;">${this.formatPrice(
                  auction.currentPrice
                )}</span>
              </p>
              <p style="margin: 5px 0; color: #ff6b6b; font-weight: bold;">
                <strong>Se termine le :</strong> ${new Date(
                  auction.endTime
                ).toLocaleString("fr-FR")}
              </p>
            </div>

            <div style="background: #ffe6e6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #d63384;">🚨 Temps limité !</h4>
              <p style="margin: 0; font-size: 14px;">Ne laissez pas passer cette opportunité.<br>Placez votre offre finale maintenant !</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/auction/${auction.id}" 
                 style="background: #ff6b6b; color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; display: inline-block; animation: pulse 2s infinite;">
                ⚡ Enchérir maintenant
              </a>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.sendEmail(participant.email, subject, html);
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  }
}

module.exports = new EmailService();
