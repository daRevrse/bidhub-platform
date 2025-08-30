import { useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    // Créer la connexion socket uniquement si l'utilisateur est connecté
    if (user) {
      socketRef.current = io("http://localhost:5000", {
        autoConnect: true,
      });

      // Authentifier automatiquement avec le token
      const token = localStorage.getItem("token");
      if (token) {
        socketRef.current.emit("authenticate", token);
      }

      // Gérer les erreurs d'authentification
      socketRef.current.on("auth_error", (error) => {
        console.error("Socket auth error:", error);
      });

      console.log("🔌 Socket connected");
    }

    // Cleanup lors du démontage
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("🔌 Socket disconnected");
      }
    };
  }, [user]);

  return socketRef.current;
};
