import React, { useState, useEffect, useCallback } from "react";
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const RealTimeBidding = ({ auction, onBidUpdate }) => {
  const { user } = useAuth();
  const socket = useSocket();

  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [recentBids, setRecentBids] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Calculer le temps restant
  useEffect(() => {
    if (!auction?.endTime) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const end = new Date(auction.endTime);
      const diff = Math.max(0, end - now);
      setTimeRemaining(Math.floor(diff / 1000));

      // Déclencher l'état "se termine bientôt"
      if (diff <= 300000 && diff > 0) {
        // 5 minutes
        setIsEnding(true);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [auction?.endTime]);

  // Gestion des événements socket
  useEffect(() => {
    // Vérifications de sécurité
    if (!socket || !user || !auction?.id || typeof socket.emit !== "function") {
      console.log("🔨 Socket pas prêt pour l'enchère:", {
        socket: !!socket,
        user: !!user,
        auction: !!auction,
        hasEmit: typeof socket?.emit,
      });
      return;
    }

    console.log("🔨 Configuration socket pour enchère:", auction.id);

    // Rejoindre la salle d'enchère
    socket.emit("join_auction", auction.id);

    // Handlers des événements
    const handleAuctionJoined = (data) => {
      setParticipants(data.participantsCount || 0);
      console.log(
        "🔨 Salle d'enchère rejointe, participants:",
        data.participantsCount
      );
    };

    const handleNewBid = (bidData) => {
      console.log("🔨 Nouvelle enchère reçue:", bidData);

      // Mettre à jour les offres récentes
      setRecentBids((prev) => [bidData, ...prev.slice(0, 4)]);

      // Mettre à jour le prix courant via le callback parent
      if (onBidUpdate && bidData.currentPrice) {
        onBidUpdate(bidData.currentPrice);
      }

      // Message de notification pour les autres participants
      if (bidData.bidder && bidData.bidder.id !== user.id) {
        setMessage(
          `${bidData.bidder.firstName} a placé une offre de ${formatPrice(
            bidData.amount
          )} !`
        );
        setTimeout(() => setMessage(""), 5000);
      }
    };

    const handleBidPlaced = (data) => {
      console.log("🔨 Réponse placement enchère:", data);
      if (data.success) {
        setBidding(false);
        setBidAmount("");
        setMessage("Offre placée avec succès !");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setBidding(false);
        setMessage(data.message || "Erreur lors du placement de l'offre");
        setTimeout(() => setMessage(""), 5000);
      }
    };

    const handleBidError = (error) => {
      console.error("🔨 Erreur enchère:", error);
      setBidding(false);
      setMessage(
        `Erreur: ${
          typeof error === "string" ? error : error.message || "Erreur inconnue"
        }`
      );
      setTimeout(() => setMessage(""), 5000);
    };

    const handleParticipantJoined = (data) => {
      setParticipants(data.participantsCount || 0);
      console.log("🔨 Nouveau participant, total:", data.participantsCount);
    };

    const handleParticipantLeft = (data) => {
      setParticipants(data.participantsCount || 0);
      console.log("🔨 Participant parti, total:", data.participantsCount);
    };

    const handleAuctionEndingSoon = (data) => {
      setIsEnding(true);
      setMessage(
        "⏰ Attention ! L'enchère se termine dans moins de 5 minutes !"
      );
      setTimeout(() => setMessage(""), 10000);
    };

    const handleAuctionEnded = (data) => {
      console.log("🔨 Enchère terminée:", data);
      if (data.winner) {
        setMessage(
          `🏆 Enchère terminée ! Gagnant: ${
            data.winner.firstName
          } (${formatPrice(data.winningAmount)})`
        );
      } else {
        setMessage("🏆 Enchère terminée !");
      }

      if (onBidUpdate) {
        onBidUpdate("ended");
      }

      setTimeout(() => setMessage(""), 15000);
    };

    const handleAuctionEndedNoBids = (data) => {
      console.log("🔨 Enchère terminée sans offres:", data);
      setMessage("📭 Enchère terminée sans offres");
      if (onBidUpdate) {
        onBidUpdate("ended");
      }
      setTimeout(() => setMessage(""), 10000);
    };

    // Attacher tous les listeners
    const listeners = [
      ["auction_joined", handleAuctionJoined],
      ["new_bid", handleNewBid],
      ["bid_placed", handleBidPlaced],
      ["bid_error", handleBidError],
      ["participant_joined", handleParticipantJoined],
      ["participant_left", handleParticipantLeft],
      ["auction_ending_soon", handleAuctionEndingSoon],
      ["auction_ended", handleAuctionEnded],
      ["auction_ended_no_bids", handleAuctionEndedNoBids],
    ];

    listeners.forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // Cleanup
    return () => {
      if (socket && typeof socket.off === "function") {
        // Quitter la salle d'enchère
        if (typeof socket.emit === "function") {
          socket.emit("leave_auction", auction.id);
        }

        // Détacher tous les listeners
        listeners.forEach(([event, handler]) => {
          socket.off(event, handler);
        });
      }
    };
  }, [socket, auction?.id, user, onBidUpdate]);

  // Fonctions utilitaires
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  }, []);

  const formatTime = useCallback((seconds) => {
    if (seconds <= 0) return "Terminée";

    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}j ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    return `${minutes}m ${secs}s`;
  }, []);

  // Fonction pour placer une enchère
  const handleBidSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Vérifications de sécurité
      if (!socket || typeof socket.emit !== "function") {
        setMessage("Connexion en cours... Veuillez patienter.");
        return;
      }

      if (bidding) {
        setMessage("Enchère en cours, veuillez patienter...");
        return;
      }

      const amount = parseFloat(bidAmount);

      // Validation du montant
      if (isNaN(amount) || amount <= 0) {
        setMessage("Veuillez entrer un montant valide");
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      if (amount <= (auction?.currentPrice || 0)) {
        setMessage(
          `L'offre doit être supérieure à ${formatPrice(
            auction?.currentPrice || 0
          )}`
        );
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      const minBid = (auction?.currentPrice || 0) + 100;
      if (amount < minBid) {
        setMessage(`L'offre minimum est de ${formatPrice(minBid)}`);
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      // Placer l'enchère
      setBidding(true);
      setMessage("Placement de votre offre...");

      console.log("🔨 Placement enchère:", {
        auctionId: auction.id,
        amount,
        userId: user.id,
      });

      socket.emit("place_bid", {
        auctionId: auction.id,
        amount,
        userId: user.id,
      });
    },
    [
      socket,
      bidding,
      bidAmount,
      auction?.currentPrice,
      auction?.id,
      user?.id,
      formatPrice,
    ]
  );

  // Fonctions pour les boutons rapides
  const handleQuickBid = useCallback(
    (increment) => {
      const newAmount = (auction?.currentPrice || 0) + increment;
      setBidAmount(newAmount.toString());
    },
    [auction?.currentPrice]
  );

  // Conditions d'affichage
  const canBid =
    user &&
    auction?.product?.sellerId !== user.id &&
    timeRemaining > 0 &&
    auction?.status === "active";

  const isOwner = user && auction?.product?.sellerId === user.id;
  const isWinner =
    user && auction?.winnerId === user.id && auction?.status === "ended";

  // États de chargement
  if (!socket) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent mr-3"></div>
          <span className="text-yellow-800">
            Connexion au serveur d'enchères...
          </span>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600 text-center">Enchère non disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statut de l'enchère */}
      <div
        className={`rounded-lg p-4 transition-all duration-300 ${
          isEnding
            ? "bg-red-50 border-2 border-red-200 animate-pulse"
            : "bg-blue-50 border border-blue-200"
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full transition-all ${
                  timeRemaining > 0
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500"
                }`}
              ></div>
              <span className="font-medium">
                {timeRemaining > 0 ? "Enchère en cours" : "Enchère terminée"}
              </span>
            </div>
            <span className="text-sm text-gray-600 flex items-center">
              <span className="mr-1">👥</span>
              {participants} participant{participants > 1 ? "s" : ""}
            </span>
          </div>
          <div className="text-right">
            <div
              className={`font-bold text-lg transition-colors ${
                isEnding ? "text-red-600 animate-pulse" : "text-gray-900"
              }`}
            >
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-gray-500">restant</div>
          </div>
        </div>
      </div>

      {/* Messages d'état */}
      {message && (
        <div
          className={`p-3 rounded-lg transition-all duration-300 ${
            message.includes("Erreur")
              ? "bg-red-100 text-red-700 border border-red-200"
              : message.includes("succès")
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-blue-100 text-blue-700 border border-blue-200"
          }`}
        >
          <div className="flex items-center">
            {message.includes("Erreur") ? (
              <span className="text-red-500 mr-2">❌</span>
            ) : message.includes("succès") ? (
              <span className="text-green-500 mr-2">✅</span>
            ) : (
              <span className="text-blue-500 mr-2">ℹ️</span>
            )}
            {message}
          </div>
        </div>
      )}

      {/* Formulaire d'enchère */}
      {canBid && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre offre (minimum:{" "}
                {formatPrice((auction?.currentPrice || 0) + 100)})
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={(auction?.currentPrice || 0) + 100}
                  step="100"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={`${(auction?.currentPrice || 0) + 1000}`}
                  disabled={bidding}
                  required
                />
                <button
                  type="submit"
                  disabled={
                    bidding ||
                    !bidAmount ||
                    parseFloat(bidAmount) <= (auction?.currentPrice || 0)
                  }
                  className={`px-6 py-2 rounded-lg font-semibold transition-all transform ${
                    bidding
                      ? "bg-gray-400 cursor-not-allowed scale-95"
                      : isEnding
                      ? "bg-red-600 hover:bg-red-700 text-white animate-pulse hover:scale-105 shadow-lg"
                      : "bg-green-600 hover:bg-green-700 text-white hover:scale-105 shadow-lg hover:shadow-xl"
                  } disabled:opacity-50 disabled:transform-none`}
                >
                  {bidding ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Enchère...</span>
                    </div>
                  ) : isEnding ? (
                    "⚡ Enchérir"
                  ) : (
                    "Enchérir"
                  )}
                </button>
              </div>
            </div>

            {/* Boutons rapides */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickBid(500)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                disabled={bidding}
              >
                +500 FCFA
              </button>
              <button
                type="button"
                onClick={() => handleQuickBid(1000)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                disabled={bidding}
              >
                +1000 FCFA
              </button>
              <button
                type="button"
                onClick={() => handleQuickBid(5000)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                disabled={bidding}
              >
                +5000 FCFA
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Offres récentes en temps réel */}
      {recentBids.length > 0 && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Offres récentes
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentBids.map((bid, index) => (
              <div
                key={bid.id || index}
                className={`flex justify-between items-center p-3 rounded-lg transition-all ${
                  index === 0
                    ? "bg-green-50 border border-green-200 shadow-sm"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {bid.bidder?.firstName?.[0] || "?"}
                    {bid.bidder?.lastName?.[0] || ""}
                  </div>
                  <span className="text-sm font-medium">
                    {bid.bidder?.firstName || "Utilisateur"}{" "}
                    {bid.bidder?.lastName?.[0] || ""}.
                  </span>
                  {index === 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      Plus haute
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold ${
                      index === 0 ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {formatPrice(bid.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {bid.timestamp
                      ? new Date(bid.timestamp).toLocaleTimeString("fr-FR")
                      : "maintenant"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages pour les cas spéciaux */}
      {!user && (
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
          <p className="text-gray-700 mb-4 font-medium">
            Connectez-vous pour participer à cette enchère
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Se connecter
          </Link>
        </div>
      )}

      {isOwner && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
          <p className="text-blue-700 font-medium">
            📊 C'est votre enchère - vous pouvez suivre les offres en temps réel
          </p>
        </div>
      )}

      {timeRemaining <= 0 && !isWinner && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center">
          <p className="text-gray-700 font-medium">
            ⏰ Cette enchère est terminée
          </p>
        </div>
      )}

      {isWinner && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
          <p className="text-green-700 font-bold text-lg mb-4">
            🎉 Félicitations ! Vous avez remporté cette enchère
          </p>
          <button
            onClick={() => navigate(`/payment/${auction.id}`)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            💳 Finaliser le paiement
          </button>
        </div>
      )}
    </div>
  );
};

export default RealTimeBidding;
