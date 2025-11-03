import React, { useState, useEffect } from "react";
import {
    FaEdit,
    FaTrash,
    FaToggleOff,
    FaToggleOn,
    FaPlus,
    FaSearch,
    FaTimes,
    FaRecycle,
    FaEyeSlash,
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
                            "https://via.placeholder.com/100x100.png?text=No+Image",
                        originalPrice: item.originalPrice || item.price || 0,
                        offerPrice: item.offerPrice || "",
                        active: item.active ?? true,
                        deleted: false, // ✅ default not deleted
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
    const [filterCategory, setFilterCategory] = useState(
        localStorage.getItem("filterCategory") || "all"
    );
    const [searchTerm, setSearchTerm] = useState(
        localStorage.getItem("searchTerm") || ""
    );
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [showDeleted, setShowDeleted] = useState(false); // ✅ Toggle deleted view
    const [formData, setFormData] = useState({
        name: "",
        category: "rings",
        image: "",
        originalPrice: "",
        offerPrice: "",
    });

    // ✅ Load products
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

    // ✅ Save to localStorage
    useEffect(() => {
        localStorage.setItem("products", JSON.stringify(products));
    }, [products]);
    useEffect(() => {
        localStorage.setItem("filterCategory", filterCategory);
    }, [filterCategory]);
    useEffect(() => {
        localStorage.setItem("searchTerm", searchTerm);
    }, [searchTerm]);

    // ✅ Filter logic
    const filteredProducts = products.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase());
        const matchesCategory =
            filterCategory === "all" || category === filterCategory;

        if (showDeleted) {
            return p.deleted && matchesSearch && matchesCategory;
        } else {
            return !p.deleted && matchesSearch && matchesCategory;
        }
    });

    // ✅ Open modal for add/edit
    const openModal = (product = null) => {
        if (product) {
            setEditProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                image: product.image,
                originalPrice: product.originalPrice,
                offerPrice: product.offerPrice,
            });
        } else {
            setEditProduct(null);
            setFormData({
                name: "",
                category: "rings",
                image: "",
                originalPrice: "",
                offerPrice: "",
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditProduct(null);
    };

    // ✅ Save product (add/edit)
    const handleSave = () => {
        if (!formData.name || !formData.image || !formData.originalPrice) {
            toast.error("Please fill all required fields!");
            return;
        }

        if (editProduct) {
            setProducts((prev) =>
                prev.map((p) =>
                    p._id === editProduct._id ? { ...p, ...formData } : p
                )
            );
            toast.success("Product updated successfully!");
        } else {
            const newProduct = {
                ...formData,
                _id: Date.now().toString(),
                active: true,
                deleted: false,
            };
            setProducts((prev) => [...prev, newProduct]);
            toast.success("Product added successfully!");
        }

        closeModal();
    };

    // ✅ Soft Delete (mark deleted)
    const handleDelete = (id) => {
        setProducts((prev) =>
            prev.map((p) =>
                p._id === id ? { ...p, deleted: true } : p
            )
        );
        toast.warn("Product moved to deleted list!");
    };

    // ✅ Restore deleted product
    const handleRestore = (id) => {
        setProducts((prev) =>
            prev.map((p) =>
                p._id === id ? { ...p, deleted: false } : p
            )
        );
        toast.success("Product restored!");
    };

    // ✅ Toggle Active
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

            {/* 🔍 Search + Filter + Add + Deleted Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
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

                <div className="flex gap-2">
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm"
                    >
                        <FaPlus /> Add Product
                    </button>

                    <button
                        onClick={() => setShowDeleted(!showDeleted)}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg shadow-sm ${showDeleted
                            ? "bg-gray-600 text-white"
                            : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                    >
                        {showDeleted ? (
                            <>
                                <FaEyeSlash /> Hide Deleted
                            </>
                        ) : (
                            <>
                                <FaRecycle /> Show Deleted
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 🧾 Table */}
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
                                <td
                                    colSpan="7"
                                    className="text-center py-6 text-gray-500"
                                >
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((p) => (
                                <tr key={p._id} className="border-b">
                                    <td className="p-3">
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                    </td>
                                    <td className="p-3">{p.name}</td>
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
                                            <span className="text-gray-500">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 flex justify-center gap-3">
                                        {!p.deleted ? (
                                            <>
                                                <button
                                                    onClick={() => openModal(p)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(p._id)
                                                    }
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
                                                >
                                                    <FaTrash />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleToggleActive(p._id)
                                                    }
                                                    className={`px-3 py-2 rounded-lg text-white ${p.active
                                                        ? "bg-green-500"
                                                        : "bg-gray-400"
                                                        }`}
                                                >
                                                    {p.active ? (
                                                        <FaToggleOn />
                                                    ) : (
                                                        <FaToggleOff />
                                                    )}
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    handleRestore(p._id)
                                                }
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
                                            >
                                                Restore
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 🧩 Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-96 relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-3 right-3 text-gray-600 hover:text-black"
                        >
                            <FaTimes />
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-purple-700">
                            {editProduct ? "Edit Product" : "Add Product"}
                        </h2>

                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Product Name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                className="border px-3 py-2 rounded-lg"
                            />
                            <select
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        category: e.target.value,
                                    })
                                }
                                className="border px-3 py-2 rounded-lg"
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
                                    setFormData({
                                        ...formData,
                                        image: e.target.value,
                                    })
                                }
                                className="border px-3 py-2 rounded-lg"
                            />
                            <input
                                type="number"
                                placeholder="Original Price"
                                value={formData.originalPrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        originalPrice: e.target.value,
                                    })
                                }
                                className="border px-3 py-2 rounded-lg"
                            />
                            <input
                                type="number"
                                placeholder="Offer Price"
                                value={formData.offerPrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        offerPrice: e.target.value,
                                    })
                                }
                                className="border px-3 py-2 rounded-lg"
                            />

                            <button
                                onClick={handleSave}
                                className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold mt-2"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductsManagement;
