import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  CameraIcon,
  UserCircleIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    city: "",
    country: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [verificationRequested, setVerificationRequested] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/profile"
      );
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        phone: response.data.phone || "",
        bio: response.data.bio || "",
        city: response.data.city || "",
        country: response.data.country || "Togo",
      });
    } catch (error) {
      console.error("Erreur chargement profil:", error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        formData
      );
      setProfile((prev) => ({ ...prev, ...response.data.user }));
      setEditing(false);
      setMessage({ type: "success", text: "Profil mis à jour avec succès" });
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erreur lors de la mise à jour",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Veuillez sélectionner une image valide",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB max
      setMessage({ type: "error", text: "L'image ne doit pas dépasser 5MB" });
      return;
    }

    setUploadingAvatar(true);
    setMessage("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("avatar", file);

      const response = await axios.post(
        "http://localhost:5000/api/users/upload-avatar",
        formDataUpload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setProfile((prev) => ({ ...prev, avatar: response.data.avatarUrl }));
      setMessage({ type: "success", text: "Avatar mis à jour avec succès" });
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Erreur lors de l'upload de l'avatar",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar) return;

    try {
      await axios.delete("http://localhost:5000/api/users/remove-avatar");
      setProfile((prev) => ({ ...prev, avatar: null }));
      setMessage({ type: "success", text: "Avatar supprimé avec succès" });
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de la suppression de l'avatar",
      });
    }
  };

  const requestVerification = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/request-verification");
      setVerificationRequested(true);
      setMessage({
        type: "success",
        text: "Demande de vérification envoyée ! Nous examinerons votre compte sous 48h.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erreur lors de la demande",
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header avec titre */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
        <p className="text-gray-600">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { key: "profile", label: "Profil", icon: UserCircleIcon },
            { key: "products", label: "Mes produits", icon: EyeIcon },
            { key: "bids", label: "Mes enchères", icon: PencilIcon },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Messages de notification */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-start space-x-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckBadgeIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Contenu des onglets */}
      {activeTab === "profile" && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne de gauche - Avatar et statut */}
          <div className="space-y-6">
            {/* Card Avatar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="relative inline-block mb-6">
                {profile?.avatar ? (
                  <img
                    src={`http://localhost:5000${profile.avatar}`}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center border-4 border-gray-100">
                    <span className="text-4xl font-bold text-white">
                      {profile?.firstName?.[0]}
                      {profile?.lastName?.[0]}
                    </span>
                  </div>
                )}

                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {profile?.firstName} {profile?.lastName}
              </h3>
              <p className="text-gray-600 mb-4 capitalize">
                {profile?.role === "seller"
                  ? "Vendeur"
                  : profile?.role === "admin"
                  ? "Administrateur"
                  : "Acheteur"}
              </p>

              {/* Actions Avatar */}
              <div className="flex space-x-2 justify-center mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CameraIcon className="w-4 h-4 mr-2" />
                  {profile?.avatar ? "Changer" : "Ajouter"}
                </button>

                {profile?.avatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Supprimer
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <p className="text-xs text-gray-500">
                JPG, PNG ou GIF. Taille max: 5MB
              </p>
            </div>

            {/* Card Statut de vérification */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                {profile?.isVerified ? (
                  <>
                    <CheckBadgeIcon className="w-5 h-5 text-green-600 mr-2" />
                    Compte vérifié
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                    Compte non vérifié
                  </>
                )}
              </h4>

              {profile?.isVerified ? (
                <div className="text-sm text-gray-600 space-y-2">
                  <p>✅ Identité vérifiée</p>
                  <p>✅ Email confirmé</p>
                  <p>✅ Téléphone vérifié</p>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-green-700 text-sm">
                      Votre compte est vérifié ! Vous bénéficiez de la confiance
                      des autres utilisateurs.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 space-y-4">
                  <div className="space-y-2">
                    <p className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      Identité en attente
                    </p>
                    <p className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Email confirmé
                    </p>
                    <p className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      Téléphone à vérifier
                    </p>
                  </div>

                  {!verificationRequested ? (
                    <button
                      onClick={requestVerification}
                      className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Demander la vérification
                    </button>
                  ) : (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-700 text-sm">
                        Demande en cours d'examen. Vous recevrez une réponse
                        sous 48h.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card Statistiques */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Mes statistiques
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Membre depuis</span>
                  <span className="font-medium">
                    {formatDate(profile?.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Produits vendus</span>
                  <span className="font-medium">
                    {profile?.products?.filter((p) => p.status === "sold")
                      ?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Enchères actives</span>
                  <span className="font-medium">
                    {profile?.bids?.filter(
                      (b) => b.auction?.status === "active"
                    )?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne de droite - Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Informations personnelles
                </h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Modifier
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biographie
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className="form-input"
                      rows={4}
                      placeholder="Parlez-nous de vous..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.bio.length}/500 caractères
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="form-input"
                        placeholder="Lomé"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pays
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="form-input"
                      >
                        <option value="Togo">Togo</option>
                        <option value="Benin">Bénin</option>
                        <option value="Ghana">Ghana</option>
                        <option value="Burkina Faso">Burkina Faso</option>
                        <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {saving ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          firstName: profile.firstName || "",
                          lastName: profile.lastName || "",
                          phone: profile.phone || "",
                          bio: profile.bio || "",
                          city: profile.city || "",
                          country: profile.country || "Togo",
                        });
                      }}
                      className="flex-1 btn-secondary"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Prénom</p>
                      <p className="font-medium text-gray-900">
                        {profile?.firstName || "Non renseigné"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nom</p>
                      <p className="font-medium text-gray-900">
                        {profile?.lastName || "Non renseigné"}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-900">
                        {profile?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                      <p className="font-medium text-gray-900">
                        {profile?.phone || "Non renseigné"}
                      </p>
                    </div>
                  </div>

                  {profile?.bio && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Biographie</p>
                      <p className="text-gray-900">{profile.bio}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Ville</p>
                      <p className="font-medium text-gray-900">
                        {profile?.city || "Non renseigné"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pays</p>
                      <p className="font-medium text-gray-900">
                        {profile?.country || "Togo"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Onglet Mes produits */}
      {activeTab === "products" && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Mes produits en vente
          </h2>
          {profile?.products && profile.products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.products.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  {product.images && product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="font-medium text-gray-900 mb-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.status === "active" ? "Actif" : "Inactif"}
                    </span>
                    {product.auction && (
                      <span className="font-semibold text-blue-600">
                        {formatPrice(product.auction.currentPrice)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucun produit en vente</p>
              <button className="btn-primary">Ajouter un produit</button>
            </div>
          )}
        </div>
      )}

      {/* Onglet Mes enchères */}
      {activeTab === "bids" && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Mes enchères actives
          </h2>
          {profile?.bids && profile.bids.length > 0 ? (
            <div className="space-y-4">
              {profile.bids.map((bid) => (
                <div
                  key={bid.id}
                  className="border rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {bid.auction?.product?.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Mon offre: {formatPrice(bid.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600 mb-1">
                      {formatPrice(bid.auction?.currentPrice)}
                    </p>
                    <p className="text-xs text-gray-500">Prix actuel</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <EyeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucune enchère en cours</p>
              <button className="btn-primary">Voir les enchères</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
