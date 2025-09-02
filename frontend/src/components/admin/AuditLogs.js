import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  ComputerDesktopIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    userId: "",
    action: "",
    entity: "",
    severity: "",
    success: "",
    startDate: "",
    endDate: "",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters.page, filters.limit]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(
        `http://localhost:5000/api/admin/audit-logs?${params}`
      );

      setLogs(response.data.logs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Erreur chargement logs:", error);
      // Données de démonstration en cas d'erreur
      setLogs([
        {
          id: 1,
          userId: 1,
          action: "ADMIN_UPDATE_USER_STATUS",
          entity: "User",
          entityId: 123,
          severity: "high",
          success: true,
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0...",
          createdAt: new Date().toISOString(),
          user: {
            firstName: "Admin",
            lastName: "User",
            email: "admin@bidhub.tg",
          },
          details: { oldStatus: "inactive", newStatus: "active" },
        },
        {
          id: 2,
          userId: 2,
          action: "LOGIN",
          entity: "User",
          entityId: 456,
          severity: "low",
          success: false,
          ipAddress: "192.168.1.2",
          userAgent: "Mozilla/5.0...",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          user: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
          },
          errorMessage: "Mot de passe incorrect",
        },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/audit-stats"
      );
      setStats(response.data);
    } catch (error) {
      console.error("Erreur chargement stats audit:", error);
      setStats({
        totalLogs: 15420,
        criticalLogs: 12,
        failedActions: 89,
        recentActivity: 234,
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const applyFilters = () => {
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      userId: "",
      action: "",
      entity: "",
      severity: "",
      success: "",
      startDate: "",
      endDate: "",
    });
    setTimeout(fetchLogs, 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return styles[severity] || styles.low;
  };

  const getSuccessIcon = (success) => {
    return success ? (
      <CheckCircleIcon className="w-5 h-5 text-green-600" />
    ) : (
      <XCircleIcon className="w-5 h-5 text-red-600" />
    );
  };

  const viewLogDetails = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  if (loading && filters.page === 1) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Journal d'audit
            </h1>
            <p className="text-gray-600">
              Historique des actions effectuées sur la plateforme
            </p>
          </div>
          <button
            onClick={() => fetchLogs()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Actions échouées
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.failedActions}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Activité récente (24h)
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.recentActivity}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
          <button
            onClick={resetFilters}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Réinitialiser
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes</option>
              <option value="LOGIN">Connexion</option>
              <option value="LOGOUT">Déconnexion</option>
              <option value="CREATE">Création</option>
              <option value="UPDATE">Mise à jour</option>
              <option value="DELETE">Suppression</option>
              <option value="ADMIN_UPDATE_USER_STATUS">
                Modif. statut utilisateur
              </option>
              <option value="ADMIN_VERIFY_USER">
                Vérification utilisateur
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entité
            </label>
            <select
              value={filters.entity}
              onChange={(e) => handleFilterChange("entity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes</option>
              <option value="User">Utilisateur</option>
              <option value="Auction">Enchère</option>
              <option value="Product">Produit</option>
              <option value="Payment">Paiement</option>
              <option value="Settings">Paramètres</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gravité
            </label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange("severity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes</option>
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
              <option value="critical">Critique</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filters.success}
              onChange={(e) => handleFilterChange("success", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous</option>
              <option value="true">Succès</option>
              <option value="false">Échec</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date début
            </label>
            <input
              type="datetime-local"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date fin
            </label>
            <input
              type="datetime-local"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={applyFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Appliquer les filtres
          </button>
        </div>
      </div>

      {/* Table des logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gravité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {log.user
                            ? `${log.user.firstName} ${log.user.lastName}`
                            : "Système"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.user?.email || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.action
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.entity}</div>
                    {log.entityId && (
                      <div className="text-sm text-gray-500">
                        ID: {log.entityId}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadge(
                        log.severity
                      )}`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getSuccessIcon(log.success)}
                      <span className="ml-2 text-sm text-gray-900">
                        {log.success ? "Succès" : "Échec"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <ComputerDesktopIcon className="w-4 h-4 mr-1" />
                      {log.ipAddress}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => viewLogDetails(log)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Voir détails"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={filters.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(totalPages, prev.page + 1),
                }))
              }
              disabled={filters.page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{filters.page}</span> sur{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={filters.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.min(totalPages, prev.page + 1),
                    }))
                  }
                  disabled={filters.page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modal détails du log */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Détails du log #{selectedLog.id}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date/Heure
                  </label>
                  <div className="text-sm text-gray-900">
                    {formatDate(selectedLog.createdAt)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Utilisateur
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedLog.user
                      ? `${selectedLog.user.firstName} ${selectedLog.user.lastName} (${selectedLog.user.email})`
                      : "Système"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedLog.action}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entité
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedLog.entity}
                    {selectedLog.entityId && ` (ID: ${selectedLog.entityId})`}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gravité
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadge(
                      selectedLog.severity
                    )}`}
                  >
                    {selectedLog.severity}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <div className="flex items-center">
                    {getSuccessIcon(selectedLog.success)}
                    <span className="ml-2 text-sm text-gray-900">
                      {selectedLog.success ? "Succès" : "Échec"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse IP
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedLog.ipAddress}
                  </div>
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message d'erreur
                  </label>
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {selectedLog.errorMessage}
                  </div>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Agent
                  </label>
                  <div className="text-sm text-gray-900 break-all">
                    {selectedLog.userAgent}
                  </div>
                </div>
              )}

              {selectedLog.details && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Détails
                  </label>
                  <pre className="text-sm text-gray-900 bg-gray-50 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}

              {(selectedLog.oldValues || selectedLog.newValues) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLog.oldValues && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Anciennes valeurs
                      </label>
                      <pre className="text-sm text-gray-900 bg-red-50 p-3 rounded overflow-auto max-h-32">
                        {JSON.stringify(selectedLog.oldValues, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.newValues && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouvelles valeurs
                      </label>
                      <pre className="text-sm text-gray-900 bg-green-50 p-3 rounded overflow-auto max-h-32">
                        {JSON.stringify(selectedLog.newValues, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
// lg shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <DocumentTextIcon className="h-8 w-8 text-blue-600" />
//             </div>
//             <div className="ml-5 w-0 flex-1">
//               <dl>
//                 <dt className="text-sm font-medium text-gray-500 truncate">
//                   Total des logs
//                 </dt>
//                 <dd className="text-lg font-medium text-gray-900">
//                   {stats.totalLogs?.toLocaleString()}
//                 </dd>
//               </dl>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
//             </div>
//             <div className="ml-5 w-0 flex-1">
//               <dl>
//                 <dt className="text-sm font-medium text-gray-500 truncate">
//                   Logs critiques
//                 </dt>
//                 <dd className="text-lg font-medium text-gray-900">
//                   {stats.criticalLogs}
//                 </dd>
//               </dl>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-
