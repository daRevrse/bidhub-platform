import React, { useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [filter, setFilter] = useState("all"); // all, unread, read

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Redirection si URL d'action définie
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "bid_placed":
        return "💰";
      case "auction_won":
        return "🏆";
      case "auction_lost":
        return "😔";
      case "auction_ending":
        return "⏰";
      case "message_received":
        return "💬";
      case "payment_received":
        return "💳";
      case "review_received":
        return "⭐";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex space-x-4 mb-6">
        {["all", "unread", "read"].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg ${
              filter === filterType
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {filterType === "all" && "Toutes"}
            {filterType === "unread" && `Non lues (${unreadCount})`}
            {filterType === "read" && "Lues"}
          </button>
        ))}
      </div>

      {/* Liste des notifications */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                !notification.isRead
                  ? "bg-blue-50 border-blue-200"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start space-x-4">
                <span className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </span>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>

                  {!notification.isRead && (
                    <div className="mt-2">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {filter === "unread"
                ? "Aucune notification non lue"
                : "Aucune notification"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
