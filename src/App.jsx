import React from "react"
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./Pages/Home"
import Login from "./Pages/Login"
import Register from "./Pages/Register"




function App() {
  return (
    <Router>
      {/* ✅ Navbar appears on all pages */}
      <Navbar />

      {/* ✅ Page Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App
