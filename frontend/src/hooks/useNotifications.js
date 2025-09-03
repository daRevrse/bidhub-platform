// frontend/src/hooks/useNotifications.js - VERSION AMÉLIORÉE
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "./useSocket";
import axios from "axios";

export const useNotifications = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configuration axios
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Setup initial et listeners
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      setupSocketListeners();
    }
  }, [user, socket]);

  // Configuration des listeners Socket.io
  const setupSocketListeners = useCallback(() => {
    if (!socket) return;

    console.log("🔔 Configuration des listeners pour les notifications");

    const handleNewNotification = (notification) => {
      console.log("🔔 Nouvelle notification reçue dans hook:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleUnreadNotifications = (data) => {
      console.log("🔔 Notifications non lues reçues:", data);
      if (data.notifications) {
        setNotifications(data.notifications);
      }
      if (typeof data.count === "number") {
        setUnreadCount(data.count);
      }
    };

    const handleNotificationRead = ({ notificationId }) => {
      console.log("🔔 Notification marquée comme lue:", notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const handleAllNotificationsRead = () => {
      console.log("🔔 Toutes les notifications marquées comme lues");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    };

    const handleSystemNotification = (notification) => {
      console.log("🔔 Notification système reçue:", notification);
      // Les notifications système peuvent être affichées différemment
    };

    const handleNotificationDeleted = ({ notificationId }) => {
      console.log("🔔 Notification supprimée:", notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      // Recalculer le count non lu
      setUnreadCount((prev) => {
        const deletedNotification = notifications.find(
          (n) => n.id === notificationId
        );
        return deletedNotification && !deletedNotification.isRead
          ? Math.max(0, prev - 1)
          : prev;
      });
    };

    // Attacher les listeners
    socket.on("new_notification", handleNewNotification);
    socket.on("unread_notifications", handleUnreadNotifications);
    socket.on("notification_marked_read", handleNotificationRead);
    socket.on("all_notifications_marked_read", handleAllNotificationsRead);
    socket.on("system_notification", handleSystemNotification);
    socket.on("notification_deleted", handleNotificationDeleted);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("unread_notifications", handleUnreadNotifications);
      socket.off("notification_marked_read", handleNotificationRead);
      socket.off("all_notifications_marked_read", handleAllNotificationsRead);
      socket.off("system_notification", handleSystemNotification);
      socket.off("notification_deleted", handleNotificationDeleted);
    };
  }, [socket, notifications]);

  // Fonctions API
  const fetchNotifications = async (options = {}) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        page: 1,
        limit: 50,
        unreadOnly: false,
        ...options,
      };

      const response = await api.get("/api/notifications", { params });

      const notificationsData = response.data.notifications || [];

      if (options.page === 1 || !options.page) {
        setNotifications(notificationsData);
      } else {
        // Pagination : ajouter à la liste existante
        setNotifications((prev) => [...prev, ...notificationsData]);
      }

      // Mettre à jour le count depuis la réponse si disponible
      if (typeof response.data.unreadCount === "number") {
        setUnreadCount(response.data.unreadCount);
      }

      return response.data;
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
      setError("Erreur lors du chargement des notifications");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await api.get("/api/notifications/unread-count");
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Erreur comptage notifications:", error);
      setError("Erreur lors du comptage des notifications");
    }
  };

  const markAsRead = async (notificationId) => {
    if (!notificationId) return;

    try {
      setError(null);

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // API call
      await api.delete(`/api/notifications/${notificationId}`);
    } catch (error) {
      console.error("Erreur suppression notification:", error);
      setError("Erreur lors de la suppression de la notification");

      // Revert optimistic update
      await fetchNotifications();
      await fetchUnreadCount();

      throw error;
    }
  };

  const deleteAllReadNotifications = async () => {
    try {
      setError(null);

      // Optimistic update - garder seulement les non lues
      setNotifications((prev) => prev.filter((n) => !n.isRead));

      // API call
      await api.delete("/api/notifications");
    } catch (error) {
      console.error("Erreur suppression notifications lues:", error);
      setError("Erreur lors de la suppression des notifications lues");

      // Revert optimistic update
      await fetchNotifications();

      throw error;
    }
  };

  const getNotificationsByType = useCallback(
    (type) => {
      return notifications.filter((n) => n.type === type);
    },
    [notifications]
  );

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((n) => !n.isRead);
  }, [notifications]);

  const getNotificationsByPriority = useCallback(
    (priority) => {
      return notifications.filter((n) => n.priority === priority);
    },
    [notifications]
  );

  const getRecentNotifications = useCallback(
    (hours = 24) => {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - hours);

      return notifications.filter((n) => new Date(n.createdAt) > cutoff);
    },
    [notifications]
  );

  // Fonctions avancées
  const updateNotificationSettings = async (settings) => {
    try {
      setError(null);
      const response = await api.put("/api/notifications/settings", settings);
      return response.data.settings;
    } catch (error) {
      console.error("Erreur mise à jour paramètres notifications:", error);
      setError("Erreur lors de la mise à jour des paramètres");
      throw error;
    }
  };

  const getNotificationSettings = async () => {
    try {
      setError(null);
      const response = await api.get("/api/notifications/settings");
      return response.data.settings;
    } catch (error) {
      console.error("Erreur récupération paramètres notifications:", error);
      setError("Erreur lors de la récupération des paramètres");
      throw error;
    }
  };

  const getNotificationStats = async () => {
    try {
      setError(null);
      const response = await api.get("/api/notifications/stats");
      return response.data;
    } catch (error) {
      console.error("Erreur récupération stats notifications:", error);
      setError("Erreur lors de la récupération des statistiques");
      throw error;
    }
  };

  const createTestNotification = async (notificationData) => {
    try {
      setError(null);
      const response = await api.post(
        "/api/notifications/test",
        notificationData
      );

      // Actualiser les notifications
      await fetchNotifications();

      return response.data.notification;
    } catch (error) {
      console.error("Erreur création notification test:", error);
      setError("Erreur lors de la création de la notification test");
      throw error;
    }
  };

  // Fonctions utilitaires
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

  const formatNotificationTime = (dateString) => {
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

  const groupNotificationsByDate = () => {
    const grouped = {};

    notifications.forEach((notification) => {
      const date = new Date(notification.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey;
      if (date.toDateString() === today.toDateString()) {
        dateKey = "Aujourd'hui";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = "Hier";
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        dateKey = date.toLocaleDateString("fr-FR", { weekday: "long" });
      } else {
        dateKey = date.toLocaleDateString("fr-FR");
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(notification);
    });

    return grouped;
  };

  const clearError = () => {
    setError(null);
  };

  const refreshData = async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  };

  // Fonction pour filtrer les notifications
  const filterNotifications = (filters = {}) => {
    let filtered = [...notifications];

    if (filters.type) {
      filtered = filtered.filter((n) => n.type === filters.type);
    }

    if (filters.priority) {
      filtered = filtered.filter((n) => n.priority === filters.priority);
    }

    if (filters.isRead !== undefined) {
      filtered = filtered.filter((n) => n.isRead === filters.isRead);
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter((n) => {
        const date = new Date(n.createdAt);
        return date >= start && date <= end;
      });
    }

    return filtered;
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      setError(null);

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);

      // API call
      await api.put("/api/notifications/mark-all-read");

      // Émettre via socket si disponible
      if (socket) {
        socket.emit("mark_all_notifications_read");
      }
    } catch (error) {
      console.error("Erreur marquage toutes notifications:", error);
      setError("Erreur lors du marquage des notifications");

      // Revert optimistic update
      await fetchNotifications();
      await fetchUnreadCount();

      throw error;
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!notificationId) return;

    try {
      setError(null);

      // Optimistic update
      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // API call
      await api.put(`/api/notifications/${notificationId}/read`);

      // Émettre via socket si disponible
      if (socket) {
        socket.emit("mark_notification_read", notificationId);
      }
    } catch (error) {
      console.error("Erreur marquage notification:", error);
      setError("Erreur lors du marquage de la notification");

      // Revert optimistic update
      await fetchNotifications();
      await fetchUnreadCount();

      throw error;
    }
  };

  return {
    // États
    notifications,
    unreadCount,
    loading,
    error,

    // Fonctions principales
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllReadNotifications,

    // Fonctions de récupération par type
    getNotificationsByType,
    getUnreadNotifications,
    getNotificationsByPriority,
    getRecentNotifications,

    // Fonctions avancées
    updateNotificationSettings,
    getNotificationSettings,
    getNotificationStats,
    createTestNotification,

    // Fonctions utilitaires
    getNotificationIcon,
    formatNotificationTime,
    groupNotificationsByDate,
    filterNotifications,
    clearError,
    refreshData,
    refreshUnreadCount: fetchUnreadCount,
  };
};
