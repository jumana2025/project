import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaSearch, FaUser } from "react-icons/fa";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";

const Navbar = () => {
    const [query, setQuery] = useState("");
    const [user, setUser] = useState(null);
    const [showLogout, setShowLogout] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Use safe defaults to prevent undefined errors
    const { cart = [] } = useContext(CartContext) || {};
    const { wishlist = [] } = useContext(WishlistContext) || {};

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) setUser(storedUser);
    }, []);

    const handleSearch = () => {
        if (query.trim() !== "") {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setQuery("");
        }
    };

    const handleEnter = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        setShowLogout(false);
        navigate("/login");
    };

    return (
        <header className="sticky top-0 z-10 shadow">
            {/* Top Navbar */}
            <div className="bg-white flex items-center justify-between p-4">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold">
                    Thushk
                </Link>

                {/* Search Bar */}
                <div className="flex w-1/2">
                    <input
                        type="text"
                        placeholder="Search for products..."
                        className="border p-2 rounded-l w-full"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleEnter}
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700 flex items-center"
                    >
                        <FaSearch />
                        <span className="ml-1">Search</span>
                    </button>
                </div>

                {/* Icons */}
                <div className="flex items-center space-x-4 relative">
                    {/* Wishlist */}
                    <Link to="/wishlist" className="relative">
                        <FaHeart size={20} className="text-pink-600 " />
                        {wishlist?.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {wishlist.length}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <Link to="/cart" className="relative">
                        <FaShoppingCart size={20} className="text-blue-600" />
                        {cart?.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {cart.length}
                            </span>
                        )}
                    </Link>

                    {/* User */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowLogout(!showLogout)}
                                className="flex items-center space-x-2 border px-3 py-1 rounded hover:bg-gray-100"
                            >
                                <FaUser className="text-blue-600" />
                                <span>Hi, {user.name}</span>
                            </button>

                            {showLogout && (
                                <button
                                    onClick={handleLogout}
                                    className="absolute right-0 mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 w-full text-center"
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="flex items-center space-x-1 border px-3 py-1 rounded hover:bg-gray-100"
                            >
                                <FaUser className="text-gray-600" />
                                <span>Login</span>
                            </Link>

                            {location.pathname === "/login" && (
                                <Link
                                    to="/register"
                                    className="px-3 py-1 border rounded hover:bg-gray-100"
                                >
                                    Register
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Navbar */}
            <div className="bg-gray-100 flex justify-center space-x-8 p-2">
                <Link to="/" className="hover:text-blue-600 font-semibold">
                    Home
                </Link>
                <Link to="/products" className="hover:text-blue-600 font-semibold">
                    All Products
                </Link>
                <Link to="/ring" className="hover:text-blue-600 font-semibold">
                    Ring
                </Link>
                <Link to="/bracelets" className="hover:text-blue-600 font-semibold">
                    Bracelets
                </Link>
                <Link to="/necklace" className="hover:text-blue-600 font-semibold">
                    Necklace
                </Link>
                <Link to="/orders" className="hover:text-blue-600 font-semibold">
                    Orders
                </Link>

            </div>
        </header>
    );
};

export default Navbar;
