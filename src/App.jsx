// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Ring from "./Pages/Ring";
import Necklace from "./Pages/Necklace";
import Bracelets from "./Pages/Bracelets";
import WishlistPage from "./Pages/WishlistPage";
import CartPage from "./Pages/CartPage";
import PaymentPage from "./Pages/PaymentPage";
import SearchPage from "./Pages/SearchPage";
import Products from "./Pages/Products";
import OrdersPage from "./Pages/OrderPage";
import AdminDashboard from "./Admin/AdminDashboard";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { OrderProvider } from "./context/OrderContext";

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <OrderProvider>
          <Router>
            {/* ✅ ToastContainer must be OUTSIDE <Routes> */}
            <ToastContainer
              position="top-right"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
              draggable
              theme="colored"
            />

            <Routes>
              {/* ✅ Protected Admin Route */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* ✅ Public Routes */}
              <Route
                path="/*"
                element={
                  <>
                    <Navbar />
                    <MainAppRoutes />
                    <Footer />
                  </>
                }
              />
            </Routes>
          </Router>
        </OrderProvider>
      </WishlistProvider>
    </CartProvider>
  );
}

function MainAppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/products" element={<Products />} />
      <Route path="/ring" element={<Ring />} />
      <Route path="/necklace" element={<Necklace />} />
      <Route path="/bracelets" element={<Bracelets />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/orders" element={<OrdersPage />} />
    </Routes>
  );
}

export default App;
