import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserOrders = async () => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get(
                    `http://localhost:5000/orders?userEmail=${user.email}`
                );
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserOrders();
    }, [navigate]);

    if (loading) return <p className="text-center mt-8 text-lg">Loading your orders...</p>;

    const user = JSON.parse(localStorage.getItem("user"));

    if (!orders.length) {
        return (
            <div className="max-w-3xl mx-auto mt-8 px-4 text-center">
                <h1 className="text-2xl font-bold mb-4">My Orders</h1>
                <p className="text-lg">
                    📝 No orders found for <strong>{user?.email}</strong>.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 px-4">
            <h1 className="text-2xl font-bold mb-6">My Orders</h1>
            {orders.map((order) => (
                <div
                    key={order.id}
                    className="border p-6 rounded-lg mb-6 shadow hover:shadow-md transition"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="font-semibold text-lg">🆔 Order #{order.id}</p>
                            <p className="text-sm text-gray-500">Placed on: {order.date}</p>
                            <p className="text-sm text-gray-500">
                                Status:
                                <span
                                    className={`ml-2 ${order.status === "delivered"
                                        ? "text-green-600"
                                        : "text-yellow-600"
                                        }`}
                                >
                                    {order.status}
                                </span>
                            </p>
                        </div>
                        <p className="text-xl font-bold">Total: ₹{order.total}</p>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Items:</h3>
                        <div className="space-y-3">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-4">
                                    <img
                                        src={item.image || "https://via.placeholder.com/100"}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-gray-600">
                                            ₹{item.price} × {item.quantity || 1} = ₹
                                            {(item.price * (item.quantity || 1)).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default OrderPage;
