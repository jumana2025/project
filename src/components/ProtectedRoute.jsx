import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    // ✅ Check user info from localStorage
    const user =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("currentUser"));

    // ⛔ If no user found
    if (!user) {
        console.log("⛔ No user found, redirecting to login...");
        return <Navigate to="/login" replace />;
    }

    // ⛔ If user is not admin
    if (user.role?.toLowerCase() !== "admin") {
        console.log("🚫 Not an admin, redirecting to home...");
        return <Navigate to="/" replace />;
    }

    // ✅ Admin found
    console.log("✅ Access granted to admin route");
    return children;
};

export default ProtectedRoute;