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
                path="/admin"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <AdminDashboard />
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

// Composant pour la page 404
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-24 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-8">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.5a7.962 7.962 0 01-5.207-1.021C6.276 19.002 6.1 18.752 6 18.5v-2.25C6 15.56 6.44 15.12 7.125 15.12c1.072 0 1.875.832 1.875 1.875S8.197 18.87 7.125 18.87c-.685 0-1.125-.44-1.125-.995V16.5"
            />
          </svg>
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
