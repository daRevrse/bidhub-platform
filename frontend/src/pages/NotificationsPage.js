// frontend/src/pages/NotificationsPage.js - VERSION AMÉLIORÉE
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import {
  BellIcon,
  CheckCircleIcon,
  TrashIcon,
  FunnelIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellSolidIcon } from "@heroicons/react/24/solid";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllReadNotifications,
    getNotificationIcon,
    formatNotificationTime,
    groupNotificationsByDate,
    filterNotifications,
    clearError,
  } = useNotifications();

  // États locaux
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  // Effets
  useEffect(() => {
    // Nettoyer l'erreur au montage
    clearError();
  }, []);

  // Filtrage des notifications
  const filteredNotifications = filterNotifications({
    type: typeFilter || undefined,
    priority: priorityFilter || undefined,
    isRead: filter === "unread" ? false : filter === "read" ? true : undefined,
  });

  const groupedNotifications = groupNotificationsByDate();

  // Gestionnaires d'événements
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      // Navigation si URL d'action définie
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
    } catch (error) {
      console.error("Erreur lors du clic sur notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setActionLoading(true);
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Erreur marquage toutes notifications:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.size === 0) return;

    setActionLoading(true);
    try {
      await Promise.all(
        Array.from(selectedNotifications).map((id) => deleteNotification(id))
      );
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error("Erreur suppression notifications:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAllRead = async () => {
    const readNotifications = notifications.filter((n) => n.isRead);
    if (readNotifications.length === 0) return;

    setActionLoading(true);
    try {
      await deleteAllReadNotifications();
    } catch (error) {
      console.error("Erreur suppression notifications lues:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      urgent: "border-l-red-500 bg-red-50 dark:bg-red-900/20",
      high: "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20",
      medium: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20",
      low: "border-l-gray-500 bg-gray-50 dark:bg-gray-900/20",
    };
    return colorMap[priority] || colorMap.medium;
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "urgent":
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      case "high":
        return <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />;
      default:
        return <InformationCircleIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  // Types de notifications disponibles
  const notificationTypes = [
    { value: "", label: "Tous les types" },
    { value: "bid_placed", label: "Enchères placées" },
    { value: "auction_won", label: "Enchères gagnées" },
    { value: "auction_lost", label: "Enchères perdues" },
    { value: "auction_ending", label: "Enchères se terminant" },
    { value: "payment_received", label: "Paiements reçus" },
    { value: "payment_required", label: "Paiements requis" },
    { value: "message_received", label: "Messages reçus" },
    { value: "review_received", label: "Avis reçus" },
    { value: "product_approved", label: "Produits approuvés" },
    { value: "product_rejected", label: "Produits rejetés" },
    { value: "system", label: "Notifications système" },
  ];

  const priorityOptions = [
    { value: "", label: "Toutes priorités" },
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "Élevée" },
    { value: "medium", label: "Moyenne" },
    { value: "low", label: "Faible" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BellSolidIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? (
                    <span className="text-blue-600 font-medium">
                      {unreadCount} notification{unreadCount > 1 ? "s" : ""} non
                      lue{unreadCount > 1 ? "s" : ""}
                    </span>
                  ) : (
                    "Toutes les notifications sont lues"
                  )}
                </p>
              </div>
            </div>

            {/* Actions principales */}
            <div className="flex items-center space-x-3">
              {selectedNotifications.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={actionLoading}
                  className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Supprimer ({selectedNotifications.size})
                </button>
              )}

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={actionLoading}
                  className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                  )}
                  Tout marquer comme lu
                </button>
              )}

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filtres
              </button>
            </div>
          </div>

          {/* Affichage de l'erreur */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
                <button
                  onClick={clearError}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtre statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes</option>
                  <option value="unread">Non lues ({unreadCount})</option>
                  <option value="read">Lues</option>
                </select>
              </div>

              {/* Filtre type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {notificationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre priorité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions du filtre */}
              <div className="flex items-end space-x-2">
                <button
                  onClick={() => {
                    setFilter("all");
                    setTypeFilter("");
                    setPriorityFilter("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Réinitialiser
                </button>

                {notifications.filter((n) => n.isRead).length > 0 && (
                  <button
                    onClick={handleDeleteAllRead}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Supprimer lues
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions de sélection */}
        {filteredNotifications.length > 0 && (
          <div className="bg-white rounded-t-xl border border-gray-200 border-b-0 px-6 py-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={
                    selectedNotifications.size ===
                      filteredNotifications.length &&
                    filteredNotifications.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  Sélectionner tout ({filteredNotifications.length})
                </span>
              </label>

              <div className="text-sm text-gray-500">
                {filteredNotifications.length} notification
                {filteredNotifications.length > 1 ? "s" : ""}
              </div>
            </div>
          </div>
        )}

        {/* Liste des notifications */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative hover:bg-gray-50 transition-colors duration-200 ${
                    !notification.isRead
                      ? `border-l-4 ${getPriorityColor(notification.priority)}`
                      : ""
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Checkbox de sélection */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() =>
                          handleSelectNotification(notification.id)
                        }
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />

                      {/* Icône de notification */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center">
                          <span className="text-xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3
                                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() =>
                                  handleNotificationClick(notification)
                                }
                              >
                                {notification.title}
                              </h3>
                              {getPriorityIcon(notification.priority)}
                              {!notification.isRead && (
                                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex items-start space-x-2 ml-4">
                            <span className="text-sm text-gray-500 whitespace-nowrap">
                              {formatNotificationTime(notification.createdAt)}
                            </span>

                            {/* Actions */}
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Marquer comme lu"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Supprimer"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Métadonnées supplémentaires */}
                        {notification.data && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <pre className="text-sm text-gray-600 font-mono">
                              {JSON.stringify(notification.data, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Action URL */}
                        {notification.actionUrl && (
                          <div className="mt-3">
                            <button
                              onClick={() =>
                                handleNotificationClick(notification)
                              }
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Voir les détails →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BellIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === "unread"
                  ? "Aucune notification non lue"
                  : filter === "read"
                  ? "Aucune notification lue"
                  : "Aucune notification"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {filter === "all"
                  ? "Vous n'avez pas encore de notifications. Elles apparaîtront ici lorsque vous en recevrez."
                  : "Aucune notification ne correspond aux filtres sélectionnés."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
