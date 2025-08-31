import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { BellIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellSolidIcon } from "@heroicons/react/24/solid";
import axios from "axios";

const MessageNotification = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadMessages();
      // Actualiser les messages toutes les 30 secondes
      const interval = setInterval(fetchUnreadMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadMessages = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/messages/unread"
      );
      setUnreadCount(response.data.unreadCount || 0);
      setRecentMessages(response.data.recentMessages || []);
    } catch (error) {
      console.error("Erreur récupération messages:", error);
    }
  };

  const loadRecentMessages = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/messages/recent?limit=5"
      );
      setRecentMessages(response.data.messages || []);
    } catch (error) {
      console.error("Erreur récupération messages récents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDropdown = () => {
    if (!isOpen && recentMessages.length === 0) {
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
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}j`;
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="w-6 h-6 text-blue-600" />
        ) : (
          <BellIcon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
        )}

        {/* Badge de notification */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown des messages */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 flex items-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-blue-600" />
                Messages
              </h3>
              {unreadCount > 0 && (
                <span className="text-xs text-blue-600 font-medium">
                  {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Liste des messages */}
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Chargement...</p>
              </div>
            ) : recentMessages.length > 0 ? (
              recentMessages.map((message) => (
                <Link
                  key={message.id}
                  to={`/messages?conversation=${
                    message.conversationId || message.senderId
                  }`}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {message.sender?.firstName?.[0] ||
                            message.senderName?.[0] ||
                            "?"}
                        </span>
                      </div>
                    </div>

                    {/* Contenu du message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {message.sender?.firstName} {message.sender?.lastName}
                          {!message.sender && message.senderName}
                        </p>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {truncateMessage(message.content || message.text)}
                      </p>
                      {!message.isRead && (
                        <div className="mt-1">
                          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">Aucun message</p>
                <p className="text-xs text-gray-400">
                  Vos conversations apparaîtront ici
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <Link
              to="/messages"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center py-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Voir tous les messages
            </Link>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default MessageNotification;
