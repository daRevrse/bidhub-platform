// frontend/src/pages/messages/MessagesPage.js
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import axios from "axios";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const MessagesPage = () => {
  const { user } = useAuth();
  const socket = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchUnreadCount();
      setupSocketListeners();
    }
  }, [user, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocketListeners = () => {
    if (!socket || !user) return;

    socket.emit("authenticate", localStorage.getItem("token"));

    socket.on("new_message", (message) => {
      if (
        activeConversation &&
        message.conversationId === activeConversation.id
      ) {
        setMessages((prev) => [...prev, message]);
        markAsRead(activeConversation.id);
      }
      updateConversationsList();
      fetchUnreadCount();
    });

    socket.on("messages_read", (data) => {
      if (activeConversation && data.conversationId === activeConversation.id) {
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            isRead: msg.senderId === user.id ? true : msg.isRead,
          }))
        );
      }
    });

    socket.on("user_typing", (data) => {
      // Afficher indicateur de frappe
      console.log(
        `User ${data.userId} is typing in conversation ${data.conversationId}`
      );
    });

    return () => {
      socket.off("new_message");
      socket.off("messages_read");
      socket.off("user_typing");
    };
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/messages/conversations"
      );
      setConversations(response.data.conversations);
      console.log("response.data", response.data);
    } catch (error) {
      console.error("Erreur chargement conversations:", error);
    } finally {
      setLoading(false);
    }
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

  const updateConversationsList = () => {
    fetchConversations();
  };

  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);
    setMessages([]);

    if (socket) {
      socket.emit("join_conversation", conversation.id);
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/conversations/${conversation.id}/messages`
      );
      setMessages(response.data.messages);

      if (conversation.unreadCount > 0) {
        await markAsRead(conversation.id);
      }
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/messages/conversations/${conversationId}/read`
      );
      updateConversationsList();
      fetchUnreadCount();
    } catch (error) {
      console.error("Erreur marquage lecture:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !activeConversation || sending) return;

    setSending(true);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/messages/conversations/${activeConversation.id}/messages`,
        {
          content: newMessage.trim(),
          messageType: "text",
        }
      );

      setMessages((prev) => [...prev, response.data.data]);
      setNewMessage("");
      updateConversationsList();
    } catch (error) {
      console.error("Erreur envoi message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (socket && activeConversation) {
      socket.emit("typing", {
        conversationId: activeConversation.id,
        isTyping: true,
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", {
          conversationId: activeConversation.id,
          isTyping: false,
        });
      }, 1000);
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/search?q=${query}&type=users`
      );
      setSearchResults(response.data.results);
    } catch (error) {
      console.error("Erreur recherche utilisateurs:", error);
    }
  };

  const startNewConversation = async (userId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/messages/conversations",
        {
          participantId: userId,
        }
      );

      const newConv = response.data.conversation;
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversation(newConv);
      setShowNewConversation(false);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Erreur création conversation:", error);
    }
  };

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
      return messageDate.toLocaleDateString("fr-FR");
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
        <p className="text-gray-600">
          Connectez-vous pour accéder à vos messages.
        </p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-120px)]">
        <div className="flex h-full">
          {/* Liste des conversations */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h1 className="text-xl font-bold">Messages</h1>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                  <button
                    onClick={() => setShowNewConversation(!showNewConversation)}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                    title="Nouveau message"
                  >
                    ✏️
                  </button>
                </div>
              </div>

              {/* Nouvelle conversation */}
              {showNewConversation && (
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchUsers(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />

                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-40 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => startNewConversation(user.id)}
                          className="w-full p-2 hover:bg-gray-50 flex items-center space-x-2 text-left"
                        >
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold">
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </span>
                          </div>
                          <span className="text-sm">
                            {user.firstName} {user.lastName}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Liste des conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="text-4xl mb-2">💬</div>
                  <p>Aucune conversation</p>
                  <p className="text-sm">
                    Commencez à discuter avec d'autres utilisateurs
                  </p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${
                      activeConversation?.id === conv.id
                        ? "bg-primary-50 border-r-2 border-r-primary-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-600">
                          {conv.otherParticipant.firstName[0]}
                          {conv.otherParticipant.lastName[0]}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conv.otherParticipant.firstName}{" "}
                            {conv.otherParticipant.lastName}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {conv.lastMessageAt && (
                              <span className="text-xs text-gray-500">
                                {formatTime(conv.lastMessageAt)}
                              </span>
                            )}
                            {conv.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>

                        {conv.auction && (
                          <p className="text-xs text-gray-500 mb-1">
                            📦 {conv.auction.product.title}
                          </p>
                        )}

                        {conv.lastMessagePreview && (
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessagePreview}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Zone de chat */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Header de conversation */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-600">
                          {activeConversation.otherParticipant.firstName[0]}
                          {activeConversation.otherParticipant.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h2 className="font-medium text-gray-900">
                          {activeConversation.otherParticipant.firstName}{" "}
                          {activeConversation.otherParticipant.lastName}
                        </h2>
                        {activeConversation.auction && (
                          <p className="text-sm text-gray-500">
                            Concernant:{" "}
                            {activeConversation.auction.product.title}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Options"
                    >
                      ⋮
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message, index) => {
                    const isOwnMessage = message.senderId === user.id;
                    const showDate =
                      index === 0 ||
                      formatMessageDate(message.createdAt) !==
                        formatMessageDate(messages[index - 1].createdAt);

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="text-center text-xs text-gray-500 my-4">
                            <span className="bg-white px-2 py-1 rounded-full">
                              {formatMessageDate(message.createdAt)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md ${
                              isOwnMessage
                                ? "bg-primary-600 text-white"
                                : "bg-white text-gray-900"
                            } rounded-lg px-4 py-2 shadow-sm`}
                          >
                            {message.messageType === "system" && (
                              <div className="text-center text-sm text-gray-500 italic">
                                {message.content}
                              </div>
                            )}

                            {message.messageType === "text" && (
                              <>
                                <p className="text-sm">{message.content}</p>
                                <div
                                  className={`text-xs mt-1 flex items-center justify-end space-x-1 ${
                                    isOwnMessage
                                      ? "text-blue-100"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <span>{formatTime(message.createdAt)}</span>
                                  {isOwnMessage && (
                                    <span>{message.isRead ? "✓✓" : "✓"}</span>
                                  )}
                                </div>
                              </>
                            )}

                            {message.messageType === "image" &&
                              message.attachments && (
                                <>
                                  <img
                                    src={`http://localhost:5000/uploads/messages/${message.attachments[0]}`}
                                    alt="Image"
                                    className="max-w-full h-auto rounded-lg mb-2"
                                  />
                                  <div
                                    className={`text-xs flex items-center justify-end space-x-1 ${
                                      isOwnMessage
                                        ? "text-blue-100"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    <span>{formatTime(message.createdAt)}</span>
                                    {isOwnMessage && (
                                      <span>{message.isRead ? "✓✓" : "✓"}</span>
                                    )}
                                  </div>
                                </>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <form
                    onSubmit={sendMessage}
                    className="flex items-end space-x-2"
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Joindre un fichier"
                    >
                      📎
                    </button>

                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e);
                          }
                        }}
                        placeholder="Tapez votre message..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={1}
                        style={{ minHeight: "40px", maxHeight: "120px" }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? "..." : "➤"}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        // TODO: Implémenter l'upload de fichiers
                        console.log("Fichier sélectionné:", e.target.files[0]);
                      }}
                    />
                  </form>
                </div>
              </>
            ) : (
              /* État vide */
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-xl font-medium mb-2">
                    Sélectionnez une conversation
                  </h2>
                  <p>
                    Choisissez une conversation existante ou démarrez-en une
                    nouvelle
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
