import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaSearch, FaUser } from "react-icons/fa";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";

const Navbar = () => {
    // Initialize query from URL so refreshing preserves search input
    const [query, setQuery] = useState(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('q') || '';
        } catch (e) {
            return '';
        }
    });
    const [user, setUser] = useState(null);
    const [showLogout, setShowLogout] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Use safe defaults to prevent undefined errors
    const { cart = [] } = useContext(CartContext) || {};
    const { wishlist = [] } = useContext(WishlistContext) || {};

    useEffect(() => {
        // Check both "currentUser" and "user" for compatibility
        const storedUser = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || "null");
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    // Listen for storage changes (when user logs in/out from other tabs)
    useEffect(() => {
        const handleStorageChange = () => {
            const storedUser = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || "null");
            setUser(storedUser);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Also check when the route changes
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || "null");
        if (storedUser) {
            setUser(storedUser);
        }
    }, [location.pathname]);

    // Keep input in sync with the URL query param (so refresh/back/forward keeps the input value)
    useEffect(() => {
        try {
            const params = new URLSearchParams(location.search);
            const q = params.get('q') || '';
            setQuery(q);
        } catch (e) {
            // ignore
        }
    }, [location.search]);

    const handleSearch = () => {
        if (query.trim() !== "") {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            // don't clear the input so refresh will continue to show it
        }
    };

    const handleEnter = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    const handleLogout = () => {
        // Remove all user-related data
        localStorage.removeItem("currentUser");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        setUser(null);
        setShowLogout(false);
        navigate("/login");
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md">
            {/* Top Navbar */}
            <div className="flex items-center justify-between p-4">
                {/* Logo */}
                <Link to="/" className="text-2xl text-pink-500 font-bold">
                    Thushk
                </Link>

                {/* Search Bar */}
                <div className="flex w-1/2">
                    <input
                        type="text"
                        placeholder="Search for products..."
                        className="border border-gray-300 p-2 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-pink-300"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleEnter}
                    />
                    {/* <button
                        onClick={handleSearch}
                        className="bg-pink-500 text-white px-4 rounded-r hover:bg-pink-600 flex items-center transition-colors"
                    >
                        <FaSearch />
                        <span className="ml-1">Search</span>
                    </button> */}
                </div>

                {/* Navigation Links */}
                <div className="flex items-center space-x-6">
                    <Link
                        to="/"
                        className="hover:text-pink-500 font-semibold transition-colors"
                    >
                        Home
                    </Link>
                    <Link
                        to="/products"
                        className="hover:text-pink-500 font-semibold transition-colors"
                    >
                        All Products
                    </Link>
                    <Link
                        to="/orders"
                        className="hover:text-pink-500 font-semibold transition-colors"
                    >
                        Orders
                    </Link>
                </div>

                {/* Icons Section */}
                <div className="flex items-center space-x-4 relative">
                    {/* Wishlist */}
                    <Link to="/wishlist" className="relative group">
                        <FaHeart
                            size={20}
                            className="text-pink-500 group-hover:text-pink-600 transition-colors"
                        />
                        {wishlist?.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {wishlist.length}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <Link to="/cart" className="relative group">
                        <FaShoppingCart
                            size={20}
                            className="text-pink-500 group-hover:text-pink-600 transition-colors"
                        />
                        {cart?.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {cart.reduce((total, item) => total + (item.quantity || 1), 0)}
                            </span>
                        )}
                    </Link>

                    {/* User Section */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowLogout(!showLogout)}
                                className="flex items-center space-x-2 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FaUser className="text-pink-500" />
                                <span className="text-gray-700">Hi, {user.name || user.email}</span>
                            </button>

                            {showLogout && (
                                <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                    <div className="p-2 border-b border-gray-100">
                                        <p className="text-sm text-gray-600">Signed in as</p>
                                        <p className="text-sm font-semibold">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Link
                                to="/login"
                                className="flex items-center space-x-2 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FaUser className="text-gray-600" />
                                <span className="text-gray-700">Login</span>
                            </Link>

                            {location.pathname !== "/register" && (
                                <Link
                                    to="/register"
                                    className="px-3 py-1 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-500 hover:text-white transition-colors"
                                >
                                    Register
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Close logout dropdown when clicking outside */}
            {showLogout && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLogout(false)}
                />
            )}
        </header>
    );
};

export default Navbar;