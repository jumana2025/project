// components/Admin/OrdersManagement.jsx
import React, { useState, useEffect } from "react";

function OrdersManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(() => {
        try {
            return localStorage.getItem('admin.orders.search') || '';
        } catch (e) {
            return '';
        }
    });

    const [statusFilter, setStatusFilter] = useState(() => {
        try {
            return localStorage.getItem('admin.orders.statusFilter') || 'all';
        } catch (e) {
            return 'all';
        }
    });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    // Persist search and filters for admin orders
    useEffect(() => {
        try {
            localStorage.setItem('admin.orders.search', searchTerm);
        } catch (e) {
            // ignore
        }
    }, [searchTerm]);

    useEffect(() => {
        try {
            localStorage.setItem('admin.orders.statusFilter', statusFilter);
        } catch (e) {
            // ignore
        }
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try API first, then fallback to localStorage
            let ordersData = [];

            try {
                const response = await fetch('http://localhost:5000/orders');
                if (response.ok) {
                    ordersData = await response.json();
                    // Sync with localStorage
                    localStorage.setItem("orders", JSON.stringify(ordersData));
                } else {
                    throw new Error('API not available');
                }
            } catch (apiError) {
                console.log('Using localStorage data:', apiError.message);
                ordersData = JSON.parse(localStorage.getItem("orders") || "[]");
            }

            setOrders(ordersData);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.message);
            // Final fallback
            const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
            setOrders(savedOrders);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // Update local state immediately for better UX
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );

            // Try API update
            try {
                const response = await fetch(`http://localhost:5000/orders/${orderId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: newStatus }),
                });

                if (response.ok) {
                    const updatedOrder = await response.json();
                    console.log('Order status updated via API:', updatedOrder);
                }
            } catch (apiError) {
                console.log('API update failed, using localStorage:', apiError.message);
            }

            // Always update localStorage
            const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
            const updatedOrders = savedOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            );
            localStorage.setItem("orders", JSON.stringify(updatedOrders));

        } catch (err) {
            console.error('Error updating order status:', err);
            setError('Failed to update order status');
            // Revert local state on error
            fetchOrders();
        }
    };

    const filteredOrders = orders
        .filter(order => {
            const matchesSearch = searchTerm === "" ||
                order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "all" || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    const getOrdersStats = () => {
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const processingOrders = orders.filter(order => order.status === 'processing').length;
        const shippedOrders = orders.filter(order => order.status === 'shipped').length;
        const completedOrders = orders.filter(order => order.status === 'completed').length;
        const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
        const totalRevenue = orders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

        return {
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue
        };
    };

    const stats = getOrdersStats();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const closeOrderModal = () => {
        setShowOrderModal(false);
        setSelectedOrder(null);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div className="mb-4 lg:mb-0">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Orders Management</h1>
                    <p className="text-gray-600">Manage and track customer orders</p>
                </div>
                <button
                    onClick={fetchOrders}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Refreshing...
                        </>
                    ) : (
                        'Refresh Orders'
                    )}
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon="📦"
                    color="blue"
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon="₹"
                    color="green"
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    icon="⏳"
                    color="yellow"
                />
                <StatCard
                    title="Completed Orders"
                    value={stats.completedOrders}
                    icon="✅"
                    color="green"
                />
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                <StatusBadge count={stats.pendingOrders} status="pending" color="yellow" />
                <StatusBadge count={stats.processingOrders} status="processing" color="blue" />
                <StatusBadge count={stats.shippedOrders} status="shipped" color="purple" />
                <StatusBadge count={stats.completedOrders} status="completed" color="green" />
                <StatusBadge count={stats.cancelledOrders} status="cancelled" color="red" />
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <span className="text-yellow-600 mr-2">⚠️</span>
                        <p className="text-yellow-800 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Orders
                        </label>
                        <input
                            type="text"
                            placeholder="Search by order ID, customer name, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order Details
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <OrderRow
                                    key={order.id}
                                    order={order}
                                    onView={viewOrderDetails}
                                    onStatusChange={updateOrderStatus}
                                    formatDate={formatDate}
                                    getStatusColor={getStatusColor}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <p className="text-gray-500 text-lg mb-2">No orders found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={closeOrderModal}
                    onStatusChange={updateOrderStatus}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                />
            )}
        </div>
    );
}

// Order Row Component
function OrderRow({ order, onView, onStatusChange, formatDate, getStatusColor }) {
    if (!order?.id) return null;

    const displayId = order.id.slice(0, 8).toUpperCase();
    const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
    const firstItem = order.items?.[0];

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-4 py-4">
                <div>
                    <div className="text-sm font-medium text-gray-900">#{displayId}</div>
                    <div className="text-sm text-gray-500">{formatDate(order.date || order.createdAt)}</div>
                </div>
            </td>
            <td className="px-4 py-4">
                <div>
                    <div className="text-sm font-medium text-gray-900">{order.userName || 'Unknown Customer'}</div>
                    <div className="text-sm text-gray-500">{order.userEmail || 'No email'}</div>
                </div>
            </td>
            <td className="px-4 py-4">
                <div className="text-sm text-gray-900">
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                </div>
                <div className="text-sm text-gray-500 truncate max-w-xs">
                    {firstItem?.name || 'No items'}
                    {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                </div>
            </td>
            <td className="px-4 py-4">
                <div className="text-sm font-bold text-gray-900">
                    ${parseFloat(order.total || 0).toFixed(2)}
                </div>
            </td>
            <td className="px-4 py-4">
                <select
                    value={order.status || 'pending'}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                    className={`text-xs font-medium border rounded-lg px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </td>
            <td className="px-4 py-4">
                <button
                    onClick={() => onView(order)}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm font-medium flex items-center"
                >
                    <span className="mr-1">👁️</span>
                    View
                </button>
            </td>
        </tr>
    );
}

