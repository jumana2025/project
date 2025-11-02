import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { OrderContext } from "../context/OrderContext";
import { CartContext } from "../context/CartContext";

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { addOrder } = useContext(OrderContext);
    const { cart = [], clearCart } = useContext(CartContext);

    let items = [];
    let total = 0;

    if (location.state?.product) {
        items = [location.state.product];
        total = Number(location.state.product.offerPrice);
    } else if (location.state?.items) {
        items = location.state.items;
        total = Number(location.state.total);
    } else if (cart.length > 0) {
        items = cart;
        total = cart.reduce((sum, item) => sum + Number(item.offerPrice), 0);
    }

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

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.name || !form.address || !form.city || !form.phone) {
            toast.warning("Please fill all fields!");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            toast.error("Please login first!");
            navigate("/login");
            return;
        }

        if (form.paymentMethod === "upi") setShowUPI(true);
        else if (form.paymentMethod === "card") setShowCardModal(true);
        else handleSuccess("Cash on Delivery");
    };

    const handleSuccess = async (method, txnId = "FAKE_TXN_" + Date.now()) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        const newOrder = {
            userEmail: user.email,
            userName: form.name,
            items,
            total,
            paymentMethod: method,
            paymentId: txnId,
            date: new Date().toLocaleString(),
            status: method === "Cash on Delivery" ? "Pending" : "Paid",
        };

        try {
            setLoading(true);
            await addOrder(newOrder);
            clearCart?.();
            toast.success(`Payment Successful via ${method}!`);
            navigate("/orders");
        } catch (err) {
            console.error("❌ Error saving order:", err);
            toast.error("Failed to save order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!items.length) {
        return <p className="text-center mt-10">🛒 No items found for payment.</p>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Payment Page</h1>

            {/* ✅ Order Summary */}
            <div className="bg-gray-100 p-4 rounded mb-6">
                <h2 className="text-xl font-semibold mb-3">Your Order</h2>
                {items.map((i) => (
                    <div key={i._id} className="flex justify-between mb-1">
                        <span>{i.name}</span>
                        <span>₹{i.offerPrice}</span>
                    </div>
                ))}
                <div className="text-right font-bold mt-3">Total: ₹{total}</div>
            </div>

            {/* ✅ Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="border w-full p-2 rounded"
                />
                <textarea
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                    className="border w-full p-2 rounded"
                />
                <div className="grid grid-cols-2 gap-4">
                    <input
                        name="city"
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange}
                        className="border w-full p-2 rounded"
                    />
                    <input
                        name="phone"
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        className="border w-full p-2 rounded"
                    />
                </div>

                <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    className="border w-full p-2 rounded"
                >
                    <option value="cod">Cash on Delivery</option>
                    <option value="upi">UPI (Fake QR)</option>
                    <option value="card">Card Payment (Demo)</option>
                </select>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-500 text-white py-2 w-full rounded"
                >
                    {loading ? "Processing..." : "Pay Now"}
                </button>
            </form>

            {/* ✅ Fake UPI QR */}
            {showUPI && (
                <div className="text-center mt-6 bg-gray-50 p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-3">Scan to Pay via UPI</h2>
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=fake@upi&pn=FashionStore&am=${total}&cu=INR&size=200x200`}
                        alt="Fake UPI QR"
                        className="mx-auto border p-2 bg-white rounded"
                    />
                    <p className="text-sm text-gray-500 mt-2">This is a demo QR code</p>
                    <button
                        onClick={() => handleSuccess("UPI")}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded mt-4"
                    >
                        ✅ I Have Paid
                    </button>
                    <button
                        onClick={() => setShowUPI(false)}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded mt-2 ml-2"
                    >
                        Cancel
                    </button>
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

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handlePay = () => {
        const { cardName, cardNumber, expiry, cvv } = formData;
        if (!cardName || !cardNumber || !expiry || !cvv) {
            toast.warning("Please fill all card details.");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            const fakeTxn = "FAKE_CARD_" + Math.random().toString(36).substring(2, 8).toUpperCase();
            toast.success("Card Payment Successful!");
            onSuccess(fakeTxn);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-80">
                <h2 className="text-lg font-bold mb-3 text-center">Card Payment (Demo)</h2>
                <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    placeholder="Cardholder Name"
                    className="border w-full p-2 rounded mb-3"
                />
                <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="Card Number"
                    className="border w-full p-2 rounded mb-3"
                />
                <input
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    className="border w-full p-2 rounded mb-3"
                />
                <input
                    type="password"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="CVV"
                    maxLength="3"
                    className="border w-full p-2 rounded mb-3"
                />
                <button
                    onClick={handlePay}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-500 text-white py-2 w-full rounded"
                >
                    {loading ? "Processing..." : `Pay ₹${total}`}
                </button>
                <button
                    onClick={onClose}
                    className="bg-gray-400 hover:bg-gray-500 text-white py-2 w-full rounded mt-2"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default PaymentPage;
