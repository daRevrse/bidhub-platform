import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import VerificationManagement from "../../components/admin/VerificationManagement";
import {
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentAuctions, setRecentAuctions] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
      const [statsRes, auctionsRes, usersRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/stats"),
        axios.get("http://localhost:5000/api/admin/recent-auctions"),
        axios.get("http://localhost:5000/api/admin/recent-users"),
      ]);

      setStats(statsRes.data);
      setRecentAuctions(auctionsRes.data || []);
      setRecentUsers(usersRes.data || []);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-24 w-24 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg mb-8">
            <ShieldCheckIcon className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Accès restreint
          </h2>
          <p className="text-gray-600 mb-8">
            Cette zone est réservée aux administrateurs de BidHub.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Administration BidHub
        </h1>
        <p className="text-gray-600">
          Tableau de bord et gestion de la plateforme
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { key: "overview", label: "Vue d'ensemble", icon: ChartBarIcon },
            {
              key: "verifications",
              label: "Vérifications",
              icon: CheckBadgeIcon,
              badge: stats.users?.pendingVerifications,
            },
            { key: "users", label: "Utilisateurs", icon: UsersIcon },
            { key: "system", label: "Système", icon: Cog6ToothIcon },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Utilisateurs totaux
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.users?.total || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +{stats.users?.newThisMonth || 0} ce mois
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <UsersIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Enchères actives
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.auctions?.active || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.auctions?.total || 0} au total
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <ShoppingBagIcon className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Volume total
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.finance?.totalVolume
                      ? formatPrice(stats.finance.totalVolume).split(" ")[0]
                      : "0"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">FCFA</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <CurrencyDollarIcon className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Vérifications
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.users?.verified || 0}
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    {stats.users?.pendingVerifications || 0} en attente
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <CheckBadgeIcon className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Alertes et notifications */}
          {stats.users?.pendingVerifications > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <BellIcon className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-orange-900 mb-1">
                    Demandes de vérification en attente
                  </h3>
                  <p className="text-orange-800 mb-4">
                    {stats.users.pendingVerifications} utilisateur(s) demandent
                    la vérification de leur compte.
                  </p>
                  <button
                    onClick={() => setActiveTab("verifications")}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <CheckBadgeIcon className="w-4 h-4 mr-2" />
                    Traiter les demandes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Grille des sections */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Enchères récentes */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Enchères récentes
                </h2>
                <Link
                  to="/admin/auctions"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir tout →
                </Link>
              </div>

              {recentAuctions.length > 0 ? (
                <div className="space-y-4">
                  {recentAuctions.slice(0, 5).map((auction) => (
                    <div
                      key={auction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {auction.product?.images?.[0] ? (
                          <img
                            src={auction.product.images[0]}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900 line-clamp-1">
                            {auction.product?.title || "Produit supprimé"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {auction.product?.seller?.firstName}{" "}
                            {auction.product?.seller?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
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
                <div className="text-center py-8">
                  <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune enchère récente</p>
                </div>
              )}
            </div>

            {/* Nouveaux utilisateurs */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Nouveaux utilisateurs
                </h2>
                <button
                  onClick={() => setActiveTab("users")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Gérer →
                </button>
              </div>

              {recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {recentUsers.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </span>
                          </div>
                        )}
                        <div>
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
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun utilisateur récent</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => setActiveTab("users")}
              className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Gérer les utilisateurs
              </h3>
              <p className="text-sm text-gray-600">
                Voir, modifier et gérer tous les comptes utilisateurs
              </p>
            </button>

            <button
              onClick={() => setActiveTab("verifications")}
              className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                  <CheckBadgeIcon className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Vérifications
              </h3>
              <p className="text-sm text-gray-600">
                Approuver ou rejeter les demandes de vérification
              </p>
              {stats.users?.pendingVerifications > 0 && (
                <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                  {stats.users.pendingVerifications} en attente
                </span>
              )}
            </button>

            <Link
              to="/admin/auctions"
              className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-left group block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition-colors">
                  <ShoppingBagIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-2xl">🔨</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Gérer les enchères
              </h3>
              <p className="text-sm text-gray-600">
                Superviser toutes les enchères et produits
              </p>
            </Link>

            <Link
              to="/admin/reports"
              className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-left group block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Rapports</h3>
              <p className="text-sm text-gray-600">
                Consulter les statistiques et analyses détaillées
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* Onglet Vérifications */}
      {activeTab === "verifications" && <VerificationManagement />}

      {/* Onglet Utilisateurs */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Gestion des utilisateurs
            </h3>
            <p className="text-gray-600 mb-6">
              Cette section sera bientôt disponible avec la liste complète des
              utilisateurs.
            </p>
            <button className="btn-primary">Voir tous les utilisateurs</button>
          </div>
        </div>
      )}

      {/* Onglet Système */}
      {activeTab === "system" && (
        <div className="space-y-6">
          {/* État du système */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              État du système
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Serveur
                    </p>
                    <p className="text-lg font-semibold text-green-900">
                      En ligne
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Base de données
                    </p>
                    <p className="text-lg font-semibold text-green-900">
                      Connectée
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Emails</p>
                    <p className="text-lg font-semibold text-green-900">
                      Opérationnels
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions système */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Actions système
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button className="p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Logs système</h4>
                    <p className="text-sm text-gray-600">
                      Consulter les journaux d'activité
                    </p>
                  </div>
                </div>
              </button>

              <button className="p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ChartBarIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Performances</h4>
                    <p className="text-sm text-gray-600">
                      Monitorer les métriques
                    </p>
                  </div>
                </div>
              </button>

              <button className="p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Cog6ToothIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Configuration</h4>
                    <p className="text-sm text-gray-600">
                      Paramètres de la plateforme
                    </p>
                  </div>
                </div>
              </button>

              <button className="p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Maintenance</h4>
                    <p className="text-sm text-gray-600">
                      Mode maintenance et sauvegardes
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
