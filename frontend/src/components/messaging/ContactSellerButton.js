import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const ContactSellerButton = ({
  auction,
  className = "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors",
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleContact = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.id === auction.product.seller.id) {
      return; // L'utilisateur ne peut pas se contacter lui-même
    }

    setCreating(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/messages/conversations",
        {
          participantId: auction.product.seller.id,
          auctionId: auction.id,
        }
      );

      // Rediriger vers la page de messages avec la conversation active
      navigate(`/messages?conversation=${response.data.conversation.id}`);
    } catch (error) {
      console.error("Erreur création conversation:", error);
      // En cas d'erreur, rediriger quand même vers les messages
      navigate("/messages");
    } finally {
      setCreating(false);
    }
  };

  // Ne pas afficher le bouton si l'utilisateur est le vendeur
  if (user && user.id === auction.product.seller.id) {
    return null;
  }

  return (
    <button
      onClick={handleContact}
      disabled={creating}
      className={`${className} ${
        creating ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title="Contacter le vendeur"
    >
      {creating ? (
        <span className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          Connexion...
        </span>
      ) : (
        <span className="flex items-center">💬 Contacter le vendeur</span>
      )}
    </button>
  );
};

export default ContactSellerButton;
