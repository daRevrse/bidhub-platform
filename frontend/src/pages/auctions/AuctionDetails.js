// frontend/src/pages/auctions/AuctionDetails.js - VERSION AMÉLIORÉE
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import RealTimeBidding from "../../components/auctions/RealTimeBidding";
import ContactSellerButton from "../../components/messaging/ContactSellerButton";
import ImageGallery from "../../components/common/ImageGallery";
import {
  HeartIcon,
  ShareIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  CameraIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";

const AuctionDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const bidInputRef = useRef(null);

  // États principaux
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // États pour les enchères
  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidHistory, setBidHistory] = useState([]);
  const [showAllBids, setShowAllBids] = useState(false);

  // États pour l'interface
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // details, bids, seller, terms
  const [sellerInfo, setSellerInfo] = useState(null);
  const [relatedAuctions, setRelatedAuctions] = useState([]);

  // États pour le partage
  const [showShareMenu, setShowShareMenu] = useState(false);

  // États pour les notifications
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });

  // Fonction pour afficher les notifications
  const showNotification = (message, type = "success") => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: "", type: "", show: false });
    }, 4000);
  };

  useEffect(() => {
    if (id) {
      fetchAuctionDetails();
      fetchRelatedAuctions();
    }
  }, [id]);

  useEffect(() => {
    if (user && auction) {
      checkIfFavorite();
    }
  }, [user, auction]);

  useEffect(() => {
    if (auction) {
      // Calculer le montant minimum pour enchérir
      const minBid = Math.ceil(auction.currentPrice * 1.01); // +1% minimum
      setBidAmount(minBid.toString());
    }
  }, [auction, currentPrice]);

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:5000/api/auctions/${id}`
      );
      const auctionData = response.data;

      setAuction(auctionData);
      setCurrentPrice(auctionData.currentPrice);
      setBidHistory(auctionData.bids || []);

      fetchSellerInfo(auctionData);

      // Marquer comme vu
      if (user) {
        markAsViewed();
      }
    } catch (error) {
      console.error("Erreur chargement enchère:", error);
      setError(
        error.response?.status === 404
          ? "Cette enchère n'existe pas ou a été supprimée."
          : "Erreur lors du chargement de l'enchère."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerInfo = async (auction) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/${auction?.product?.sellerId}/profile`
      );
      setSellerInfo(response.data);
    } catch (error) {
      console.error("Erreur chargement info vendeur:", error);
    }
  };

  const fetchRelatedAuctions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/auctions`, {
        params: {
          category: auction?.product?.category,
          limit: 4,
          exclude: id,
        },
      });
      setRelatedAuctions(response.data.auctions || []);
    } catch (error) {
      console.error("Erreur chargement enchères similaires:", error);
    }
  };

  const markAsViewed = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/auctions/${id}/view`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
    } catch (error) {
      // Erreur silencieuse pour les vues
      console.error("Erreur marquage vue:", error);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/favorites`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const favorites = response.data.map((fav) => fav.auctionId);
      setIsFavorite(favorites.includes(parseInt(id)));
    } catch (error) {
      console.error("Erreur vérification favoris:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`http://localhost:5000/api/users/favorites/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setIsFavorite(false);
        showNotification("Retiré des favoris");
      } else {
        await axios.post(
          `http://localhost:5000/api/users/favorites`,
          { auctionId: id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setIsFavorite(true);
        showNotification("Ajouté aux favoris");
      }
    } catch (error) {
      showNotification("Erreur lors de la gestion des favoris", "error");
    }
  };

  const handleBid = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= auction.currentPrice) {
      setBidError(
        `L'enchère doit être supérieure à ${formatPrice(auction.currentPrice)}`
      );
      return;
    }

    try {
      setBidding(true);
      setBidError("");

      const response = await axios.post(
        `http://localhost:5000/api/auctions/${id}/bid`,
        { amount: parseFloat(bidAmount) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success("Enchère placée avec succès !");

      // Actualiser les données
      fetchAuctionDetails();

      // Calculer la nouvelle enchère minimum
      const newMinBid = Math.ceil(parseFloat(bidAmount) * 1.01);
      setBidAmount(newMinBid.toString());
    } catch (error) {
      console.error("Erreur placement enchère:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors du placement de l'enchère";
      setBidError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setBidding(false);
    }
  };

  const handleBidUpdate = (newPrice, newBids) => {
    if (newPrice === "ended") {
      setAuction((prev) => (prev ? { ...prev, status: "ended" } : null));
      showNotification("Cette enchère vient de se terminer", "info");
    } else {
      setCurrentPrice(newPrice);
      if (newBids) {
        setBidHistory(newBids);
      }

      // Mettre à jour le montant minimum
      const minBid = Math.ceil(newPrice * 1.01);
      setBidAmount(minBid.toString());
    }
  };

  const shareAuction = async (platform) => {
    const url = window.location.href;
    const title = `${auction.product?.title} - Enchère sur BidHub`;
    const text = `Découvrez cette enchère : ${
      auction.product?.title
    } - Prix actuel: ${formatPrice(auction.currentPrice)}`;

    switch (platform) {
      case "copy":
        try {
          await navigator.clipboard.writeText(url);
          showNotification("Lien copié dans le presse-papiers");
        } catch (error) {
          showNotification("Erreur lors de la copie du lien", "error");
        }
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            text
          )}&url=${encodeURIComponent(url)}`
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
        );
        break;
    }
    setShowShareMenu(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return { text: "Terminée", ended: true, urgent: false };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const urgent = diff < 2 * 60 * 60 * 1000; // moins de 2h

    if (days > 0)
      return {
        text: `${days}j ${hours}h ${minutes}m`,
        ended: false,
        urgent: false,
      };
    if (hours > 0)
      return {
        text: `${hours}h ${minutes}m ${seconds}s`,
        ended: false,
        urgent,
      };
    return { text: `${minutes}m ${seconds}s`, ended: false, urgent: true };
  };

  const getConditionLabel = (condition) => {
    const conditions = {
      new: "Neuf",
      like_new: "Comme neuf",
      good: "Bon état",
      fair: "État correct",
      poor: "Mauvais état",
    };
    return conditions[condition] || condition;
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "new":
        return "bg-green-100 text-green-800";
      case "like_new":
        return "bg-blue-100 text-blue-800";
      case "good":
        return "bg-yellow-100 text-yellow-800";
      case "fair":
        return "bg-orange-100 text-orange-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isAuctionActive = () => {
    return (
      auction?.status === "active" && new Date() < new Date(auction.endTime)
    );
  };

  const canBid = () => {
    return (
      user && isAuctionActive() && auction?.product?.sellerId !== user?.userId
    );
  };

  const getBidderRank = (bidderId) => {
    const sortedBids = [...bidHistory].sort((a, b) => b.amount - a.amount);
    const userBids = sortedBids.filter((bid) => bid.bidderId === bidderId);
    if (userBids.length === 0) return null;

    const bestBidIndex = sortedBids.findIndex(
      (bid) => bid.bidderId === bidderId
    );
    return bestBidIndex + 1;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Enchère introuvable
          </h2>
          <p className="text-red-700 mb-6">{error}</p>
          <Link
            to="/auctions"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retour aux enchères
          </Link>
        </div>
      </div>
    );
  }

  if (!auction) return null;

  const timeRemaining = formatTimeRemaining(auction.endTime);
  const images = auction.product?.images || [];
  const visibleBids = showAllBids ? bidHistory : bidHistory.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-gray-700">
          Accueil
        </Link>
        <span>/</span>
        <Link to="/auctions" className="hover:text-gray-700">
          Enchères
        </Link>
        <span>/</span>
        <span className="text-gray-900">{auction.product?.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale - Images et détails */}
        <div className="lg:col-span-2 space-y-6">
          {/* Galerie d'images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {images.length > 0 ? (
              <ImageGallery
                images={images.map(
                  (img) => `http://localhost:5000/uploads/products/${img}`
                )}
                alt={auction.product?.title}
              />
            ) : (
              <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune image disponible</p>
                </div>
              </div>
            )}
          </div>

          {/* Onglets de navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "details", label: "Détails", icon: DocumentTextIcon },
                  {
                    id: "bids",
                    label: `Enchères (${bidHistory.length})`,
                    icon: BanknotesIcon,
                  },
                  { id: "seller", label: "Vendeur", icon: UserIcon },
                  { id: "terms", label: "Conditions", icon: ShieldCheckIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Contenu des onglets */}
              {activeTab === "details" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Description du produit
                    </h3>
                    <div
                      className={`text-gray-700 ${
                        !showFullDescription ? "line-clamp-4" : ""
                      }`}
                    >
                      {auction.product?.description ||
                        "Aucune description fournie."}
                    </div>
                    {auction.product?.description &&
                      auction.product.description.length > 200 && (
                        <button
                          onClick={() =>
                            setShowFullDescription(!showFullDescription)
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm mt-2 flex items-center"
                        >
                          {showFullDescription ? "Voir moins" : "Voir plus"}
                          {showFullDescription ? (
                            <ChevronUpIcon className="w-4 h-4 ml-1" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      )}
                  </div>

                  {/* Spécifications */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Catégorie
                      </h4>
                      <p className="text-gray-700 capitalize">
                        {auction.product?.category}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">État</h4>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
                          auction.product?.condition
                        )}`}
                      >
                        {getConditionLabel(auction.product?.condition)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Localisation
                      </h4>
                      <p className="text-gray-700">
                        {auction.product?.location || "Non spécifiée"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Créé le
                      </h4>
                      <p className="text-gray-700">
                        {new Date(auction.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "bids" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Historique des enchères
                    </h3>
                    {bidHistory.length > 5 && (
                      <button
                        onClick={() => setShowAllBids(!showAllBids)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {showAllBids
                          ? "Voir moins"
                          : `Voir tout (${bidHistory.length})`}
                      </button>
                    )}
                  </div>

                  {bidHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <BanknotesIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Aucune enchère pour le moment
                      </p>
                      <p className="text-gray-400 text-sm">
                        Soyez le premier à enchérir !
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visibleBids
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt) - new Date(a.createdAt)
                        )
                        .map((bid, index) => {
                          const isTopBid = index === 0;
                          const isUserBid =
                            user && bid.bidderId === user.userId;
                          const rank = getBidderRank(bid.bidderId);

                          return (
                            <div
                              key={bid.id}
                              className={`flex items-center justify-between p-4 rounded-lg border ${
                                isTopBid
                                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                                  : isUserBid
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isTopBid
                                      ? "bg-green-600 text-white"
                                      : "bg-gray-600 text-white"
                                  }`}
                                >
                                  {isTopBid ? (
                                    <TrophyIcon className="w-4 h-4" />
                                  ) : (
                                    <span className="text-xs font-bold">
                                      #{rank}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {bid.bidder?.firstName}{" "}
                                    {bid.bidder?.lastName?.[0]}.
                                    {isUserBid && (
                                      <span className="ml-2 text-blue-600 text-sm">
                                        (Vous)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(bid.createdAt).toLocaleString(
                                      "fr-FR"
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg text-gray-900">
                                  {formatPrice(bid.amount)}
                                </div>
                                {isTopBid && (
                                  <div className="text-green-600 text-xs font-medium">
                                    Enchère gagnante
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "seller" && sellerInfo && (
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {sellerInfo.firstName?.[0]}
                        {sellerInfo.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {sellerInfo.firstName} {sellerInfo.lastName}
                        </h3>
                        {sellerInfo.isVerified && (
                          <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <span>
                          Membre depuis{" "}
                          {new Date(sellerInfo.createdAt).getFullYear()}
                        </span>
                        <span>•</span>
                        <span>
                          {sellerInfo.productsCount || 0} produit(s) vendu(s)
                        </span>
                      </div>

                      {sellerInfo.reputation && (
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= sellerInfo.reputation.averageRating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({sellerInfo.reputation.totalReviews} avis)
                          </span>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <ContactSellerButton
                          auction={auction}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        />
                        <Link
                          to={`/user/${auction.product?.sellerId}`}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Voir le profil
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Statistiques du vendeur */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {sellerInfo.stats?.totalSales || 0}
                      </div>
                      <div className="text-sm text-gray-600">Ventes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {sellerInfo.stats?.activeAuctions || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        Enchères actives
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {sellerInfo.reputation?.averageRating?.toFixed(1) ||
                          "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">Note moyenne</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "terms" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Conditions de vente
                    </h3>
                    <div className="space-y-4 text-sm text-gray-700">
                      <div className="flex items-start space-x-3">
                        <CheckBadgeIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Paiement sécurisé</p>
                          <p className="text-gray-600">
                            Le paiement est requis dans les 48h après la fin de
                            l'enchère via notre système sécurisé.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <ShieldCheckIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Garantie BidHub</p>
                          <p className="text-gray-600">
                            Protection de l'acheteur incluse. Retour possible si
                            l'article ne correspond pas à la description.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <BanknotesIcon className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Frais de commission</p>
                          <p className="text-gray-600">
                            Commission BidHub de 5% du prix final, déjà incluse
                            dans le prix affiché.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <TrophyIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Livraison</p>
                          <p className="text-gray-600">
                            À organiser directement avec le vendeur. Options de
                            livraison et frais à convenir.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h4 className="font-medium mb-3">Règles d'enchère</h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>• Les enchères sont fermes et définitives</li>
                      <li>
                        • Chaque enchère doit être supérieure d'au moins 1% à la
                        précédente
                      </li>
                      <li>
                        • En cas d'enchère dans les 5 dernières minutes,
                        l'enchère est prolongée de 5 minutes
                      </li>
                      <li>
                        • Le gagnant est automatiquement notifié par email
                      </li>
                      <li>• Support client disponible 7j/7 pour tout litige</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Composant temps réel */}
          {auction && (
            <RealTimeBidding
              auctionId={auction.id}
              onBidUpdate={handleBidUpdate}
            />
          )}
        </div>

        {/* Colonne droite - Panneau d'enchère */}
        <div className="space-y-6">
          {/* Panneau principal d'enchère */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 top-6">
            <div className="p-6">
              {/* En-tête avec titre et actions */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 line-clamp-2">
                    {auction.product?.title}
                  </h1>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={toggleFavorite}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {isFavorite ? (
                        <HeartSolidIcon className="w-6 h-6 text-red-500" />
                      ) : (
                        <HeartIcon className="w-6 h-6" />
                      )}
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <ShareIcon className="w-6 h-6" />
                      </button>
                      {showShareMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <button
                            onClick={() => shareAuction("copy")}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Copier le lien
                          </button>
                          <button
                            onClick={() => shareAuction("facebook")}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Partager sur Facebook
                          </button>
                          <button
                            onClick={() => shareAuction("twitter")}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Partager sur Twitter
                          </button>
                          <button
                            onClick={() => shareAuction("whatsapp")}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Partager sur WhatsApp
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statut de l'enchère */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      auction.status === "active"
                        ? "bg-green-100 text-green-800"
                        : auction.status === "ended"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {auction.status === "active" ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        En cours
                      </>
                    ) : auction.status === "ended" ? (
                      <>
                        <TrophyIcon className="w-4 h-4 mr-2" />
                        Terminée
                      </>
                    ) : (
                      <>
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Programmée
                      </>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <EyeIcon className="w-4 h-4 mr-1" />
                    {auction.views || 0} vues
                  </div>
                </div>
              </div>

              {/* Prix et temps */}
              <div className="mb-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatPrice(currentPrice)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Prix de départ: {formatPrice(auction.startingPrice)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {bidHistory.length} enchère
                    {bidHistory.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Temps restant */}
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold mb-1 ${
                      timeRemaining.ended
                        ? "text-gray-600"
                        : timeRemaining.urgent
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {timeRemaining.text}
                  </div>
                  <div className="text-sm text-gray-600">
                    {timeRemaining.ended
                      ? "Enchère terminée"
                      : timeRemaining.urgent
                      ? "Temps restant"
                      : "Temps restant"}
                  </div>
                  {!timeRemaining.ended && (
                    <div className="text-xs text-gray-500 mt-1">
                      Fin: {new Date(auction.endTime).toLocaleString("fr-FR")}
                    </div>
                  )}
                </div>
              </div>

              {/* Formulaire d'enchère */}
              {canBid() ? (
                <form onSubmit={handleBid} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre enchère (FCFA)
                    </label>
                    <input
                      ref={bidInputRef}
                      type="number"
                      value={bidAmount}
                      onChange={(e) => {
                        setBidAmount(e.target.value);
                        setBidError("");
                      }}
                      min={Math.ceil(currentPrice * 1.01)}
                      step="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold text-center"
                      placeholder={`Min. ${formatPrice(
                        Math.ceil(currentPrice * 1.01)
                      )}`}
                    />
                    {bidError && (
                      <p className="text-red-600 text-sm mt-2">{bidError}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      Enchère minimum:{" "}
                      {formatPrice(Math.ceil(currentPrice * 1.01))}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      bidding ||
                      !bidAmount ||
                      parseFloat(bidAmount) <= currentPrice
                    }
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bidding ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Placement en cours...
                      </div>
                    ) : (
                      `Enchérir ${
                        bidAmount ? formatPrice(parseFloat(bidAmount)) : ""
                      }`
                    )}
                  </button>
                </form>
              ) : !user ? (
                <div className="space-y-4">
                  <div className="text-center text-gray-600 mb-4">
                    <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Connectez-vous pour enchérir</p>
                  </div>
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-colors"
                    >
                      Se connecter
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors"
                    >
                      S'inscrire
                    </Link>
                  </div>
                </div>
              ) : auction?.product?.sellerId === user?.userId ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <TagIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">
                      Ceci est votre enchère
                    </span>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    Vous ne pouvez pas enchérir sur vos propres produits
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClockIcon className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-gray-800 font-medium">
                      Enchère terminée
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mt-1">
                    Cette enchère s'est terminée le{" "}
                    {new Date(auction.endTime).toLocaleString("fr-FR")}
                  </p>
                </div>
              )}

              {/* Enchères rapides */}
              {canBid() && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">
                    Enchères rapides :
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      Math.ceil(currentPrice * 1.05),
                      Math.ceil(currentPrice * 1.1),
                      Math.ceil(currentPrice * 1.2),
                    ].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setBidAmount(amount.toString())}
                        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {formatPrice(amount)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations sur le vendeur */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Vendeur</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {auction.product?.seller?.firstName?.[0]}
                  {auction.product?.seller?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {auction.product?.seller?.firstName}{" "}
                    {auction.product?.seller?.lastName}
                  </span>
                  {auction.product?.seller?.isVerified && (
                    <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">Membre vérifié</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <ContactSellerButton
                auction={auction}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors text-center"
              />
              <Link
                to={`/user/${auction.product?.sellerId}`}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors text-center"
              >
                Profil
              </Link>
            </div>
          </div>

          {/* Enchères similaires */}
          {relatedAuctions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Enchères similaires
              </h3>
              <div className="space-y-4">
                {relatedAuctions.slice(0, 3).map((relatedAuction) => (
                  <Link
                    key={relatedAuction.id}
                    to={`/auction/${relatedAuction.id}`}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {relatedAuction.product?.images?.[0] ? (
                        <img
                          src={`http://localhost:5000/uploads/products/${relatedAuction.product.images[0]}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <TagIcon className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {relatedAuction.product?.title}
                      </p>
                      <p className="text-sm text-green-600 font-semibold">
                        {formatPrice(relatedAuction.currentPrice)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimeRemaining(relatedAuction.endTime).text}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                to={`/auctions?category=${auction.product?.category}`}
                className="block mt-4 text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Voir toutes les enchères similaires
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" && (
              <CheckBadgeIcon className="w-5 h-5 mr-2" />
            )}
            {notification.type === "error" && (
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionDetails;
