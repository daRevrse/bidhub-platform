// frontend/src/pages/messages/MessagesPage.js - VERSION FUSIONNÉE AVEC SYSTÈME D'ENVOI AMÉLIORÉ
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import { useSearchParams } from "react-router-dom";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  UserCircleIcon,
  XMarkIcon,
  PhotoIcon,
  DocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { CheckCheck } from "lucide-react";

const MessagesPage = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [searchParams] = useSearchParams();

  // States principaux
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // States pour la recherche et nouvelle conversation
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // States pour les fonctionnalités avancées
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

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

  // Fonction utilitaire pour générer des clés uniques
  const generateMessageKey = (message, index) => {
    return `${message.id}-${message.senderId}-${new Date(
      message.createdAt
    ).getTime()}-${index}`;
  };

  // FONCTIONS UTILITAIRES OPTIMISÉES
  const fetchConversationsOptimized = useCallback(async () => {
    try {
      const response = await api.get("/api/messages/conversations");
      const conversationsData = response.data.conversations || [];

      const enrichedConversations = conversationsData.map((conv) => ({
        ...conv,
        otherParticipant:
          conv.participant1Id === user.id
            ? conv.participant2
            : conv.participant1,
      }));

      console.log("enrichedConversations", response);

      setConversations(enrichedConversations);
    } catch (error) {
      console.error("Erreur chargement conversations:", error);
    }
  }, [user?.id]);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      console.log(`📨 Chargement messages pour conversation ${conversationId}`);
      setLoadingMessages(true);

      const response = await api.get(
        `/api/messages/conversations/${conversationId}/messages`
      );

      const messagesData = (response.data.messages || []).map((msg) => ({
        ...msg,
        attachments: msg.attachments ? JSON.parse(msg.attachments) : [],
      }));
      console.log("messagesData", messagesData);
      setMessages(messagesData);
    } catch (error) {
      console.error("Erreur chargement messages:", error);

      // Gestion d'erreurs spécifiques
      if (error.response?.status === 403) {
        console.error("Accès refusé à cette conversation");
        setMessages([]);
      } else if (error.response?.status === 404) {
        console.error("Conversation non trouvée");
        setMessages([]);
      } else {
        console.error(
          "Erreur serveur:",
          error.response?.data?.message || error.message
        );
        setMessages([]);
      }
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const markAsRead = useCallback(async (conversationId) => {
    try {
      await api.put(`/api/messages/conversations/${conversationId}/read`);

      // Mettre à jour localement SANS re-fetch
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error("Erreur marquage lecture:", error);
    }
  }, []);

  // INITIALISATION
  const initializeMessaging = useCallback(async () => {
    try {
      setLoading(true);
      await fetchConversationsOptimized();
    } catch (error) {
      console.error("Erreur initialisation messaging:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchConversationsOptimized]);

  // SETUP SOCKET LISTENERS OPTIMISÉ
  const setupSocketListeners = useCallback(() => {
    if (!socket || !user) {
      console.log("💬 Socket ou user non disponible pour les listeners");
      return;
    }

    if (typeof socket.on !== "function" || typeof socket.off !== "function") {
      console.error("💬 Socket n'a pas les méthodes on/off");
      return;
    }

    console.log("💬 Configuration des listeners Socket pour les messages");

    // Authentifier le socket pour les messages
    const token = localStorage.getItem("token");
    if (token) {
      socket.emit("authenticate", token);
    }

    const handleNewMessage = (message) => {
      console.log("💬 Nouveau message reçu en temps réel:", message);

      // Ajouter uniquement si c'est pour la conversation active
      if (
        activeConversation &&
        message.conversationId === activeConversation.id
      ) {
        setMessages((prev) => [...prev, message]);
      }

      // Mettre à jour les conversations LOCALEMENT
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? {
                ...conv,
                lastMessageAt: new Date().toISOString(),
                lastMessagePreview:
                  message.content?.substring(0, 100) || "[Fichier]",
                unreadCount:
                  conv.id === activeConversation?.id
                    ? 0
                    : (conv.unreadCount || 0) + 1,
              }
            : conv
        )
      );
    };

    const handleMessagesRead = (data) => {
      console.log("💬 Messages marqués comme lus:", data);
      if (activeConversation && data.conversationId === activeConversation.id) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
      }
      // Mettre à jour les conversations LOCALEMENT
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    };

    const handleUserTyping = (data) => {
      if (activeConversation && data.conversationId === activeConversation.id) {
        if (data.isTyping) {
          setTypingUsers((prev) => new Set([...prev, data.userId]));
        } else {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }

        // Supprimer automatiquement après 3 secondes
        setTimeout(() => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }, 3000);
      }
    };

    const handleUserOnline = (data) => {
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
    };

    const handleUserOffline = (data) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    // Attacher les listeners
    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      console.log("💬 Nettoyage des listeners Socket");
      if (socket && typeof socket.off === "function") {
        socket.off("new_message", handleNewMessage);
        socket.off("messages_read", handleMessagesRead);
        socket.off("user_typing", handleUserTyping);
        socket.off("user_online", handleUserOnline);
        socket.off("user_offline", handleUserOffline);
      }
    };
  }, [user, activeConversation?.id]);

  // GESTION DE LA SAISIE
  const handleTyping = useCallback(() => {
    if (!socket || !activeConversation || !user) return;

    if (typeof socket.emit === "function") {
      socket.emit("typing", {
        conversationId: activeConversation.id,
        isTyping: true,
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socket && typeof socket.emit === "function") {
          socket.emit("typing", {
            conversationId: activeConversation.id,
            isTyping: false,
          });
        }
      }, 1500);
    }
  }, [socket, activeConversation, user]);

  const handleMessageChange = useCallback(
    (e) => {
      setNewMessage(e.target.value);

      // Throttle le typing indicator
      if (!typingTimeoutRef.current) {
        handleTyping();
      }
    },
    [handleTyping]
  );

  // SÉLECTION DE CONVERSATION - CORRIGÉE
  const selectConversation = useCallback(
    async (conversation) => {
      try {
        if (!conversation || !conversation.id) {
          console.error("❌ Conversation invalide");
          return;
        }

        // Si on clique sur la conversation déjà active, on ne fait rien
        if (activeConversation && activeConversation.id === conversation.id) {
          console.log("💬 Conversation déjà active:", conversation.id);
          return;
        }

        console.log("💬 Sélection de la conversation:", conversation.id);

        // Quitter la conversation précédente
        if (activeConversation && socket && typeof socket.emit === "function") {
          socket.emit("leave_conversation", activeConversation.id);
          console.log("💬 Quitté la conversation:", activeConversation.id);
        }

        // Réinitialiser les états avant de charger la nouvelle conversation
        setMessages([]);
        setNewMessage("");
        setSelectedFile(null);
        setTypingUsers(new Set());

        // Mettre à jour la conversation active
        setActiveConversation(conversation);

        // Rejoindre la nouvelle conversation
        if (socket && typeof socket.emit === "function") {
          socket.emit("join_conversation", conversation.id);
          console.log("💬 Rejoint la conversation:", conversation.id);
        }

        // Charger les messages
        await fetchMessages(conversation.id);

        // Marquer comme lu
        if (conversation.unreadCount > 0) {
          await markAsRead(conversation.id);
        }
      } catch (error) {
        console.error("❌ Erreur sélection conversation:", error);
      }
    },
    [activeConversation, socket, fetchMessages, markAsRead]
  );

  // ENVOI DE MESSAGE - VERSION AMÉLIORÉE (de votre code)
  const sendMessage = async (e) => {
    e.preventDefault();

    if ((!newMessage.trim() && !selectedFile) || !activeConversation || sending)
      return;

    setSending(true);

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append("file", selectedFile);
        formData.append(
          "messageType",
          selectedFile.type.startsWith("image/") ? "image" : "file"
        );
      }

      if (newMessage.trim()) {
        formData.append("content", newMessage.trim());
        if (!selectedFile) {
          formData.append("messageType", "text");
        }
      }

      const response = await api.post(
        `/api/messages/conversations/${activeConversation.id}/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Ajouter le message à la liste locale
      // setMessages((prev) => [...prev, response.data.data]);

      // Réinitialiser
      setNewMessage("");
      setSelectedFile(null);

      requestAnimationFrame(() => {
        // messageInputRef.current?.focus({ preventScroll: true });
        scrollToBottom();
      });

      // Mettre à jour les conversations
      fetchConversationsOptimized();
    } catch (error) {
      console.error("Erreur envoi message:", error);
    } finally {
      setSending(false);
    }
  };

  // RECHERCHE D'UTILISATEURS
  const searchUsers = useCallback(async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const response = await api.get("/api/users/search", {
        params: { q: query, limit: 10 },
      });
      setSearchResults(response.data.users || []);
      console.log("response", response);
    } catch (error) {
      console.error("Erreur recherche utilisateurs:", error);
    } finally {
      setSearchingUsers(false);
    }
  }, []);

  const startNewConversation = useCallback(
    async (otherUserId) => {
      try {
        const response = await api.post("/api/messages/conversations", {
          participantId: otherUserId,
        });

        const newConversation = response.data.conversation;
        await fetchConversationsOptimized();
        setShowNewConversation(false);
        setSearchQuery("");
        setSearchResults([]);

        setTimeout(() => {
          selectConversation(newConversation);
        }, 100);
      } catch (error) {
        console.error("Erreur création conversation:", error);
      }
    },
    [fetchConversationsOptimized, selectConversation]
  );

  // FONCTIONS UTILITAIRES
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, []);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMessageDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return messageDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "short",
      });
    }
  };

  const isUserOnline = (userId) => onlineUsers.has(userId);

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith("image/"))
      return <PhotoIcon className="w-4 h-4" />;
    return <DocumentIcon className="w-4 h-4" />;
  };

  // USEEFFECTS OPTIMISÉS
  useEffect(() => {
    if (user) {
      initializeMessaging();
    }
  }, [user, initializeMessaging]);

  useEffect(() => {
    if (socket && user) {
      return setupSocketListeners();
    }
  }, [socket, user, setupSocketListeners]);

  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(
        (c) => c.id === parseInt(conversationId)
      );
      if (conversation) {
        selectConversation(conversation);
      }
    }
  }, [searchParams, conversations, selectConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // DEBUG (en développement seulement)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Debug Socket Info:");
      console.log("- Socket exists:", !!socket);
      console.log(
        "- Socket.emit exists:",
        !!(socket && typeof socket.emit === "function")
      );
      console.log("- Socket.connected:", socket?.connected);
      console.log("- User:", user?.email);
      console.log("- Active conversation:", activeConversation?.id);
    }
  }, [socket, user, activeConversation]);

  // GUARDS
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Accès restreint
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour accéder à vos messages.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement des conversations...</p>
          {!socket && (
            <p className="mt-2 text-sm text-orange-600">
              Connexion au serveur...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-2rem)]">
          <div className="flex h-full">
            {/* SIDEBAR - Liste des conversations */}
            <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
              {/* Header du sidebar */}
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                  <button
                    onClick={() => setShowNewConversation(!showNewConversation)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Nouvelle conversation"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Nouveau panneau de conversation */}
                {showNewConversation && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Nouvelle conversation
                    </h3>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          searchUsers(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Résultats de recherche */}
                    {searchingUsers && (
                      <div className="mt-3 text-center text-sm text-gray-500">
                        Recherche...
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                        {searchResults.map((userResult) => (
                          <div
                            key={userResult.id}
                            onClick={() => startNewConversation(userResult.id)}
                            className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {userResult.firstName[0]}
                              {userResult.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {userResult.firstName} {userResult.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {userResult.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setShowNewConversation(false);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="mt-3 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>

              {/* Liste des conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCircleIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium mb-2">
                      Aucune conversation
                    </p>
                    <p className="text-gray-400 text-sm">
                      Commencez une nouvelle conversation
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-white ${
                        activeConversation?.id === conversation.id
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Avatar avec indicateur en ligne */}
                        <div className="relative">
                          {conversation.otherParticipant?.avatar ? (
                            <img
                              src={`${process.env.REACT_APP_API_URL}/uploads/avatars/${conversation.otherParticipant.avatar}`}
                              alt={`${conversation.otherParticipant.firstName} ${conversation.otherParticipant.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {conversation.otherParticipant?.firstName?.[0]}
                              {conversation.otherParticipant?.lastName?.[0]}
                            </div>
                          )}

                          {/* Indicateur en ligne */}
                          {isUserOnline(conversation.otherParticipant?.id) && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                          )}
                        </div>

                        {/* Informations de conversation */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.otherParticipant?.firstName}{" "}
                              {conversation.otherParticipant?.lastName}
                            </h3>
                            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {formatTime(
                                    conversation.lastMessage.createdAt
                                  )}
                                </span>
                              )}
                              {conversation.unreadCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs font-bold rounded-full min-w-[18px] h-4 flex items-center justify-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Dernier message */}
                          {conversation.lastMessage && (
                            <div className="flex items-center space-x-1">
                              {conversation.lastMessage.senderId ===
                                user.id && (
                                <div className="flex-shrink-0">
                                  {conversation.lastMessage.isRead ? (
                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                  ) : (
                                    <CheckIcon className="w-3 h-3 text-gray-400" />
                                  )}
                                </div>
                              )}
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.lastMessage.messageType === "text"
                                  ? conversation.lastMessage.content
                                  : conversation.lastMessage.messageType ===
                                    "image"
                                  ? "📷 Image"
                                  : "📎 Fichier"}
                              </p>
                            </div>
                          )}

                          {/* Informations sur l'enchère si applicable */}
                          {conversation.auction && (
                            <div className="mt-1">
                              <p className="text-xs text-blue-600 truncate">
                                🔨 {conversation.auction.product?.title}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ZONE PRINCIPALE - Messages */}
            <div className="flex-1 flex flex-col">
              {!activeConversation ? (
                /* Écran d'accueil */
                <div className="flex-1 flex items-center justify-center bg-gray-50/30">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <UserCircleIcon className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      Bienvenue dans vos messages
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Sélectionnez une conversation pour commencer à échanger ou
                      créez-en une nouvelle.
                    </p>
                    <button
                      onClick={() => setShowNewConversation(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                      Nouvelle conversation
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header de conversation */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="relative">
                          {activeConversation.otherParticipant?.avatar ? (
                            <img
                              src={`${process.env.REACT_APP_API_URL}/uploads/avatars/${activeConversation.otherParticipant.avatar}`}
                              alt={`${activeConversation.otherParticipant.firstName} ${activeConversation.otherParticipant.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {
                                activeConversation.otherParticipant
                                  ?.firstName?.[0]
                              }
                              {
                                activeConversation.otherParticipant
                                  ?.lastName?.[0]
                              }
                            </div>
                          )}

                          {/* Indicateur en ligne */}
                          {isUserOnline(
                            activeConversation.otherParticipant?.id
                          ) && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                          )}
                        </div>

                        {/* Informations utilisateur */}
                        <div>
                          <h2 className="font-bold text-gray-900">
                            {activeConversation.otherParticipant?.firstName}{" "}
                            {activeConversation.otherParticipant?.lastName}
                          </h2>
                          <div className="flex items-center space-x-2">
                            {isUserOnline(
                              activeConversation.otherParticipant?.id
                            ) ? (
                              <span className="text-sm text-green-600">
                                En ligne
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">
                                Hors ligne
                              </span>
                            )}

                            {/* Indicateur de frappe */}
                            {typingUsers.size > 0 && (
                              <span className="text-sm text-blue-600 animate-pulse">
                                En train d'écrire...
                              </span>
                            )}
                          </div>

                          {/* Informations sur l'enchère */}
                          {activeConversation.auction && (
                            <p className="text-sm text-blue-600 flex items-center space-x-1">
                              <span>🔨</span>
                              <span>
                                Enchère:{" "}
                                {activeConversation.auction.product?.title}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="relative">
                        <button
                          onClick={() => setShowActions((prev) => !prev)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <EllipsisVerticalIcon className="w-5 h-5" />
                        </button>

                        {showActions && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                            <button
                              onClick={() => {
                                setActiveConversation(null); // Fermer la discussion
                                setShowActions(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Fermer la discussion
                            </button>

                            <button
                              onClick={() => {
                                // log ou API pour supprimer
                                console.log(
                                  "Suppression conversation:",
                                  activeConversation?.id
                                );
                                setShowActions(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                            >
                              Supprimer la discussion
                            </button>

                            <button
                              onClick={() => {
                                // log ou API pour bloquer
                                console.log(
                                  "Bloquer:",
                                  activeConversation?.otherParticipant?.id
                                );
                                setShowActions(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Bloquer l’utilisateur
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Zone des messages */}
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto bg-gray-50/30 p-4"
                  >
                    {loadingMessages ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500">
                          Aucun message dans cette conversation.
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Envoyez le premier message !
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-w-4xl mx-auto">
                        {messages.map((message, index) => {
                          const isOwnMessage = message.senderId === user.id;
                          const showDate =
                            index === 0 ||
                            formatMessageDate(message.createdAt) !==
                              formatMessageDate(messages[index - 1].createdAt);

                          // Utiliser une clé unique
                          const uniqueKey = generateMessageKey(message, index);

                          return (
                            <div key={uniqueKey}>
                              {/* Séparateur de date */}
                              {showDate && (
                                <div className="text-center my-6">
                                  <span className="bg-white text-gray-600 text-sm px-4 py-2 rounded-full shadow-sm border">
                                    {formatMessageDate(message.createdAt)}
                                  </span>
                                </div>
                              )}

                              {/* Message */}
                              <div
                                className={`flex ${
                                  isOwnMessage ? "justify-end" : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-md ${
                                    isOwnMessage ? "order-2" : "order-1"
                                  }`}
                                >
                                  {/* Contenu du message */}
                                  <div
                                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                                      isOwnMessage
                                        ? "bg-blue-600 text-white ml-auto"
                                        : "bg-white text-gray-900"
                                    } ${
                                      message.messageType === "system"
                                        ? "bg-yellow-100 text-yellow-800 text-center italic"
                                        : ""
                                    }`}
                                  >
                                    {/* Message système */}
                                    {message.messageType === "system" && (
                                      <p className="text-sm">
                                        {message.content}
                                      </p>
                                    )}

                                    {/* Message texte */}
                                    {message.messageType === "text" && (
                                      <p className="text-sm whitespace-pre-wrap break-words">
                                        {message.content}
                                      </p>
                                    )}

                                    {/* Message image */}
                                    {message.messageType === "image" &&
                                      message.attachments && (
                                        <div>
                                          <img
                                            src={`${process.env.REACT_APP_API_URL}/uploads/messages/${message.attachments[0]?.filename}`}
                                            alt="Image partagée"
                                            className="max-w-full h-auto rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() =>
                                              window.open(
                                                `${process.env.REACT_APP_API_URL}/uploads/messages/${message.attachments[0]?.filename}`,
                                                "_blank"
                                              )
                                            }
                                          />
                                          {message.content && (
                                            <p className="text-sm mt-2">
                                              {message.content}
                                            </p>
                                          )}
                                        </div>
                                      )}

                                    {/* Message fichier */}
                                    {message.messageType === "file" &&
                                      message.attachments && (
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                          <div className="flex-shrink-0">
                                            {getFileIcon(
                                              message.attachments[0]?.mimetype
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                              {message.attachments[0]
                                                ?.originalName ||
                                                message.content}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {message.attachments[0]?.size &&
                                                `${(
                                                  message.attachments[0].size /
                                                  1024
                                                ).toFixed(1)} KB`}
                                            </p>
                                          </div>
                                          <a
                                            href={`${process.env.REACT_APP_API_URL}/uploads/messages/${message.attachments[0]?.filename}`}
                                            download={
                                              message.attachments[0]
                                                ?.originalName
                                            }
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                          >
                                            Télécharger
                                          </a>
                                        </div>
                                      )}
                                  </div>

                                  {/* Métadonnées du message */}
                                  <div
                                    className={`flex items-center space-x-2 mt-1 text-xs ${
                                      isOwnMessage
                                        ? "justify-end text-gray-500"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    <span>{formatTime(message.createdAt)}</span>
                                    {isOwnMessage && (
                                      <>
                                        {message.isRead ? (
                                          <CheckCheck className="w-3 h-3 text-blue-500" />
                                        ) : (
                                          <CheckIcon className="w-3 h-3" />
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Zone de saisie */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    {/* Aperçu du fichier sélectionné */}
                    {selectedFile && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <PaperClipIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-900 truncate max-w-xs">
                            {selectedFile.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(selectedFile.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    <form
                      onSubmit={sendMessage}
                      className="flex items-center space-x-3"
                    >
                      {/* Bouton pièce jointe */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        title="Ajouter une pièce jointe"
                      >
                        <PaperClipIcon className="w-5 h-5" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) =>
                          setSelectedFile(e.target.files[0] || null)
                        }
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />

                      {/* Champ de saisie */}
                      <div className="flex-1 relative">
                        <input
                          ref={messageInputRef}
                          type="text"
                          value={newMessage}
                          onChange={handleMessageChange}
                          placeholder="Écrivez votre message..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                          disabled={sending}
                        />

                        {/* Bouton emoji */}
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <FaceSmileIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Bouton d'envoi */}
                      <button
                        type="submit"
                        disabled={
                          sending || (!newMessage.trim() && !selectedFile)
                        }
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <PaperAirplaneIcon className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
