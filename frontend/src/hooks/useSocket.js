// frontend/src/hooks/useSocket.js - VERSION COMPLÈTEMENT CORRIGÉE
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

        // CRÉER LA CONNEXION SOCKET
        socketRef.current = io(baseURL, {
          autoConnect: true,
          transports: ["websocket", "polling"],
          upgrade: true,
          rememberUpgrade: true,
          timeout: 5000,
          forceNew: true,
        });

        // Événements de connexion
        socketRef.current.on("connect", () => {
          console.log("🔌 Socket connected:", socketRef.current.id);
          setIsConnected(true);

          // Authentifier après connexion
          const token = localStorage.getItem("token");
          if (token && user) {
            console.log("🔌 Authenticating socket...");
            // Authentification pour les messages (avec token JWT)
            socketRef.current.emit("authenticate", token);
            // Authentification pour les notifications (avec userId)
            socketRef.current.emit("authenticate", { userId: user.id });
          }
        });

        socketRef.current.on("disconnect", (reason) => {
          console.log("🔌 Socket disconnected:", reason);
          setIsConnected(false);
          setIsAuthenticated(false);
        });

        socketRef.current.on("reconnect", (attemptNumber) => {
          console.log("🔌 Socket reconnected after", attemptNumber, "attempts");
          setIsConnected(true);

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
          setIsAuthenticated(true);
        });

        socketRef.current.on("auth_error", (error) => {
          console.error("🔌 Socket auth error:", error);
          setIsAuthenticated(false);
        });

        // Gérer les erreurs
        socketRef.current.on("connect_error", (error) => {
          console.error("🔌 Socket connection error:", error);
          setIsConnected(false);
        });

        socketRef.current.on("error", (error) => {
          console.error("🔌 Socket error:", error);
        });

        console.log("🔌 Socket initialized successfully");
      } catch (error) {
        console.error("🔌 Error initializing socket:", error);
        socketRef.current = null;
        setIsConnected(false);
        setIsAuthenticated(false);
      } finally {
        isInitializing.current = false;
      }
    }

    // Cleanup si l'utilisateur se déconnecte
    if (!user && socketRef.current) {
      console.log("🔌 User logged out, disconnecting socket");
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsAuthenticated(false);
      isInitializing.current = false;
    }
  }, [user]);

  // Cleanup lors du démontage complet du composant
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log("🔌 Component unmounting, disconnecting socket");
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setIsAuthenticated(false);
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

  // RETOURNER DIRECTEMENT LE SOCKET AVEC PROPRIÉTÉS ADDITIONNELLES
  if (!socketRef.current) {
    return null;
  }

  // Ajouter des propriétés utilitaires au socket existant
  socketRef.current.isReady = isSocketReady;
  socketRef.current.isConnected = isConnected;
  socketRef.current.isAuthenticated = isAuthenticated;

  // Méthodes sécurisées
  socketRef.current.safeEmit = (event, data) => {
    if (isSocketReady()) {
      socketRef.current.emit(event, data);
      return true;
    } else {
      console.warn(`🔌 Socket not ready for event: ${event}`);
      return false;
    }
  };

  socketRef.current.safeOn = (event, handler) => {
    if (socketRef.current && typeof socketRef.current.on === "function") {
      socketRef.current.on(event, handler);
      return true;
    }
    return false;
  };

  socketRef.current.safeOff = (event, handler) => {
    if (socketRef.current && typeof socketRef.current.off === "function") {
      socketRef.current.off(event, handler);
      return true;
    }
    return false;
  };

  return socketRef.current;
};
