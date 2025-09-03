// frontend/src/hooks/useSocket.js - VERSION CORRIGÉE
import { useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    // Créer la connexion socket uniquement si l'utilisateur est connecté
    if (user && !socketRef.current) {
      console.log("🔌 Initializing socket connection...");

      socketRef.current = io(
        process.env.REACT_APP_API_URL || "http://localhost:5000",
        {
          autoConnect: true,
          transports: ["websocket", "polling"],
          upgrade: true,
          rememberUpgrade: true,
        }
      );

      // Authentifier automatiquement avec le token
      const token = localStorage.getItem("token");
      if (token) {
        // Authentification pour les messages
        socketRef.current.emit("authenticate", token);

        // Authentification pour les notifications (format différent)
        socketRef.current.emit("authenticate", { userId: user.id });
      }

      // Événements de connexion
      socketRef.current.on("connect", () => {
        console.log("🔌 Socket connected:", socketRef.current.id);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected:", reason);
      });

      socketRef.current.on("reconnect", (attemptNumber) => {
        console.log("🔌 Socket reconnected after", attemptNumber, "attempts");

        // Ré-authentifier après reconnexion
        // const token = localStorage.getItem("token");
        if (token && user) {
          socketRef.current.emit("authenticate", token);
          socketRef.current.emit("authenticate", { userId: user.id });
        }
      });

      // Gérer les erreurs d'authentification
      socketRef.current.on("auth_error", (error) => {
        console.error("🔌 Socket auth error:", error);
      });

      socketRef.current.on("authenticated", (data) => {
        console.log("✅ Socket authenticated successfully:", data);
      });

      // Gérer les erreurs de connexion
      socketRef.current.on("connect_error", (error) => {
        console.error("🔌 Socket connection error:", error);
      });

      console.log("🔌 Socket initialized for user:", user.email);
    }

    // Cleanup lors du changement d'utilisateur ou démontage
    return () => {
      if (socketRef.current && !user) {
        console.log("🔌 Cleaning up socket connection...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  // Cleanup lors du démontage complet
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log("🔌 Disconnecting socket on unmount");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return socketRef.current;
};
