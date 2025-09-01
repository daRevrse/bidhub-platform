import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPasswordRequest from "./pages/auth/ResetPasswordRequest";
import ResetPassword from "./pages/auth/ResetPassword";
import AuctionList from "./pages/auctions/AuctionList";
import AuctionDetails from "./pages/auctions/AuctionDetails";
import CreateProduct from "./pages/products/CreateProduct";
import AdminDashboard from "./pages/admin/Dashboard";
import Profile from "./pages/user/Profile";
import { AuthProvider } from "./contexts/AuthContext";
import PaymentPage from "./pages/payment/PaymentPage";
import PaymentStatus from "./pages/payment/PaymentStatus";
import ReviewsPage from "./pages/reviews/ReviewsPage";
import UserProfile from "./pages/users/UserProfile";
import MessagesPage from "./pages/messages/MessagesPage";
import PrivateRoute from "./components/auth/PrivateRoute";
import PublicRoute from "./components/auth/PublicRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/auctions" element={<AuctionList />} />
              <Route path="/auction/:id" element={<AuctionDetails />} />
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="/reviews" element={<ReviewsPage />} />

              {/* Pages d'information */}
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Routes d'authentification (accessibles seulement si non connecté) */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPasswordRequest />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password/:token"
                element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                }
              />

              {/* Routes privées (nécessitent une authentification) */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create-product"
                element={
                  <PrivateRoute roles={["seller", "admin"]}>
                    <CreateProduct />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment/:auctionId"
                element={
                  <PrivateRoute>
                    <PaymentPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment/:paymentId/status"
                element={
                  <PrivateRoute>
                    <PaymentStatus />
                  </PrivateRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <PrivateRoute>
                    <MessagesPage />
                  </PrivateRoute>
                }
              />

              {/* Routes d'administration (admin seulement) */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <UserManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/auctions"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <AuctionManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <Reports />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <AdminSettings />
                  </PrivateRoute>
                }
              />

              {/* Route 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Composants de pages temporaires (à créer)
const HowItWorks = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Comment ça marche</h1>
    <div className="prose max-w-none">
      <p>Guide d'utilisation de BidHub...</p>
    </div>
  </div>
);

const About = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">
      À propos de BidHub
    </h1>
    <div className="prose max-w-none">
      <p>BidHub est la première plateforme d'enchères en ligne au Togo...</p>
    </div>
  </div>
);

const Contact = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Contactez-nous</h1>
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Informations de contact</h2>
        <div className="space-y-3">
          <p>📧 contact@bidhub.tg</p>
          <p>📞 +228 90 00 00 00</p>
          <p>📍 Lomé, Togo</p>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Formulaire de contact</h2>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Votre nom"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Votre email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Votre message"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  </div>
);

const Terms = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">
      Conditions d'utilisation
    </h1>
    <div className="prose max-w-none">
      <p>Conditions d'utilisation de BidHub...</p>
    </div>
  </div>
);

const Privacy = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">
      Politique de confidentialité
    </h1>
    <div className="prose max-w-none">
      <p>Politique de confidentialité de BidHub...</p>
    </div>
  </div>
);

// Composants d'administration temporaires
const UserManagement = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">
      Gestion des utilisateurs
    </h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p>Interface de gestion des utilisateurs à venir...</p>
    </div>
  </div>
);

const AuctionManagement = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">
      Gestion des enchères
    </h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p>Interface de gestion des enchères à venir...</p>
    </div>
  </div>
);

const Reports = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">
      Rapports et analyses
    </h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p>Interface de rapports à venir...</p>
    </div>
  </div>
);

const AdminSettings = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">
      Paramètres administrateur
    </h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p>Interface de paramètres à venir...</p>
    </div>
  </div>
);

// Composant pour la page 404
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-24 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-8">
          <span className="text-4xl">🤔</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Page non trouvée
        </h2>
        <p className="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="space-y-4">
          <a
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
          >
            Retour à l'accueil
          </a>
          <a
            href="/auctions"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Voir les enchères
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
