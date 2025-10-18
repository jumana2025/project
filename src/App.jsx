import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { OrderProvider } from "./context/OrderContext";
import PaymentPage from "./Pages/PaymentPage";
import SearchPage from "./Pages/SearchPage";
import Products from "./Pages/Products";
import OrdersPage from "./Pages/OrderPage";



function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <OrderProvider>
          <Router>
            <Navbar />


            {/* Page Routes */}

            < Routes >
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/ring" element={<Ring />} />
              <Route path="/necklace" element={<Necklace />} />

              <Route path="/bracelets" element={<Bracelets />} />  {/* was Bracelet */}
              <Route path="/wishlist" element={<WishlistPage />} />  {/* lowercase */}
              <Route path="/cart" element={<CartPage />} />  {/* lowercase */}
              <Route path="/payment" element={<PaymentPage />} /> {/* ✅ lowercase */}
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/search" element={<SearchPage />} />
            </Routes>
            <Footer />
          </Router>
        </OrderProvider>
      </WishlistProvider>
    </CartProvider>

  );
}

export default App;

