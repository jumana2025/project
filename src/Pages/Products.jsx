import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { FaHeart } from "react-icons/fa";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Products() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [categoryFilter, setCategoryFilter] = useState(() => {
        try { return localStorage.getItem('products.categoryFilter') || 'all'; } catch (e) { return 'all'; }
    });
    const [priceRange, setPriceRange] = useState(() => {
        try { return localStorage.getItem('products.priceRange') || 'all'; } catch (e) { return 'all'; }
    });
    const [sortOption, setSortOption] = useState(() => {
        try { return localStorage.getItem('products.sortOption') || 'default'; } catch (e) { return 'default'; }
    });

    const [currentPage, setCurrentPage] = useState(() => {
        try { return Number(localStorage.getItem('products.currentPage')) || 1; } catch (e) { return 1; }
    });
    const productsPerPage = 8;

    const [selectedProduct, setSelectedProduct] = useState(null);

    const { cart, addToCart } = useContext(CartContext);
    const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);

    const navigate = useNavigate();

    // Fetch products
    useEffect(() => {
        Promise.all([
            axios.get("http://localhost:5000/ring"),
            axios.get("http://localhost:5000/necklace"),
            axios.get("http://localhost:5000/bracelets"),
        ])
            .then(([ringsRes, necklacesRes, braceletsRes]) => {
                const allProducts = [...ringsRes.data, ...necklacesRes.data, ...braceletsRes.data];
                setProducts(allProducts);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching products:", err);
                setLoading(false);
            });
    }, []);

    // Filters & sorting
    const didMountRef = useRef(false);

    useEffect(() => {
        let temp = [...products];

        // Category filter
        if (categoryFilter !== "all") temp = temp.filter((item) => item.category === categoryFilter);

        // Price filter
        if (priceRange !== "all") {
            if (priceRange === "0-500") temp = temp.filter((i) => i.offerPrice <= 500);
            else if (priceRange === "500-1000") temp = temp.filter((i) => i.offerPrice > 500 && i.offerPrice <= 1000);
            else if (priceRange === "1000+") temp = temp.filter((i) => i.offerPrice > 1000);
        }

        // Sorting
        if (sortOption === "price-low-high") temp.sort((a, b) => a.offerPrice - b.offerPrice);
        else if (sortOption === "price-high-low") temp.sort((a, b) => b.offerPrice - a.offerPrice);
        else if (sortOption === "name-az") temp.sort((a, b) => (a.name || a.title).localeCompare(b.name || b.title));

        setFilteredProducts(temp);
        if (didMountRef.current) {
            setCurrentPage(1);
        } else {
            didMountRef.current = true;
        }
    }, [categoryFilter, priceRange, sortOption, products]);

    // Persist filter/sort/page so refresh keeps the view
    useEffect(() => { try { localStorage.setItem('products.categoryFilter', categoryFilter); } catch (e) { } }, [categoryFilter]);
    useEffect(() => { try { localStorage.setItem('products.priceRange', priceRange); } catch (e) { } }, [priceRange]);
    useEffect(() => { try { localStorage.setItem('products.sortOption', sortOption); } catch (e) { } }, [sortOption]);
    useEffect(() => { try { localStorage.setItem('products.currentPage', String(currentPage)); } catch (e) { } }, [currentPage]);

    // Pagination
    const indexOfLast = currentPage * productsPerPage;
    const indexOfFirst = indexOfLast - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // Wishlist check
    const isInWishlist = (itemId) => wishlist.some((product) => product.id === itemId);
    const handleWishlistClick = (item) => {
        if (isInWishlist(item.id)) {
            removeFromWishlist(item.id);
            toast.error("Removed from wishlist");
        } else {
            addToWishlist(item);
            toast.success("Added to wishlist");
        }
    };

    // Cart check
    const isInCart = (itemId) => cart.some((product) => product.id === itemId);

    if (loading) return <p className="text-center mt-10 text-gray-500">Loading products...</p>;

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <h1 className="text-4xl font-bold text-center mb-8 tracking-wide">All Products</h1>

                {/* Category Highlight */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                    {["ring", "bracelets", "necklace"].map((cat) => {
                        const catProduct = products.find((p) => p.category === cat);
                        if (!catProduct) return null;
                        return (
                            <div
                                key={cat}
                                className="relative group cursor-pointer hover:scale-105 hover:translate-y-1 transition-transform duration-300"
                                onClick={() => navigate(`/${cat}`)}
                            >
                                <img
                                    src={catProduct.image}
                                    alt={cat}
                                    className="w-full h-40 object-cover rounded-lg shadow-lg group-hover:shadow-2xl"
                                />
                                <div className="absolute inset-0 bg-black/25 flex items-center justify-center text-white text-lg font-bold rounded-lg">
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm mb-8 gap-4">
                    <div className="flex gap-3 w-full md:w-auto">
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="p-2 border rounded w-full md:w-auto">
                            <option value="all">All Categories</option>
                            <option value="ring">Ring</option>
                            <option value="bracelets">Bracelets</option>
                            <option value="necklace">Necklace</option>
                        </select>
                        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="p-2 border rounded w-full md:w-auto">
                            <option value="all">All Prices</option>
                            <option value="0-500">Below ₹500</option>
                            <option value="500-1000">₹500 - ₹1000</option>
                            <option value="1000+">Above ₹1000</option>
                        </select>
                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="p-2 border rounded w-full md:w-auto">
                            <option value="default">Sort By</option>
                            <option value="price-low-high">Price: Low → High</option>
                            <option value="price-high-low">Price: High → Low</option>
                            <option value="name-az">Name: A–Z</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {currentProducts.map((item) => {
                        const inWishlist = isInWishlist(item.id);
                        return (
                            <div key={item.id} className="relative border rounded-xl overflow-hidden shadow bg-white hover:shadow-lg transition group">
                                <button onClick={() => handleWishlistClick(item)} className="absolute top-3 right-3 z-10">
                                    <FaHeart className={`text-2xl cursor-pointer transition ${inWishlist ? "text-pink-500" : "text-gray-400 hover:text-pink-400"}`} />
                                </button>
                                <img
                                    src={item.image}
                                    alt={item.name || item.title}
                                    className="w-full h-56 object-cover cursor-pointer"
                                    onClick={() => setSelectedProduct(item)}
                                />
                                <div className="p-4 cursor-pointer" onClick={() => setSelectedProduct(item)}>
                                    <h2 className="text-lg font-semibold mb-1 truncate">{item.name || item.title}</h2>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-400 line-through text-sm">₹{item.originalPrice}</span>
                                        <span className="text-indigo-600 font-bold text-lg">₹{item.offerPrice}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-10 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-full transition ${page === currentPage ? "bg-blue-600 text-white shadow" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                {/* Product Modal */}
                {selectedProduct && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                        onClick={() => setSelectedProduct(null)}
                    >
                        <div
                            className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">
                                ✕
                            </button>
                            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-64 object-cover rounded mb-4" />
                            <h2 className="text-2xl font-bold mb-2">{selectedProduct.name || selectedProduct.title}</h2>
                            <p className="text-gray-700 mb-4">{selectedProduct.description || "No description available."}</p>
                            <div className="flex items-center space-x-3 mb-4">
                                <span className="text-gray-400 line-through text-sm">₹{selectedProduct.originalPrice}</span>
                                <span className="text-indigo-600 font-bold text-xl">₹{selectedProduct.offerPrice}</span>
                            </div>
                            <div className="flex gap-3">
                                {isInCart(selectedProduct.id) ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => addToCart(selectedProduct, -1)} // decrease quantity
                                            className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
                                        >
                                            −
                                        </button>
                                        <span className="font-semibold">
                                            {
                                                cart.find((item) => item.id === selectedProduct.id)?.quantity || 1
                                            }
                                        </span>
                                        <button
                                            onClick={() => addToCart(selectedProduct, 1)} // increase quantity
                                            className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
                                        >
                                            +
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            addToCart(selectedProduct, 1);
                                            toast.success("Product added to cart");
                                        }}
                                        className="bg-pink-400 text-white px-4 py-2 rounded hover:bg-pink-500"
                                    >
                                        Add to Cart
                                    </button>
                                )}

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
        </div>
    );
}

export default Products;
