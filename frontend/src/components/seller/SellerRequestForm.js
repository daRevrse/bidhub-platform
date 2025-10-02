// frontend/src/components/seller/SellerRequestForm.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const SellerRequestForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "individual",
    businessDescription: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
    experienceDescription: "",
    categoriesOfInterest: [],
    expectedMonthlyVolume: "",
  });

  const [files, setFiles] = useState({
    idDocument: null,
    businessDocument: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);

  const businessTypes = [
    { value: "individual", label: "Particulier" },
    { value: "company", label: "Entreprise" },
    { value: "association", label: "Association" },
    { value: "other", label: "Autre" },
  ];

  const volumeOptions = [
    { value: "1-10", label: "1-10 articles par mois" },
    { value: "11-50", label: "11-50 articles par mois" },
    { value: "51-100", label: "51-100 articles par mois" },
    { value: "100+", label: "Plus de 100 articles par mois" },
  ];

  const availableCategories = [
    "Électronique",
    "Véhicules",
    "Mode et Accessoires",
    "Maison et Jardin",
    "Art et Antiquités",
    "Sports et Loisirs",
    "Livres et Médias",
    "Bijoux et Montres",
    "Instruments de Musique",
    "Autres",
  ];

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà une demande
    checkExistingRequest();

    // Rediriger si déjà vendeur
    if (user && (user.role === "seller" || user.role === "admin")) {
      navigate("/");
    }
  }, [user, navigate]);

  const checkExistingRequest = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/seller-requests/my-request"
      );
      if (response.data.request) {
        setExistingRequest(response.data.request);
      }
    } catch (error) {
      console.error("Erreur vérification demande:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => ({
      ...prev,
      categoriesOfInterest: prev.categoriesOfInterest.includes(category)
        ? prev.categoriesOfInterest.filter((c) => c !== category)
        : [...prev.categoriesOfInterest, category],
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList.length > 0) {
      const file = fileList[0];

      // Vérifier la taille (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("Le fichier ne doit pas dépasser 10MB");
        return;
      }

      setFiles((prev) => ({
        ...prev,
        [name]: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validation
      if (!formData.businessDescription.trim()) {
        throw new Error("La description de votre activité est requise");
      }

      if (formData.categoriesOfInterest.length === 0) {
        throw new Error(
          "Veuillez sélectionner au moins une catégorie d'intérêt"
        );
      }

      // Créer le FormData
      const submitData = new FormData();

      // Ajouter les données du formulaire
      Object.keys(formData).forEach((key) => {
        if (key === "categoriesOfInterest") {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Ajouter les fichiers
      if (files.idDocument) {
        submitData.append("idDocument", files.idDocument);
      }
      if (files.businessDocument) {
        submitData.append("businessDocument", files.businessDocument);
      }

      const response = await axios.post(
        "http://localhost:5000/api/seller-requests",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(true);
      setExistingRequest(response.data.request);
    } catch (error) {
      console.error("Erreur soumission demande:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Erreur lors de la soumission"
      );
    } finally {
      setLoading(false);
    }
  };

  // Si l'utilisateur a déjà une demande, afficher le statut
  if (existingRequest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            {existingRequest.status === "pending" && (
              <>
                <ExclamationCircleIcon className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Demande en cours de traitement
                </h2>
                <p className="text-gray-600 mb-4">
                  Votre demande pour devenir vendeur a été soumise le{" "}
                  {new Date(existingRequest.submittedAt).toLocaleDateString(
                    "fr-FR"
                  )}
                  et est actuellement en cours d'examen par notre équipe.
                </p>
                <p className="text-sm text-gray-500">
                  Vous recevrez une notification par email dès que votre demande
                  sera traitée.
                </p>
              </>
            )}

            {existingRequest.status === "approved" && (
              <>
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Demande approuvée !
                </h2>
                <p className="text-gray-600 mb-4">
                  Félicitations ! Votre demande a été approuvée le{" "}
                  {new Date(existingRequest.reviewedAt).toLocaleDateString(
                    "fr-FR"
                  )}
                  . Vous pouvez maintenant créer des enchères.
                </p>
                <button
                  onClick={() => navigate("/products/create")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Créer ma première enchère
                </button>
              </>
            )}

            {existingRequest.status === "rejected" && (
              <>
                <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Demande rejetée
                </h2>
                <p className="text-gray-600 mb-4">
                  Votre demande a été rejetée le{" "}
                  {new Date(existingRequest.reviewedAt).toLocaleDateString(
                    "fr-FR"
                  )}
                  .
                </p>
                {existingRequest.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                    <p className="text-sm text-red-700">
                      <strong>Raison :</strong>{" "}
                      {existingRequest.rejectionReason}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mb-4">
                  Vous pouvez soumettre une nouvelle demande en tenant compte
                  des remarques.
                </p>
                <button
                  onClick={() => setExistingRequest(null)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Nouvelle demande
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Demande soumise avec succès !
          </h2>
          <p className="text-gray-600 mb-4">
            Votre demande pour devenir vendeur a été transmise à notre équipe.
            Vous recevrez une réponse par email dans les plus brefs délais.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Devenir vendeur sur BidHub
          </h1>
          <p className="text-gray-600 mt-2">
            Remplissez ce formulaire pour soumettre votre demande de vendeur.
            Notre équipe examinera votre candidature et vous contactera
            rapidement.
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 mr-2" />
              Informations sur votre activité
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'activité *
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {businessTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise (optionnel)
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom de votre entreprise"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description de votre activité *
                </label>
                <textarea
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez votre activité de vente, vos produits, votre expérience..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone professionnel
                </label>
                <input
                  type="tel"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+228 XX XX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email professionnel
                </label>
                <input
                  type="email"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@monentreprise.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de l'activité
                </label>
                <textarea
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adresse complète de votre activité"
                />
              </div>
            </div>
          </div>

          {/* Catégories d'intérêt */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Catégories de produits *
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sélectionnez les catégories de produits que vous souhaitez vendre
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableCategories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.categoriesOfInterest.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Volume d'activité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume mensuel estimé
            </label>
            <select
              name="expectedMonthlyVolume"
              value={formData.expectedMonthlyVolume}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionnez un volume</option>
              {volumeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Expérience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expérience dans la vente (optionnel)
            </label>
            <textarea
              name="experienceDescription"
              value={formData.experienceDescription}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez votre expérience dans la vente en ligne ou physique..."
            />
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Documents (optionnels)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pièce d'identité
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        {files.idDocument
                          ? files.idDocument.name
                          : "Cliquez pour uploader"}
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF (10MB max)
                      </p>
                    </div>
                    <input
                      type="file"
                      name="idDocument"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document d'activité
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <DocumentTextIcon className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        {files.businessDocument
                          ? files.businessDocument.name
                          : "Cliquez pour uploader"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Registre commerce, etc.
                      </p>
                    </div>
                    <input
                      type="file"
                      name="businessDocument"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Soumission en cours..." : "Soumettre ma demande"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerRequestForm;
