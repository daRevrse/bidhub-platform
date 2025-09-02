// frontend/src/App.js - VERSION MISE À JOUR avec toutes les nouvelles routes
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
import AuctionManagement from "./components/admin/AuctionManagement";
import Reports from "./components/admin/Reports";
import UserManagement from "./components/admin/UserManagement";
import AdminSettings from "./components/admin/AdminSettings";
import AuditLogs from "./components/admin/AuditLogs";
import HowItWorks from "./pages/info/HowItWorks";
import About from "./pages/info/About";
import Contact from "./pages/info/Contact";
// import Categories from "./pages/info/Categories";
// import BecomeSeller from "./pages/info/BecomeSeller";
import FAQ from "./pages/info/FAQ";
// import Help from "./pages/info/Help";
// import Blog from "./pages/info/Blog";
// import Careers from "./pages/info/Careers";
// import Terms from "./pages/info/Terms";
// import Privacy from "./pages/info/Privacy";
// import Cookies from "./pages/info/Cookies";
import Legal from "./pages/legal/Legal";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Cookies from "./pages/legal/Cookies";

function App() {
  return (
    <AuthProvider>
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
              {/* <Route path="/categories" element={<Categories />} /> */}
              {/* <Route path="/become-seller" element={<BecomeSeller />} /> */}
              <Route path="/faq" element={<FAQ />} />
              {/* <Route path="/help" element={<Help />} /> */}
              {/* <Route path="/blog" element={<Blog />} /> */}
              {/* <Route path="/careers" element={<Careers />} /> */}
              {/* <Route path="/press" element={<Press />} /> */}
              <Route path="/report" element={<Reports />} />

              {/* Pages légales */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/legal" element={<Legal />} />
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

              {/* Routes administrateur */}
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
                path="/admin/audit"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <AuditLogs />
                  </PrivateRoute>
                }
              />

              {/* Page 404 */}
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
          <span className="text-4xl">🤔</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Page non trouvée
        </h2>
        <p className="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg transform hover:scale-105"
          >
            Retour à l'accueil
          </a>
          <a
            href="/auctions"
            className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200"
          >
            Voir les enchères
          </a>
        </div>

        {/* Crédit GCSGC Agency */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            BidHub - Une création{" "}
            <a
              href="https://darevrse.github.io/site-gcsgc-agency/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              GCSGC Agency
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
