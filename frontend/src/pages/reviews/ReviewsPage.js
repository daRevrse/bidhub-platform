import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import ReviewForm from "../../components/reputation/ReviewForm";
import UserReputation from "../../components/reputation/UserReputation";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const ReviewsPage = () => {
  const { user } = useAuth();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [showReviewForm, setShowReviewForm] = useState(null);
  const [showResponseForm, setShowResponseForm] = useState(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPendingReviews(),
        fetchMyReviews(),
        fetchReceivedReviews(),
      ]);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      // Récupérer les enchères terminées où l'utilisateur peut donner un avis
      const response = await axios.get(
        "http://localhost:5000/api/auctions?status=ended&limit=50"
      );
      const auctions = response.data.auctions;

      const pending = [];

      for (const auction of auctions) {
        const isWinner = auction.winnerId === user.id;
        const isSeller = auction.product.sellerId === user.id;

        if (isWinner || isSeller) {
          // Vérifier l'éligibilité
          try {
            const eligibilityResponse = await axios.get(
              `http://localhost:5000/api/reviews/auction/${auction.id}/eligibility`
            );
            const eligibility = eligibilityResponse.data;

            if (eligibility.canReviewSeller) {
              pending.push({
                auction,
                type: "buyer_to_seller",
                revieweeId: auction.product.seller.id,
                revieweeName: `${auction.product.seller.firstName} ${auction.product.seller.lastName}`,
                role: "vendeur",
              });
            }

            if (eligibility.canReviewBuyer) {
              // Récupérer les infos du gagnant
              const winner = await getUserInfo(auction.winnerId);
              pending.push({
                auction,
                type: "seller_to_buyer",
                revieweeId: auction.winnerId,
                revieweeName: `${winner.firstName} ${winner.lastName}`,
                role: "acheteur",
              });
            }
          } catch (error) {
            console.error("Erreur vérification éligibilité:", error);
          }
        }
      }

      setPendingReviews(pending);
    } catch (error) {
      console.error("Erreur récupération avis en attente:", error);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviews/user/${user.id}?type=given`
      );
      setMyReviews(response.data.reviews);
    } catch (error) {
      console.error("Erreur récupération mes avis:", error);
    }
  };

  const fetchReceivedReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviews/user/${user.id}?type=received`
      );
      setReceivedReviews(response.data.reviews);
    } catch (error) {
      console.error("Erreur récupération avis reçus:", error);
    }
  };

  const getUserInfo = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/${userId}`
      );
      return response.data;
    } catch (error) {
      return { firstName: "Utilisateur", lastName: "Inconnu" };
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(null);
    fetchData();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const RatingDisplay = ({ rating, size = "text-sm" }) => (
    <div className={`flex items-center ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-yellow-400" : "text-gray-300"}
        >
          ⭐
        </span>
      ))}
      <span className="ml-2 text-gray-600">{rating}/5</span>
    </div>
  );

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
        <p className="text-gray-600">Connectez-vous pour accéder à vos avis.</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Mes avis et réputation
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez vos évaluations et consultez votre réputation sur BidHub
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          {/* Navigation par onglets */}
          <div className="border-b">
            <nav className="flex space-x-8">
              {[
                {
                  key: "pending",
                  label: "À évaluer",
                  count: pendingReviews.length,
                },
                { key: "given", label: "Mes avis", count: myReviews.length },
                {
                  key: "received",
                  label: "Avis reçus",
                  count: receivedReviews.length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="min-h-[400px]">
            {activeTab === "pending" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Transactions à évaluer
                </h2>
                {pendingReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune évaluation en attente
                    </h3>
                    <p className="text-gray-500">
                      Vos futures transactions apparaîtront ici pour évaluation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReviews.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white border rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start space-x-4">
                              {item.auction.product.images &&
                                item.auction.product.images.length > 0 && (
                                  <img
                                    src={`http://localhost:5000/uploads/products/${item.auction.product.images[0]}`}
                                    alt={item.auction.product.title}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                )}
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                  {item.auction.product.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Prix final:{" "}
                                  {formatPrice(item.auction.currentPrice)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Terminée le{" "}
                                  {new Date(
                                    item.auction.endTime
                                  ).toLocaleDateString("fr-FR")}
                                </p>
                                <div className="mt-2 flex items-center text-sm">
                                  <span className="text-gray-700">
                                    Évaluer le {item.role}:{" "}
                                  </span>
                                  <span className="font-medium ml-1">
                                    {item.revieweeName}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowReviewForm(item)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Donner un avis
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "given" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Mes avis donnés</h2>
                {myReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">💭</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun avis donné
                    </h3>
                    <p className="text-gray-500">
                      Vos évaluations d'autres utilisateurs apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myReviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white border rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-gray-600">
                                {review.reviewee.firstName[0]}
                                {review.reviewee.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {review.reviewee.firstName}{" "}
                                {review.reviewee.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {review.type === "buyer_to_seller"
                                  ? "Vendeur"
                                  : "Acheteur"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <RatingDisplay rating={review.rating} />
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(review.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {review.auction.product.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Prix: {formatPrice(review.auction.currentPrice)}
                          </p>
                        </div>

                        {review.comment && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <p className="text-sm text-gray-700">
                              {review.comment}
                            </p>
                          </div>
                        )}

                        {review.response && (
                          <div className="border-l-4 border-primary-500 pl-4">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Réponse de {review.reviewee.firstName}:
                            </p>
                            <p className="text-sm text-gray-700">
                              {review.response}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "received" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Avis reçus</h2>
                {receivedReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">⭐</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun avis reçu
                    </h3>
                    <p className="text-gray-500">
                      Les évaluations des autres utilisateurs apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedReviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white border rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-gray-600">
                                {review.reviewer.firstName[0]}
                                {review.reviewer.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {review.reviewer.firstName}{" "}
                                {review.reviewer.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Vous a évalué en tant que{" "}
                                {review.type === "buyer_to_seller"
                                  ? "vendeur"
                                  : "acheteur"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <RatingDisplay rating={review.rating} />
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(review.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {review.auction.product.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Prix: {formatPrice(review.auction.currentPrice)}
                          </p>
                        </div>

                        {review.comment && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-4">
                            <p className="text-sm text-gray-700">
                              {review.comment}
                            </p>
                          </div>
                        )}

                        {review.response ? (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Votre réponse:
                            </p>
                            <p className="text-sm text-gray-700">
                              {review.response}
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowResponseForm(review)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Répondre à cet avis
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale - Réputation */}
        <div className="lg:col-span-1">
          <UserReputation userId={user.id} showDetails={true} />
        </div>
      </div>

      {/* Modal de formulaire d'avis */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ReviewForm
              auction={showReviewForm.auction}
              revieweeId={showReviewForm.revieweeId}
              type={showReviewForm.type}
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowReviewForm(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
