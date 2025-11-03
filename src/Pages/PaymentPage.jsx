import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { OrderContext } from "../context/OrderContext";
import { CartContext } from "../context/CartContext";

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { addOrder } = useContext(OrderContext);
    const { cart = [], clearCart, removeFromCart } = useContext(CartContext);

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [form, setForm] = useState({
        name: "",
        address: "",
        city: "",
        phone: "",
        paymentMethod: "cod",
    });
    const [showUPI, setShowUPI] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ Fix: Properly handle items and total calculation
    useEffect(() => {
        let calculatedItems = [];
        let calculatedTotal = 0;

        if (location.state?.product) {
            calculatedItems = [location.state.product];
            calculatedTotal = Number(location.state.product.offerPrice || location.state.product.price || 0);
        } else if (location.state?.items) {
            calculatedItems = location.state.items;
            calculatedTotal = Number(location.state.total || 0);
        } else if (cart.length > 0) {
            calculatedItems = cart;
            calculatedTotal = cart.reduce((sum, item) => {
                const price = Number(item.offerPrice || item.price || 0);
                const quantity = Number(item.quantity || 1);
                return sum + (price * quantity);
            }, 0);
        }

        setItems(calculatedItems);
        setTotal(calculatedTotal);
    }, [location.state, cart]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });

        // Hide UPI/Card modals when payment method changes
        if (e.target.name === "paymentMethod") {
            setShowUPI(false);
            setShowCardModal(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.phone.trim()) {
            toast.warning("Please fill all fields!");
            return;
        }

        // Validate phone number
        if (form.phone.length < 10) {
            toast.warning("Please enter a valid phone number!");
            return;
        }

        const user = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || "null");
        if (!user) {
            toast.error("Please login first!");
            navigate("/login");
            return;
        }

        if (items.length === 0) {
            toast.error("No items to purchase!");
            return;
        }

        // Handle different payment methods
        if (form.paymentMethod === "upi") {
            setShowUPI(true);
        } else if (form.paymentMethod === "card") {
            setShowCardModal(true);
        } else {
            handleSuccess("Cash on Delivery");
        }
    };

    const handleSuccess = async (method, txnId = "FAKE_TXN_" + Date.now()) => {
        const user = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || "null");
        if (!user) {
            toast.error("User not found!");
            return;
        }

        const newOrder = {
            id: Date.now().toString(),
            userEmail: user.email,
            userName: form.name,
            userId: user.id,
            items: items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.offerPrice || item.price,
                quantity: item.quantity || 1,
                image: item.image
            })),
            total: total,
            paymentMethod: method,
            paymentId: txnId,
            date: new Date().toISOString(),
            status: method === "Cash on Delivery" ? "Pending" : "Paid",
            shippingAddress: {
                address: form.address,
                city: form.city,
                phone: form.phone
            }
        };

        try {
            setLoading(true);
            await addOrder(newOrder);

            // Remove purchased items from cart
            if (location.state?.items || cart.length > 0) {
                items.forEach(item => {
                    removeFromCart(item.id);
                });
            }

            toast.success(`Order placed successfully via ${method}!`);
            navigate("/orders");
        } catch (err) {
            console.error("❌ Error saving order:", err);
            toast.error("Failed to save order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-semibold mb-4">No items found for payment</h2>
                    <p className="text-gray-600 mb-6">Please add items to your cart first.</p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8">Payment</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* ✅ Order Summary */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between border-b pb-3">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div>
                                            <h3 className="font-medium">{item.name}</h3>
                                            <p className="text-gray-600 text-sm">
                                                Qty: {item.quantity || 1}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-semibold">
                                        ₹{(Number(item.offerPrice || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total Amount:</span>
                                <span className="text-pink-600">₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* ✅ Payment Form */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Shipping & Payment Details</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="border border-gray-300 w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address *
                                </label>
                                <textarea
                                    name="address"
                                    placeholder="Enter your complete address"
                                    value={form.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="border border-gray-300 w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City *
                                    </label>
                                    <input
                                        name="city"
                                        placeholder="City"
                                        value={form.city}
                                        onChange={handleChange}
                                        className="border border-gray-300 w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        name="phone"
                                        placeholder="Phone Number"
                                        value={form.phone}
                                        onChange={handleChange}
                                        type="tel"
                                        className="border border-gray-300 w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Method *
                                </label>
                                <select
                                    name="paymentMethod"
                                    value={form.paymentMethod}
                                    onChange={handleChange}
                                    className="border border-gray-300 w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                                >
                                    <option value="cod">Cash on Delivery</option>
                                    <option value="upi">UPI Payment</option>
                                    <option value="card">Card Payment</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded font-semibold transition-colors ${loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-green-600 hover:bg-green-500 text-white"
                                    }`}
                            >
                                {loading ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ✅ Fake UPI QR */}
                {showUPI && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                            <h2 className="text-xl font-semibold mb-4 text-center">Scan to Pay via UPI</h2>
                            <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300 mb-4">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=fake@thushk&pn=ThushkStore&am=${total}&cu=INR&size=200x200`}
                                    alt="Fake UPI QR"
                                    className="mx-auto"
                                />
                            </div>
                            <p className="text-sm text-gray-500 text-center mb-4">
                                This is a demo QR code for testing purposes
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleSuccess("UPI")}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors"
                                >
                                    ✅ I Have Paid
                                </button>
                                <button
                                    onClick={() => setShowUPI(false)}
                                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ Card Modal */}
                {showCardModal && (
                    <CardModal
                        total={total}
                        onClose={() => setShowCardModal(false)}
                        onSuccess={(txn) => {
                            setShowCardModal(false);
                            handleSuccess("Card", txn);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

function CardModal({ total, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        cardName: "",
        cardNumber: "",
        expiry: "",
        cvv: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        let value = e.target.value;

        // Format card number with spaces
        if (e.target.name === "cardNumber") {
            value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            if (value.length > 19) value = value.slice(0, 19);
        }

        // Format expiry date
        if (e.target.name === "expiry") {
            value = value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            if (value.length > 5) value = value.slice(0, 5);
        }

        // Limit CVV to 3 digits
        if (e.target.name === "cvv") {
            value = value.replace(/\D/g, '').slice(0, 3);
        }

        setFormData({ ...formData, [e.target.name]: value });
    };

    const handlePay = () => {
        const { cardName, cardNumber, expiry, cvv } = formData;

        if (!cardName.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
            toast.warning("Please fill all card details.");
            return;
        }

        if (cardNumber.replace(/\s/g, '').length !== 16) {
            toast.warning("Please enter a valid 16-digit card number.");
            return;
        }

        if (cvv.length !== 3) {
            toast.warning("Please enter a valid 3-digit CVV.");
            return;
        }

        setLoading(true);
        // Simulate payment processing
        setTimeout(() => {
            const fakeTxn = "FAKE_CARD_" + Math.random().toString(36).substring(2, 8).toUpperCase();
            onSuccess(fakeTxn);
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 mx-4">
                <h2 className="text-xl font-bold mb-4 text-center">Card Payment</h2>
                <p className="text-sm text-gray-500 text-center mb-4">Demo Payment Gateway</p>

                <div className="space-y-3">
                    <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="Cardholder Name"
                        className="border border-gray-300 w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                    <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        className="border border-gray-300 w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            name="expiry"
                            value={formData.expiry}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            className="border border-gray-300 w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                        <input
                            type="password"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="CVV"
                            className="border border-gray-300 w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                    </div>
                </div>

                <div className="mt-6 space-y-2">
                    <button
                        onClick={handlePay}
                        disabled={loading}
                        className={`w-full py-3 rounded font-semibold transition-colors ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-500 text-white"
                            }`}
                    >
                        {loading ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-400 hover:bg-gray-500 text-white py-3 rounded transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentPage;