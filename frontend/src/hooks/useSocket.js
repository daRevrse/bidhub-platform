// frontend/src/hooks/useSocket.js - VERSION CORRIGÉE
import { useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const isInitializing = useRef(false);

  useEffect(() => {
    // Éviter la double initialisation
    if (isInitializing.current) return;

    // Créer la connexion socket uniquement si l'utilisateur est connecté
    if (user && !socketRef.current) {
      isInitializing.current = true;
      console.log("🔌 Initializing socket connection for user:", user.email);

      try {
        const baseURL =
          process.env.REACT_APP_API_URL || "http://localhost:5000";

        // CRÉER UNE SEULE CONNEXION SOCKET POUR SIMPLIFIER
        socketRef.current = io(baseURL, {
          autoConnect: true,
          transports: ["websocket", "polling"],
          upgrade: true,
          rememberUpgrade: true,
          timeout: 20000,
          forceNew: true,
        });

        // Événements de connexion
        socketRef.current.on("connect", () => {
          console.log("🔌 Socket connected:", socketRef.current.id);

          // Authentifier après connexion
          const token = localStorage.getItem("token");
          if (token && user) {
            // Double authentification pour compatibilité
            socketRef.current.emit("authenticate", token); // Pour les messages
            socketRef.current.emit("authenticate", { userId: user.id }); // Pour les notifications
          }
        });

        socketRef.current.on("disconnect", (reason) => {
          console.log("🔌 Socket disconnected:", reason);
        });

        socketRef.current.on("reconnect", (attemptNumber) => {
          console.log("🔌 Socket reconnected after", attemptNumber, "attempts");

          // Ré-authentifier après reconnexion
          const token = localStorage.getItem("token");
          if (token && user) {
            socketRef.current.emit("authenticate", token);
            socketRef.current.emit("authenticate", { userId: user.id });
          }
        });

        // Gérer les événements d'authentification
        socketRef.current.on("authenticated", (data) => {
          console.log("✅ Socket authenticated successfully:", data);
        });

        socketRef.current.on("auth_error", (error) => {
          console.error("🔌 Socket auth error:", error);
        });

        // Gérer les erreurs de connexion
        socketRef.current.on("connect_error", (error) => {
          console.error("🔌 Socket connection error:", error);
        });

        // Gérer les erreurs générales
        socketRef.current.on("error", (error) => {
          console.error("🔌 Socket error:", error);
        });

        console.log("🔌 Socket initialized successfully");
      } catch (error) {
        console.error("🔌 Error initializing socket:", error);
        socketRef.current = null;
      } finally {
        isInitializing.current = false;
      }
    }

    // Cleanup si l'utilisateur se déconnecte
    if (!user && socketRef.current) {
      console.log("🔌 User logged out, disconnecting socket");
      socketRef.current.disconnect();
      socketRef.current = null;
      isInitializing.current = false;
    }

    // Cleanup function
    return () => {
      // Ne pas déconnecter si l'utilisateur est toujours connecté
      // (évite les déconnexions inutiles lors des re-renders)
    };
  }, [user]);

  // Cleanup lors du démontage complet du composant
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log("🔌 Component unmounting, disconnecting socket");
        socketRef.current.disconnect();
        socketRef.current = null;
        isInitializing.current = false;
      }
    };
  }, []);

  // Fonction utilitaire pour vérifier si le socket est prêt
  const isSocketReady = () => {
    return (
      socketRef.current &&
      socketRef.current.connected &&
      typeof socketRef.current.emit === "function"
    );
  };

  // Retourner le socket avec des méthodes utilitaires
  return socketRef.current
    ? {
        ...socketRef.current,
        isReady: isSocketReady,
        safeEmit: (event, data) => {
          if (isSocketReady()) {
            socketRef.current.emit(event, data);
            return true;
          } else {
            console.warn(`🔌 Socket not ready for event: ${event}`);
            return false;
          }
        },
        safeOn: (event, handler) => {
          if (socketRef.current && typeof socketRef.current.on === "function") {
            socketRef.current.on(event, handler);
            return true;
          }
          return false;
        },
        safeOff: (event, handler) => {
          if (
            socketRef.current &&
            typeof socketRef.current.off === "function"
          ) {
            socketRef.current.off(event, handler);
            return true;
          }
          return false;
        },
      }
    : null;
};
