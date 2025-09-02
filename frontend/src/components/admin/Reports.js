import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  TrendingDownIcon,
  DocumentTextIcon,
  CalendarIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  ArrowTrendingUpIconIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30d");
  const [analytics, setAnalytics] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [topAuctions, setTopAuctions] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [
        analyticsRes,
        revenueRes,
        usersRes,
        categoriesRes,
        topUsersRes,
        topAuctionsRes,
      ] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/admin/analytics?period=${dateRange}`
        ),
        axios.get(
          `http://localhost:5000/api/admin/revenue-chart?period=${dateRange}`
        ),
        axios.get(
          `http://localhost:5000/api/admin/users-chart?period=${dateRange}`
        ),
        axios.get(`http://localhost:5000/api/admin/categories-stats`),
        axios.get(`http://localhost:5000/api/admin/top-users`),
        axios.get(`http://localhost:5000/api/admin/top-auctions`),
      ]);

      setAnalytics(analyticsRes.data);
      setRevenueData(revenueRes.data);
      setUsersData(usersRes.data);
      setCategoriesData(categoriesRes.data);
      setTopUsers(topUsersRes.data);
      setTopAuctions(topAuctionsRes.data);
    } catch (error) {
      console.error("Erreur chargement analytics:", error);
      // Données de fallback pour le développement
      setAnalytics({
        totalRevenue: 1250000,
        totalCommissions: 125000,
        totalUsers: 1247,
        activeUsers: 892,
        totalAuctions: 3456,
        activeAuctions: 234,
        completedAuctions: 2987,
        averageAuctionValue: 15600,
        conversionRate: 12.5,
        revenueGrowth: 15.2,
        usersGrowth: 8.7,
        auctionsGrowth: 22.1,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rapports et analyses
            </h1>
            <p className="text-gray-600">
              Analytics et statistiques détaillées de la plateforme
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">1 an</option>
            </select>
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { key: "overview", label: "Vue d'ensemble", icon: ChartBarIcon },
            { key: "revenue", label: "Revenus", icon: CurrencyDollarIcon },
            { key: "users", label: "Utilisateurs", icon: UsersIcon },
            { key: "auctions", label: "Enchères", icon: ShoppingBagIcon },
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
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* KPIs principaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Revenus totaux
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(analytics.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      {formatPercentage(analytics.revenueGrowth)}
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Utilisateurs actifs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.activeUsers?.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600">
                      {formatPercentage(analytics.usersGrowth)}
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Enchères actives
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.activeAuctions?.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600">
                      {formatPercentage(analytics.auctionsGrowth)}
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Valeur moy. enchère
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(analytics.averageAuctionValue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-yellow-600">+5.2%</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Évolution des revenus */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Évolution des revenus
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatPrice(value)} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Répartition par catégories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Enchères par catégorie
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top utilisateurs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top utilisateurs (volume)
              </h3>
              <div className="space-y-4">
                {topUsers.slice(0, 5).map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium text-white ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-400"
                              : index === 2
                              ? "bg-orange-500"
                              : "bg-blue-500"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(user.totalVolume || 0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.auctionsCount || 0} enchères
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top enchères */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Enchères les plus performantes
              </h3>
              <div className="space-y-4">
                {topAuctions.slice(0, 5).map((auction, index) => (
                  <div
                    key={auction.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium text-white ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-400"
                              : index === 2
                              ? "bg-orange-500"
                              : "bg-blue-500"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {auction.product?.title || "Produit supprimé"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {auction.bidsCount || 0} offres
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(auction.currentPrice)}
                      </p>
                      <p
                        className={`text-sm ${
                          auction.status === "active"
                            ? "text-green-600"
                            : auction.status === "ended"
                            ? "text-gray-600"
                            : "text-blue-600"
                        }`}
                      >
                        {auction.status === "active"
                          ? "En cours"
                          : auction.status === "ended"
                          ? "Terminée"
                          : "Programmée"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "revenue" && (
        <div className="space-y-8">
          {/* KPIs revenus */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Revenus totaux
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(analytics.totalRevenue)}
                  </p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Commissions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(analytics.totalCommissions)}
                  </p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Taux de conversion
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.conversionRate}%
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Graphique détaillé des revenus */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Évolution détaillée des revenus
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(value)} />
                <Bar dataKey="revenue" fill="#3B82F6" />
                <Bar dataKey="commissions" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-8">
          {/* KPIs utilisateurs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total utilisateurs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalUsers?.toLocaleString()}
                  </p>
                </div>
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Utilisateurs actifs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.activeUsers?.toLocaleString()}
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Nouveaux (30j)
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.newUsers?.toLocaleString() || "125"}
                  </p>
                </div>
                <UsersIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Taux de rétention
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.retentionRate || "78.2"}%
                  </p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Graphique évolution utilisateurs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Évolution des inscriptions
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={usersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "auctions" && (
        <div className="space-y-8">
          {/* KPIs enchères */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total enchères
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalAuctions?.toLocaleString()}
                  </p>
                </div>
                <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Enchères actives
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.activeAuctions?.toLocaleString()}
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Enchères complétées
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.completedAuctions?.toLocaleString()}
                  </p>
                </div>
                <CheckIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Valeur moyenne
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(analytics.averageAuctionValue)}
                  </p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Répartition par catégories */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Répartition par catégories
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-4">
                {categoriesData.map((category, index) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {category.value}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(
                          (category.value /
                            categoriesData.reduce(
                              (sum, cat) => sum + cat.value,
                              0
                            )) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
