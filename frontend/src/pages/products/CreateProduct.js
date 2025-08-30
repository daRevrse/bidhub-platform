import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const CreateProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "good",
    startingPrice: "",
    reservePrice: "",
    auctionDuration: "7", // en jours
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    { value: "new", label: "Neuf" },
    { value: "like_new", label: "Comme neuf" },
    { value: "good", label: "Bon état" },
    { value: "fair", label: "État correct" },
    { value: "poor", label: "Mauvais état" },
  ];

  // Redirection si pas vendeur
  React.useEffect(() => {
    if (user && user.role !== "seller" && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 5) {
      setError("Maximum 5 images autorisées");
      return;
    }

    // Vérifier la taille des fichiers (5MB max chacun)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError("Chaque image doit faire moins de 5MB");
      return;
    }

    // Vérifier le type des fichiers
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
    setImages((prev) => [...prev, ...files]);

    // Créer les previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Créer le FormData pour l'upload
      const productData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (
          key !== "startingPrice" &&
          key !== "reservePrice" &&
          key !== "auctionDuration"
        ) {
          productData.append(key, formData[key]);
        }
      });

      // Ajouter les images
      images.forEach((image) => {
        productData.append("images", image);
      });

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
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      await axios.post("http://localhost:5000/api/auctions", auctionData);

      navigate("/auctions");
    } catch (error) {
      console.error("Erreur création produit:", error);
      setError(
        error.response?.data?.message || "Erreur lors de la création du produit"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
        <p className="text-gray-600 mb-4">
          Vous devez être vendeur pour accéder à cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Créer une nouvelle enchère
        </h1>
        <p className="text-gray-600 mt-2">
          Ajoutez votre produit et lancez une enchère
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Informations de base */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            Informations du produit
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du produit *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ex: iPhone 13 Pro Max 256GB"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description détaillée *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="form-input"
                placeholder="Décrivez votre produit en détail, son état, ses caractéristiques..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  État du produit *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  {conditions.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Upload d'images */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Images du produit</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos ({images.length}/5) - Première photo = photo principale
              </label>

              {images.length < 5 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="text-gray-600">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2">
                        <span className="font-medium text-primary-600 hover:text-primary-500">
                          Cliquez pour ajouter des images
                        </span>{" "}
                        ou glissez-déposez
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, GIF jusqu'à 5MB chacun
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Preview des images */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                          Principale
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Paramètres de l'enchère */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            Paramètres de l'enchère
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix de départ (FCFA) *
                </label>
                <input
                  type="number"
                  name="startingPrice"
                  value={formData.startingPrice}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="10000"
                  min="100"
                  step="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix de réserve (FCFA)
                  <span className="text-sm text-gray-500 ml-1">
                    (optionnel)
                  </span>
                </label>
                <input
                  type="number"
                  name="reservePrice"
                  value={formData.reservePrice}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="15000"
                  min="100"
                  step="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (jours) *
                </label>
                <select
                  name="auctionDuration"
                  value={formData.auctionDuration}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="1">1 jour</option>
                  <option value="3">3 jours</option>
                  <option value="5">5 jours</option>
                  <option value="7">7 jours</option>
                  <option value="10">10 jours</option>
                  <option value="14">14 jours</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                ℹ️ Informations importantes
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• L'enchère commencera immédiatement après création</li>
                <li>
                  • Le prix de réserve est le prix minimum acceptable (non
                  visible publiquement)
                </li>
                <li>• Commission BidHub: 5% du prix final de vente</li>
                <li>
                  • Vous recevrez des notifications pour chaque nouvelle offre
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || images.length === 0}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? "Création en cours..." : "Créer l'enchère"}
          </button>
        </div>

        {images.length === 0 && (
          <p className="text-sm text-red-600 text-center">
            Au moins une image est requise pour créer l'enchère
          </p>
        )}
      </form>
    </div>
  );
};

export default CreateProduct;
