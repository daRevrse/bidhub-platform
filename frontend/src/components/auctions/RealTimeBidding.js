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
    const updateTimeRemaining = () => {
      const now = new Date();
      const end = new Date(auction.endTime);
      const diff = Math.max(0, end - now);
      setTimeRemaining(Math.floor(diff / 1000));
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime]);

  // Gestion des événements socket
  useEffect(() => {
    if (!socket || !user) return;

    // Rejoindre la salle d'enchère
    socket.emit("join_auction", auction.id);

    // Écouter les événements
    const handleAuctionJoined = (data) => {
      setParticipants(data.participantsCount);
      console.log("Joined auction room");
    };

    const handleNewBid = (bidData) => {
      // Mettre à jour les offres récentes
      setRecentBids((prev) => [bidData, ...prev.slice(0, 4)]);

      // Mettre à jour le prix courant via le callback parent
      onBidUpdate(bidData.currentPrice);

      // Message de notification
      if (bidData.bidder.id !== user.id) {
        setMessage(
          `${bidData.bidder.firstName} a placé une offre de ${formatPrice(
            bidData.amount
          )} !`
        );
        setTimeout(() => setMessage(""), 5000);
      }
    };

    const handleBidPlaced = (data) => {
      if (data.success) {
        setBidding(false);
        setBidAmount("");
        setMessage("Offre placée avec succès !");
        setTimeout(() => setMessage(""), 3000);
      }
    };

    const handleBidError = (error) => {
      setBidding(false);
      setMessage(`Erreur: ${error}`);
      setTimeout(() => setMessage(""), 5000);
    };

    const handleParticipantJoined = (data) => {
      setParticipants(data.participantsCount);
    };

    const handleParticipantLeft = (data) => {
      setParticipants(data.participantsCount);
    };

    const handleAuctionEndingSoon = (data) => {
      setIsEnding(true);
      setMessage(
        "⏰ Attention ! L'enchère se termine dans moins de 5 minutes !"
      );
    };

    const handleAuctionEnded = (data) => {
      setMessage(
        `🏆 Enchère terminée ! Gagnant: ${data.winner.firstName} (${formatPrice(
          data.winningAmount
        )})`
      );
      onBidUpdate("ended");
    };

    const handleAuctionEndedNoBids = (data) => {
      setMessage("Enchère terminée sans offres");
      onBidUpdate("ended");
    };

    // Attacher les écouteurs
    socket.on("auction_joined", handleAuctionJoined);
    socket.on("new_bid", handleNewBid);
    socket.on("bid_placed", handleBidPlaced);
    socket.on("bid_error", handleBidError);
    socket.on("participant_joined", handleParticipantJoined);
    socket.on("participant_left", handleParticipantLeft);
    socket.on("auction_ending_soon", handleAuctionEndingSoon);
    socket.on("auction_ended", handleAuctionEnded);
    socket.on("auction_ended_no_bids", handleAuctionEndedNoBids);

    // Cleanup
    return () => {
      socket.emit("leave_auction", auction.id);
      socket.off("auction_joined", handleAuctionJoined);
      socket.off("new_bid", handleNewBid);
      socket.off("bid_placed", handleBidPlaced);
      socket.off("bid_error", handleBidError);
      socket.off("participant_joined", handleParticipantJoined);
      socket.off("participant_left", handleParticipantLeft);
      socket.off("auction_ending_soon", handleAuctionEndingSoon);
      socket.off("auction_ended", handleAuctionEnded);
      socket.off("auction_ended_no_bids", handleAuctionEndedNoBids);
    };
  }, [socket, auction.id, user, onBidUpdate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return "Terminée";

    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}j ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    return `${minutes}m ${secs}s`;
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();

    if (!socket) {
      setMessage("Connexion en cours...");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= auction.currentPrice) {
      setMessage(
        `L'offre doit être supérieure à ${formatPrice(auction.currentPrice)}`
      );
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setBidding(true);
    socket.emit("place_bid", {
      auctionId: auction.id,
      amount,
    });
  };

  const canBid =
    user && auction.product.sellerId !== user.id && timeRemaining > 0;

  return (
    <div className="space-y-6">
      {/* Statut de l'enchère */}
      <div
        className={`rounded-lg p-4 ${
          isEnding
            ? "bg-red-50 border-2 border-red-200"
            : "bg-blue-50 border border-blue-200"
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  timeRemaining > 0
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500"
                }`}
              ></div>
              <span className="font-medium">
                {timeRemaining > 0 ? "Enchère en cours" : "Enchère terminée"}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              👥 {participants} participant{participants > 1 ? "s" : ""}
            </span>
          </div>
          <div className="text-right">
            <div
              className={`font-bold text-lg ${
                isEnding ? "text-red-600" : "text-gray-900"
              }`}
            >
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-gray-500">restant</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.includes("Erreur")
              ? "bg-red-100 text-red-700"
              : message.includes("succès")
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Formulaire d'enchère */}
      {canBid && timeRemaining > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre offre (minimum: {formatPrice(auction.currentPrice + 100)})
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={auction.currentPrice + 100}
                  step="100"
                  className="flex-1 form-input"
                  placeholder={`${auction.currentPrice + 1000}`}
                  disabled={bidding}
                />
                <button
                  type="submit"
                  disabled={bidding || !bidAmount}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    bidding
                      ? "bg-gray-400 cursor-not-allowed"
                      : isEnding
                      ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                      : "bg-green-600 hover:bg-green-700 text-white hover:scale-105"
                  } disabled:opacity-50`}
                >
                  {bidding
                    ? "Enchère..."
                    : isEnding
                    ? "⚡ Enchérir"
                    : "Enchérir"}
                </button>
              </div>
            </div>

            {/* Boutons rapides */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setBidAmount(auction.currentPrice + 500)}
                className="btn-secondary text-sm"
                disabled={bidding}
              >
                +500 FCFA
              </button>
              <button
                type="button"
                onClick={() => setBidAmount(auction.currentPrice + 1000)}
                className="btn-secondary text-sm"
                disabled={bidding}
              >
                +1000 FCFA
              </button>
              <button
                type="button"
                onClick={() => setBidAmount(auction.currentPrice + 5000)}
                className="btn-secondary text-sm"
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
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Offres récentes
          </h3>
          <div className="space-y-2">
            {recentBids.map((bid, index) => (
              <div
                key={bid.id}
                className={`flex justify-between items-center p-2 rounded ${
                  index === 0
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                    {bid.bidder.firstName[0]}
                    {bid.bidder.lastName[0]}
                  </div>
                  <span className="text-sm">
                    {bid.bidder.firstName} {bid.bidder.lastName[0]}.
                  </span>
                  {index === 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
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
                    {new Date(bid.timestamp).toLocaleTimeString("fr-FR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages pour les cas spéciaux */}
      {!user && (
        <div className="text-center bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 mb-3">
            Connectez-vous pour participer à cette enchère
          </p>
          {/* <button className="btn-primary">Se connecter</button> */}
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Se connecter
          </Link>
        </div>
      )}

      {user && auction.product.sellerId === user.id && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
          <p className="text-blue-700">
            C'est votre enchère - vous pouvez suivre les offres en temps réel
          </p>
        </div>
      )}

      {timeRemaining <= 0 && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center">
          <p className="text-gray-700 font-medium">
            Cette enchère est terminée
          </p>
        </div>
      )}

      {user && auction.winnerId === user.id && auction.status === "ended" && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
          <p className="text-green-700 font-medium mb-3">
            🎉 Félicitations ! Vous avez remporté cette enchère
          </p>
          <button
            onClick={() => navigate(`/payment/${auction.id}`)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            💳 Finaliser le paiement
          </button>
        </div>
      )}
    </div>
  );
};

export default RealTimeBidding;
