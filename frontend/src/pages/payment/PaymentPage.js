// frontend/src/pages/payment/PaymentPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const PaymentPage = () => {
  const { auctionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [paymentData, setPaymentData] = useState({
    provider: "flooz",
    phoneNumber: "",
  });

  useEffect(() => {
    fetchAuctionDetails();
  }, [auctionId]);

  const fetchAuctionDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auctions/${auctionId}`
      );
      const auctionData = response.data;

      // Vérifier que l'utilisateur a remporté l'enchère
      if (!user || auctionData.winnerId !== user.id) {
        setError("Vous n'avez pas remporté cette enchère");
        return;
      }

      if (auctionData.status !== "ended") {
        setError("Cette enchère n'est pas encore terminée");
        return;
      }

      setAuction(auctionData);
    } catch (error) {
      setError("Enchère non trouvée");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const calculateFees = (amount, provider) => {
    const feeRates = {
      flooz: 0.025, // 2.5%
      tmoney: 0.02, // 2%
    };

    const fee = amount * (feeRates[provider] || 0.025);
    return Math.max(50, Math.min(fee, 5000)); // Min 50, Max 5000 FCFA
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/payments/initiate",
        {
          auctionId: parseInt(auctionId),
          provider: paymentData.provider,
          phoneNumber: paymentData.phoneNumber,
        }
      );

      if (response.data.success) {
        setSuccess(
          "Paiement initié avec succès ! Vérifiez votre téléphone pour confirmer."
        );

        // Rediriger vers la page de suivi du paiement
        setTimeout(() => {
          navigate(`/payment/${response.data.payment.id}/status`);
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors du paiement");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error && !auction) {
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

  const fees = auction
    ? calculateFees(auction.currentPrice, paymentData.provider)
    : 0;
  const totalAmount = auction ? parseFloat(auction.currentPrice) + fees : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Finaliser le paiement
        </h1>
        <p className="text-gray-600 mt-2">
          Félicitations ! Vous avez remporté cette enchère. Finalisez votre
          achat.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Résumé de l'enchère */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Résumé de votre achat</h2>

          {auction && (
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                {auction.product.images &&
                  auction.product.images.length > 0 && (
                    <img
                      src={`http://localhost:5000/uploads/products/${auction.product.images[0]}`}
                      alt={auction.product.title}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/80?text=No+Image";
                      }}
                    />
                  )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {auction.product.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Vendu par {auction.product.seller.firstName}{" "}
                    {auction.product.seller.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Enchère terminée le{" "}
                    {new Date(auction.endTime).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Prix de vente :</span>
                  <span className="font-semibold">
                    {formatPrice(auction.currentPrice)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Frais de transaction :</span>
                  <span>{formatPrice(fees)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total à payer :</span>
                  <span className="text-primary-600">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  📋 Prochaines étapes
                </h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Effectuez le paiement via Mobile Money</li>
                  <li>2. Le vendeur sera notifié de votre paiement</li>
                  <li>3. Organisez la livraison avec le vendeur</li>
                  <li>4. Confirmez la réception du produit</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Formulaire de paiement */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Méthode de paiement</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-6">
            {/* Choix du provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choisir votre opérateur Mobile Money
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    name="provider"
                    value="flooz"
                    checked={paymentData.provider === "flooz"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentData.provider === "flooz"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">F</span>
                      </div>
                      <div className="font-medium">Flooz</div>
                      <div className="text-sm text-gray-500">Moov Money</div>
                      <div className="text-xs text-gray-400 mt-1">
                        2.5% frais
                      </div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="provider"
                    value="tmoney"
                    checked={paymentData.provider === "tmoney"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentData.provider === "tmoney"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">T</span>
                      </div>
                      <div className="font-medium">T-Money</div>
                      <div className="text-sm text-gray-500">Togocel</div>
                      <div className="text-xs text-gray-400 mt-1">2% frais</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone Mobile Money
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={paymentData.phoneNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="90 00 00 00 ou +228 90 00 00 00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Utilisez le numéro associé à votre compte{" "}
                {paymentData.provider === "flooz" ? "Flooz" : "T-Money"}
              </p>
            </div>

            {/* Récapitulatif des frais */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                💰 Récapitulatif des frais
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Montant de l'enchère :</span>
                  <span>
                    {auction ? formatPrice(auction.currentPrice) : "0 FCFA"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Frais{" "}
                    {paymentData.provider === "flooz" ? "Flooz" : "T-Money"} :
                  </span>
                  <span>{formatPrice(fees)}</span>
                </div>
                <div className="flex justify-between font-medium text-base border-t pt-1">
                  <span>Total :</span>
                  <span className="text-primary-600">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    ⚠️ Important
                  </h4>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Vous recevrez un code de confirmation sur votre
                        téléphone
                      </li>
                      <li>
                        Le paiement sera débité de votre compte Mobile Money
                      </li>
                      <li>
                        En cas d'échec, le montant sera remboursé
                        automatiquement
                      </li>
                      <li>
                        Contactez le vendeur après paiement pour la livraison
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton de paiement */}
            <button
              type="submit"
              disabled={processing || !paymentData.phoneNumber}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Traitement en cours...
                </span>
              ) : (
                `💳 Payer ${formatPrice(totalAmount)} via ${
                  paymentData.provider === "flooz" ? "Flooz" : "T-Money"
                }`
              )}
            </button>
          </form>

          {/* Sécurité */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="w-4 h-4 mr-1">🔒</span>
                Sécurisé
              </span>
              <span className="flex items-center">
                <span className="w-4 h-4 mr-1">⚡</span>
                Instantané
              </span>
              <span className="flex items-center">
                <span className="w-4 h-4 mr-1">✅</span>
                Certifié
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
