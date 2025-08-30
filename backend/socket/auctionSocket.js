// backend/socket/auctionSocket.js - Gestion des sockets pour les enchères
const jwt = require("jsonwebtoken");
const { Auction, Product, User, Bid } = require("../models");
const emailService = require("../services/emailService");

class AuctionSocketManager {
  constructor(io) {
    this.io = io;
    this.auctionRooms = new Map(); // Map des salles d'enchères actives
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Authentification du socket
      socket.on("authenticate", async (token) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.userId = decoded.userId;
          socket.userEmail = decoded.email;
          console.log(`✅ User authenticated: ${socket.userEmail}`);
        } catch (error) {
          socket.emit("auth_error", "Invalid token");
        }
      });

      // Rejoindre une salle d'enchère
      socket.on("join_auction", async (auctionId) => {
        try {
          const auction = await Auction.findByPk(auctionId, {
            include: [
              {
                model: Product,
                as: "product",
                include: [
                  {
                    model: User,
                    as: "seller",
                    attributes: ["id", "firstName", "lastName"],
                  },
                ],
              },
            ],
          });

          if (!auction) {
            socket.emit("error", "Enchère non trouvée");
            return;
          }

          socket.join(`auction_${auctionId}`);

          // Ajouter à la map des salles actives
          if (!this.auctionRooms.has(auctionId)) {
            this.auctionRooms.set(auctionId, new Set());
          }
          this.auctionRooms.get(auctionId).add(socket.id);

          // Envoyer les infos actuelles de l'enchère
          socket.emit("auction_joined", {
            auctionId,
            currentPrice: auction.currentPrice,
            participantsCount: this.auctionRooms.get(auctionId).size,
          });

          // Notifier les autres participants
          socket.to(`auction_${auctionId}`).emit("participant_joined", {
            participantsCount: this.auctionRooms.get(auctionId).size,
          });

          console.log(
            `👥 User ${socket.userEmail} joined auction ${auctionId}`
          );
        } catch (error) {
          console.error("Error joining auction:", error);
          socket.emit("error", "Erreur lors de la connexion à l'enchère");
        }
      });

      // Quitter une salle d'enchère
      socket.on("leave_auction", (auctionId) => {
        socket.leave(`auction_${auctionId}`);

        if (this.auctionRooms.has(auctionId)) {
          this.auctionRooms.get(auctionId).delete(socket.id);

          // Notifier les autres participants
          socket.to(`auction_${auctionId}`).emit("participant_left", {
            participantsCount: this.auctionRooms.get(auctionId).size,
          });
        }
      });

      // Placement d'une offre en temps réel
      socket.on("place_bid", async (data) => {
        try {
          const { auctionId, amount } = data;

          if (!socket.userId) {
            socket.emit("bid_error", "Non authentifié");
            return;
          }

          // Vérifications côté serveur
          const auction = await Auction.findByPk(auctionId, {
            include: [
              {
                model: Product,
                as: "product",
              },
            ],
          });

          if (!auction) {
            socket.emit("bid_error", "Enchère non trouvée");
            return;
          }

          if (auction.status !== "active") {
            socket.emit("bid_error", "Cette enchère n'est pas active");
            return;
          }

          if (new Date() > auction.endTime) {
            socket.emit("bid_error", "Cette enchère est terminée");
            return;
          }

          if (amount <= auction.currentPrice) {
            socket.emit(
              "bid_error",
              `L'offre doit être supérieure à ${auction.currentPrice} FCFA`
            );
            return;
          }

          if (auction.product.sellerId === socket.userId) {
            socket.emit(
              "bid_error",
              "Vous ne pouvez pas enchérir sur votre propre produit"
            );
            return;
          }

          // Créer l'offre
          const bid = await Bid.create({
            auctionId,
            bidderId: socket.userId,
            amount: parseFloat(amount),
          });

          // Mettre à jour le prix courant
          await auction.update({ currentPrice: amount });

          // Récupérer les infos du bidder
          const bidder = await User.findByPk(socket.userId, {
            attributes: ["id", "firstName", "lastName"],
          });

          // Données de l'offre à diffuser
          const bidData = {
            id: bid.id,
            amount: parseFloat(amount),
            timestamp: bid.timestamp,
            bidder: {
              id: bidder.id,
              firstName: bidder.firstName,
              lastName: bidder.lastName,
            },
            auctionId,
            currentPrice: parseFloat(amount),
          };

          // Diffuser à tous les participants de l'enchère
          this.io.to(`auction_${auctionId}`).emit("new_bid", bidData);

          // Confirmer au bidder
          socket.emit("bid_placed", {
            success: true,
            bid: bidData,
          });

          console.log(
            `💰 New bid: ${amount} FCFA on auction ${auctionId} by ${bidder.firstName}`
          );

          // Envoyer notification email au vendeur
          try {
            const seller = await User.findByPk(auction.product.sellerId);
            if (seller && seller.email) {
              await emailService.sendNewBidNotification(
                seller,
                auction,
                bid,
                bidder
              );
            }
          } catch (emailError) {
            console.error("Error sending bid notification email:", emailError);
          }

          // Vérifier si l'enchère se termine bientôt (dernières 5 minutes)
          const timeRemaining = auction.endTime - new Date();
          if (timeRemaining <= 5 * 60 * 1000 && timeRemaining > 0) {
            this.io.to(`auction_${auctionId}`).emit("auction_ending_soon", {
              timeRemaining: Math.floor(timeRemaining / 1000),
            });
          }
        } catch (error) {
          console.error("Error placing bid:", error);
          socket.emit("bid_error", "Erreur lors du placement de l'offre");
        }
      });

      // Déconnexion
      socket.on("disconnect", () => {
        // Nettoyer les salles d'enchères
        this.auctionRooms.forEach((participants, auctionId) => {
          if (participants.has(socket.id)) {
            participants.delete(socket.id);

            // Notifier les autres participants
            socket.to(`auction_${auctionId}`).emit("participant_left", {
              participantsCount: participants.size,
            });
          }
        });

        console.log(`🔌 User disconnected: ${socket.id}`);
      });
    });
  }

  // Méthode pour terminer une enchère (appelée par un cron job)
  async endAuction(auctionId) {
    try {
      const auction = await Auction.findByPk(auctionId, {
        include: [
          {
            model: Product,
            as: "product",
          },
          {
            model: Bid,
            as: "bids",
            include: [
              {
                model: User,
                as: "bidder",
                attributes: ["id", "firstName", "lastName", "email"],
              },
            ],
            order: [["amount", "DESC"]],
            limit: 1,
          },
        ],
      });

      if (!auction) return;

      // Mettre à jour le statut de l'enchère
      await auction.update({ status: "ended" });

      // Définir le gagnant s'il y a des offres
      if (auction.bids && auction.bids.length > 0) {
        const winningBid = auction.bids[0];
        await auction.update({ winnerId: winningBid.bidderId });

        // Envoyer notifications email
        try {
          // Notifier le gagnant
          await emailService.sendAuctionWonNotification(
            winningBid.bidder,
            auction,
            winningBid
          );

          // Notifier le vendeur
          const seller = await User.findByPk(auction.product.sellerId);
          if (seller) {
            await emailService.sendAuctionSoldNotification(
              seller,
              auction,
              winningBid.bidder,
              winningBid
            );
          }
        } catch (emailError) {
          console.error(
            "Error sending auction end notification emails:",
            emailError
          );
        }

        // Notifier le gagnant et le vendeur
        this.io.to(`auction_${auctionId}`).emit("auction_ended", {
          auctionId,
          winner: winningBid.bidder,
          winningAmount: winningBid.amount,
          productTitle: auction.product.title,
        });
      } else {
        // Aucune offre
        this.io.to(`auction_${auctionId}`).emit("auction_ended_no_bids", {
          auctionId,
          productTitle: auction.product.title,
        });
      }

      // Nettoyer la salle
      this.auctionRooms.delete(auctionId);

      console.log(`🏁 Auction ${auctionId} ended`);
    } catch (error) {
      console.error("Error ending auction:", error);
    }
  }
}

module.exports = AuctionSocketManager;
