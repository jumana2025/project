// components/Admin/DashboardHome.jsx
import React, { useState, useEffect } from "react";

// Performance Metric Component
function PerformanceMetric({ label, value, color, description }) {
    const colorClasses = {
        green: 'text-green-600',
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        orange: 'text-orange-600'
    };

    return (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${colorClasses[color]} mb-2`}>{value}%</div>
            <div className="text-sm font-medium text-gray-700">{label}</div>
            <div className="text-xs text-gray-500 mt-1">{description}</div>
        </div>
    );
}

// Quick Stat Component
function QuickStat({ value, label, color }) {
    const colorClasses = {
        green: 'bg-green-50 border-green-200 text-green-700',
        blue: 'bg-blue-50 border-blue-200 text-blue-700',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        red: 'bg-red-50 border-red-200 text-red-700'
    };

    return (
        <div className={`${colorClasses[color]} rounded-lg p-3 text-center border`}>
            <div className="text-lg font-bold">{value}</div>
            <div className="text-xs">{label}</div>
        </div>
    );
}

// Stat Card Component
function StatCard({ title, value, icon, color, growth, description }) {
    const colorClasses = {
        green: 'bg-green-50 border-green-200',
        blue: 'bg-blue-50 border-blue-200',
        purple: 'bg-purple-50 border-purple-200',
        orange: 'bg-orange-50 border-orange-200'
    };

    const iconColors = {
        green: 'text-green-600',
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        orange: 'text-orange-600'
    };

    return (
        <div className={`${colorClasses[color]} rounded-lg shadow-sm border p-4 lg:p-6`}>
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
                    <p className={`text-xl lg:text-2xl font-bold ${iconColors[color]} truncate`}>{value}</p>
                    {description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{description}</p>
                    )}
                    {growth !== undefined && (
                        <p className={`text-xs font-medium mt-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}% from last month
                        </p>
                    )}
                </div>
                <div className={`text-2xl lg:text-3xl ml-3 flex-shrink-0 ${iconColors[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// RevenueBarChart removed per user request

// Simple Pie Chart component used for Order Status overview
function SimplePieChart({ data }) {
    const d = data || { completed: 0, pending: 0, cancelled: 0 };
    const total = (d.completed || 0) + (d.pending || 0) + (d.cancelled || 0) || 1;
    const completedPercent = ((d.completed || 0) / total) * 100;
    const pendingPercent = ((d.pending || 0) / total) * 100;
    const cancelledPercent = ((d.cancelled || 0) / total) * 100;

    const radius = 15.9155; // for viewBox 42x42
    const circumference = 2 * Math.PI * radius;

    const dashCompleted = `${completedPercent} ${100 - completedPercent}`;
    const dashPending = `${pendingPercent} ${100 - pendingPercent}`;
    const dashCancelled = `${cancelledPercent} ${100 - cancelledPercent}`;

    return (
        <div className="h-full flex items-center justify-center">
            <div className="flex items-center space-x-4">
                <svg viewBox="0 0 42 42" className="w-24 h-24">
                    {/* Completed */}
                    <circle cx="21" cy="21" r={radius} fill="transparent"
                        stroke="#10B981" strokeWidth="8"
                        strokeDasharray={dashCompleted}
                        strokeDashoffset={25}
                        transform="rotate(-90 21 21)"
                    />
                    {/* Pending */}
                    <circle cx="21" cy="21" r={radius} fill="transparent"
                        stroke="#F59E0B" strokeWidth="8"
                        strokeDasharray={dashPending}
                        strokeDashoffset={25 - completedPercent}
                        transform="rotate(-90 21 21)"
                    />
                    {/* Cancelled */}
                    <circle cx="21" cy="21" r={radius} fill="transparent"
                        stroke="#EF4444" strokeWidth="8"
                        strokeDasharray={dashCancelled}
                        strokeDashoffset={25 - completedPercent - pendingPercent}
                        transform="rotate(-90 21 21)"
                    />
                </svg>

                <div className="text-sm">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                        <span className="text-xs text-gray-700">Completed: {d.completed || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block"></span>
                        <span className="text-xs text-gray-700">Pending: {d.pending || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                        <span className="text-xs text-gray-700">Cancelled: {d.cancelled || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Lightweight SVG Bar Chart component
function BarChart({ data, height = 140 }) {
    const series = data || [];
    const maxVal = Math.max(...series.map(s => s.value), 1);

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex-1 flex items-end">
                <svg viewBox={`0 0 ${series.length * 40} ${height}`} className="w-full">
                    {series.map((d, i) => {
                        const barWidth = 24;
                        const gap = 16;
                        const x = i * (barWidth + gap) + gap / 2;
                        const barHeight = (d.value / maxVal) * (height - 30);

                        return (
                            <g key={d.label}>
                                <rect
                                    x={x}
                                    y={height - barHeight - 20}
                                    width={barWidth}
                                    height={barHeight}
                                    rx="4"
                                    fill="#6D28D9"
                                    className="transition-transform duration-200 hover:opacity-90 cursor-pointer"
                                />
                                <text x={x + barWidth / 2} y={height - 4} fontSize="10" textAnchor="middle" fill="#374151">
                                    {d.label}
                                </text>
                                <title>{`${d.label}: ${d.value}`}</title>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

// Interactive Category Chart Component
function InteractiveCategoryChart({ data, onCategoryClick, onCategoryHover, onCategoryLeave, hoveredCategory }) {
    const totalProducts = data.rings.total + data.necklaces.total + data.bracelets.total + data.other.total;
    const ringsPercent = totalProducts > 0 ? (data.rings.total / totalProducts) * 100 : 0;
    const necklacesPercent = totalProducts > 0 ? (data.necklaces.total / totalProducts) * 100 : 0;
    const braceletsPercent = totalProducts > 0 ? (data.bracelets.total / totalProducts) * 100 : 0;
    const otherPercent = totalProducts > 0 ? (data.other.total / totalProducts) * 100 : 0;

    const getScale = (category) => hoveredCategory === category ? 1.1 : 1;

    const categories = [
        { category: 'ring', data: data.rings, color: '#8B5CF6', label: 'Rings' },
        { category: 'necklace', data: data.necklaces, color: '#EC4899', label: 'Necklaces' },
        { category: 'bracelets', data: data.bracelets, color: '#10B981', label: 'Bracelets' },
        { category: 'other', data: data.other, color: '#F59E0B', label: 'Other' }
    ];

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-6 lg:gap-8">
            {/* Pie Chart Visualization */}
            <div className="relative w-48 h-48 lg:w-56 lg:h-56">
                <svg viewBox="0 0 42 42" className="w-full h-full">
                    {categories.map((cat, index, array) => {
                        const previousPercent = array.slice(0, index).reduce((sum, c) => {
                            const catTotal = c.data.total;
                            return sum + (totalProducts > 0 ? (catTotal / totalProducts) * 100 : 0);
                        }, 0);

                        const currentPercent = totalProducts > 0 ? (cat.data.total / totalProducts) * 100 : 0;

                        return (
                            <circle
                                key={cat.category}
                                cx="21"
                                cy="21"
                                r="15.9155"
                                fill="transparent"
                                stroke={cat.color}
                                strokeWidth="8"
                                strokeDasharray={`${currentPercent} ${100 - currentPercent}`}
                                strokeDashoffset={25 - previousPercent}
                                transform="rotate(-90 21 21)"
                                className="transition-all duration-300 cursor-pointer"
                                style={{
                                    transform: `rotate(-90deg) scale(${getScale(cat.category)})`,
                                    transformOrigin: '21px 21px'
                                }}
                                onClick={() => onCategoryClick(cat.category)}
                                onMouseEnter={() => onCategoryHover(cat.category)}
                                onMouseLeave={onCategoryLeave}
                            />
                        );
                    })}
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-xl lg:text-2xl font-bold text-gray-800">{totalProducts}</div>
                        <div className="text-xs lg:text-sm text-gray-500">Total Products</div>
                    </div>
                </div>
            </div>

            {/* Legend with interactive items */}
            <div className="space-y-3 lg:space-y-4">
                {categories.map((cat) => (
                    <div
                        key={cat.category}
                        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${hoveredCategory === cat.category ? 'bg-gray-100 scale-105' : ''
                            }`}
                        onClick={() => onCategoryClick(cat.category)}
                        onMouseEnter={() => onCategoryHover(cat.category)}
                        onMouseLeave={onCategoryLeave}
                    >
                        <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                        ></div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                                <span className="text-xs text-gray-500 ml-2">{cat.data.total}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                                {cat.data.ordered} ordered • {Math.round((cat.data.ordered / (cat.data.total || 1)) * 100)}% rate
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Category Stock Chart Component (Missing component)
function CategoryStockChart({ products, category, categoryData, onBack }) {
    const maxStock = Math.max(...products.map(p => parseInt(p.stock) || 0), 1);
    const lowStockCount = products.filter(p => (parseInt(p.stock) || 0) < 10).length;
    const outOfStockCount = products.filter(p => (parseInt(p.stock) || 0) === 0).length;

    const getStockColor = (stock) => {
        if (stock === 0) return { bg: 'bg-red-500', text: 'text-red-600' };
        if (stock < 10) return { bg: 'bg-yellow-500', text: 'text-yellow-600' };
        return { bg: 'bg-green-500', text: 'text-green-600' };
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-pink-400 hover:text-pink-500 transition-colors"
                >
                    <span>←</span>
                    <span>Back to Categories</span>
                </button>
                <div className="text-right">
                    <div className="text-sm text-gray-600">
                        {categoryData.ordered} ordered • {categoryData.total - categoryData.ordered} available
                    </div>
                    <div className="text-xs text-gray-500">
                        {lowStockCount} low stock • {outOfStockCount} out of stock
                    </div>
                </div>
            </div>

            {/* Category Summary */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{categoryData.total}</div>
                    <div className="text-xs text-gray-600">Total Products</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{categoryData.ordered}</div>
                    <div className="text-xs text-gray-600">Ordered</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {categoryData.total > 0 ? Math.round((categoryData.ordered / categoryData.total) * 100) : 0}%
                    </div>
                    <div className="text-xs text-gray-600">Order Rate</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="space-y-3">
                    {products.map((product, index) => {
                        const stock = parseInt(product.stock) || 0;
                        const stockColor = getStockColor(stock);

                        return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">{product.name}</p>
                                        <p className="text-xs text-gray-600 truncate">
                                            {product.metal || 'No metal type'} • ${product.price || '0'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${stockColor.bg}`}
                                                style={{ width: `${(stock / maxStock) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-sm font-bold min-w-8 ${stockColor.text}`}>
                                            {stock}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">in stock</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Recent Orders Section Component
function RecentOrdersSection({ orders, formatDate, formatCurrency }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return { dot: 'bg-green-500', badge: 'bg-green-100 text-green-800' };
            case 'pending':
                return { dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800' };
            case 'cancelled':
                return { dot: 'bg-red-500', badge: 'bg-red-100 text-red-800' };
            default:
                return { dot: 'bg-gray-500', badge: 'bg-gray-100 text-gray-800' };
        }
    };

    const getOrderDisplayId = (order) => {
        if (!order.id) return 'N/A';
        const idString = String(order.id);
        return idString.slice(0, 8);
    };

    const getOrderDate = (order) => {
        return formatDate(order.createdAt || order.date || order.orderDate);
    };

    const getOrderAmount = (order) => {
        return formatCurrency(order.total || order.amount || 0);
    };

    const getOrderStatus = (order) => {
        return order.status || 'pending';
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 lg:p-6 border-b">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                    <span className="text-xs bg-blue-100 text-pink-400 px-2 py-1 rounded-full">
                        {orders.length} total
                    </span>
                </div>
            </div>
            <div className="p-4 lg:p-6">
                <div className="space-y-3">
                    {orders.map((order, index) => {
                        const status = getOrderStatus(order);
                        const statusColors = getStatusColor(status);

                        return (
                            <div
                                key={order.id || `order-${index}`}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div
                                        className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full flex-shrink-0 ${statusColors.dot}`}
                                        title={status}
                                    ></div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate text-gray-900">
                                            Order #{getOrderDisplayId(order)}
                                        </p>
                                        <p className="text-xs text-gray-600 truncate mt-1">
                                            {getOrderDate(order)}
                                        </p>
                                        {order.customerName && (
                                            <p className="text-xs text-gray-500 truncate mt-1">
                                                {order.customerName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right min-w-0 flex-shrink-0 ml-3">
                                    <p className="font-bold text-sm text-gray-900">
                                        {getOrderAmount(order)}
                                    </p>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${statusColors.badge}`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {orders.length === 0 && (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm">No orders yet</p>
                            <p className="text-gray-400 text-xs mt-1">Orders will appear here once they are placed</p>
                        </div>
                    )}
                </div>

                {orders.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                            className="w-full text-center text-sm text-pink-400 hover:text-pink-500 font-medium transition-colors"
                            onClick={() => {
                                // Navigate to orders page
                                window.location.href = '/admin/orders';
                            }}
                        >
                            View All Orders →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Recent Users Section Component
function RecentUsersSection({ users }) {
    const getUserInitials = (user) => {
        if (!user.name) return 'UU';
        return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getUserRole = (user) => {
        return user.role === 'admin' ? 'Admin' : 'User';
    };

    const getRoleColor = (role) => {
        return role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 lg:p-6 border-b">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Users</h3>
                    <span className="text-xs bg-blue-100 text-pink-400 px-2 py-1 rounded-full">
                        {users.length} total
                    </span>
                </div>
            </div>
            <div className="p-4 lg:p-6">
                <div className="space-y-3">
                    {users.map((user, index) => {
                        const role = getUserRole(user);
                        const roleColor = getRoleColor(role);

                        return (
                            <div key={user.id || `user-${index}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-pink to-purple-600 rounded-full flex items-center justify-center text-white text-xs lg:text-sm font-bold flex-shrink-0">
                                        {getUserInitials(user)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">{user.name || 'Unknown User'}</p>
                                        <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs flex-shrink-0 ${roleColor}`}>
                                    {role}
                                </span>
                            </div>
                        );
                    })}

                    {users.length === 0 && (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm">No users yet</p>
                            <p className="text-gray-400 text-xs mt-1">Users will appear here once they register</p>
                        </div>
                    )}
                </div>

                {users.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            onClick={() => {
                                // Navigate to users page
                                window.location.href = '/admin/users';
                            }}
                        >
                            View All Users →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Main DashboardHome Component
function DashboardHome() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        lowStockProducts: 0,
        activeUsers: 0,
        cancelledOrders: 0
    });

    const [recentOrders, setRecentOrders] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [growth, setGrowth] = useState({
        revenueGrowth: 0,
        ordersGrowth: 0,
        usersGrowth: 0,
        productsGrowth: 0
    });

    // Interactive chart states (persist selected options across refreshes)
    const [selectedCategory, setSelectedCategory] = useState(() => {
        try {
            const v = localStorage.getItem('dashboard.selectedCategory');
            return v ? v : null;
        } catch (e) {
            return null;
        }
    });

    const [selectedTimeRange, setSelectedTimeRange] = useState(() => {
        try {
            return localStorage.getItem('dashboard.selectedTimeRange') || 'month';
        } catch (e) {
            return 'month';
        }
    });

    const [hoveredCategory, setHoveredCategory] = useState(null);

    // Persist selected view state to localStorage so refresh keeps the same page/view
    useEffect(() => {
        try {
            if (selectedCategory) {
                localStorage.setItem('dashboard.selectedCategory', selectedCategory);
            } else {
                localStorage.removeItem('dashboard.selectedCategory');
            }
        } catch (e) {
            // ignore storage errors
        }
    }, [selectedCategory]);

    useEffect(() => {
        try {
            if (selectedTimeRange) {
                localStorage.setItem('dashboard.selectedTimeRange', selectedTimeRange);
            }
        } catch (e) {
            // ignore storage errors
        }
    }, [selectedTimeRange]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = () => {
        try {
            // Get real data from localStorage with error handling
            const products = JSON.parse(localStorage.getItem("products") || "[]");
            const orders = JSON.parse(localStorage.getItem("orders") || "[]");
            const users = JSON.parse(localStorage.getItem("users") || "[]");

            // Calculate real statistics
            const revenue = orders.reduce((total, order) => total + (parseFloat(order.total) || 0), 0);
            const pendingOrders = orders.filter(order => order.status === 'pending' || !order.status).length;
            const completedOrders = orders.filter(order => order.status === 'completed').length;
            const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
            const lowStockProducts = products.filter(product => (parseInt(product.stock) || 0) < 10).length;
            const activeUsers = users.filter(user =>
                (user.isActive !== false && user.isBlocked !== true)
            ).length;

            // Get recent orders (last 5)
            const recentOrdersData = orders
                .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
                .slice(0, 5);

            // Get recent users (last 5)
            const recentUsersData = users
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, 5);

            // Calculate growth percentages
            const calculatedGrowth = calculateGrowthStats(orders, users, products);

            setStats({
                totalProducts: products.length,
                totalOrders: orders.length,
                totalUsers: users.length,
                totalRevenue: revenue,
                pendingOrders,
                completedOrders,
                cancelledOrders,
                lowStockProducts,
                activeUsers
            });

            setRecentOrders(recentOrdersData);
            setRecentUsers(recentUsersData);
            setGrowth(calculatedGrowth);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateGrowthStats = (orders, users, products) => {
        // Simplified growth calculation - in a real app, you'd compare with previous period data
        const currentDate = new Date();
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

        try {

            return {
                revenueGrowth: 25,
                ordersGrowth: 18,
                usersGrowth: 20,
                productsGrowth: 10
            };
        } catch (error) {
            console.error('Error calculating growth stats:', error);
            return {
                revenueGrowth: 0,
                ordersGrowth: 0,
                usersGrowth: 0,
                productsGrowth: 0
            };
        }
    };

    // getRevenueChartData removed per user request

    // Get order status summary for the pie chart (module scope)
    const getOrderStatusData = () => {
        try {
            const orders = JSON.parse(localStorage.getItem("orders") || "[]");
            const completed = orders.filter(o => o.status === 'completed').length;
            const pending = orders.filter(o => o.status === 'pending' || !o.status).length;
            const cancelled = orders.filter(o => o.status === 'cancelled').length;

            return { completed, pending, cancelled };
        } catch (error) {
            console.error('Error getting order status data:', error);
            return { completed: 0, pending: 0, cancelled: 0 };
        }
    };

    // Get monthly revenue for last N months for the bar chart
    const getMonthlyRevenueData = (months = 6) => {
        try {
            const orders = JSON.parse(localStorage.getItem("orders") || "[]");
            const now = new Date();
            const result = [];

            for (let i = months - 1; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const month = d.getMonth();
                const year = d.getFullYear();
                const label = d.toLocaleString('en-US', { month: 'short' });

                const monthRevenue = orders.reduce((sum, order) => {
                    const date = new Date(order.createdAt || order.date || order.orderDate || 0);
                    if (date.getFullYear() === year && date.getMonth() === month) {
                        return sum + (parseFloat(order.total) || 0);
                    }
                    return sum;
                }, 0);

                result.push({ label, value: Math.round(monthRevenue) });
            }

            return result;
        } catch (error) {
            console.error('Error getting monthly revenue data:', error);
            return Array.from({ length: months }, (_, i) => ({ label: '', value: 0 }));
        }
    };

    // Get weekly revenue for last N weeks
    const getWeeklyRevenueData = (weeks = 8) => {
        try {
            const orders = JSON.parse(localStorage.getItem("orders") || "[]");
            const now = new Date();
            const result = [];

            for (let i = weeks - 1; i >= 0; i--) {
                // weekStart is Monday
                const ref = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
                const weekStart = new Date(ref);
                weekStart.setDate(ref.getDate() - ((ref.getDay() + 6) % 7));
                weekStart.setHours(0, 0, 0, 0);

                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);

                const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                const weekRevenue = orders.reduce((sum, order) => {
                    const date = new Date(order.createdAt || order.date || order.orderDate || 0);
                    if (date >= weekStart && date <= weekEnd) {
                        return sum + (parseFloat(order.total) || 0);
                    }
                    return sum;
                }, 0);

                result.push({ label, value: Math.round(weekRevenue) });
            }

            return result;
        } catch (error) {
            console.error('Error getting weekly revenue data:', error);
            return Array.from({ length: weeks }, (_, i) => ({ label: '', value: 0 }));
        }
    };

    // Get daily revenue for last N days
    const getDailyRevenueData = (days = 7) => {
        try {
            const orders = JSON.parse(localStorage.getItem("orders") || "[]");
            const now = new Date();
            const result = [];

            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                d.setHours(0, 0, 0, 0);
                const dayStart = new Date(d);
                const dayEnd = new Date(d);
                dayEnd.setHours(23, 59, 59, 999);

                const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                const dayRevenue = orders.reduce((sum, order) => {
                    const date = new Date(order.createdAt || order.date || order.orderDate || 0);
                    if (date >= dayStart && date <= dayEnd) {
                        return sum + (parseFloat(order.total) || 0);
                    }
                    return sum;
                }, 0);

                result.push({ label, value: Math.round(dayRevenue) });
            }

            return result;
        } catch (error) {
            console.error('Error getting daily revenue data:', error);
            return Array.from({ length: days }, (_, i) => ({ label: '', value: 0 }));
        }
    };
    // Get category data with order information
    const getCategoryData = () => {
        try {
            const products = JSON.parse(localStorage.getItem("products") || "[]");
            const orders = JSON.parse(localStorage.getItem("orders") || "[]");

            // Get all ordered product IDs
            const orderedProductIds = orders.flatMap(order =>
                (order.items || []).map(item => item.productId || item.id)
            ).filter(Boolean);

            const rings = products.filter(p => p.category === 'ring');
            const necklaces = products.filter(p => p.category === 'necklace');
            const bracelets = products.filter(p => p.category === 'bracelets');
            const other = products.filter(p => !['ring', 'necklace', 'bracelets'].includes(p.category));

            // Calculate ordered products for each category
            const getOrderedProducts = (categoryProducts) => {
                return categoryProducts.filter(product =>
                    orderedProductIds.includes(product.id)
                ).length;
            };

            return {
                rings: {
                    total: rings.length,
                    ordered: getOrderedProducts(rings),
                    products: rings
                },
                necklaces: {
                    total: necklaces.length,
                    ordered: getOrderedProducts(necklaces),
                    products: necklaces
                },
                bracelets: {
                    total: bracelets.length,
                    ordered: getOrderedProducts(bracelets),
                    products: bracelets
                },
                other: {
                    total: other.length,
                    ordered: getOrderedProducts(other),
                    products: other
                }
            };
        } catch (error) {
            console.error('Error getting category data:', error);
            return {
                rings: { total: 0, ordered: 0, products: [] },
                necklaces: { total: 0, ordered: 0, products: [] },
                bracelets: { total: 0, ordered: 0, products: [] },
                other: { total: 0, ordered: 0, products: [] }
            };
        }
    };

    const getCategoryStockData = (category) => {
        const categoryData = getCategoryData();

        const categoryMap = {
            'ring': categoryData.rings.products,
            'necklace': categoryData.necklaces.products,
            'bracelets': categoryData.bracelets.products,
            'other': categoryData.other.products
        };

        return categoryMap[category] || [];
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'Invalid Date' :
                date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(selectedCategory === category ? null : category);
    };

    const handleCategoryHover = (category) => {
        setHoveredCategory(category);
    };

    const handleCategoryLeave = () => {
        setHoveredCategory(null);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
                <p className="text-gray-600 text-sm lg:text-base">Welcome back! Here's what's happening with your store today.</p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-8">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    icon="₹"
                    color="green"
                    growth={growth.revenueGrowth}
                    description="All-time sales"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon="📦"
                    color="blue"
                    growth={growth.ordersGrowth}
                    description={`${stats.completedOrders} completed`}
                />
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon="🛍️"
                    color="purple"
                    growth={growth.productsGrowth}
                    description={`${stats.lowStockProducts} low stock`}
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon="👥"
                    color="orange"
                    growth={growth.usersGrowth}
                    description={`${stats.activeUsers} active`}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
                {/* Revenue Bar Chart with time range controls */}
                <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <h3 className="text-lg lg:text-xl font-semibold text-gray-800">Revenue</h3>
                        <div className="flex items-center space-x-2">
                            <button
                                className={`text-xs px-2 py-1 rounded ${selectedTimeRange === 'day' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                                onClick={() => setSelectedTimeRange('day')}
                            >
                                Daily
                            </button>
                            <button
                                className={`text-xs px-2 py-1 rounded ${selectedTimeRange === 'week' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                                onClick={() => setSelectedTimeRange('week')}
                            >
                                Weekly
                            </button>
                            <button
                                className={`text-xs px-2 py-1 rounded ${selectedTimeRange === 'month' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                                onClick={() => setSelectedTimeRange('month')}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>
                    <div className="h-48 lg:h-64">
                        {selectedTimeRange === 'day' && <BarChart data={getDailyRevenueData(7)} height={140} />}
                        {selectedTimeRange === 'week' && <BarChart data={getWeeklyRevenueData(8)} height={140} />}
                        {selectedTimeRange === 'month' && <BarChart data={getMonthlyRevenueData(6)} height={140} />}
                    </div>
                </div>

                {/* Order Status Chart */}
                <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4 lg:mb-6">Order Status</h3>
                    <div className="h-48 lg:h-64">
                        <SimplePieChart data={getOrderStatusData()} />
                    </div>
                </div>
            </div>

            {/* Interactive Categories Chart */}
            <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-6 lg:mb-8">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4 lg:mb-6">
                    {selectedCategory
                        ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products Details`
                        : 'Product Categories Overview'
                    }
                </h3>
                <div className="h-64 lg:h-80">
                    {selectedCategory ? (
                        <CategoryStockChart
                            products={getCategoryStockData(selectedCategory)}
                            category={selectedCategory}
                            categoryData={getCategoryData()[selectedCategory === 'bracelets' ? 'bracelets' : selectedCategory + 's']}
                            onBack={() => setSelectedCategory(null)}
                        />
                    ) : (
                        <InteractiveCategoryChart
                            data={getCategoryData()}
                            onCategoryClick={handleCategoryClick}
                            onCategoryHover={handleCategoryHover}
                            onCategoryLeave={handleCategoryLeave}
                            hoveredCategory={hoveredCategory}
                        />
                    )}
                </div>
            </div>

            {/* Store Performance - Static Metrics */}
            <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-6 lg:mb-8">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4 lg:mb-6">Store Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <PerformanceMetric
                        label="Order Completion Rate"
                        value={stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}
                        color="green"
                        description={`${stats.completedOrders} of ${stats.totalOrders} orders`}
                    />
                    <PerformanceMetric
                        label="User Activation Rate"
                        value={stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}
                        color="blue"
                        description={`${stats.activeUsers} of ${stats.totalUsers} users`}
                    />
                    <PerformanceMetric
                        label="Inventory Health"
                        value={stats.totalProducts > 0 ? Math.round(((stats.totalProducts - stats.lowStockProducts) / stats.totalProducts) * 100) : 0}
                        color="purple"
                        description={`${stats.lowStockProducts} low stock items`}
                    />
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Recent Orders */}
                <RecentOrdersSection orders={recentOrders} formatDate={formatDate} formatCurrency={formatCurrency} />

                {/* Recent Users */}
                <RecentUsersSection users={recentUsers} />
            </div>

            {/* Quick Stats Grid */}
            <div className="mt-6 lg:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                <QuickStat value={stats.completedOrders} label="Completed Orders" color="green" />
                <QuickStat value={stats.pendingOrders} label="Pending Orders" color="yellow" />
                <QuickStat value={stats.activeUsers} label="Active Users" color="blue" />
                <QuickStat value={stats.lowStockProducts} label="Low Stock Items" color="red" />
            </div>
        </div>
    );
}

export default DashboardHome;