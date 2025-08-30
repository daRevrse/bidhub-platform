// frontend/src/pages/admin/Dashboard.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentAuctions, setRecentAuctions] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Ces routes devront être créées côté backend
      const [statsRes, auctionsRes, usersRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/stats"),
        axios.get("http://localhost:5000/api/admin/recent-auctions"),
        axios.get("http://localhost:5000/api/admin/recent-users"),
      ]);

      setStats(statsRes.data);
      setRecentAuctions(auctionsRes.data);
      setRecentUsers(usersRes.data);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
        <p className="text-gray-600">
          Cette page est réservée aux administrateurs.
        </p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de bord Admin
        </h1>
        <p className="text-gray-600 mt-2">
          Vue d'ensemble de la plateforme BidHub
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Utilisateurs totaux
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🛍️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Enchères actives
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeAuctions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Volume total</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalVolume ? formatPrice(stats.totalVolume) : "0 FCFA"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Commissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCommissions
                  ? formatPrice(stats.totalCommissions)
                  : "0 FCFA"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Enchères récentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Enchères récentes</h2>
          </div>
          <div className="p-6">
            {recentAuctions.length > 0 ? (
              <div className="space-y-4">
                {recentAuctions.slice(0, 5).map((auction) => (
                  <div
                    key={auction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {auction.product.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Par {auction.product.seller.firstName}{" "}
                        {auction.product.seller.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(auction.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatPrice(auction.currentPrice)}
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          auction.status === "active"
                            ? "bg-green-100 text-green-800"
                            : auction.status === "ended"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {auction.status === "active"
                          ? "Active"
                          : auction.status === "ended"
                          ? "Terminée"
                          : "Programmée"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucune enchère récente
              </p>
            )}
          </div>
        </div>

        {/* Utilisateurs récents */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Nouveaux utilisateurs</h2>
          </div>
          <div className="p-6">
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-600">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === "seller"
                            ? "bg-blue-100 text-blue-800"
                            : user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role === "seller"
                          ? "Vendeur"
                          : user.role === "admin"
                          ? "Admin"
                          : "Acheteur"}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucun utilisateur récent
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/users")}
              className="w-full btn-secondary text-left"
            >
              👥 Gérer les utilisateurs
            </button>
            <button
              onClick={() => navigate("/admin/auctions")}
              className="w-full btn-secondary text-left"
            >
              🔨 Gérer les enchères
            </button>
            <button
              onClick={() => navigate("/admin/reports")}
              className="w-full btn-secondary text-left"
            >
              📊 Voir les rapports
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Système</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Serveur</span>
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                En ligne
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Base de données</span>
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Connectée
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Emails</span>
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Actifs
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Support</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Besoin d'aide ? Consultez la documentation ou contactez l'équipe
              technique.
            </p>
            <button className="btn-primary text-sm">
              📞 Contact technique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
