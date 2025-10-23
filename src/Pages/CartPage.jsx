import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function CartPage() {
    const { cart = [], removeFromCart, updateQuantity } = useContext(CartContext);
    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();

    // ✅ Login check on page load
    useEffect(() => {
        const user = localStorage.getItem("user"); // or use AuthContext if available
        if (!user) {
            alert("Please login to access your cart.");
            navigate("/login");
        }
    }, [navigate]);

    const toggleSelect = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const handleQuantityChange = (id, newQuantity) => {
        updateQuantity(id, newQuantity);
    };

    const selectedCartItems = cart.filter(item => selectedItems.includes(item.id));
    const totalAmount = selectedCartItems.reduce(
        (acc, item) => acc + Number(item.offerPrice) * Number(item.quantity),
        0
    );

    const handleBuy = () => {
        if (selectedItems.length === 0) {
            alert("Please select items to purchase");
            return;
        }

        const purchasedItems = cart.filter(item => selectedItems.includes(item.id));
        const totalAmount = purchasedItems.reduce(
            (acc, item) => acc + Number(item.offerPrice) * Number(item.quantity),
            0
        );

        selectedItems.forEach(id => removeFromCart(id));
        setSelectedItems([]);
        navigate("/payment", { state: { items: purchasedItems, total: totalAmount } });
    };

    if (!cart || cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
                <p className="text-gray-600">Your cart is empty.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Your Cart</h1>

            {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center mb-4 border-b pb-4">
                    <div className="flex items-center space-x-4">
                        <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="w-4 h-4"
                        />
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                        <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-gray-600">₹{Number(item.offerPrice).toFixed(2)}</p>

                            <div className="flex items-center space-x-2 mt-2">
                                <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="bg-gray-200 px-2 py-1 rounded"
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="bg-gray-200 px-2 py-1 rounded"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="font-semibold">
                            ₹{(Number(item.offerPrice) * Number(item.quantity)).toFixed(2)}
                        </p>
                        <button
                            onClick={() => removeFromCart(item.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 mt-2"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ))}

            <div className="mt-6 p-4 bg-gray-100 rounded">
                <div className="text-right text-xl font-bold mb-4">
                    Total Selected: ₹{totalAmount.toFixed(2)}
                </div>
                <div className="text-right">
                    <button
                        onClick={handleBuy}
                        disabled={selectedItems.length === 0}
                        className={`px-6 py-3 rounded text-white font-semibold ${selectedItems.length > 0
                            ? "bg-blue-600 hover:bg-blue-500"
                            : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Buy Selected ({selectedItems.length} items)
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CartPage;
