import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OrderContext } from "../context/OrderContext";

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { addOrder } = useContext(OrderContext); // ✅ use OrderContext
    const { items, total } = location.state || { items: [], total: 0 };

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        phone: "",
        paymentMethod: "cod",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.address || !formData.city || !formData.phone) {
            alert("Please fill in all fields");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            alert("Please login first");
            navigate("/login");
            return;
        }

        const order = {
            userEmail: user.email,
            userName: user.name,
            items: items,
            total: total,
            date: new Date().toLocaleString(),
            status: "pending",
        };

        try {
            await addOrder(order); // ✅ add to JSON Server
            alert(`Payment Successful! Thank you, ${formData.name}`);
            navigate("/orders"); // redirect to OrdersPage
        } catch (error) {
            console.error("Payment failed:", error);
            alert("Payment failed. Please try again.");
        }
    };

    if (!items.length) return <p className="text-center mt-10">No items to pay for.</p>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Checkout & Payment</h1>

            {/* Order Summary */}
            <div className="bg-gray-100 p-4 rounded mb-6">
                <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
                <ul>
                    {items.map((item) => (
                        <li key={item.id} className="flex justify-between mb-1">
                            <span>{item.name}</span>
                            <span>₹{item.offerPrice}</span>
                        </li>
                    ))}
                </ul>
                <div className="text-right font-bold mt-2">Total: ₹{total}</div>
            </div>

            {/* Address Form */}
            <form onSubmit={handlePayment} className="space-y-4">
                <div>
                    <label className="block font-semibold">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="border w-full p-2 rounded"
                        placeholder="Enter your full name"
                    />
                </div>

                <div>
                    <label className="block font-semibold">Address</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="border w-full p-2 rounded"
                        placeholder="House no, Street, Area"
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-semibold">City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="border w-full p-2 rounded"
                            placeholder="Enter your city"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="border w-full p-2 rounded"
                            placeholder="Enter phone number"
                        />
                    </div>
                </div>

                <div>
                    <label className="block font-semibold mb-1">Payment Method</label>
                    <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="border w-full p-2 rounded"
                    >
                        <option value="cod">Cash on Delivery</option>
                        <option value="upi">UPI</option>
                        <option value="card">Credit / Debit Card</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-500 w-full mt-4"
                >
                    Pay Now
                </button>
            </form>
        </div>
    );
}

export default PaymentPage;
