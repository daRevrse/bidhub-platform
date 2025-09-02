import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  FlagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AuctionManagement = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchAuctions();
    fetchStats();
  }, [currentPage, searchTerm, filterStatus, filterCategory]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: filterStatus,
        category: filterCategory,
      });

      const response = await axios.get(
        `http://localhost:5000/api/admin/auctions?${params}`
      );

      setAuctions(response.data.auctions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Erreur chargement enchères:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const fetchAuctionDetails = async (auctionId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/auctions/${auctionId}/details`
      );
      setSelectedAuction(response.data);
      setShowAuctionModal(true);
    } catch (error) {
      console.error("Erreur chargement détails enchère:", error);
    }
  };

  const updateAuctionStatus = async (auctionId, status) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir ${status} cette enchère ?`)) {
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/admin/auctions/${auctionId}/status`,
        { status }
      );
      fetchAuctions();
      alert("Statut enchère mis à jour");
    } catch (error) {
      console.error("Erreur mise à jour enchère:", error);
      alert("Erreur lors de la mise à jour");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      ended: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      scheduled: "bg-blue-100 text-blue-800",
    };
    return styles[status] || styles.scheduled;
  };

  const getStatusText = (status) => {
    const texts = {
      active: "Active",
      ended: "Terminée",
      cancelled: "Annulée",
      scheduled: "Programmée",
    };
    return texts[status] || "Inconnue";
  };

  const getRemainingTime = (endTime) => {
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

  if (loading && currentPage === 1) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestion des enchères
            </h1>
            <p className="text-gray-600">
              Surveillez et gérez toutes les enchères de la plateforme
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlayIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Enchères actives
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.auctions?.active || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Programmées
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.auctions?.scheduled || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StopIcon className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Terminées
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.auctions?.ended || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Volume total
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatPrice(stats.totalVolume || 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="md:col-span-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher enchères..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtre statut */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="scheduled">Programmée</option>
            <option value="ended">Terminée</option>
            <option value="cancelled">Annulée</option>
          </select>

          {/* Filtre catégorie */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes catégories</option>
            <option value="electronics">Électronique</option>
            <option value="fashion">Mode</option>
            <option value="home">Maison</option>
            <option value="sports">Sports</option>
            <option value="books">Livres</option>
            <option value="art">Art</option>
            <option value="other">Autre</option>
          </select>
        </div>
      </div>

      {/* Table des enchères */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix actuel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temps restant
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auctions.map((auction) => (
                <tr key={auction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {auction.product?.images?.[0] ? (
                        <img
                          src={`http://localhost:5000/uploads/products/${auction.product?.images?.[0]}`}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {auction.product?.title || "Produit supprimé"}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {auction.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {auction.product?.seller?.firstName}{" "}
                          {auction.product?.seller?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {auction.product?.seller?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(auction.currentPrice)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {auction.bids?.length || 0} offre(s)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        auction.status
                      )}`}
                    >
                      {getStatusText(auction.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {getRemainingTime(auction.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => fetchAuctionDetails(auction.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir détails"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>

                      {auction.status === "active" && (
                        <button
                          onClick={() =>
                            updateAuctionStatus(auction.id, "cancelled")
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Annuler"
                        >
                          <StopIcon className="w-4 h-4" />
                        </button>
                      )}

                      {auction.status === "scheduled" && (
                        <button
                          onClick={() =>
                            updateAuctionStatus(auction.id, "active")
                          }
                          className="text-green-600 hover:text-green-900"
                          title="Démarrer"
                        >
                          <PlayIcon className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Signaler"
                      >
                        <FlagIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> sur{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modal détails enchère */}
      {showAuctionModal && selectedAuction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Détails de l'enchère #{selectedAuction.id}
              </h3>
              <button
                onClick={() => setShowAuctionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations produit */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Produit
                </h4>
                <div className="space-y-4">
                  {selectedAuction.product?.images?.[0] && (
                    <img
                      src={`http://localhost:5000/uploads/products/${selectedAuction.product?.images?.[0]}`}
                      alt=""
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {selectedAuction.product?.title}
                    </h5>
                    <p className="text-gray-600 mt-2">
                      {selectedAuction.product?.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Catégorie:</span>
                      <p className="font-medium">
                        {selectedAuction.product?.category}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">État:</span>
                      <p className="font-medium">
                        {selectedAuction.product?.condition}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations enchère */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Enchère
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(selectedAuction.currentPrice)}
                      </div>
                      <div className="text-sm text-gray-600">Prix actuel</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedAuction.bids?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Offres</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Prix de départ:</span>
                      <span className="font-medium">
                        {formatPrice(selectedAuction.startPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Début:</span>
                      <span className="font-medium">
                        {formatDate(selectedAuction.startTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fin:</span>
                      <span className="font-medium">
                        {formatDate(selectedAuction.endTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Statut:</span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          selectedAuction.status
                        )}`}
                      >
                        {getStatusText(selectedAuction.status)}
                      </span>
                    </div>
                  </div>

                  {/* Vendeur */}
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Vendeur</h5>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {selectedAuction.product?.seller?.firstName?.[0]}
                          {selectedAuction.product?.seller?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {selectedAuction.product?.seller?.firstName}{" "}
                          {selectedAuction.product?.seller?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedAuction.product?.seller?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Historique des offres */}
            {selectedAuction.bids && selectedAuction.bids.length > 0 && (
              <div className="mt-6 border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Historique des offres
                </h4>
                <div className="max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {selectedAuction.bids
                      .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      )
                      .map((bid, index) => (
                        <div
                          key={bid.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            index === 0
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-xs">
                                {bid.bidder?.firstName?.[0]}
                                {bid.bidder?.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {bid.bidder?.firstName} {bid.bidder?.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(bid.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-bold ${
                                index === 0 ? "text-green-600" : "text-gray-900"
                              }`}
                            >
                              {formatPrice(bid.amount)}
                            </div>
                            {index === 0 && (
                              <div className="text-xs text-green-600">
                                Offre gagnante
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
              <button
                onClick={() => setShowAuctionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
              {selectedAuction.status === "active" && (
                <button
                  onClick={() => {
                    updateAuctionStatus(selectedAuction.id, "cancelled");
                    setShowAuctionModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Annuler enchère
                </button>
              )}
              {selectedAuction.status === "scheduled" && (
                <button
                  onClick={() => {
                    updateAuctionStatus(selectedAuction.id, "active");
                    setShowAuctionModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Démarrer enchère
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionManagement;
