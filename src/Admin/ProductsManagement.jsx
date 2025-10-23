// Admin/ProductsManagement.jsx
import React, { useState, useEffect } from "react";

function ProductsManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        name: "",
        price: "",
        originalPrice: "",
        image: "",
        description: "",
        category: "ring",
        metal: "",
        stock: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(() => {
        try {
            return localStorage.getItem('admin.products.search') || '';
        } catch (e) {
            return '';
        }
    });

    const [categoryFilter, setCategoryFilter] = useState(() => {
        try {
            return localStorage.getItem('admin.products.categoryFilter') || 'all';
        } catch (e) {
            return 'all';
        }
    });

    // Load products from API on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch from all category endpoints
            const endpoints = [
                'http://localhost:5000/ring',
                'http://localhost:5000/necklace',
                'http://localhost:5000/bracelets'
            ];

            // Fetch data from all endpoints
            const responses = await Promise.all(
                endpoints.map(endpoint =>
                    fetch(endpoint).then(res => {
                        if (!res.ok) throw new Error(`Failed to fetch from ${endpoint}`);
                        return res.json();
                    })
                )
            );

            // Combine all products and add category information
            const allProducts = responses.flatMap((categoryProducts, index) => {
                const category = endpoints[index].split('/').pop(); // Extract category from URL
                return categoryProducts.map(product => ({
                    ...product,
                    category: category,
                    // Ensure consistent field names
                    price: product.price || product.offerPrice,
                    originalPrice: product.originalPrice || product.originalPrice,
                    image: product.image || product.img,
                    description: product.description || product.desc,
                    metal: product.metal || product.material,
                    stock: product.stock || product.quantity || 0
                }));
            });

            setProducts(allProducts);

            // Also save to localStorage for backup
            localStorage.setItem("products", JSON.stringify(allProducts));

        } catch (err) {
            console.log('API fetch failed, using localStorage:', err.message);
            // Fallback to localStorage
            const savedProducts = JSON.parse(localStorage.getItem("products")) || [];

            // If no products in localStorage, use sample data
            if (savedProducts.length === 0) {
                const sampleProducts = getSampleProducts();
                setProducts(sampleProducts);
                localStorage.setItem("products", JSON.stringify(sampleProducts));
            } else {
                setProducts(savedProducts);
            }
        } finally {
            setLoading(false);
        }
    };

    // Get sample products data
    const getSampleProducts = () => {
        return [
            {
                id: "1",
                name: "Diamond Ring",
                category: "ring",
                metal: "Diamond",
                description: "Beautiful diamond ring for special occasions",
                originalPrice: 20000,
                price: 19000,
                image: "https://i.pinimg.com/736x/3c/e5/92/3ce592d081090b361711075fc9d9509e.jpg",
                stock: 10,
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: "2",
                name: "Pearl Necklace",
                category: "necklace",
                metal: "Pearl",
                description: "Elegant pearl necklace for formal events",
                originalPrice: 2500,
                price: 2300,
                image: "https://i.pinimg.com/1200x/2e/1c/e0/2e1ce007d3004f2a39a109f70f0b0034.jpg",
                stock: 8,
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: "3",
                name: "Silver Bracelet",
                category: "bracelets",
                metal: "Silver",
                description: "Beautiful silver bracelet with intricate design",
                originalPrice: 1500,
                price: 1400,
                image: "https://i.pinimg.com/736x/f4/88/bb/f488bb03ba82b125fea7276eed9b38ef.jpg",
                stock: 15,
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ];
    };

    // Save products to API when modified
    const saveProductToAPI = async (product, method = 'POST') => {
        try {
            const endpoint = `http://localhost:5000/${product.category}`;

            if (method === 'POST') {
                // Add new product
                await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(product)
                });
            } else if (method === 'PUT') {
                // Update existing product
                await fetch(`${endpoint}/${product.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(product)
                });
            } else if (method === 'DELETE') {
                // Delete product
                await fetch(`${endpoint}/${product.id}`, {
                    method: 'DELETE'
                });
            }
        } catch (err) {
            console.warn('Failed to sync with API, using localStorage only:', err.message);
            // Continue with localStorage if API fails
        }
    };

    // Save products to localStorage whenever products change
    useEffect(() => {
        if (products.length > 0) {
            localStorage.setItem("products", JSON.stringify(products));
        }
    }, [products]);

    // Persist admin search and filters so refresh keeps the same view
    useEffect(() => {
        try {
            localStorage.setItem('admin.products.search', searchTerm);
        } catch (e) {
            // ignore storage errors
        }
    }, [searchTerm]);

    useEffect(() => {
        try {
            localStorage.setItem('admin.products.categoryFilter', categoryFilter);
        } catch (e) {
            // ignore storage errors
        }
    }, [categoryFilter]);

    // Filter products
    const filteredProducts = products
        .filter(product => {
            const matchesSearch =
                product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editingId) {
            // Update existing product
            const updatedProducts = products.map(p =>
                p.id === editingId ? { ...p, ...form } : p
            );
            setProducts(updatedProducts);

            // Try to update in API
            const updatedProduct = updatedProducts.find(p => p.id === editingId);
            await saveProductToAPI(updatedProduct, 'PUT');

            setEditingId(null);
        } else {
            // Add new product
            const newProduct = {
                ...form,
                id: Date.now().toString(),
                isActive: true,
                createdAt: new Date().toISOString()
            };
            setProducts([...products, newProduct]);

            // Try to save to API
            await saveProductToAPI(newProduct, 'POST');
        }

        // Reset form
        setForm({
            name: "",
            price: "",
            originalPrice: "",
            image: "",
            description: "",
            category: "ring",
            metal: "",
            stock: ""
        });
    };

    const startEdit = (product) => {
        setForm({
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || "",
            image: product.image,
            description: product.description || "",
            category: product.category || "ring",
            metal: product.metal || "",
            stock: product.stock || ""
        });
        setEditingId(product.id);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            const productToDelete = products.find(p => p.id === id);
            setProducts(products.filter(p => p.id !== id));

            // Try to delete from API
            if (productToDelete) {
                await saveProductToAPI(productToDelete, 'DELETE');
            }
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm({
            name: "",
            price: "",
            originalPrice: "",
            image: "",
            description: "",
            category: "ring",
            metal: "",
            stock: ""
        });
    };

    const getProductsStats = () => {
        const totalProducts = products.length;
        const ringProducts = products.filter(p => p.category === "ring").length;
        const necklaceProducts = products.filter(p => p.category === "necklace").length;
        const braceletProducts = products.filter(p => p.category === "bracelets").length;
        const activeProducts = products.filter(p => p.isActive).length;

        return { totalProducts, ringProducts, necklaceProducts, braceletProducts, activeProducts };
    };

    const stats = getProductsStats();

    // Loading state
    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading products...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Products Management</h1>
                    <p className="text-gray-600">Manage your store products and inventory</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <StatCard title="Total Products" value={stats.totalProducts} icon="🛍️" color="blue" />
                <StatCard title="Rings" value={stats.ringProducts} icon="💍" color="purple" />
                <StatCard title="Necklaces" value={stats.necklaceProducts} icon="📿" color="green" />
                <StatCard title="Bracelets" value={stats.braceletProducts} icon="📿" color="yellow" />
                <StatCard title="Active" value={stats.activeProducts} icon="✅" color="green" />
            </div>

            {/* Info banner for localStorage usage */}
            {error && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <span className="text-blue-600 mr-2">💡</span>
                        <p className="text-blue-800">
                            Using local storage for products management. Data will persist in your browser.
                        </p>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Products
                        </label>
                        <input
                            type="text"
                            placeholder="Search by product name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Category
                        </label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Categories</option>
                            <option value="ring">Rings</option>
                            <option value="necklace">Necklaces</option>
                            <option value="bracelets">Bracelets</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Product Form */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                    {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={form.price}
                        onChange={e => setForm({ ...form, price: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Original Price (optional)"
                        value={form.originalPrice}
                        onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ring">Ring</option>
                        <option value="necklace">Necklace</option>
                        <option value="bracelets">Bracelets</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Metal Type (e.g., Gold, Silver)"
                        value={form.metal}
                        onChange={e => setForm({ ...form, metal: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        placeholder="Stock Quantity"
                        value={form.stock}
                        onChange={e => setForm({ ...form, stock: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="url"
                        placeholder="Image URL"
                        value={form.image}
                        onChange={e => setForm({ ...form, image: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                        rows="3"
                        required
                    />
                    <div className="md:col-span-2 flex gap-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {editingId ? "Update Product" : "Add Product"}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Metal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                                <ProductRow
                                    key={product.id}
                                    product={product}
                                    onEdit={startEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-gray-400 text-6xl mb-4">🛍️</div>
                        <p className="text-lg">No products found</p>
                        <p className="text-gray-400">Try adjusting your search or add a new product</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Product Row Component (Table Row)
function ProductRow({ product, onEdit, onDelete }) {
    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.image}
                            alt={product.name}
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                            }}
                        />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {product.category}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.metal || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">${product.price}</div>
                {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-sm text-gray-500 line-through">${product.originalPrice}</div>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.stock || 0}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(product)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-sm transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(product.id, product.name)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded text-sm transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        purple: 'bg-purple-50 border-purple-200',
        yellow: 'bg-yellow-50 border-yellow-200',
        red: 'bg-red-50 border-red-200'
    };

    const textColors = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        purple: 'text-purple-600',
        yellow: 'text-yellow-600',
        red: 'text-red-600'
    };

    return (
        <div className={`${colorClasses[color]} rounded-lg shadow-sm border p-4`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className={`text-2xl font-bold ${textColors[color]}`}>{value}</p>
                </div>
                <div className="text-2xl">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default ProductsManagement;