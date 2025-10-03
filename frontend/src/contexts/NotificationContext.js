// frontend/src/contexts/NotificationContext.js - VERSION CORRIGÉE
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useSocket } from "../hooks/useSocket";
import { toast } from "react-hot-toast";
import axios from "axios";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications doit être utilisé dans NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Charger les notifications initiales
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  // Configuration axios
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  });

  // Intercepteur pour ajouter le token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Authentifier le socket pour les notifications
  // useEffect(() => {
  //   if (socket && user) {
  //     console.log("🔔 Authenticating socket for notifications...");
  //     socket.emit("authenticate", { userId: user.id });
  //   }
  // }, [socket, user]);

  // useEffect(() => {
  //   if (socket?.notifications && user) {
  //     console.log("🔔 Authenticating notification socket...");
  //     socket.notifications.emit("authenticate", { userId: user.id });
  //   }
  // }, [socket, user]);

  useEffect(() => {
    if (socket && user) {
      console.log("🔔 Authentification socket notifications...");

      // IMPORTANT: Authentifier immédiatement
      socket.emit("authenticate", { userId: user.id });

      // Demander le count initial
      socket.emit("get_unread_count");
    }
  }, [socket, user]);

  // Écouter les notifications en temps réel
  // useEffect(() => {
  //   // if (!socket) return;
  //   if (!socket?.notifications) return;

  //   const notificationSocket = socket.notifications;

  //   console.log("🔔 Setting up notification listeners...");

  //   // Nouvelle notification reçue
  //   const handleNewNotification = (notification) => {
  //     console.log("🔔 New notification received:", notification);
  //     setNotifications((prev) => [notification, ...prev]);
  //     setUnreadCount((prev) => prev + 1);

  //     // Toast notification avec type approprié
  //     const toastOptions = {
  //       duration: 5000,
  //       position: "top-right",
  //     };

  //     switch (notification.priority) {
  //       case "urgent":
  //         toast.error(notification.title, {
  //           ...toastOptions,
  //           description: notification.message,
  //           duration: 8000,
  //         });
  //         break;
  //       case "high":
  //         toast.success(notification.title, {
  //           ...toastOptions,
  //           description: notification.message,
  //           duration: 6000,
  //         });
  //         break;
  //       default:
  //         toast(notification.title, {
  //           ...toastOptions,
  //           description: notification.message,
  //           icon: getNotificationIcon(notification.type),
  //         });
  //     }
  //   };

  //   // Notifications non lues à la connexion
  //   const handleUnreadNotifications = (data) => {
  //     console.log("🔔 Unread notifications received:", data);
  //     setNotifications(data.notifications || []);
  //     setUnreadCount(data.count || 0);
  //   };

  //   // Notification marquée comme lue
  //   const handleNotificationRead = ({ notificationId }) => {
  //     console.log("🔔 Notification marked as read:", notificationId);
  //     setNotifications((prev) =>
  //       prev.map((n) =>
  //         n.id === notificationId
  //           ? { ...n, isRead: true, readAt: new Date() }
  //           : n
  //       )
  //     );
  //     setUnreadCount((prev) => Math.max(0, prev - 1));
  //   };

  //   // Toutes marquées comme lues
  //   const handleAllNotificationsRead = () => {
  //     console.log("🔔 All notifications marked as read");
  //     setNotifications((prev) =>
  //       prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
  //     );
  //     setUnreadCount(0);
  //   };

  //   // Notification système
  //   const handleSystemNotification = (notification) => {
  //     console.log("🔔 System notification received:", notification);
  //     toast.info(notification.title, {
  //       description: notification.message,
  //       duration: 8000,
  //       position: "top-center",
  //       icon: "🔔",
  //     });
  //   };

  //   // Notification de salle (enchères, etc.)
  //   const handleRoomNotification = (notification) => {
  //     console.log("🔔 Room notification received:", notification);
  //     toast.info(notification.title, {
  //       description: notification.message,
  //       duration: 4000,
  //     });
  //   };

  //   // Attacher les listeners
  //   // socket.on("new_notification", handleNewNotification);
  //   // socket.on("unread_notifications", handleUnreadNotifications);
  //   // socket.on("notification_marked_read", handleNotificationRead);
  //   // socket.on("all_notifications_marked_read", handleAllNotificationsRead);
  //   // socket.on("system_notification", handleSystemNotification);
  //   // socket.on("room_notification", handleRoomNotification);

  //   notificationSocket.on("new_notification", handleNewNotification);
  //   notificationSocket.on("unread_notifications", handleUnreadNotifications);
  //   notificationSocket.on("notification_marked_read", handleNotificationRead);
  //   notificationSocket.on(
  //     "all_notifications_marked_read",
  //     handleAllNotificationsRead
  //   );
  //   notificationSocket.on("system_notification", handleSystemNotification);
  //   notificationSocket.on("room_notification", handleRoomNotification);

  //   // Cleanup
  //   return () => {
  //     console.log("🔔 Cleaning up notification listeners...");
  //     // socket.off("new_notification", handleNewNotification);
  //     // socket.off("unread_notifications", handleUnreadNotifications);
  //     // socket.off("notification_marked_read", handleNotificationRead);
  //     // socket.off("all_notifications_marked_read", handleAllNotificationsRead);
  //     // socket.off("system_notification", handleSystemNotification);
  //     // socket.off("room_notification", handleRoomNotification);

  //     notificationSocket.off("new_notification", handleNewNotification);
  //     notificationSocket.off("unread_notifications", handleUnreadNotifications);
  //     notificationSocket.off(
  //       "notification_marked_read",
  //       handleNotificationRead
  //     );
  //     notificationSocket.off(
  //       "all_notifications_marked_read",
  //       handleAllNotificationsRead
  //     );
  //     notificationSocket.off("system_notification", handleSystemNotification);
  //     notificationSocket.off("room_notification", handleRoomNotification);
  //   };
  // }, [socket]);

  useEffect(() => {
    if (!socket || !user) return;

    console.log("🔔 Configuration listeners notifications");

    // Handler pour le count mis à jour
    const handleUnreadCount = (data) => {
      console.log("🔔 Unread count reçu:", data);
      setUnreadCount(data.count || 0);
    };

    const handleNewNotification = (notification) => {
      console.log("🔔 Nouvelle notification reçue:", notification);

      // NE PAS AJOUTER SI C'EST UNE NOTIF DE MESSAGE
      if (notification.type === "new_message") {
        console.log("🔔 Ignorée (notification de message)");
        return;
      }

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Toast selon priorité
      const toastOptions = {
        duration: 5000,
        position: "top-right",
      };

      switch (notification.priority) {
        case "urgent":
          toast.error(notification.title, {
            ...toastOptions,
            description: notification.message,
            duration: 8000,
          });
          break;
        case "high":
          toast.success(notification.title, {
            ...toastOptions,
            description: notification.message,
            duration: 6000,
          });
          break;
        default:
          toast(notification.title, {
            ...toastOptions,
            description: notification.message,
            icon: getNotificationIcon(notification.type),
          });
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
      console.log("🔔 Toutes marquées comme lues");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    };

    // ATTACHER LES LISTENERS
    socket.on("new_notification", handleNewNotification);
    socket.on("unread_count", handleUnreadCount);
    socket.on("notification_marked_read", handleNotificationRead);
    socket.on("all_notifications_marked_read", handleAllNotificationsRead);

    // CLEANUP
    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("unread_count", handleUnreadCount);
      socket.off("notification_marked_read", handleNotificationRead);
      socket.off("all_notifications_marked_read", handleAllNotificationsRead);
    };
  }, [socket, user]);

  // Fonctions utilitaires
  const getNotificationIcon = (type) => {
    const icons = {
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
    return icons[type] || "🔔";
  };

  // API calls
  // const fetchNotifications = async (page = 1, limit = 20) => {
  //   if (!user) return;

  //   setLoading(true);
  //   try {
  //     const response = await api.get(
  //       `/api/notifications?page=${page}&limit=${limit}`
  //     );
  //     if (page === 1) {
  //       setNotifications(response.data.notifications);
  //     } else {
  //       setNotifications((prev) => [...prev, ...response.data.notifications]);
  //     }
  //     return response.data;
  //   } catch (error) {
  //     console.error("Erreur chargement notifications:", error);
  //     toast.error("Erreur lors du chargement des notifications");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // ✅ Fetch SANS les notifications de messages
      const response = await api.get("/api/notifications", {
        params: {
          page: 1,
          limit: 50,
          // Ne pas spécifier de type = récupère tout SAUF new_message (géré backend)
        },
      });

      const notificationsData = response.data.notifications || [];

      // ✅ DOUBLE VÉRIFICATION: Filtrer côté client aussi
      const filteredNotifications = notificationsData.filter(
        (n) => n.type !== "new_message"
      );

      setNotifications(filteredNotifications);

      if (typeof response.data.unreadCount === "number") {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // const fetchUnreadCount = async () => {
  //   if (!user) return;

  //   try {
  //     const response = await api.get("/api/notifications/unread-count");
  //     setUnreadCount(response.data.unreadCount);
  //   } catch (error) {
  //     console.error("Erreur comptage notifications:", error);
  //   }
  // };

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await api.get("/api/notifications/unread-count");
      // Ce endpoint exclut déjà les messages (vérifié dans corrections précédentes)
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Erreur comptage notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!socket) return;

    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Envoyer via socket
      socket.emit("mark_notification_read", notificationId);

      // API call comme backup
      await api.put(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error("Erreur marquage notification:", error);
      toast.error("Erreur lors du marquage de la notification");
      // Revert optimistic update
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const markAllAsRead = async () => {
    if (!socket) return;

    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);

      // Envoyer via socket
      socket.emit("mark_all_notifications_read");

      // API call comme backup
      await api.put("/api/notifications/mark-all-read");
    } catch (error) {
      console.error("Erreur marquage toutes notifications:", error);
      toast.error("Erreur lors du marquage des notifications");
      // Revert optimistic update
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      await api.delete(`/api/notifications/${notificationId}`);
      toast.success("Notification supprimée");
    } catch (error) {
      console.error("Erreur suppression notification:", error);
      toast.error("Erreur lors de la suppression");
      // Revert optimistic update
      fetchNotifications();
    }
  };

  const getNotificationsByType = (type) => {
    return notifications.filter((n) => n.type === type);
  };

  const getUnreadNotifications = () => {
    return notifications.filter((n) => !n.isRead);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    refreshUnreadCount: fetchUnreadCount,
    getNotificationsByType,
    getUnreadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
