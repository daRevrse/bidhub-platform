import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import axios from "axios";

const MessageNotification = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchRecentMessages();
    }
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      socket.on("new_message", () => {
        fetchUnreadCount();
        fetchRecentMessages();
      });

      return () => {
        socket.off("new_message");
      };
    }
  }, [socket, user]);

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

  const fetchRecentMessages = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/messages/conversations?limit=5"
      );
      setRecentMessages(
        response.data.conversations.filter((conv) => conv.unreadCount > 0)
      );
    } catch (error) {
      console.error("Erreur récupération messages récents:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <span className="text-xl">💬</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Messages</h3>
              <Link
                to="/messages"
                className="text-primary-600 hover:text-primary-700 text-sm"
                onClick={() => setShowDropdown(false)}
              >
                Voir tous
              </Link>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recentMessages.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="text-2xl mb-2">📭</div>
                <p className="text-sm">Aucun nouveau message</p>
              </div>
            ) : (
              recentMessages.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/messages?conversation=${conv.id}`}
                  onClick={() => setShowDropdown(false)}
                  className="block p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-600">
                        {conv.otherParticipant.firstName[0]}
                        {conv.otherParticipant.lastName[0]}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-gray-900 truncate">
                          {conv.otherParticipant.firstName}{" "}
                          {conv.otherParticipant.lastName}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      {conv.lastMessagePreview && (
                        <p className="text-sm text-gray-600 truncate">
                          {conv.lastMessagePreview}
                        </p>
                      )}

                      {conv.lastMessageAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(conv.lastMessageAt).toLocaleString("fr-FR")}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <Link
              to="/messages"
              onClick={() => setShowDropdown(false)}
              className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              Ouvrir la messagerie
            </Link>
          </div>
        </div>
      )}

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  );
};

export default MessageNotification;
