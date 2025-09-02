import React, { useState, useEffect } from "react";
import axios from "axios";

const UserReputation = ({ userId, showDetails = true }) => {
  const [reputation, setReputation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchReputation();
    if (showDetails) {
      fetchReviews();
    }
  }, [userId]);

  const fetchReputation = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviews/reputation/${userId}`
      );
      setReputation(response.data);
    } catch (error) {
      console.error("Erreur chargement réputation:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviews/user/${userId}?type=received&limit=5`
      );
      setReviews(response.data.reviews);
    } catch (error) {
      console.error("Erreur chargement avis:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrustLevelDisplay = (level) => {
    const levels = {
      new: { label: "Nouveau", color: "bg-gray-100 text-gray-800", icon: "🆕" },
      bronze: {
        label: "Bronze",
        color: "bg-amber-100 text-amber-800",
        icon: "🥉",
      },
      silver: {
        label: "Argent",
        color: "bg-gray-200 text-gray-800",
        icon: "🥈",
      },
      gold: { label: "Or", color: "bg-yellow-100 text-yellow-800", icon: "🥇" },
      platinum: {
        label: "Platine",
        color: "bg-purple-100 text-purple-800",
        icon: "💎",
      },
    };
    return levels[level] || levels.new;
  };

  const RatingStars = ({ rating, size = "text-sm" }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className={`flex items-center ${size}`}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={
              i < fullStars
                ? "text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "text-yellow-400"
                : "text-gray-300"
            }
          >
            {i < fullStars ? "⭐" : i === fullStars && hasHalfStar ? "⭐" : "☆"}
          </span>
        ))}
        <span className="ml-2 text-gray-600 font-medium">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!reputation) return null;

  const trustDisplay = getTrustLevelDisplay(reputation.trustLevel);

  // Version compacte
  if (!showDetails) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <RatingStars rating={reputation.overallRating} />
          <span className="text-sm text-gray-500">
            ({reputation.totalReviews} avis)
          </span>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${trustDisplay.color}`}
        >
          {trustDisplay.icon} {trustDisplay.label}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Réputation</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${trustDisplay.color}`}
        >
          {trustDisplay.icon} {trustDisplay.label}
        </span>
      </div>

      {/* Onglets */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {["overview", "reviews", "badges"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "overview"
                ? "Vue d'ensemble"
                : tab === "reviews"
                ? "Avis récents"
                : "Badges"}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Statistiques principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {reputation.overallRating.toFixed(1)}
              </div>
              <RatingStars rating={reputation.overallRating} size="text-lg" />
              <p className="text-sm text-gray-500 mt-1">
                {reputation.totalReviews} avis au total
              </p>
            </div>
            <div className="space-y-2">
              {reputation.sellerReviews > 0 && (
                <div className="flex justify-between text-sm">
                  <span>En tant que vendeur:</span>
                  <div className="flex items-center">
                    <RatingStars
                      rating={reputation.sellerRating}
                      size="text-xs"
                    />
                    <span className="ml-1 text-gray-500">
                      ({reputation.sellerReviews})
                    </span>
                  </div>
                </div>
              )}
              {reputation.buyerReviews > 0 && (
                <div className="flex justify-between text-sm">
                  <span>En tant qu'acheteur:</span>
                  <div className="flex items-center">
                    <RatingStars
                      rating={reputation.buyerRating}
                      size="text-xs"
                    />
                    <span className="ml-1 text-gray-500">
                      ({reputation.buyerReviews})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Distribution des notes */}
          {reputation.totalReviews > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Distribution des notes
              </h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reputation.ratingDistribution[star] || 0;
                  const percentage =
                    reputation.totalReviews > 0
                      ? (count / reputation.totalReviews) * 100
                      : 0;

                  return (
                    <div key={star} className="flex items-center text-sm">
                      <span className="w-3">{star}</span>
                      <span className="w-3 ml-1">⭐</span>
                      <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right text-gray-500">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun avis pour le moment
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {review.reviewer.firstName[0]}
                        {review.reviewer.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {review.reviewer.firstName}{" "}
                        {review.reviewer.lastName[0]}.
                      </p>
                      <div className="flex items-center space-x-2">
                        <RatingStars rating={review.rating} size="text-xs" />
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 ml-10">
                    {review.comment}
                  </p>
                )}
                {review.response && (
                  <div className="ml-10 mt-2 bg-gray-50 p-2 rounded">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Réponse:
                    </p>
                    <p className="text-sm text-gray-700">{review.response}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "badges" && (
        <div>
          {reputation.badges && reputation.badges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {reputation.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="text-center p-4 border rounded-lg"
                >
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <h4 className="text-sm font-medium">{badge.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Obtenu le{" "}
                    {new Date(badge.earnedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-gray-500">Aucun badge obtenu pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">
                Continuez à utiliser BidHub pour débloquer des badges !
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserReputation;
