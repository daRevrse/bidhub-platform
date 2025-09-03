// frontend/src/components/notifications/NotificationDropdown.js - VERSION AMÉLIORÉE
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import {
  BellIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellSolidIcon } from "@heroicons/react/24/solid";

const NotificationDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } =
    useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      // Marquer comme lu si pas encore lu
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      // Fermer le dropdown
      setIsOpen(false);

      // Redirection si URL d'action définie
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
    } catch (error) {
      console.error("Erreur lors du clic sur notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setLoadingAction(true);
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Erreur marquage toutes notifications:", error);
    } finally {
      setLoadingAction(false);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      bid_placed: "🔨",
      auction_won: "🏆",
      auction_lost: "😔",
      auction_ending: "⏰",
      payment_received: "💰",
      payment_required: "💳",
      message_received: "💬",
      review_received: "⭐",
      product_approved: "✅",
      product_rejected: "❌",
      system: "🔔",
    };
    return iconMap[type] || "🔔";
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      urgent: "border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20",
      high: "border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20",
      medium: "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20",
      low: "border-l-4 border-gray-500 bg-gray-50 dark:bg-gray-900/20",
    };
    return colorMap[priority] || colorMap.medium;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return date.toLocaleDateString("fr-FR");
  };

  // Limiter à 10 notifications pour le dropdown
  const displayNotifications = notifications.slice(0, 10);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Notifications ${
          unreadCount > 0 ? `(${unreadCount} non lues)` : ""
        }`}
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="w-6 h-6 text-blue-600 animate-pulse" />
        ) : (
          <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
        )}

        {/* Badge de notifications non lues */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center animate-bounce">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown des notifications */}
      {isOpen && (
        <>
          <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-50 max-h-[32rem] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BellIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                      {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={loadingAction}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50 transition-colors"
                    >
                      {loadingAction ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircleIcon className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des notifications */}
            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chargement...
                  </p>
                </div>
              ) : displayNotifications.length > 0 ? (
                displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-50 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group ${
                      !notification.isRead
                        ? getPriorityColor(notification.priority)
                        : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icône de notification avec animation */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {notification.title}
                          </h4>
                          <div className="flex flex-col items-end ml-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {notification.priority === "urgent" && (
                              <ClockIcon className="w-3 h-3 text-red-500 mt-1" />
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                          {notification.message}
                        </p>

                        {/* Indicateurs de statut */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                                <span className="text-xs text-blue-600 font-medium">
                                  Nouveau
                                </span>
                              </div>
                            )}
                          </div>

                          {notification.actionUrl && (
                            <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              Cliquer pour voir →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BellIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Aucune notification
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vos notifications apparaîtront ici
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full py-3 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                >
                  <BellIcon className="w-4 h-4 mr-2" />
                  Voir toutes les notifications
                  {notifications.length > 10 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      +{notifications.length - 10}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/5 dark:bg-black/20"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
