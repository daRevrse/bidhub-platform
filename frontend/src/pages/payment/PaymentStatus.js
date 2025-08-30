import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const PaymentStatus = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPaymentStatus();

    // Vérifier le statut toutes les 5 secondes si en attente
    const interval = setInterval(() => {
      if (payment && payment.status === "pending") {
        fetchPaymentStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentId]);

  const fetchPaymentStatus = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/payments/${paymentId}/status`
      );
      setPayment(response.data);
    } catch (error) {
      setError("Paiement non trouvé");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: "⏳",
          title: "En attente",
          message: "Vérifiez votre téléphone et confirmez le paiement",
        };
      case "completed":
        return {
          color: "bg-green-100 text-green-800",
          icon: "✅",
          title: "Paiement réussi",
          message: "Votre paiement a été confirmé avec succès",
        };
      case "failed":
        return {
          color: "bg-red-100 text-red-800",
          icon: "❌",
          title: "Paiement échoué",
          message: "Le paiement n'a pas pu être traité",
        };
      case "cancelled":
        return {
          color: "bg-gray-100 text-gray-800",
          icon: "🚫",
          title: "Paiement annulé",
          message: "Le paiement a été annulé",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: "❓",
          title: "Statut inconnu",
          message: "Statut du paiement indéterminé",
        };
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={() => navigate("/profile")} className="btn-primary">
          Retour au profil
        </button>
      </div>
    );
  }

  if (!payment) return null;

  const statusDisplay = getStatusDisplay(payment.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icône et statut */}
        <div className="mb-6">
          <div className="text-6xl mb-4">{statusDisplay.icon}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {statusDisplay.title}
          </h1>
          <p className="text-gray-600">{statusDisplay.message}</p>
        </div>

        {/* Badge de statut */}
        <div className="mb-6">
          <span
            className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${statusDisplay.color}`}
          >
            {statusDisplay.title}
          </span>
        </div>

        {/* Détails du paiement */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Détails du paiement</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Montant total :</span>
              <span className="font-semibold">
                {formatPrice(payment.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Frais de transaction :</span>
              <span>{formatPrice(payment.fees)}</span>
            </div>
            <div className="flex justify-between">
              <span>Méthode :</span>
              <span className="capitalize">{payment.provider}</span>
            </div>
            <div className="flex justify-between">
              <span>ID Transaction :</span>
              <span className="font-mono text-xs">{payment.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span>Date :</span>
              <span>{new Date(payment.createdAt).toLocaleString("fr-FR")}</span>
            </div>
            {payment.completedAt && (
              <div className="flex justify-between">
                <span>Complété le :</span>
                <span>
                  {new Date(payment.completedAt).toLocaleString("fr-FR")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions selon le statut */}
        <div className="space-y-4">
          {payment.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm mb-3">
                <strong>⏳ Paiement en cours</strong>
                <br />
                Vérifiez votre téléphone et saisissez votre code PIN pour
                confirmer le paiement.
              </p>
              <button
                onClick={fetchPaymentStatus}
                className="btn-secondary text-sm"
              >
                🔄 Actualiser le statut
              </button>
            </div>
          )}

          {payment.status === "completed" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm mb-3">
                <strong>🎉 Paiement confirmé !</strong>
                <br />
                Le vendeur a été notifié. Il vous contactera bientôt pour
                organiser la livraison.
              </p>
              <div className="space-x-3">
                <button
                  onClick={() => navigate("/profile")}
                  className="btn-primary"
                >
                  Voir mes achats
                </button>
                <button
                  onClick={() => navigate("/auctions")}
                  className="btn-secondary"
                >
                  Autres enchères
                </button>
              </div>
            </div>
          )}

          {(payment.status === "failed" || payment.status === "cancelled") && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm mb-3">
                <strong>❌ Paiement non abouti</strong>
                <br />
                Vous pouvez réessayer le paiement ou contacter le support.
              </p>
              <div className="space-x-3">
                <button
                  onClick={() => navigate(`/payment/${payment.auctionId}`)}
                  className="btn-primary"
                >
                  Réessayer le paiement
                </button>
                <button
                  onClick={() => navigate("/support")}
                  className="btn-secondary"
                >
                  Contacter le support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
