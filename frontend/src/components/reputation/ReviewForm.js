// frontend/src/components/reputation/ReviewForm.js
import React, { useState } from "react";
import axios from "axios";

const ReviewForm = ({ auction, revieweeId, type, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
    criteria: {
      communication: 5,
      speed: 5,
      productCondition: type === "buyer_to_seller" ? 5 : null,
      payment: type === "seller_to_buyer" ? 5 : null,
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const criteriaLabels = {
    buyer_to_seller: {
      communication: "Communication",
      speed: "Rapidité de livraison",
      productCondition: "État du produit",
    },
    seller_to_buyer: {
      communication: "Communication",
      speed: "Rapidité de paiement",
      payment: "Fiabilité du paiement",
    },
  };

  const handleRatingChange = (field, rating) => {
    if (field === "overall") {
      setFormData((prev) => ({ ...prev, rating }));
    } else {
      setFormData((prev) => ({
        ...prev,
        criteria: { ...prev.criteria, [field]: rating },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await axios.post("http://localhost:5000/api/reviews", {
        auctionId: auction.id,
        revieweeId,
        rating: formData.rating,
        comment: formData.comment,
        type,
        criteria: formData.criteria,
      });

      onSuccess?.();
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, size = "text-2xl" }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`${size} transition-colors ${
            star <= value
              ? "text-yellow-400"
              : "text-gray-300 hover:text-yellow-200"
          }`}
        >
          ⭐
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">
        {type === "buyer_to_seller"
          ? "Évaluer le vendeur"
          : "Évaluer l'acheteur"}
      </h3>

      {/* Informations sur la transaction */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-medium text-gray-900">{auction.product.title}</h4>
        <p className="text-sm text-gray-600">
          Enchère terminée le{" "}
          {new Date(auction.endTime).toLocaleDateString("fr-FR")}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Note globale */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note globale *
          </label>
          <div className="flex items-center space-x-4">
            <StarRating
              value={formData.rating}
              onChange={(rating) => handleRatingChange("overall", rating)}
            />
            <span className="text-lg font-medium text-gray-700">
              {formData.rating}/5
            </span>
          </div>
        </div>

        {/* Critères détaillés */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Évaluation détaillée
          </label>
          <div className="space-y-4">
            {Object.entries(criteriaLabels[type]).map(
              ([key, label]) =>
                formData.criteria[key] !== null && (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 w-1/3">{label}</span>
                    <div className="flex items-center space-x-2 w-2/3">
                      <StarRating
                        value={formData.criteria[key]}
                        onChange={(rating) => handleRatingChange(key, rating)}
                        size="text-lg"
                      />
                      <span className="text-sm text-gray-500 min-w-[30px]">
                        {formData.criteria[key]}/5
                      </span>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>

        {/* Commentaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commentaire (optionnel)
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, comment: e.target.value }))
            }
            rows={4}
            className="form-input"
            placeholder="Partagez votre expérience avec les autres utilisateurs..."
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.comment.length}/500 caractères
          </p>
        </div>

        {/* Boutons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {submitting ? "Envoi..." : "Publier l'avis"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 btn-secondary"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
