import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaSearch } from "react-icons/fa";

const Navbar = () => {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = () => {
        if (query.trim() !== "") {
            // Navigate to search results page or filtered products
            navigate();
            setQuery("");
        }
    };

    const handleEnter = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <header className="sticky top-0 z-10 shadow">
            {/* Top Navbar */}
            <div className="bg-white flex items-center justify-between p-4">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold">Thushk</Link>

                {/* Search Bar with Button */}
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
                <div className="flex items-center space-x-4">
                    <FaHeart size={20} />
                    <FaShoppingCart size={20} />
                    <Link to="/login" className="px-3 py-1 border rounded">Login</Link>
                    <Link to="/register" className="px-3 py-1 border rounded">Register</Link>
                </div>
            </div>

            {/* Bottom Navbar - Categories */}
            <div className="bg-gray-100 flex justify-center space-x-8 p-2">
                <Link to="/products/ring" className="hover:text-blue-600 font-semibold">Rings</Link>
                <Link to="/products/bracelet" className="hover:text-blue-600 font-semibold">Bracelets</Link>
                <Link to="/products/necklace" className="hover:text-blue-600 font-semibold">Necklaces</Link>
            </div>
        </header>
    );
};

export default Navbar;