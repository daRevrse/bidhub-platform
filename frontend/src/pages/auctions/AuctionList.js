// frontend/src/pages/auctions/AuctionList.js - VERSION AMÉLIORÉE
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";

const AuctionList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // États principaux
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid ou list

  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAuctions, setTotalAuctions] = useState(0);

  // États de filtrage et recherche
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "active",
    category: searchParams.get("category") || "",
    priceMin: searchParams.get("priceMin") || "",
    priceMax: searchParams.get("priceMax") || "",
    condition: searchParams.get("condition") || "",
    search: searchParams.get("search") || "",
    sortBy: searchParams.get("sortBy") || "endTime",
    sortOrder: searchParams.get("sortOrder") || "asc",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Options de filtrage
  const categoryOptions = [
    { value: "", label: "Toutes catégories" },
    { value: "electronics", label: "Électronique" },
    { value: "fashion", label: "Mode & Accessoires" },
    { value: "home", label: "Maison & Jardin" },
    { value: "sports", label: "Sports & Loisirs" },
    { value: "books", label: "Livres & Médias" },
    { value: "art", label: "Art & Collection" },
    { value: "vehicles", label: "Véhicules" },
    { value: "other", label: "Autre" },
  ];

  const conditionOptions = [
    { value: "", label: "Tous états" },
    { value: "new", label: "Neuf" },
    { value: "like_new", label: "Comme neuf" },
    { value: "good", label: "Bon état" },
    { value: "fair", label: "État correct" },
    { value: "poor", label: "Mauvais état" },
  ];

  const sortOptions = [
    { value: "endTime_asc", label: "Fin bientôt" },
    { value: "endTime_desc", label: "Fin plus tard" },
    { value: "currentPrice_asc", label: "Prix croissant" },
    { value: "currentPrice_desc", label: "Prix décroissant" },
    { value: "startingPrice_asc", label: "Prix initial croissant" },
    { value: "startingPrice_desc", label: "Prix initial décroissant" },
    { value: "createdAt_desc", label: "Plus récentes" },
    { value: "createdAt_asc", label: "Plus anciennes" },
    { value: "bids_desc", label: "Plus d'enchères" },
  ];

  // Effet pour charger les enchères
  useEffect(() => {
    fetchAuctions();
  }, [currentPage, filters]);

  // Effet pour mettre à jour les paramètres URL
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (currentPage > 1) params.set("page", currentPage);
    setSearchParams(params);
  }, [filters, currentPage, setSearchParams]);

  // Charger les favoris de l'utilisateur
  useEffect(() => {
    if (user) {
      fetchUserFavorites();
    }
  }, [user]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        status: filters.status,
        page: currentPage,
        limit: 12,
        ...(filters.category && { category: filters.category }),
        ...(filters.priceMin && { priceMin: filters.priceMin }),
        ...(filters.priceMax && { priceMax: filters.priceMax }),
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.search && { search: filters.search }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const response = await axios.get(`http://localhost:5000/api/auctions`, {
        params,
      });

      setAuctions(response.data.auctions);
      setTotalPages(response.data.totalPages);
      setTotalAuctions(response.data.totalAuctions);
    } catch (error) {
      console.error("Erreur chargement enchères:", error);
      setError("Erreur lors du chargement des enchères");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/favorites`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setFavorites(response.data.map((fav) => fav.auctionId));
    } catch (error) {
      console.error("Erreur chargement favoris:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (sortValue) => {
    const [sortBy, sortOrder] = sortValue.split("_");
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      status: "active",
      category: "",
      priceMin: "",
      priceMax: "",
      condition: "",
      search: "",
      sortBy: "endTime",
      sortOrder: "asc",
    });
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAuctions();
  };

  const toggleFavorite = async (auctionId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const isFavorite = favorites.includes(auctionId);

      if (isFavorite) {
        await axios.delete(
          `http://localhost:5000/api/users/favorites/${auctionId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setFavorites((prev) => prev.filter((id) => id !== auctionId));
      } else {
        await axios.post(
          `http://localhost:5000/api/users/favorites`,
          { auctionId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setFavorites((prev) => [...prev, auctionId]);
      }
    } catch (error) {
      console.error("Erreur gestion favoris:", error);
    }
  };

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return { text: "Terminée", urgent: false, ended: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const urgent = diff < 2 * 60 * 60 * 1000; // moins de 2h

    if (days > 0)
      return { text: `${days}j ${hours}h`, urgent: false, ended: false };
    if (hours > 0)
      return { text: `${hours}h ${minutes}m`, urgent, ended: false };
    return { text: `${minutes}m`, urgent: true, ended: false };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <FireIcon className="w-4 h-4" />;
      case "ended":
        return <TrophyIcon className="w-4 h-4" />;
      case "scheduled":
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <TagIcon className="w-4 h-4" />;
    }
  };

  // Composant pour une carte d'enchère en mode grille
  const AuctionGridCard = ({ auction }) => {
    const timeRemaining = formatTimeRemaining(auction.endTime);
    const isFavorite = favorites.includes(auction.id);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
        {/* Image */}
        <div className="relative h-48 bg-gray-100">
          {auction.product?.images?.[0] ? (
            <img
              src={`http://localhost:5000/uploads/products/${auction.product.images[0]}`}
              alt={auction.product?.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <TagIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Badge statut */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                auction.status
              )}`}
            >
              {getStatusIcon(auction.status)}
              <span className="ml-1 capitalize">
                {auction.status === "active"
                  ? "En cours"
                  : auction.status === "ended"
                  ? "Terminée"
                  : "Programmée"}
              </span>
            </span>
          </div>

          {/* Bouton favoris */}
          {user && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(auction.id);
              }}
              className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <HeartIcon
                className={`w-5 h-5 ${
                  isFavorite ? "text-red-500" : "text-gray-400"
                }`}
              />
            </button>
          )}

          {/* Temps restant */}
          <div className="absolute bottom-3 right-3">
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                timeRemaining.ended
                  ? "bg-gray-800 text-white"
                  : timeRemaining.urgent
                  ? "bg-red-100 text-red-800 animate-pulse"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              <ClockIcon className="w-3 h-3 mr-1" />
              {timeRemaining.text}
            </span>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {auction.product?.title || "Produit supprimé"}
          </h3>

          {/* Prix */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(auction.currentPrice)}
              </p>
              <p className="text-sm text-gray-500">
                Départ: {formatPrice(auction.startingPrice)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {auction.bids?.length || 0} enchère(s)
              </p>
            </div>
          </div>

          {/* Vendeur */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">
                  {auction.product?.seller?.firstName?.[0]}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {auction.product?.seller?.firstName}{" "}
                {auction.product?.seller?.lastName}
              </span>
            </div>
          </div>

          {/* Bouton voir détails */}
          <Link
            to={`/auction/${auction.id}`}
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Voir l'enchère
          </Link>
        </div>
      </div>
    );
  };

  // Composant pour une ligne d'enchère en mode liste
  const AuctionListRow = ({ auction }) => {
    const timeRemaining = formatTimeRemaining(auction.endTime);
    const isFavorite = favorites.includes(auction.id);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-4">
        <div className="flex items-center space-x-4">
          {/* Image */}
          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
            {auction.product?.images?.[0] ? (
              <img
                src={`http://localhost:5000/uploads/products/${auction.product.images[0]}`}
                alt={auction.product?.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <TagIcon className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {auction.product?.title || "Produit supprimé"}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Par {auction.product?.seller?.firstName}{" "}
                  {auction.product?.seller?.lastName}
                </p>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                      auction.status
                    )}`}
                  >
                    {getStatusIcon(auction.status)}
                    <span className="ml-1 capitalize">
                      {auction.status === "active"
                        ? "En cours"
                        : auction.status === "ended"
                        ? "Terminée"
                        : "Programmée"}
                    </span>
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      timeRemaining.ended
                        ? "bg-gray-800 text-white"
                        : timeRemaining.urgent
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {timeRemaining.text}
                  </span>
                </div>
              </div>

              {/* Prix et actions */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(auction.currentPrice)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {auction.bids?.length || 0} enchère(s)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {user && (
                    <button
                      onClick={() => toggleFavorite(auction.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <HeartIcon
                        className={`w-5 h-5 ${
                          isFavorite ? "text-red-500" : ""
                        }`}
                      />
                    </button>
                  )}
                  <Link
                    to={`/auction/${auction.id}`}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header avec statistiques */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">Enchères</h1>
            <p className="text-gray-600 mt-1">
              {totalAuctions} enchère{totalAuctions !== 1 ? "s" : ""} trouvée
              {totalAuctions !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center space-x-3">
            {/* Toggle vue */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filtres
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="mt-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une enchère, un produit, un vendeur..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </form>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Filtres avancés
            </h3>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Réinitialiser
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Enchères actives</option>
                <option value="ended">Enchères terminées</option>
                <option value="scheduled">À venir</option>
                <option value="">Toutes</option>
              </select>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* État */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                État du produit
              </label>
              <select
                value={filters.condition}
                onChange={(e) =>
                  handleFilterChange("condition", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {conditionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <select
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtres de prix */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix minimum (FCFA)
              </label>
              <input
                type="number"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix maximum (FCFA)
              </label>
              <input
                type="number"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                placeholder="1000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {loading && <LoadingSpinner />}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {auctions.length === 0 ? (
            <div className="text-center py-12">
              <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune enchère trouvée
              </h3>
              <p className="text-gray-600 mb-6">
                Essayez de modifier vos critères de recherche ou parcourez
                toutes les enchères.
              </p>
              <button
                onClick={resetFilters}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Voir toutes les enchères
              </button>
            </div>
          ) : (
            <>
              {/* Liste des enchères */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {auctions.map((auction) => (
                    <AuctionGridCard key={auction.id} auction={auction} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  {auctions.map((auction) => (
                    <AuctionListRow key={auction.id} auction={auction} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} sur {totalPages} - {totalAuctions}{" "}
                    enchère{totalAuctions !== 1 ? "s" : ""} au total
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Bouton précédent */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>

                    {/* Numéros de page */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Bouton suivant */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Suggestions d'amélioration de la recherche */}
      {!loading && auctions.length < 3 && filters.search && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-blue-900 mb-2">
            Suggestions pour améliorer votre recherche :
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Vérifiez l'orthographe de vos mots-clés</li>
            <li>• Utilisez des termes plus généraux</li>
            <li>• Essayez des synonymes</li>
            <li>• Supprimez certains filtres pour élargir la recherche</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AuctionList;
