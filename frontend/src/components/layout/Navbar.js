// frontend/src/components/layout/Navbar.js - VERSION CORRIGÉE
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import MessageNotification from "../messaging/MessageNotification";
import NotificationDropdown from "../notifications/NotificationDropdown";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
  BellIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Logo } from "./Logo";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Détection du scroll pour l'effet de transparence
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer les menus lors du changement de route
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsProfileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Navigation items
  const navigationItems = [
    { name: "Enchères", href: "/auctions", public: true },
    {
      name: "Vendre",
      href: "/create-product",
      public: false,
      roles: ["seller", "admin"],
    },
    {
      name: "Avis",
      href: "/reviews",
      public: false,
      roles: ["user", "seller", "admin"],
    },
    { name: "Comment ça marche", href: "/how-it-works", public: true },
  ];

  // CORRECTION: Amélioration de la fonction isActiveLink
  const isActiveLink = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50"
            : "bg-white/90 backdrop-blur-sm shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* CORRECTION: Logo avec dimensions fixes pour éviter qu'il soit cliquable sur toute la hauteur */}
            <Link
              to="/"
              className="flex items-center space-x-2 group flex-shrink-0"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                <Logo className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col h-8 justify-center">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none">
                  BidHub
                </span>
                <span className="text-xs text-gray-500 leading-none">Togo</span>
              </div>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                // Vérifier si l'item doit être affiché
                const shouldShow =
                  item.public ||
                  (user && (!item.roles || item.roles.includes(user.role)));

                if (!shouldShow) return null;

                const isActive = isActiveLink(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group ${
                      isActive
                        ? "text-blue-600 bg-blue-50 shadow-sm"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                    {/* CORRECTION: Indicateur visuel plus clair pour les liens actifs */}
                    <div
                      className={`absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-200 ${
                        isActive
                          ? "w-full left-0"
                          : "w-0 group-hover:w-full group-hover:left-0"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* NOUVEAU: Bouton de notifications */}
                  <NotificationDropdown />

                  {/* Messages */}
                  <MessageNotification />

                  {/* User Profile */}
                  <div className="relative">
                    <button
                      onClick={toggleProfileMenu}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="w-8 h-8 text-gray-600" />
                      )}
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-900">
                          {user.firstName}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {user.role}
                        </span>
                      </div>
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-50">
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.firstName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <UserCircleIcon className="w-10 h-10 text-gray-600" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <UserCircleIcon className="w-4 h-4 mr-3" />
                            Mon Profil
                          </Link>
                          {/* <Link
                            to="/settings"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <CogIcon className="w-4 h-4 mr-3" />
                            Paramètres
                          </Link> */}
                          {user.role === "admin" && (
                            <Link
                              to="/admin"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <CogIcon className="w-4 h-4 mr-3" />
                              Administration
                            </Link>
                          )}
                          <hr className="my-2" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                            Déconnexion
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Guest Actions */}
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    S'inscrire
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => {
                const shouldShow =
                  item.public ||
                  (user && (!item.roles || item.roles.includes(user.role)));

                if (!shouldShow) return null;

                const isActive = isActiveLink(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {!user && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Connexion
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Overlay pour fermer les menus */}
      {(isProfileMenuOpen || isMenuOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => {
            setIsProfileMenuOpen(false);
            setIsMenuOpen(false);
          }}
        />
      )}

      {/* Spacer pour compenser la navbar fixe */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
