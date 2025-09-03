// frontend/src/hooks/useMessages.js - VERSION AMÉLIORÉE
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "./useSocket";
import axios from "axios";

export const useMessages = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
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
      fetchUnreadCount();
      fetchConversations();
      setupSocketListeners();
    }
  }, [user, socket]);

  // Configuration des listeners Socket.io
  const setupSocketListeners = useCallback(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      console.log("💬 Nouveau message reçu dans hook:", message);
      fetchUnreadCount();
      fetchConversations();
    };

    const handleMessagesRead = (data) => {
      console.log("💬 Messages marqués comme lus dans hook:", data);
      fetchUnreadCount();
      fetchConversations();
    };

    const handleUserOnline = (data) => {
      console.log("💬 Utilisateur en ligne:", data.userId);
    };

    const handleUserOffline = (data) => {
      console.log("💬 Utilisateur hors ligne:", data.userId);
    };

    // Attacher les listeners
    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [socket]);

  // Fonctions API
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await api.get("/api/messages/unread-count");
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Erreur comptage messages non lus:", error);
      setError("Erreur lors du comptage des messages non lus");
    }
  };

  const fetchConversations = async (page = 1, limit = 50) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/messages/conversations", {
        params: { page, limit },
      });

      const conversationsData = response.data.conversations || [];

      // Enrichir avec les informations d'autres participants
      const enrichedConversations = conversationsData.map((conv) => ({
        ...conv,
        otherParticipant:
          conv.participant1Id === user.id
            ? conv.participant2
            : conv.participant1,
      }));

      setConversations(enrichedConversations);
      return enrichedConversations;
    } catch (error) {
      console.error("Erreur chargement conversations:", error);
      setError("Erreur lors du chargement des conversations");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getConversation = async (conversationId) => {
    try {
      const response = await api.get(
        `/api/messages/conversations/${conversationId}`
      );
      return response.data.conversation;
    } catch (error) {
      console.error("Erreur récupération conversation:", error);
      throw new Error("Erreur lors de la récupération de la conversation");
    }
  };

  const getMessages = async (conversationId, page = 1, limit = 50) => {
    try {
      const response = await api.get(
        `/api/messages/conversations/${conversationId}/messages`,
        { params: { page, limit } }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur récupération messages:", error);
      throw new Error("Erreur lors de la récupération des messages");
    }
  };

  const sendMessage = async (
    conversationId,
    content,
    messageType = "text",
    attachments = null
  ) => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("messageType", messageType);

      if (attachments) {
        attachments.forEach((file, index) => {
          formData.append(`attachments`, file);
        });
      }

      const response = await api.post(
        `/api/messages/conversations/${conversationId}/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Actualiser les données locales
      await fetchConversations();
      await fetchUnreadCount();

      return response.data.data;
    } catch (error) {
      console.error("Erreur envoi message:", error);
      throw new Error("Erreur lors de l'envoi du message");
    }
  };

  const sendQuickMessage = async (recipientId, content, auctionId = null) => {
    try {
      setError(null);

      // Créer la conversation
      const conversationResponse = await api.post(
        "/api/messages/conversations",
        {
          participantId: recipientId,
          auctionId,
        }
      );

      const conversation = conversationResponse.data.conversation;

      // Envoyer le message
      const message = await sendMessage(conversation.id, content);

      return { conversation, message };
    } catch (error) {
      console.error("Erreur envoi message rapide:", error);
      setError("Erreur lors de l'envoi du message");
      throw error;
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      await api.put(`/api/messages/conversations/${conversationId}/read`);
      await fetchConversations();
      await fetchUnreadCount();
    } catch (error) {
      console.error("Erreur marquage conversation:", error);
      throw new Error("Erreur lors du marquage de la conversation");
    }
  };

  const createConversation = async (participantId, auctionId = null) => {
    try {
      setError(null);
      const response = await api.post("/api/messages/conversations", {
        participantId,
        auctionId,
      });

      // Actualiser la liste des conversations
      await fetchConversations();

      return response.data.conversation;
    } catch (error) {
      console.error("Erreur création conversation:", error);
      setError("Erreur lors de la création de la conversation");
      throw error;
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      setError(null);
      await api.delete(`/api/messages/conversations/${conversationId}`);

      // Retirer de la liste locale
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );
      await fetchUnreadCount();

      return true;
    } catch (error) {
      console.error("Erreur suppression conversation:", error);
      setError("Erreur lors de la suppression de la conversation");
      throw error;
    }
  };

  const blockConversation = async (conversationId, block = true) => {
    try {
      setError(null);
      const response = await api.put(
        `/api/messages/conversations/${conversationId}/block`,
        {
          block,
        }
      );

      // Actualiser les conversations
      await fetchConversations();

      return response.data.conversation;
    } catch (error) {
      console.error("Erreur blocage conversation:", error);
      setError(
        `Erreur lors du ${block ? "blocage" : "déblocage"} de la conversation`
      );
      throw error;
    }
  };

  const searchMessages = async (
    query,
    conversationId = null,
    page = 1,
    limit = 20
  ) => {
    try {
      setError(null);
      const response = await api.get("/api/messages/search", {
        params: { query, conversationId, page, limit },
      });

      return response.data;
    } catch (error) {
      console.error("Erreur recherche messages:", error);
      setError("Erreur lors de la recherche de messages");
      throw error;
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      setError(null);
      const response = await api.put(`/api/messages/${messageId}`, {
        content: newContent,
      });

      // Actualiser les conversations si nécessaire
      await fetchConversations();

      return response.data.data;
    } catch (error) {
      console.error("Erreur modification message:", error);
      setError("Erreur lors de la modification du message");
      throw error;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      setError(null);
      await api.delete(`/api/messages/${messageId}`);

      // Actualiser les conversations si nécessaire
      await fetchConversations();

      return true;
    } catch (error) {
      console.error("Erreur suppression message:", error);
      setError("Erreur lors de la suppression du message");
      throw error;
    }
  };

  // Fonctions utilitaires
  const getConversationById = (conversationId) => {
    return conversations.find((conv) => conv.id === conversationId);
  };

  const getUnreadConversations = () => {
    return conversations.filter((conv) => conv.unreadCount > 0);
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce(
      (total, conv) => total + (conv.unreadCount || 0),
      0
    );
  };

  const clearError = () => {
    setError(null);
  };

  // Fonction de rafraîchissement complet
  const refreshData = async () => {
    await Promise.all([fetchUnreadCount(), fetchConversations()]);
  };

  return {
    // États
    conversations,
    unreadCount,
    loading,
    error,

    // Fonctions principales
    fetchConversations,
    getConversation,
    getMessages,
    sendMessage,
    sendQuickMessage,
    markConversationAsRead,
    createConversation,
    deleteConversation,
    blockConversation,

    // Fonctions avancées
    searchMessages,
    editMessage,
    deleteMessage,

    // Fonctions utilitaires
    getConversationById,
    getUnreadConversations,
    getTotalUnreadCount,
    refreshUnreadCount: fetchUnreadCount,
    refreshData,
    clearError,
  };
};
