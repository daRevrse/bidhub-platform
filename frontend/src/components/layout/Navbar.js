import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import MessageNotification from "../messaging/MessageNotification";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">BidHub</span>
            <span className="ml-2 text-sm text-gray-500">Togo</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/auctions"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Enchères
            </Link>
            {user && (user.role === "seller" || user.role === "admin") && (
              <Link
                to="/create-product"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Vendre
              </Link>
            )}
            <Link
              to="/categories"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Catégories
            </Link>
            <Link
              to="/how-it-works"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Comment ça marche
            </Link>
            <Link
              to="/reviews"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Avis
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <MessageNotification />
                <span className="text-gray-700">Bonjour, {user.firstName}</span>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="btn-secondary">
                  Profil
                </Link>
                <button onClick={handleLogout} className="btn-primary">
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Connexion
                </Link>
                <Link to="/register" className="btn-primary">
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
