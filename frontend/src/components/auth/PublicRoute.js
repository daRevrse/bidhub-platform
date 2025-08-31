import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers la page précédente ou l'accueil si déjà authentifié
  if (user) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return children;
};

export default PublicRoute;
