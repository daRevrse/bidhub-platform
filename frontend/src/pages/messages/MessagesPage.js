// frontend/src/pages/messages/MessagesPage.js - VERSION AMÉLIORÉE
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

  // States pour les fonctionnalités avancées
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
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

  // Effets principaux
  useEffect(() => {
    if (user) {
      initializeMessaging();
    }
  }, [user, socket]);

  // USEEFFECT SÉPARÉ POUR LES SOCKETS
  useEffect(() => {
    if (socket && user && typeof socket.emit === "function") {
      setupSocketListeners();
    }
  }, [socket, user]);

  useEffect(() => {
    // Vérifier si une conversation est spécifiée dans l'URL
    const conversationId = searchParams.get("conversation");
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(
        (c) => c.id === parseInt(conversationId)
      );
      if (conversation) {
        selectConversation(conversation);
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialisation
  const initializeMessaging = async () => {
    try {
      await fetchConversations();
      // setupSocketListeners();
    } catch (error) {
      console.error("Erreur initialisation messaging:", error);
    } finally {
      setLoading(false);
    }
  };

  // Configuration des listeners Socket.io
  const setupSocketListeners = useCallback(() => {
    // if (!socket || !user) return;
    if (!socket || !user || typeof socket.emit !== "function") {
      console.log("💬 Socket pas prêt pour les listeners");
      return;
    }

    console.log("🔌 Configuration des listeners pour les messages");

    // const token = localStorage.getItem("token");
    // // Authentifier le socket pour les messages
    // socket.emit("authenticate", token);

    // AUTHENTIFIER LE SOCKET POUR LES MESSAGES
    const token = localStorage.getItem("token");
    if (token) {
      socket.emit("authenticate", token);
    }

    // Nouveau message reçu
    const handleNewMessage = (message) => {
      console.log("💬 Nouveau message reçu:", message);

      if (
        activeConversation &&
        message.conversationId === activeConversation.id
      ) {
        setMessages((prev) => [...prev, message]);
        markAsRead(activeConversation.id);
      }

      fetchConversations(); // Mettre à jour la liste des conversations
    };

    // Messages marqués comme lus
    const handleMessagesRead = (data) => {
      console.log("💬 Messages marqués comme lus:", data);

      if (activeConversation && data.conversationId === activeConversation.id) {
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            isRead: msg.senderId === user.id ? true : msg.isRead,
          }))
        );
      }
    };

    // Utilisateur en train d'écrire
    const handleUserTyping = (data) => {
      if (data.conversationId === activeConversation?.id) {
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

    // Utilisateur en ligne/hors ligne
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
      if (socket && typeof socket.off === "function") {
        socket.off("new_message", handleNewMessage);
        socket.off("messages_read", handleMessagesRead);
        socket.off("user_typing", handleUserTyping);
        socket.off("user_online", handleUserOnline);
        socket.off("user_offline", handleUserOffline);
      }
    };
  }, [socket, user, activeConversation]);

  // Récupération des données
  const fetchConversations = async () => {
    try {
      const response = await api.get("/api/messages/conversations");
      const conversationsData = response.data.conversations.conversations || [];

      // Enrichir avec les informations d'autres participants
      const enrichedConversations = conversationsData.map((conv) => ({
        ...conv,
        otherParticipant:
          conv.participant1Id === user.id
            ? conv.participant2
            : conv.participant1,
      }));

      setConversations(enrichedConversations);
    } catch (error) {
      console.error("Erreur chargement conversations:", error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      const response = await api.get(
        `/api/messages/conversations/${conversationId}/messages`
      );
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Actions principales
  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);
    setMessages([]);

    // Rejoindre la conversation via socket
    // if (socket) {
    //   socket.emit("join_conversation", conversation.id);
    // }
    if (socket && typeof socket.emit === "function") {
      socket.emit("join_conversation", conversation.id);
    }

    // Charger les messages
    await fetchMessages(conversation.id);

    // Marquer comme lu si non lus
    if (conversation.unreadCount > 0) {
      await markAsRead(conversation.id);
    }
  };

  // const sendMessage = async (e) => {
  //   e.preventDefault();

  //   if ((!newMessage.trim() && !selectedFile) || !activeConversation || sending)
  //     return;

  //   setSending(true);

  //   try {
  //     const formData = new FormData();

  //     if (selectedFile) {
  //       formData.append("file", selectedFile);
  //       formData.append(
  //         "messageType",
  //         selectedFile.type.startsWith("image/") ? "image" : "file"
  //       );
  //     }

  //     if (newMessage.trim()) {
  //       formData.append("content", newMessage.trim());
  //       if (!selectedFile) {
  //         formData.append("messageType", "text");
  //       }
  //     }

  //     const response = await api.post(
  //       `/api/messages/conversations/${activeConversation.id}/messages`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     // Ajouter le message à la liste locale
  //     setMessages((prev) => [...prev, response.data.data]);

  //     // Réinitialiser
  //     setNewMessage("");
  //     setSelectedFile(null);

  //     // Mettre à jour les conversations
  //     fetchConversations();
  //   } catch (error) {
  //     console.error("Erreur envoi message:", error);
  //   } finally {
  //     setSending(false);
  //   }
  // };

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
      setMessages((prev) => [...prev, response.data.data]);

      // Réinitialiser
      setNewMessage("");
      setSelectedFile(null);

      requestAnimationFrame(() => {
        messageInputRef.current?.focus({ preventScroll: true });
        scrollToBottom();
      });

      // ⚡ Garder le focus et scroller en bas
      // setTimeout(() => {
      //   messageInputRef.current?.focus();
      //   scrollToBottom();
      // }, 50);

      // Mettre à jour les conversations
      fetchConversations();
    } catch (error) {
      console.error("Erreur envoi message:", error);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await api.put(`/api/messages/conversations/${conversationId}/read`);
      fetchConversations();
    } catch (error) {
      console.error("Erreur marquage lecture:", error);
    }
  };

  // Gestion de la frappe
  const handleTyping = useCallback(() => {
    // if (socket && activeConversation) {
    //   socket.emit("typing", {
    //     conversationId: activeConversation.id,
    //     isTyping: true,
    //   });
    if (socket && activeConversation && typeof socket.emit === "function") {
      socket.emit("typing", {
        conversationId: activeConversation.id,
        isTyping: true,
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        // socket.emit("typing", {
        //   conversationId: activeConversation.id,
        //   isTyping: false,
        // });
        if (socket && typeof socket.emit === "function") {
          socket.emit("typing", {
            conversationId: activeConversation.id,
            isTyping: false,
          });
        }
      }, 1500);
    }
  }, [socket, activeConversation]);

  // Recherche d'utilisateurs
  const searchUsers = async (query) => {
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
    } catch (error) {
      console.error("Erreur recherche utilisateurs:", error);
    } finally {
      setSearchingUsers(false);
    }
  };

  const startNewConversation = async (otherUserId) => {
    try {
      const response = await api.post("/api/messages/conversations", {
        participantId: otherUserId,
      });

      const newConversation = response.data.conversation;
      await fetchConversations();
      setShowNewConversation(false);
      setSearchQuery("");
      setSearchResults([]);

      // Sélectionner automatiquement la nouvelle conversation
      setTimeout(() => {
        selectConversation(newConversation);
      }, 100);
    } catch (error) {
      console.error("Erreur création conversation:", error);
    }
  };

  // Fonctions utilitaires
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  // Guards
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

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
  //     </div>
  //   );
  // }

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
                                  ? "� Image"
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
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Zone des messages */}
                  <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4">
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

                          return (
                            <div key={message.id}>
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
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                                            className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                                          >
                                            ⬇️
                                          </a>
                                        </div>
                                      )}
                                  </div>

                                  {/* Métadonnées du message */}
                                  <div
                                    className={`flex items-center space-x-2 mt-1 text-xs ${
                                      isOwnMessage
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                                  >
                                    <span className="text-gray-500">
                                      {formatTime(message.createdAt)}
                                    </span>

                                    {/* Indicateurs de lecture pour ses propres messages */}
                                    {isOwnMessage && (
                                      <div className="text-gray-400">
                                        {message.isRead ? (
                                          <CheckCheck className="w-4 h-4 text-blue-500" />
                                        ) : (
                                          <CheckIcon className="w-4 h-4" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Avatar pour les messages reçus */}
                                {!isOwnMessage && (
                                  <div className="order-1 mr-3 mt-auto">
                                    {activeConversation.otherParticipant
                                      ?.avatar ? (
                                      <img
                                        src={`${process.env.REACT_APP_API_URL}/uploads/avatars/${activeConversation.otherParticipant.avatar}`}
                                        alt={`${activeConversation.otherParticipant.firstName} ${activeConversation.otherParticipant.lastName}`}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold">
                                        {
                                          activeConversation.otherParticipant
                                            ?.firstName?.[0]
                                        }
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Zone de saisie */}
                  <div className="p-4 bg-white border-t border-gray-200">
                    {/* Indicateur de fichier sélectionné */}
                    {selectedFile && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getFileIcon(selectedFile.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Formulaire de saisie */}
                    <form
                      onSubmit={sendMessage}
                      className="flex items-end space-x-3"
                    >
                      {/* Input principal */}
                      <div className="flex-1 min-w-0">
                        <div className="relative">
                          <textarea
                            ref={messageInputRef}
                            value={newMessage}
                            onChange={(e) => {
                              setNewMessage(e.target.value);
                              handleTyping();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage(e);
                              }
                            }}
                            placeholder={`Écrivez votre message à ${activeConversation.otherParticipant?.firstName}...`}
                            className="w-full max-h-32 min-h-[44px] p-3 pr-20 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            rows="1"
                            style={{
                              height: "auto",
                              minHeight: "44px",
                            }}
                            onInput={(e) => {
                              e.target.style.height = "auto";
                              e.target.style.height =
                                Math.min(e.target.scrollHeight, 128) + "px";
                            }}
                          />

                          {/* Boutons d'actions dans l'input */}
                          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                            {/* Bouton fichier */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Joindre un fichier"
                            >
                              <PaperClipIcon className="w-4 h-4" />
                            </button>

                            {/* Bouton émoji (placeholder) */}
                            <button
                              type="button"
                              onClick={() =>
                                setShowEmojiPicker(!showEmojiPicker)
                              }
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Ajouter un emoji"
                            >
                              <FaceSmileIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Bouton d'envoi */}
                      <button
                        type="submit"
                        disabled={
                          (!newMessage.trim() && !selectedFile) || sending
                        }
                        className={`p-3 rounded-2xl transition-all duration-200 ${
                          (!newMessage.trim() && !selectedFile) || sending
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 active:scale-95"
                        }`}
                        title="Envoyer le message"
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <PaperAirplaneIcon className="w-5 h-5" />
                        )}
                      </button>
                    </form>

                    {/* Input file caché */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                        }
                      }}
                      className="hidden"
                    />

                    {/* Raccourcis clavier */}
                    <div className="mt-2 text-xs text-gray-400 text-center">
                      <span>
                        Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
                      </span>
                    </div>
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
