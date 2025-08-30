import React from "react";
import { Link } from "react-router-dom";

const AuctionCard = ({ auction, timeRemaining }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "ending":
        return "bg-yellow-100 text-yellow-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <Link to={`/auction/${auction.id}`}>
        {/* Image du produit */}
        <div className="aspect-w-16 aspect-h-12 mb-4">
          {auction.product.images && auction.product.images.length > 0 ? (
            <img
              src={`http://localhost:5000/uploads/products/${auction.product.images[0]}`}
              alt={auction.product.title}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = "https://placehold.net/1.png";
              }}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Pas d'image</span>
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {auction.product.title}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                auction.status
              )}`}
            >
              {auction.status === "active"
                ? "En cours"
                : auction.status === "ended"
                ? "Terminée"
                : "À venir"}
            </span>
          </div>

          <p className="text-gray-600 text-sm line-clamp-2">
            {auction.product.description}
          </p>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Prix actuel</p>
              <p className="text-lg font-bold text-primary-600">
                {formatPrice(auction.currentPrice)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Temps restant</p>
              <p className="text-sm font-semibold text-auction-live">
                {timeRemaining}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">
              Vendu par{" "}
              <span className="font-medium">
                {auction.product.seller.firstName}{" "}
                {auction.product.seller.lastName}
              </span>
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AuctionCard;
