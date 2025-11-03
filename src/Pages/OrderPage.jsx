import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserOrders = () => {
            // Check both 'currentUser' and 'user' for compatibility
            const user = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || "null");

            if (!user) {
                toast.warning("Please login to view your orders!");
                navigate("/login");
                return;
            }

            try {
                // Try to fetch from JSON server first
                fetch(`http://localhost:5000/orders?userEmail=${user.email}`)
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error('JSON server not available');
                    })
                    .then(data => {
                        setOrders(data);
                        setLoading(false);
                    })
                    .catch(error => {
                        console.log("JSON server not available, using localStorage:", error);
                        // Fallback to localStorage
                        const userOrders = JSON.parse(localStorage.getItem(`orders_${user.id}`) || "[]");
                        setOrders(userOrders);
                        setLoading(false);
                    });
            } catch (error) {
                console.error("Error fetching orders:", error);
                // Final fallback
                const userOrders = JSON.parse(localStorage.getItem(`orders_${user.id}`) || "[]");
                setOrders(userOrders);
                setLoading(false);
            }
        };

        fetchUserOrders();
    }, [navigate]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return "text-green-600 bg-green-100 px-2 py-1 rounded";
            case 'shipped':
                return "text-blue-600 bg-blue-100 px-2 py-1 rounded";
            case 'processing':
                return "text-yellow-600 bg-yellow-100 px-2 py-1 rounded";
            case 'cancelled':
                return "text-red-600 bg-red-100 px-2 py-1 rounded";
            case 'pending':
                return "text-orange-600 bg-orange-100 px-2 py-1 rounded";
            default:
                return "text-gray-600 bg-gray-100 px-2 py-1 rounded";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not available';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    const calculateItemTotal = (item) => {
        const price = Number(item.price || item.offerPrice || 0);
        const quantity = Number(item.quantity || 1);
        return (price * quantity).toFixed(2);
    };

    const calculateOrderTotal = (orderItems) => {
        return orderItems.reduce((total, item) => {
            const price = Number(item.price || item.offerPrice || 0);
            const quantity = Number(item.quantity || 1);
            return total + (price * quantity);
        }, 0).toFixed(2);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    const user = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || "null");

    if (!orders || orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-center mb-8">My Orders</h1>
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h2 className="text-2xl font-semibold mb-4">No orders found</h2>
                        <p className="text-gray-600 mb-2">
                            {user ? `No orders found for ${user.email}` : "Please login to view your orders"}
                        </p>
                        <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
                        <button
                            onClick={() => navigate("/")}
                            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                            Start Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8">My Orders</h1>

                <div className="space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order.id || order._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Order Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Order #{order.id || order._id || 'N/A'}
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Placed on: {formatDate(order.date)}
                                        </p>
                                    </div>
                                    <div className="mt-2 md:mt-0">
                                        <span className={getStatusColor(order.status)}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <h3 className="font-semibold text-lg mb-4">Order Items</h3>
                                <div className="space-y-4">
                                    {order.items && order.items.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-4 border-b pb-4 last:border-b-0">
                                            <img
                                                src={item.image || "https://via.placeholder.com/100?text=No+Image"}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded flex-shrink-0"
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/100?text=No+Image";
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                                                <p className="text-gray-600 text-sm">
                                                    ₹{item.price || item.offerPrice} × {item.quantity || 1}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-semibold">
                                                    ₹{calculateItemTotal(item)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping Address */}
                                {order.shippingAddress && (
                                    <div className="mt-6 pt-4 border-t">
                                        <h4 className="font-semibold mb-2">Shipping Address</h4>
                                        <p className="text-gray-600">
                                            {order.shippingAddress.address}, {order.shippingAddress.city}
                                            <br />
                                            Phone: {order.shippingAddress.phone}
                                        </p>
                                    </div>
                                )}

                                {/* Payment Information */}
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Payment Method: <span className="font-medium">{order.paymentMethod}</span>
                                            </p>
                                            {order.paymentId && (
                                                <p className="text-sm text-gray-600">
                                                    Transaction ID: <span className="font-medium">{order.paymentId}</span>
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-pink-600">
                                                Total: ₹{order.total ? Number(order.total).toFixed(2) : calculateOrderTotal(order.items || [])}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Orders Summary */}
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4">Orders Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
                            <p className="text-gray-600">Total Orders</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">
                                {orders.filter(order => order.status === 'delivered').length}
                            </p>
                            <p className="text-gray-600">Delivered</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">
                                {orders.filter(order => order.status !== 'delivered').length}
                            </p>
                            <p className="text-gray-600">In Progress</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderPage;