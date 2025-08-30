import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AuctionCard from "../../components/auctions/AuctionCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    fetchAuctions();
  }, [currentPage, filter]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/auctions`, {
        params: {
          status: filter,
          page: currentPage,
          limit: 12,
        },
      });

      setAuctions(response.data.auctions);
      setTotalPages(response.data.totalPages);

      console.log("response", response);
    } catch (error) {
      console.error("Erreur chargement enchères:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return "Terminée";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enchères</h1>
          <p className="text-gray-600 mt-2">
            Découvrez les meilleures affaires du moment
          </p>
        </div>

        {/* Filtres */}
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input"
          >
            <option value="active">Enchères actives</option>
            <option value="ended">Enchères terminées</option>
            <option value="scheduled">À venir</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && <LoadingSpinner />}

      {/* Liste des enchères */}
      {!loading && (
        <>
          {auctions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                Aucune enchère trouvée
              </div>
              <Link to="/" className="btn-primary">
                Retour à l'accueil
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {auctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  timeRemaining={formatTimeRemaining(auction.endTime)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Précédent
              </button>

              <span className="flex items-center px-4 py-2 text-gray-700">
                Page {currentPage} sur {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuctionList;
