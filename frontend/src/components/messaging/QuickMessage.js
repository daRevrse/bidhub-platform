import React, { useState } from "react";
import axios from "axios";

const QuickMessage = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  auctionId = null,
  onSuccess,
}) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const predefinedMessages = [
    "Bonjour, je suis intéressé(e) par votre produit.",
    "Pouvez-vous me donner plus de détails ?",
    "Le produit est-il toujours disponible ?",
    "Acceptez-vous une négociation ?",
    "Quand peut-on organiser la livraison ?",
  ];

  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);

    try {
      // Créer ou récupérer la conversation
      const conversationResponse = await axios.post(
        "http://localhost:5000/api/messages/conversations",
        {
          participantId: recipientId,
          auctionId,
        }
      );

      const conversationId = conversationResponse.data.conversation.id;

      // Envoyer le message
      await axios.post(
        `http://localhost:5000/api/messages/conversations/${conversationId}/messages`,
        {
          content: message.trim(),
          messageType: "text",
        }
      );

      setMessage("");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Erreur envoi message:", error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Message à {recipientName}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Messages pré-définis */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Messages rapides :
            </label>
            <div className="space-y-2">
              {predefinedMessages.map((predefined, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(predefined)}
                  className="w-full text-left text-sm p-2 bg-gray-50 hover:bg-gray-100 rounded border"
                >
                  {predefined}
                </button>
              ))}
            </div>
          </div>

          {/* Zone de saisie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre message :
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button onClick={onClose} className="btn-secondary">
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="btn-primary disabled:opacity-50"
          >
            {sending ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickMessage;
