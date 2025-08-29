import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AuctionDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAuctionDetails();
  }, [id]);

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/auctions/${id}`
      );
      setAuction(response.data);
      setBidAmount((response.data.currentPrice + 1000).toString());
    } catch (error) {
      console.error("Erreur chargement enchère:", error);
      setError("Enchère non trouvée");
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    setBidding(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`http://localhost:5000/api/auctions/${id}/bid`, {
        amount: parseFloat(bidAmount),
      });

      setSuccess("Offre placée avec succès !");
      await fetchAuctionDetails(); // Rafraîchir les données
    } catch (error) {
      setError(
        error.response?.data?.message || "Erreur lors du placement de l'offre"
      );
    } finally {
      setBidding(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return "Terminée";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}j ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isAuctionActive = () => {
    if (!auction) return false;
    return (
      auction.status === "active" && new Date() < new Date(auction.endTime)
    );
  };

  const canBid = () => {
    if (!user || !auction) return false;
    if (auction.product.sellerId === user.id) return false;
    return isAuctionActive();
  };

  if (loading) return <LoadingSpinner />;

  if (error && !auction) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={() => navigate("/auctions")} className="btn-primary">
          Retour aux enchères
        </button>
      </div>
    );
  }

  if (!auction) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images du produit */}
        <div className="space-y-4">
          <div className="aspect-w-16 aspect-h-12">
            {auction.product.images && auction.product.images.length > 0 ? (
              <img
                src={`http://localhost:5000/uploads/products/${auction.product.images[0]}`}
                alt={auction.product.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/600x400?text=Image+non+disponible";
                }}
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-gray-500 text-lg">
                  Pas d'image disponible
                </span>
              </div>
            )}
          </div>

          {/* Miniatures (si plusieurs images) */}
          {auction.product.images && auction.product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {auction.product.images.slice(1, 5).map((image, index) => (
                <img
                  key={index}
                  src={`http://localhost:5000/uploads/products/${image}`}
                  alt={`${auction.product.title} ${index + 2}`}
                  className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150?text=N/A";
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Détails de l'enchère */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {auction.product.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span>Catégorie: {auction.product.category}</span>
              <span>•</span>
              <span>État: {auction.product.condition}</span>
            </div>
          </div>

          {/* Informations sur l'enchère */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Prix de départ</p>
                <p className="text-lg font-semibold">
                  {formatPrice(auction.startingPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Prix actuel</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatPrice(auction.currentPrice)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Temps restant</p>
                <p
                  className={`text-lg font-semibold ${
                    isAuctionActive() ? "text-auction-live" : "text-gray-600"
                  }`}
                >
                  {formatTimeRemaining(auction.endTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Nombre d'offres</p>
                <p className="text-lg font-semibold">
                  {auction.bids ? auction.bids.length : 0}
                </p>
              </div>
            </div>

            {/* Formulaire d'enchère */}
            {canBid() && (
              <form onSubmit={handleBid} className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre offre (minimum:{" "}
                    {formatPrice(auction.currentPrice + 1)})
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={auction.currentPrice + 1}
                    step="100"
                    className="form-input"
                    placeholder="Montant en FCFA"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={bidding}
                  className="w-full bid-button disabled:opacity-50"
                >
                  {bidding ? "Placement de l'offre..." : "Placer l'offre"}
                </button>
              </form>
            )}

            {/* Messages pour les cas où on ne peut pas enchérir */}
            {!user && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Connectez-vous pour participer à cette enchère
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="btn-primary"
                >
                  Se connecter
                </button>
              </div>
            )}

            {user && auction.product.sellerId === user.id && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                C'est votre produit - vous ne pouvez pas enchérir dessus
              </div>
            )}

            {!isAuctionActive() && auction.status === "ended" && (
              <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded text-center">
                Cette enchère est terminée
              </div>
            )}
          </div>

          {/* Informations sur le vendeur */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-2">Vendeur</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-semibold">
                  {auction.product.seller.firstName[0]}
                  {auction.product.seller.lastName[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {auction.product.seller.firstName}{" "}
                  {auction.product.seller.lastName}
                </p>
                <p className="text-sm text-gray-500">Vendeur</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description du produit */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-gray-700 whitespace-pre-wrap">
            {auction.product.description}
          </p>
        </div>
      </div>

      {/* Historique des offres */}
      {auction.bids && auction.bids.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Historique des offres ({auction.bids.length})
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {auction.bids.map((bid, index) => (
                <div
                  key={bid.id}
                  className={`p-4 flex justify-between items-center ${
                    index !== auction.bids.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  } ${index === 0 ? "bg-green-50" : ""}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-600">
                        {bid.bidder.firstName[0]}
                        {bid.bidder.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {bid.bidder.firstName} {bid.bidder.lastName[0]}.
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(bid.timestamp).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        index === 0 ? "text-green-600 text-lg" : "text-gray-900"
                      }`}
                    >
                      {formatPrice(bid.amount)}
                    </p>
                    {index === 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Offre la plus haute
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Informations supplémentaires */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Détails de l'enchère</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-500">Début de l'enchère</dt>
              <dd className="font-medium">
                {new Date(auction.startTime).toLocaleString("fr-FR")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Fin de l'enchère</dt>
              <dd className="font-medium">
                {new Date(auction.endTime).toLocaleString("fr-FR")}
              </dd>
            </div>
            {auction.reservePrice && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Prix de réserve</dt>
                <dd className="font-medium">
                  {formatPrice(auction.reservePrice)}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Statut</dt>
              <dd className="font-medium capitalize">
                {auction.status === "active"
                  ? "Active"
                  : auction.status === "ended"
                  ? "Terminée"
                  : auction.status === "scheduled"
                  ? "Programmée"
                  : auction.status}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Conditions de vente</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Paiement requis dans les 48h après la fin de l'enchère</li>
            <li>• Frais de commission BidHub: 5% du prix final</li>
            <li>• Livraison à organiser avec le vendeur</li>
            <li>• Retours possibles sous conditions (voir CGV)</li>
            <li>• Support client disponible 7j/7</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;
