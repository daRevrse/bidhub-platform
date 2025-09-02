import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useSocket } from "../hooks/useSocket";
import { toast } from "react-hot-toast";

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

  // Authentifier le socket pour les notifications
  useEffect(() => {
    if (socket && user) {
      socket.emit("authenticate", { userId: user.id });
    }
  }, [socket, user]);

  // Écouter les notifications en temps réel
  useEffect(() => {
    if (!socket) return;

    // Nouvelle notification reçue
    socket.on("new_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Toast notification
      toast.success(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    });

    // Notifications non lues à la connexion
    socket.on("unread_notifications", (data) => {
      setNotifications(data.notifications);
      setUnreadCount(data.count);
    });

    // Notification marquée comme lue
    socket.on("notification_marked_read", ({ notificationId }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    // Toutes marquées comme lues
    socket.on("all_notifications_marked_read", () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });

    // Notification système
    socket.on("system_notification", (notification) => {
      toast.info(notification.title, {
        description: notification.message,
        duration: 8000,
      });
    });

    // Cleanup
    return () => {
      socket.off("new_notification");
      socket.off("unread_notifications");
      socket.off("notification_marked_read");
      socket.off("all_notifications_marked_read");
      socket.off("system_notification");
    };
  }, [socket]);

  const markAsRead = (notificationId) => {
    if (socket) {
      socket.emit("mark_notification_read", notificationId);
    }
  };

  const markAllAsRead = () => {
    if (socket) {
      socket.emit("mark_all_notifications_read");
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
