import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
  const AdminRoute = ({ element }) => {
    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    return currentUser.role === "admin" ? element : <Navigate to="/" />;
  };

  return (
    <CartProvider>
      <WishlistProvider>
        <OrderProvider>
          <Router>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
              draggable
            />


            <RouteConditionalRenderer />
          </Router>
        </OrderProvider>
      </WishlistProvider>
    </CartProvider>
  );
}


function RouteConditionalRenderer() {
  const location = window.location.pathname;

  if (location.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <MainAppRoutes />
      <Footer />
    </>
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