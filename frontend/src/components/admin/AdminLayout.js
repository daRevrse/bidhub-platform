// frontend/src/components/admin/AdminLayout.js
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  HomeIcon,
  UsersIcon,
  TagIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  BellIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Si l'utilisateur n'est pas admin, rediriger
  React.useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: HomeIcon,
      current: location.pathname === "/admin",
    },
    {
      name: "Utilisateurs",
      href: "/admin/users",
      icon: UsersIcon,
      current: location.pathname.startsWith("/admin/users"),
      badge: null, // Sera peuplé dynamiquement
    },
    {
      name: "Demandes Vendeur",
      href: "/admin/seller-requests",
      icon: ClipboardDocumentListIcon,
      current: location.pathname.startsWith("/admin/seller-requests"),
      badge: null, // Sera peuplé dynamiquement
    },
    {
      name: "Catégories",
      href: "/admin/categories",
      icon: TagIcon,
      current: location.pathname.startsWith("/admin/categories"),
    },
    {
      name: "Enchères",
      href: "/admin/auctions",
      icon: ShoppingBagIcon,
      current: location.pathname.startsWith("/admin/auctions"),
    },
    {
      name: "Paiements",
      href: "/admin/payments",
      icon: CreditCardIcon,
      current: location.pathname.startsWith("/admin/payments"),
    },
    {
      name: "Signalements",
      href: "/admin/reports",
      icon: ExclamationTriangleIcon,
      current: location.pathname.startsWith("/admin/reports"),
      badge: null, // Sera peuplé dynamiquement
    },
    {
      name: "Statistiques",
      href: "/admin/stats",
      icon: ChartBarIcon,
      current: location.pathname.startsWith("/admin/stats"),
    },
    {
      name: "Logs Audit",
      href: "/admin/audit",
      icon: DocumentTextIcon,
      current: location.pathname.startsWith("/admin/audit"),
    },
    {
      name: "Paramètres",
      href: "/admin/settings",
      icon: CogIcon,
      current: location.pathname.startsWith("/admin/settings"),
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Mobile */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.current ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                  {item.name}
                </div>
                {item.badge && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200"></div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.current ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                  {item.name}
                </div>
                {item.badge && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64">
        {/* Contenu de la page */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
