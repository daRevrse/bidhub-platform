import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        phone: response.data.phone,
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
      setProfile({ ...profile, ...formData });
      setEditing(false);
      setMessage("Profil mis à jour avec succès");
    } catch (error) {
      setMessage("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>

      {/* Informations du profil */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">Informations personnelles</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary">
              Modifier
            </button>
          )}
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.includes("succès")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
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

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    phone: profile.phone,
                  });
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Prénom</p>
                <p className="font-medium">{profile?.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">{profile?.lastName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium">{profile?.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Rôle</p>
                <p className="font-medium capitalize">
                  {profile?.role === "seller"
                    ? "Vendeur"
                    : profile?.role === "admin"
                    ? "Administrateur"
                    : "Acheteur"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile?.isVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {profile?.isVerified ? "Vérifié" : "Non vérifié"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mes enchères actives */}
      {profile?.bids && profile.bids.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Mes enchères actives</h2>
          <div className="space-y-3">
            {profile.bids.slice(0, 5).map((bid) => (
              <div
                key={bid.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium">{bid.auction.product.title}</p>
                  <p className="text-sm text-gray-500">
                    Mon offre: {formatPrice(bid.amount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(bid.auction.currentPrice)}
                  </p>
                  <p className="text-sm text-gray-500">Prix actuel</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mes produits en vente */}
      {profile?.products && profile.products.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Mes produits en vente</h2>
          <div className="space-y-3">
            {profile.products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium">{product.title}</p>
                  <p className="text-sm text-gray-500">
                    Statut: {product.status === "active" ? "Actif" : "Inactif"}
                  </p>
                </div>
                <div className="text-right">
                  {product.auction && (
                    <>
                      <p className="font-semibold">
                        {formatPrice(product.auction.currentPrice)}
                      </p>
                      <p className="text-sm text-gray-500">Prix actuel</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
