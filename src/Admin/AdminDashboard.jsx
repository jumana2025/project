// components/Admin/AdminDashboard.jsx
import React from "react";
import { Routes, Route, Navigate, useNavigate, NavLink } from "react-router-dom";
import DashboardHome from "./DashboardHome";
import ProductsManagement from "./ProductsManagement";
import OrdersManagement from "./OrdersManagement";
import UsersManagement from "./UsersManagement";
import Analytics from "./Analytics";

function AdminDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("adminToken");
        navigate("/login");
    };

    const navItems = [
        { path: "/admin/dashboard", icon: "📊", label: "Dashboard" },
        { path: "/admin/products", icon: "🛍️", label: "Products Details" },
        { path: "/admin/orders", icon: "📦", label: "Orders Details" },
        { path: "/admin/users", icon: "👥", label: "Users Details" },
        { path: "/admin/analytics", icon: "📈", label: "Analytics" }
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col sticky top-0 h-screen">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                    <p className="text-sm text-gray-600 mt-1">Store Management</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center p-3 rounded-lg transition-colors duration-200 ${isActive
                                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500 font-semibold"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`
                            }
                        >
                            <span className="text-lg mr-3">{item.icon}</span>
                            <span className="text-sm">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center p-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors duration-200 font-medium"
                    >
                        <span className="mr-2">🚪</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <Routes>
                    <Route path="dashboard" element={<DashboardHome />} />
                    <Route path="products" element={<ProductsManagement />} />
                    <Route path="orders" element={<OrdersManagement />} />
                    <Route path="users" element={<UsersManagement />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="/" element={<Navigate to="dashboard" replace />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
            </div>
        </div>
    );
}

export default AdminDashboard;