// frontend/src/pages/products/CreateProductWizard.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  XMarkIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const CreateProductWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // État du wizard
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Données du formulaire
  const [formData, setFormData] = useState({
    // Étape 1 : Informations de base
    title: "",
    description: "",
    category: "",
    condition: "good",

    // Étape 2 : Images
    images: [],
    imagePreviews: [],

    // Étape 3 : Pricing et durée
    startingPrice: "",
    reservePrice: "",
    auctionDuration: "7",

    // Étape 4 : Options avancées
    shippingOptions: [],
    paymentMethods: ["mobile_money", "cash"],
    autoRelist: false,
    allowBuyNow: false,
    buyNowPrice: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Configuration des étapes
  const steps = [
    {
      id: 1,
      title: "Informations",
      description: "Détails du produit",
      icon: InformationCircleIcon,
    },
    {
      id: 2,
      title: "Photos",
      description: "Images du produit",
      icon: PhotoIcon,
    },
    {
      id: 3,
      title: "Prix & Durée",
      description: "Paramètres d'enchère",
      icon: CurrencyDollarIcon,
    },
    {
      id: 4,
      title: "Finalisation",
      description: "Options et aperçu",
      icon: EyeIcon,
    },
  ];

  const categories = [
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

  const conditions = [
    {
      value: "new",
      label: "Neuf",
      description: "Jamais utilisé, dans son emballage",
    },
    {
      value: "like_new",
      label: "Comme neuf",
      description: "Utilisé très peu, excellent état",
    },
    {
      value: "good",
      label: "Bon état",
      description: "Signes d'usure mineurs, fonctionne parfaitement",
    },
    {
      value: "fair",
      label: "État correct",
      description: "Signes d'usure visibles mais fonctionnel",
    },
    {
      value: "poor",
      label: "Mauvais état",
      description: "Défauts visibles, peut nécessiter des réparations",
    },
  ];

  const shippingOptionsList = [
    { id: "pickup", label: "Retrait en personne", price: 0 },
    { id: "local", label: "Livraison locale (Lomé)", price: 2000 },
    { id: "national", label: "Livraison nationale", price: 5000 },
    { id: "express", label: "Livraison express", price: 8000 },
  ];

  // Redirection si pas vendeur
  React.useEffect(() => {
    if (user && user.role !== "seller" && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Gestion des changements de champs
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Gestion des images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + formData.images.length > 5) {
      setError("Maximum 5 images autorisées");
      return;
    }

    // Vérifications
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError("Chaque image doit faire moins de 5MB");
      return;
    }

    const invalidFiles = files.filter(
      (file) =>
        !["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(
          file.type
        )
    );
    if (invalidFiles.length > 0) {
      setError("Seuls les fichiers JPG, PNG et GIF sont autorisés");
      return;
    }

    setError("");

    // Ajouter les nouveaux fichiers
    const newImages = [...formData.images, ...files];
    const newPreviews = [...formData.imagePreviews];

    // Créer les previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        if (newPreviews.length === newImages.length) {
          setFormData((prev) => ({
            ...prev,
            images: newImages,
            imagePreviews: newPreviews,
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Validation de chaque étape
  const validateCurrentStep = () => {
    setError("");

    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          setError("Le titre est obligatoire");
          return false;
        }
        if (!formData.description.trim()) {
          setError("La description est obligatoire");
          return false;
        }
        if (!formData.category) {
          setError("Veuillez sélectionner une catégorie");
          return false;
        }
        break;

      case 2:
        if (formData.images.length === 0) {
          setError("Au moins une image est requise");
          return false;
        }
        break;

      case 3:
        if (
          !formData.startingPrice ||
          parseFloat(formData.startingPrice) < 100
        ) {
          setError("Le prix de départ doit être d'au moins 100 FCFA");
          return false;
        }
        if (
          formData.reservePrice &&
          parseFloat(formData.reservePrice) < parseFloat(formData.startingPrice)
        ) {
          setError("Le prix de réserve doit être supérieur au prix de départ");
          return false;
        }
        if (
          formData.allowBuyNow &&
          (!formData.buyNowPrice ||
            parseFloat(formData.buyNowPrice) <=
              parseFloat(formData.startingPrice))
        ) {
          setError(
            "Le prix d'achat immédiat doit être supérieur au prix de départ"
          );
          return false;
        }
        break;
    }

    return true;
  };

  // Soumission finale
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    setError("");

    try {
      // Créer le FormData pour l'upload
      const productData = new FormData();

      // Informations de base
      productData.append("title", formData.title);
      productData.append("description", formData.description);
      productData.append("category", formData.category);
      productData.append("condition", formData.condition);

      // Ajouter les images
      formData.images.forEach((image) => {
        productData.append("images", image);
      });

      // Options avancées
      productData.append(
        "shippingOptions",
        JSON.stringify(formData.shippingOptions)
      );
      productData.append(
        "paymentMethods",
        JSON.stringify(formData.paymentMethods)
      );

      // Créer le produit
      const productResponse = await axios.post(
        "http://localhost:5000/api/products",
        productData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const productId = productResponse.data.product.id;

      // Créer l'enchère
      const startTime = new Date();
      const endTime = new Date();
      endTime.setDate(startTime.getDate() + parseInt(formData.auctionDuration));

      const auctionData = {
        productId,
        startingPrice: parseFloat(formData.startingPrice),
        reservePrice: formData.reservePrice
          ? parseFloat(formData.reservePrice)
          : null,
        buyNowPrice: formData.allowBuyNow
          ? parseFloat(formData.buyNowPrice)
          : null,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        autoRelist: formData.autoRelist,
      };

      await axios.post("http://localhost:5000/api/auctions", auctionData);

      navigate("/auctions", {
        state: { message: "Votre enchère a été créée avec succès !" },
      });
    } catch (error) {
      console.error("Erreur création produit:", error);
      setError(
        error.response?.data?.message || "Erreur lors de la création du produit"
      );
    } finally {
      setLoading(false);
    }
  };

  // Rendu du contenu selon l'étape
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du produit *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: iPhone 13 Pro Max 256GB"
                maxLength={100}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.title.length}/100 caractères
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description détaillée *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez votre produit en détail : état, caractéristiques, défauts éventuels, accessoires inclus..."
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/1000 caractères
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choisir une catégorie</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État du produit *
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) =>
                    handleInputChange("condition", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {conditions.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description de l'état sélectionné */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                {conditions.find((c) => c.value === formData.condition)?.label}
              </h4>
              <p className="text-sm text-blue-800">
                {
                  conditions.find((c) => c.value === formData.condition)
                    ?.description
                }
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ajoutez des photos de votre produit
              </h3>
              <p className="text-gray-600 mb-6">
                Des photos de qualité augmentent vos chances de vente de 40%
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="images"
                className="cursor-pointer flex flex-col items-center"
              >
                <PhotoIcon className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-lg font-medium text-gray-900 mb-2">
                  Cliquez pour ajouter des photos
                </span>
                <span className="text-gray-600">
                  ou glissez-déposez vos images ici
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  JPG, PNG ou GIF - Max 5MB par image - Maximum 5 images
                </span>
              </label>
            </div>

            {/* Aperçu des images */}
            {formData.imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {formData.imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Photo principale
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Conseils pour les photos */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">
                💡 Conseils pour de bonnes photos
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Prenez des photos dans un endroit bien éclairé</li>
                <li>• Montrez le produit sous différents angles</li>
                <li>• Incluez les défauts ou l'usure s'il y en a</li>
                <li>• Ajoutez une photo des accessoires inclus</li>
                <li>• La première photo sera celle affichée en miniature</li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de départ (FCFA) *
                </label>
                <input
                  type="number"
                  value={formData.startingPrice}
                  onChange={(e) =>
                    handleInputChange("startingPrice", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000"
                  min="100"
                  step="100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Prix minimum : 100 FCFA
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de réserve (FCFA)
                  <span className="text-gray-400 ml-1">(optionnel)</span>
                </label>
                <input
                  type="number"
                  value={formData.reservePrice}
                  onChange={(e) =>
                    handleInputChange("reservePrice", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="15000"
                  min="100"
                  step="100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Prix minimum acceptable (non visible)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée de l'enchère *
              </label>
              <select
                value={formData.auctionDuration}
                onChange={(e) =>
                  handleInputChange("auctionDuration", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1">1 jour</option>
                <option value="3">3 jours</option>
                <option value="5">5 jours</option>
                <option value="7">7 jours (recommandé)</option>
                <option value="10">10 jours</option>
                <option value="14">14 jours</option>
              </select>
            </div>

            {/* Option achat immédiat */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowBuyNow"
                  checked={formData.allowBuyNow}
                  onChange={(e) =>
                    handleInputChange("allowBuyNow", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="allowBuyNow"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Permettre l'achat immédiat
                </label>
              </div>

              {formData.allowBuyNow && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix d'achat immédiat (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={formData.buyNowPrice}
                    onChange={(e) =>
                      handleInputChange("buyNowPrice", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25000"
                    min={formData.startingPrice || 100}
                    step="100"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Prix pour acheter le produit immédiatement
                  </p>
                </div>
              )}
            </div>

            {/* Options de livraison */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Options de livraison
              </label>
              <div className="space-y-3">
                {shippingOptionsList.map((option) => (
                  <div key={option.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={option.id}
                      checked={formData.shippingOptions.includes(option.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange("shippingOptions", [
                            ...formData.shippingOptions,
                            option.id,
                          ]);
                        } else {
                          handleInputChange(
                            "shippingOptions",
                            formData.shippingOptions.filter(
                              (id) => id !== option.id
                            )
                          );
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={option.id}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {option.label}{" "}
                      {option.price > 0 && `(+${option.price} FCFA)`}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Informations sur les frais */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                💰 Récapitulatif des frais
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Commission BidHub : 5% du prix de vente final</li>
                <li>• Insertion gratuite pour tous les vendeurs</li>
                <li>• Options de mise en avant disponibles</li>
                <li>• Paiement après vente réussie uniquement</li>
              </ul>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Récapitulatif */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  Aperçu de votre enchère
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Images */}
                {formData.imagePreviews.length > 0 && (
                  <div>
                    <img
                      src={formData.imagePreviews[0]}
                      alt="Preview principal"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {formData.imagePreviews.length > 1 && (
                      <p className="text-sm text-gray-500 mt-2">
                        +{formData.imagePreviews.length - 1} autre(s) photo(s)
                      </p>
                    )}
                  </div>
                )}

                {/* Informations */}
                <div className="space-y-3">
                  <h4 className="text-xl font-semibold text-gray-900">
                    {formData.title}
                  </h4>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {formData.category}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {
                        conditions.find((c) => c.value === formData.condition)
                          ?.label
                      }
                    </span>
                  </div>

                  <p className="text-gray-700">{formData.description}</p>
                </div>

                {/* Détails de l'enchère */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix de départ :</span>
                    <span className="font-medium">
                      {formData.startingPrice} FCFA
                    </span>
                  </div>

                  {formData.reservePrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix de réserve :</span>
                      <span className="font-medium">
                        {formData.reservePrice} FCFA
                      </span>
                    </div>
                  )}

                  {formData.allowBuyNow && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Achat immédiat :</span>
                      <span className="font-medium text-green-600">
                        {formData.buyNowPrice} FCFA
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Durée :</span>
                    <span className="font-medium">
                      {formData.auctionDuration} jour(s)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Options avancées */}
            <div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="autoRelist"
                  checked={formData.autoRelist}
                  onChange={(e) =>
                    handleInputChange("autoRelist", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="autoRelist"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Remettre automatiquement en vente si pas vendu
                </label>
              </div>
            </div>

            {/* Conditions */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">
                📋 Conditions de vente
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Vous vous engagez à vendre le produit tel que décrit</li>
                <li>• L'enchère démarre immédiatement après validation</li>
                <li>• Commission de 5% prélevée sur le prix final</li>
                <li>• Vous devez répondre aux questions des acheteurs</li>
                <li>• Livraison sous 7 jours après réception du paiement</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Rendu principal
  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
        <p className="text-gray-600 mb-4">
          Vous devez être vendeur pour créer une enchère.
        </p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header avec indicateur de progression */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Créer une nouvelle enchère
        </h1>
        <p className="text-gray-600 mb-6">
          Suivez ces étapes pour créer votre enchère en quelques minutes
        </p>

        {/* Indicateur de progression */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const IconComponent = step.icon;

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Étape */}
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p
                      className={`text-sm font-medium ${
                        isActive || isCompleted
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>

                {/* Ligne de connexion */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-all duration-200 ${
                      isCompleted ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenu de l'étape courante */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header de l'étape */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Étape {currentStep} : {steps[currentStep - 1]?.title}
              </h2>
              <p className="text-gray-600 text-sm">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-blue-600">
                {currentStep} sur {totalSteps}
              </span>
              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
          <button
            type="button"
            onClick={previousStep}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            Précédent
          </button>

          <div className="flex space-x-3">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Suivant
                <ChevronRightIcon className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Créer l'enchère
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Aide contextuelle */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              {currentStep === 1 && "💡 Conseil pour l'étape 1"}
              {currentStep === 2 && "📸 Conseil pour les photos"}
              {currentStep === 3 && "💰 Conseil pour les prix"}
              {currentStep === 4 && "✅ Dernière vérification"}
            </h4>
            <p className="text-sm text-blue-800">
              {currentStep === 1 &&
                "Un titre clair et une description détaillée augmentent vos chances de vente de 60%. Mentionnez la marque, le modèle et l'état."}
              {currentStep === 2 &&
                "La première photo est cruciale ! Elle apparaîtra dans les résultats de recherche. Assurez-vous qu'elle soit nette et bien éclairée."}
              {currentStep === 3 &&
                "Un prix de départ attractif génère plus d'enchères. Vous pouvez fixer un prix de réserve pour vous protéger."}
              {currentStep === 4 &&
                "Vérifiez tous les détails avant de publier. Une fois l'enchère lancée, certains éléments ne pourront plus être modifiés."}
            </p>
          </div>
        </div>
      </div>

      {/* Aide et support */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-2">
          Besoin d'aide pour créer votre enchère ?
        </p>
        <div className="flex justify-center space-x-4">
          <a href="/help" className="text-sm text-blue-600 hover:text-blue-700">
            Guide du vendeur
          </a>
          <span className="text-gray-300">•</span>
          <a
            href="/contact"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Contacter le support
          </a>
          <span className="text-gray-300">•</span>
          <a href="/faq" className="text-sm text-blue-600 hover:text-blue-700">
            FAQ vendeurs
          </a>
        </div>
      </div>
    </div>
  );
};

export default CreateProductWizard;
