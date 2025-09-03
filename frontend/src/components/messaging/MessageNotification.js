// frontend/src/components/messaging/MessageNotification.js - VERSION AMÉLIORÉE
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import {
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ChatBubbleLeftRightIcon as ChatSolidIcon } from "@heroicons/react/24/solid";
import axios from "axios";

const MessageNotification = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      setupSocketListeners();

      // Actualiser périodiquement
      const interval = setInterval(fetchUnreadCount, 60000); // 1 minute
      return () => clearInterval(interval);
    }
  }, [user, socket]);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const setupSocketListeners = () => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      console.log("💬 Nouveau message reçu:", message);
      fetchUnreadCount();

      // Si le dropdown est ouvert, actualiser les messages récents
      if (isOpen) {
        loadRecentMessages();
      }
    };

    const handleMessagesRead = (data) => {
      console.log("💬 Messages marqués comme lus:", data);
      fetchUnreadCount();

      if (isOpen) {
        loadRecentMessages();
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/api/messages/unread-count");
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Erreur récupération count messages:", error);
    }
  };

  const loadRecentMessages = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await api.get("/api/messages/conversations", {
        params: { limit: 5, page: 1 },
      });

      // Extraire les derniers messages de chaque conversation
      const conversations = response.data.conversations.conversations || [];
      const recentMessagesData = conversations
        .filter((conv) => conv.lastMessage)
        .map((conv) => ({
          ...conv.lastMessage,
          conversationId: conv.id,
          otherParticipant: conv.otherParticipant,
          unreadCount: conv.unreadCount || 0,
        }))
        .slice(0, 5);

      setRecentMessages(recentMessagesData);
    } catch (error) {
      console.error("Erreur récupération messages récents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDropdown = () => {
    if (!isOpen) {
      loadRecentMessages();
    }
    setIsOpen(!isOpen);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return date.toLocaleDateString("fr-FR");
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return "";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const getMessagePreview = (message) => {
    switch (message.messageType) {
      case "image":
        return "📸 Image";
      case "file":
        return "📎 Fichier";
      case "system":
        return "💬 Message système";
      default:
        return message.content || "Message";
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Messages ${
          unreadCount > 0 ? `(${unreadCount} non lus)` : ""
        }`}
      >
        {unreadCount > 0 ? (
          <ChatSolidIcon className="w-6 h-6 text-blue-600" />
        ) : (
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
        )}

        {/* Badge de messages non lus */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown des messages */}
      {isOpen && (
        <>
          <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-50 max-h-[32rem] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ChatBubbleOvalLeftIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Messages
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {unreadCount} nouveau{unreadCount > 1 ? "x" : ""}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Liste des messages récents */}
            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chargement...
                  </p>
                </div>
              ) : recentMessages.length > 0 ? (
                recentMessages.map((message) => (
                  <Link
                    key={`${message.conversationId}-${message.id}`}
                    to={`/messages?conversation=${message.conversationId}`}
                    onClick={() => setIsOpen(false)}
                    className="block p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {message.otherParticipant?.avatar ? (
                          <img
                            src={`http://localhost:5000/uploads/avatars/${message.otherParticipant.avatar}`}
                            alt={`${message.otherParticipant.firstName} ${message.otherParticipant.lastName}`}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {message.otherParticipant?.firstName?.[0] || "?"}
                              {message.otherParticipant?.lastName?.[0] || ""}
                            </span>
                          </div>
                        )}

                        {/* Indicateur en ligne (placeholder) */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      </div>

                      {/* Contenu du message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {message.otherParticipant?.firstName}{" "}
                            {message.otherParticipant?.lastName}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                              {formatTime(message.createdAt)}
                            </span>
                            {message.unreadCount > 0 && (
                              <span className="bg-blue-500 text-white text-xs font-bold rounded-full min-w-[18px] h-4 flex items-center justify-center">
                                {message.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {truncateMessage(getMessagePreview(message))}
                        </p>

                        {/* Statut du message */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1">
                            {message.messageType === "image" && (
                              <span className="text-xs text-blue-500">📸</span>
                            )}
                            {message.messageType === "file" && (
                              <span className="text-xs text-green-500">📎</span>
                            )}
                          </div>

                          {message.senderId === user.id && (
                            <div className="flex items-center text-xs text-gray-400">
                              {message.isRead ? (
                                <span className="text-blue-500">✓✓</span>
                              ) : (
                                <span>✓</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Aucun message
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vos conversations apparaîtront ici
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Link
                to="/messages"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full py-3 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                Voir tous les messages
              </Link>
            </div>
          </div>

          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default MessageNotification;
