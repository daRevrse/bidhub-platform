import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "./useSocket";
import axios from "axios";

export const useMessages = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      setupSocketListeners();
    }
  }, [user, socket]);

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on("new_message", () => {
      fetchUnreadCount();
    });

    socket.on("messages_read", () => {
      fetchUnreadCount();
    });

    return () => {
      socket.off("new_message");
      socket.off("messages_read");
    };
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/messages/unread-count"
      );
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Erreur comptage messages non lus:", error);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/messages/conversations"
      );
      setConversations(response.data.conversations);
    } catch (error) {
      console.error("Erreur chargement conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendQuickMessage = async (recipientId, content, auctionId = null) => {
    try {
      // Créer conversation
      const conversationResponse = await axios.post(
        "http://localhost:5000/api/messages/conversations",
        {
          participantId: recipientId,
          auctionId,
        }
      );

      // Envoyer message
      await axios.post(
        `http://localhost:5000/api/messages/conversations/${conversationResponse.data.conversation.id}/messages`,
        { content, messageType: "text" }
      );

      return conversationResponse.data.conversation;
    } catch (error) {
      throw new Error("Erreur envoi message: " + error.message);
    }
  };

  return {
    unreadCount,
    conversations,
    loading,
    fetchConversations,
    sendQuickMessage,
    refreshUnreadCount: fetchUnreadCount,
  };
};
