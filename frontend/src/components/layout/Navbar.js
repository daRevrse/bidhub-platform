import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import MessageNotification from "../messaging/MessageNotification";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
  BellIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

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
    { name: "Avis", href: "/reviews", public: true },
    { name: "Comment ça marche", href: "/how-it-works", public: true },
  ];

  const isActiveLink = (href) => {
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
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg
                  className="w-5 h-5 text-white font-bold"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BidHub
                </span>
                <span className="text-xs text-gray-500 -mt-1">Togo</span>
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

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group ${
                      isActiveLink(item.href)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                    <div
                      className={`absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-200 group-hover:w-full group-hover:left-0 ${
                        isActiveLink(item.href) ? "w-full left-0" : ""
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Messages (Desktop) */}
                  <div className="hidden md:block">
                    <MessageNotification />
                  </div>

                  {/* Profile Menu */}
                  <div className="relative">
                    <button
                      onClick={toggleProfileMenu}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </span>
                      </div>
                      <div className="hidden md:block text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {user.role === "seller"
                            ? "Vendeur"
                            : user.role === "admin"
                            ? "Admin"
                            : "Acheteur"}
                        </div>
                      </div>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                          isProfileMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>

                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <UserCircleIcon className="w-4 h-4 mr-3" />
                          Mon profil
                        </Link>

                        <Link
                          to="/messages"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors md:hidden"
                        >
                          <BellIcon className="w-4 h-4 mr-3" />
                          Messages
                        </Link>

                        {user.role === "admin" && (
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <CogIcon className="w-4 h-4 mr-3" />
                            Administration
                          </Link>
                        )}

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActiveLink(item.href)
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
