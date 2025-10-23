import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FaHeart } from "react-icons/fa";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Bracelet() {
    const [bracelets, setBracelets] = useState([]);
    const [filteredBracelets, setFilteredBracelets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [priceRange, setPriceRange] = useState("all");
    const [sortOption, setSortOption] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const productsPerPage = 8;

    const { cart, addToCart } = useContext(CartContext);
    const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
    const navigate = useNavigate();

    // ✅ Fetch bracelets
    useEffect(() => {
        axios
            .get("http://localhost:5000/bracelets")
            .then(res => {
                setBracelets(res.data || []);
                setFilteredBracelets(res.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching bracelets:", err);
                setLoading(false);
            });
    }, []);

    // ✅ Filter & Sort
    useEffect(() => {
        let temp = [...bracelets];
        if (priceRange !== "all") {
            temp = temp.filter(item => {
                const price = Number(item.offerPrice);
                if (priceRange === "0-500") return price <= 500;
                if (priceRange === "500-1000") return price > 500 && price <= 1000;
                if (priceRange === "1000+") return price > 1000;
                return true;
            });
        }

        if (sortOption === "price-low-high") temp.sort((a, b) => Number(a.offerPrice) - Number(b.offerPrice));
        else if (sortOption === "price-high-low") temp.sort((a, b) => Number(b.offerPrice) - Number(a.offerPrice));
        else if (sortOption === "name-az") temp.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        setFilteredBracelets(temp);
        setCurrentPage(1);
    }, [priceRange, sortOption, bracelets]);

    // Pagination
    const indexOfLast = currentPage * productsPerPage;
    const indexOfFirst = indexOfLast - productsPerPage;
    const currentProducts = filteredBracelets.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredBracelets.length / productsPerPage);

    // Wishlist
    const isInWishlist = id => wishlist.some(p => p.id === id);
    const handleWishlistClick = item => {
        if (isInWishlist(item.id)) removeFromWishlist(item.id);
        else addToWishlist(item);
    };

    // Add to Cart
    const handleAddToCart = (item) => {
        const user = localStorage.getItem("user");
        if (!user) {
            alert("Please login to add products to your cart.");
            navigate("/login");
            return;
        }
        addToCart(item, 1);
        toast.success("Product added to cart!");
    };

    // Check if product is in cart
    const isInCart = (id) => cart.some(item => item.id === id);

    // Buy Now
    const handleBuyNow = (item) => {
        const productToBuy = {
            id: item.id,
            name: item.name,
            offerPrice: item.offerPrice,
            image: item.image,
            description: item.description,
        };
        navigate("/payment", { state: { product: productToBuy } });
    };

    if (loading) return <p className="text-center mt-10 text-gray-500">Loading bracelets...</p>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold text-center mb-8 tracking-wide">Bracelet Collection</h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm mb-8 gap-4">
                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={priceRange}
                        onChange={e => setPriceRange(e.target.value)}
                        className="p-2 border rounded w-full md:w-auto"
                    >
                        <option value="all">All Prices</option>
                        <option value="0-500">Below ₹500</option>
                        <option value="500-1000">₹500 - ₹1000</option>
                        <option value="1000+">Above ₹1000</option>
                    </select>

                    <select
                        value={sortOption}
                        onChange={e => setSortOption(e.target.value)}
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
                {currentProducts.map(item => (
                    <div
                        key={item.id}
                        className="relative border rounded-xl overflow-hidden shadow bg-white hover:shadow-lg transition group"
                    >
                        <button
                            onClick={() => handleWishlistClick(item)}
                            className="absolute top-3 right-3 z-10"
                        >
                            <FaHeart
                                className={`text-2xl cursor-pointer transition ${isInWishlist(item.id)
                                    ? "text-pink-500"
                                    : "text-gray-400 hover:text-pink-400"
                                    }`}
                            />
                        </button>

                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-56 object-cover cursor-pointer"
                            onClick={() => setSelectedProduct(item)}
                        />

                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-1 truncate">{item.name}</h2>
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-gray-400 line-through text-sm">₹{item.originalPrice}</span>
                                <span className="text-pink-400 font-bold text-lg">₹{item.offerPrice}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="bg-pink-400 text-white px-4 py-2 rounded hover:bg-pink-500"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => handleBuyNow(item)}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-10 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-full transition ${page === currentPage
                            ? "bg-pink-400 text-white shadow"
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
                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-2 right-2 text-gray-600 hover:text-black"
                        >
                            ✕
                        </button>

                        <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="w-full h-56 object-cover rounded mb-3"
                        />
                        <h2 className="text-xl font-semibold mb-1">{selectedProduct.name}</h2>
                        <p className="text-gray-600 mb-2">{selectedProduct.description}</p>
                        <p className="text-pink-500 font-bold text-lg mb-4">
                            ₹{selectedProduct.offerPrice}
                        </p>

                        <div className="flex gap-3">
                            {isInCart(selectedProduct.id) ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => addToCart(selectedProduct, -1)}
                                        className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
                                    >
                                        −
                                    </button>
                                    <span className="font-semibold">
                                        {cart.find(item => item.id === selectedProduct.id)?.quantity || 1}
                                    </span>
                                    <button
                                        onClick={() => addToCart(selectedProduct, 1)}
                                        className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        addToCart(selectedProduct, 1);
                                        toast.success("Product added to cart!");
                                    }}
                                    className="bg-pink-400 text-white px-4 py-2 rounded hover:bg-pink-500"
                                >
                                    Add to Cart
                                </button>
                            )}

                            <button
                                onClick={() => { handleBuyNow(selectedProduct); setSelectedProduct(null); }}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
                            >
                                Buy Now
                            </button>

                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Bracelet;
