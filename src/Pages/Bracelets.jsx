import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FaHeart } from "react-icons/fa";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";

function Bracelet() {
    const [bracelets, setBracelets] = useState([]);
    const [filteredBracelets, setFilteredBracelets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [priceRange, setPriceRange] = useState("all");
    const [sortOption, setSortOption] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;

    const [selectedProduct, setSelectedProduct] = useState(null);

    const { addToCart } = useContext(CartContext);
    const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);

    // Fetch Bracelets
    useEffect(() => {
        axios
            .get("http://localhost:5000/bracelets")
            .then((res) => {
                setBracelets(res.data);
                setFilteredBracelets(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching bracelets:", err);
                setLoading(false);
            });
    }, []);

    // Filters + Sorting
    useEffect(() => {
        let temp = [...bracelets];

        if (priceRange !== "all") {
            if (priceRange === "0-500") temp = temp.filter(item => item.offerPrice <= 500);
            else if (priceRange === "500-1000") temp = temp.filter(item => item.offerPrice > 500 && item.offerPrice <= 1000);
            else if (priceRange === "1000+") temp = temp.filter(item => item.offerPrice > 1000);
        }

        if (sortOption === "price-low-high") temp.sort((a, b) => a.offerPrice - b.offerPrice);
        else if (sortOption === "price-high-low") temp.sort((a, b) => b.offerPrice - a.offerPrice);
        else if (sortOption === "name-az") temp.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        setFilteredBracelets(temp);
        setCurrentPage(1);
    }, [priceRange, sortOption, bracelets]);

    // Wishlist functions
    const isInWishlist = (itemId) => wishlist.some(product => product.id === itemId);
    const handleWishlistClick = (item) => {
        if (isInWishlist(item.id)) removeFromWishlist(item.id);
        else addToWishlist(item);
    };

    // Pagination
    const indexOfLast = currentPage * productsPerPage;
    const indexOfFirst = indexOfLast - productsPerPage;
    const currentProducts = filteredBracelets.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredBracelets.length / productsPerPage);

    if (loading) return <p className="text-center mt-10 text-gray-500">Loading bracelets...</p>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold text-center mb-8 tracking-wide">
                Bracelet Collection
            </h1>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm mb-8 gap-4">
                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="p-2 border rounded w-full md:w-auto"
                    >
                        <option value="all">All Prices</option>
                        <option value="0-500">Below ₹500</option>
                        <option value="500-1000">₹500 - ₹1000</option>
                        <option value="1000+">Above ₹1000</option>
                    </select>

                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="p-2 border rounded w-full md:w-auto"
                    >
                        <option value="default">Sort By</option>
                        <option value="price-low-high">Price: Low → High</option>
                        <option value="price-high-low">Price: High → Low</option>
                        <option value="name-az">Name: A–Z</option>
                    </select>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentProducts.map((item) => (
                    <div
                        key={item.id}
                        className="relative border rounded-xl overflow-hidden shadow bg-white hover:shadow-lg transition group"
                    >
                        {/* Wishlist Icon */}
                        <button
                            onClick={() => handleWishlistClick(item)}
                            className="absolute top-2 right-2 z-10"
                            aria-label="Add to wishlist"
                        >
                            <FaHeart
                                className={`text-2xl cursor-pointer transition-colors ${isInWishlist(item.id) ? "text-red-500" : "text-gray-400 hover:text-pink-400"
                                    }`}
                            />
                        </button>

                        {/* Product Image */}
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-56 object-cover cursor-pointer"
                            onClick={() => setSelectedProduct(item)}
                        />

                        {/* Product Info */}
                        <div
                            className="p-4 cursor-pointer"
                            onClick={() => setSelectedProduct(item)}
                        >
                            <h2 className="text-lg font-semibold mb-1 truncate">{item.name}</h2>
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-400 line-through text-sm">
                                    ₹{item.originalPrice}
                                </span>
                                <span className="text-indigo-600 font-bold text-lg">
                                    ₹{item.offerPrice}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-3">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-10 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-full transition ${page === currentPage
                                ? "bg-blue-600 text-white shadow"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                        >
                            ✕
                        </button>
                        <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="w-full h-64 object-cover rounded mb-4"
                        />
                        <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                        <p className="text-gray-700 mb-4">{selectedProduct.description}</p>
                        <div className="flex items-center space-x-3 mb-4">
                            <span className="text-gray-400 line-through text-sm">
                                ₹{selectedProduct.originalPrice}
                            </span>
                            <span className="text-indigo-600 font-bold text-xl">
                                ₹{selectedProduct.offerPrice}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => addToCart(selectedProduct, 1)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={() => handleWishlistClick(selectedProduct)}
                                className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
                            >
                                {isInWishlist(selectedProduct.id) ? "Remove Wishlist" : "Add to Wishlist"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Bracelet;
