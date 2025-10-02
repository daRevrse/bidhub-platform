import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../admin/AdminLayout";

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600 font-medium">
            Vérification de l'authentification...
          </p>
        </div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les rôles si spécifiés
  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-24 w-24 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg mb-8">
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Accès refusé
          </h2>
          <p className="text-gray-600 mb-8">
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            page.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
            >
              Retour
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Accueil
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === "admin") {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return children;
};

export default PrivateRoute;
