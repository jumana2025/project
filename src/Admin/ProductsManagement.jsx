import React, { useState, useEffect } from "react";
import {
    FaEdit,
    FaTrash,
    FaToggleOff,
    FaToggleOn,
    FaPlus,
    FaSearch,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const productAPI = {
    async getAllProducts() {
        const endpoints = [
            { url: "http://localhost:5000/ring", category: "rings" },
            { url: "http://localhost:5000/necklace", category: "necklaces" },
            { url: "http://localhost:5000/bracelets", category: "bracelets" },
        ];

        try {
            const results = await Promise.all(
                endpoints.map(async (endpoint) => {
                    const res = await fetch(endpoint.url);
                    const data = await res.json();
                    return data.map((item) => ({
                        ...item,
                        _id: item._id || `${endpoint.category}-${Math.random()}`,
                        category: endpoint.category,
                        name: item.name || item.title || "Unnamed Product",
                        image:
                            item.image ||
                            item.img ||
                            item.imageURL ||
                            "https://via.placeholder.com/100x100.png?text=No+Image",
                        originalPrice: item.originalPrice || item.price || 0,
                        offerPrice: item.offerPrice || item.discountPrice || "",
                        active: item.active ?? true,
                    }));
                })
            );
            return results.flat();
        } catch (err) {
            console.error("❌ Error fetching data:", err);
            return [];
        }
    },
};

function ProductsManagement() {
    const [products, setProducts] = useState([]);
    const [filterCategory, setFilterCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        category: "rings",
        image: "",
        originalPrice: "",
        offerPrice: "",
    });

    // ✅ Load from backend or localStorage
    useEffect(() => {
        const saved = localStorage.getItem("products");
        if (saved && JSON.parse(saved).length > 0) {
            setProducts(JSON.parse(saved));
        } else {
            (async () => {
                const data = await productAPI.getAllProducts();
                setProducts(data);
                localStorage.setItem("products", JSON.stringify(data));
            })();
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("products", JSON.stringify(products));
    }, [products]);

    const filteredProducts = products.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        return (
            (filterCategory === "all" || category === filterCategory) &&
            name.includes(searchTerm.toLowerCase())
        );
    });

    const openModal = (product = null) => {
        setEditProduct(product);
        setFormData(
            product || {
                name: "",
                category: "rings",
                image: "",
                originalPrice: "",
                offerPrice: "",
            }
        );
        setShowModal(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.image || !formData.originalPrice) {
            toast.error("Please fill all required fields!");
            return;
        }

        if (editProduct) {
            setProducts((prev) =>
                prev.map((p) =>
                    p._id === editProduct._id
                        ? { ...p, ...formData }
                        : p
                )
            );
            toast.success("Product updated successfully!");
        } else {
            const newProduct = {
                ...formData,
                _id: Date.now().toString(),
                active: true,
            };
            setProducts((prev) => [...prev, newProduct]);
            toast.success("Product added successfully!");
        }

        setShowModal(false);
        setEditProduct(null);
    };

    const handleDelete = (id) => {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        toast.error("Product deleted!");
    };

    const handleToggleActive = (id) => {
        setProducts((prev) =>
            prev.map((p) => (p._id === id ? { ...p, active: !p.active } : p))
        );
        toast.success("Status updated!");
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">
                Products Management
            </h1>

            {/* 🔍 Search + Filter + Add Button */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                {/* Search */}
                <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 w-full md:w-1/3 bg-white shadow-sm">
                    <FaSearch className="text-gray-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Search product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full outline-none"
                    />
                </div>

                {/* Filter */}
                <div className="flex gap-2 flex-wrap justify-center">
                    {["all", "rings", "necklaces", "bracelets"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filterCategory === cat
                                ? "bg-purple-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-purple-100"
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Add Product */}
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm"
                >
                    <FaPlus /> Add Product
                </button>
            </div>

            {/* 🧾 Product Table (No Lines) */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow-md">
                    <thead className="bg-purple-600 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left">Image</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-left">Original Price</th>
                            <th className="px-4 py-3 text-left">Offer Price</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-6 text-gray-500">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((p) => (
                                <tr
                                    key={p._id}
                                    className="bg-white hover:bg-purple-50 transition-all duration-200 rounded-lg shadow-sm my-3"
                                >
                                    <td className="p-3">
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="w-20 h-20 object-cover rounded-lg shadow-sm"
                                        />
                                    </td>
                                    <td className="p-3 font-medium">{p.name}</td>
                                    <td className="p-3 capitalize">{p.category}</td>
                                    <td className="p-3">₹{p.originalPrice}</td>
                                    <td className="p-3 text-purple-600 font-semibold">
                                        ₹{p.offerPrice || "-"}
                                    </td>
                                    <td className="p-3">
                                        {p.active ? (
                                            <span className="text-green-600 font-semibold">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">Inactive</span>
                                        )}
                                    </td>
                                    <td className="p-3 flex justify-center gap-3">
                                        <button
                                            onClick={() => openModal(p)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-sm"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p._id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-sm"
                                        >
                                            <FaTrash />
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(p._id)}
                                            className={`px-3 py-2 rounded-lg text-white shadow-sm ${p.active
                                                ? "bg-green-500 hover:bg-green-600"
                                                : "bg-gray-400 hover:bg-gray-500"
                                                }`}
                                        >
                                            {p.active ? <FaToggleOn /> : <FaToggleOff />}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 🪟 Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl w-[90%] md:w-[450px] shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-purple-700 text-center">
                            {editProduct ? "Edit Product" : "Add Product"}
                        </h2>

                        <input
                            type="text"
                            placeholder="Product Name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="border border-gray-300 px-3 py-2 rounded-lg w-full mb-3"
                        />
                        <select
                            value={formData.category}
                            onChange={(e) =>
                                setFormData({ ...formData, category: e.target.value })
                            }
                            className="border border-gray-300 px-3 py-2 rounded-lg w-full mb-3"
                        >
                            <option value="rings">Rings</option>
                            <option value="necklaces">Necklaces</option>
                            <option value="bracelets">Bracelets</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Image URL"
                            value={formData.image}
                            onChange={(e) =>
                                setFormData({ ...formData, image: e.target.value })
                            }
                            className="border border-gray-300 px-3 py-2 rounded-lg w-full mb-3"
                        />
                        {formData.image && (
                            <img
                                src={formData.image}
                                alt="Preview"
                                className="w-24 h-24 object-cover mx-auto mb-3 rounded-lg shadow"
                            />
                        )}
                        <input
                            type="number"
                            placeholder="Original Price"
                            value={formData.originalPrice}
                            onChange={(e) =>
                                setFormData({ ...formData, originalPrice: e.target.value })
                            }
                            className="border border-gray-300 px-3 py-2 rounded-lg w-full mb-3"
                        />
                        <input
                            type="number"
                            placeholder="Offer Price"
                            value={formData.offerPrice}
                            onChange={(e) =>
                                setFormData({ ...formData, offerPrice: e.target.value })
                            }
                            className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                        />

                        <div className="flex justify-end gap-2 mt-5">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                            >
                                {editProduct ? "Update" : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductsManagement;
