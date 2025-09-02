import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Charger les notifications
  const fetchNotifications = async (options = {}) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await axios.get("/api/notifications", {
        params: {
          page: 1,
          limit: 10,
          unreadOnly: false,
          ...options,
        },
      });

      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Marquer comme lu
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);

      // Mettre à jour localement
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur marquage notification:", error);
    }
  };

  // Marquer toutes comme lues
  const markAllAsRead = async () => {
    try {
      await axios.put("/api/notifications/mark-all-read");

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur marquage toutes notifications:", error);
    }
  };

  // Auto-refresh périodique
  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Actualiser toutes les 30 secondes
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
