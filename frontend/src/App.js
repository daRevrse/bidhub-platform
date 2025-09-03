// frontend/src/App.js - VERSION CORRIGÉE
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
import CreateProductWizard from "./pages/products/CreateProductWizard";
import AdminDashboard from "./pages/admin/Dashboard";
import Profile from "./pages/user/Profile";
import PaymentPage from "./pages/payment/PaymentPage";
import PaymentStatus from "./pages/payment/PaymentStatus";
import ReviewsPage from "./pages/reviews/ReviewsPage";
import UserProfile from "./pages/users/UserProfile";
import MessagesPage from "./pages/messages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";

// Composants d'authentification et de protection
import PrivateRoute from "./components/auth/PrivateRoute";
import PublicRoute from "./components/auth/PublicRoute";

// Composants admin
import AuctionManagement from "./components/admin/AuctionManagement";
import Reports from "./components/admin/Reports";
import UserManagement from "./components/admin/UserManagement";
import AdminSettings from "./components/admin/AdminSettings";
import AuditLogs from "./components/admin/AuditLogs";

// Pages d'information
import HowItWorks from "./pages/info/HowItWorks";
import About from "./pages/info/About";
import Contact from "./pages/info/Contact";
import FAQ from "./pages/info/FAQ";

// Pages légales
import Legal from "./pages/legal/Legal";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Cookies from "./pages/legal/Cookies";

// Contextes et providers
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

// Toast notifications
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Routes publiques principales */}
                <Route path="/" element={<Home />} />
                <Route path="/auctions" element={<AuctionList />} />
                <Route path="/auction/:id" element={<AuctionDetails />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="/reviews" element={<ReviewsPage />} />

                {/* Pages d'information */}
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />

                {/* Pages légales */}
                <Route path="/legal" element={<Legal />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/cookies" element={<Cookies />} />

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

                {/* Routes pour vendeurs et admins */}
                <Route
                  path="/create-product"
                  element={
                    <PrivateRoute roles={["seller", "admin"]}>
                      <CreateProduct />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/create-product-wizard"
                  element={
                    <PrivateRoute roles={["seller", "admin"]}>
                      <CreateProductWizard />
                    </PrivateRoute>
                  }
                />

                {/* Routes utilisateur authentifié */}
                <Route
                  path="/messages"
                  element={
                    <PrivateRoute>
                      <MessagesPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <PrivateRoute>
                      <NotificationsPage />
                    </PrivateRoute>
                  }
                />

                {/* Routes de paiement */}
                <Route
                  path="/payment/:auctionId"
                  element={
                    <PrivateRoute>
                      <PaymentPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/payment-status"
                  element={
                    <PrivateRoute>
                      <PaymentStatus />
                    </PrivateRoute>
                  }
                />

                {/* Routes d'administration */}
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute roles={["admin"]}>
                      <AdminDashboard />
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
                  path="/admin/users"
                  element={
                    <PrivateRoute roles={["admin"]}>
                      <UserManagement />
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
                <Route
                  path="/admin/audit-logs"
                  element={
                    <PrivateRoute roles={["admin"]}>
                      <AuditLogs />
                    </PrivateRoute>
                  }
                />

                {/* Route 404 - Page non trouvée */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <span className="text-4xl">🚫</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                          Page non trouvée
                        </h1>
                        <p className="text-gray-600 mb-6">
                          La page que vous recherchez n'existe pas ou a été
                          déplacée.
                        </p>
                        <a
                          href="/"
                          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                          Retourner à l'accueil
                        </a>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </main>
            <Footer />

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                  borderRadius: "12px",
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "#10B981",
                    secondary: "#fff",
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: "#EF4444",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