// Order Details Modal Component
function OrderDetailsModal({ order, onClose, onStatusChange, formatDate, getStatusColor }) {
    if (!order) return null;

    const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
    const totalAmount = parseFloat(order.total || 0).toFixed(2);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <InfoCard title="Order Information">
                            <InfoRow label="Order ID" value={order.id} />
                            <InfoRow label="Date" value={formatDate(order.date || order.createdAt)} />
                            <InfoRow label="Items" value={itemCount.toString()} />
                            <InfoRow label="Total" value={`$${totalAmount}`} isBold isGreen />
                        </InfoCard>

                        <InfoCard title="Customer Information">
                            <InfoRow label="Name" value={order.userName || 'Unknown Customer'} />
                            <InfoRow label="Email" value={order.userEmail || 'No email'} />
                            {order.shippingAddress && (
                                <InfoRow
                                    label="Address"
                                    value={`${order.shippingAddress.street}, ${order.shippingAddress.city}`}
                                />
                            )}
                        </InfoCard>

                        <InfoCard title="Order Status">
                            <select
                                value={order.status || 'pending'}
                                onChange={(e) => onStatusChange(order.id, e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${getStatusColor(order.status)}`}
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <p className="text-xs text-gray-600 mt-2">
                                Update the order status to track its progress.
                            </p>
                        </InfoCard>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Items</h3>
                        <div className="space-y-3">
                            {order.items?.map((item, index) => (
                                <OrderItem key={index} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Order Timeline</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <TimelineRow label="Order Placed" value={formatDate(order.date || order.createdAt)} />
                            <TimelineRow
                                label="Current Status"
                                value={order.status || 'pending'}
                                isStatus
                                statusColor={getStatusColor(order.status)}
                            />
                            {order.updatedAt && (
                                <TimelineRow label="Last Updated" value={formatDate(order.updatedAt)} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function InfoCard({ title, children }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
            {children}
        </div>
    );
}

function InfoRow({ label, value, isBold = false, isGreen = false }) {
    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-sm text-gray-600">{label}:</span>
            <span className={`text-sm ${isBold ? 'font-bold' : 'font-medium'} ${isGreen ? 'text-green-600' : 'text-gray-900'}`}>
                {value}
            </span>
        </div>
    );
}

function OrderItem({ item }) {
    const quantity = item.quantity || 1;
    const price = item.price || item.offerPrice || 0;
    const total = (price * quantity).toFixed(2);

    return (
        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 flex-1">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                    }}
                />
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-600">
                        Quantity: {quantity} × ${price}
                    </p>
                    {item.category && (
                        <p className="text-xs text-gray-500">Category: {item.category}</p>
                    )}
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-gray-900">${total}</p>
            </div>
        </div>
    );
}

function TimelineRow({ label, value, isStatus = false, statusColor = '' }) {
    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-gray-600">{label}:</span>
            {isStatus ? (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    {value}
                </span>
            ) : (
                <span className="font-medium">{value}</span>
            )}
        </div>
    );
}

// Status Badge Component
function StatusBadge({ count, status, color }) {
    const colorClasses = {
        yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        blue: 'bg-blue-100 text-blue-800 border-blue-200',
        purple: 'bg-purple-100 text-purple-800 border-purple-200',
        green: 'bg-green-100 text-green-800 border-green-200',
        red: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
        <div className={`${colorClasses[color]} rounded-lg border p-3 text-center`}>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-sm font-medium capitalize">{status}</div>
        </div>
    );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-700',
        green: 'bg-green-50 border-green-200 text-green-700',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        purple: 'bg-purple-50 border-purple-200 text-purple-700',
        red: 'bg-red-50 border-red-200 text-red-700'
    };

    return (
        <div className={`${colorClasses[color]} rounded-lg border p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className="text-2xl opacity-80">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default OrdersManagement;