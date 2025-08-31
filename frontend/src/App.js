import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auctions" element={<AuctionList />} />
              <Route path="/auction/:id" element={<AuctionDetails />} />
              <Route path="/create-product" element={<CreateProduct />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment/:auctionId" element={<PaymentPage />} />
              <Route
                path="/payment/:paymentId/status"
                element={<PaymentStatus />}
              />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="/messages" element={<MessagesPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
