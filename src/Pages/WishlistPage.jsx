import React, { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { toast } from "react-toastify";

function WishlistPage() {
    const { wishlist, removeFromWishlist, clearWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    // ✅ When empty
    if (!wishlist.length)
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <img
                    src="https://cdn-icons-png.flaticon.com/512/4076/4076505.png"
                    alt="Empty Wishlist"
                    className="w-40 mb-4 opacity-70"
                />
                <p className="text-gray-600 text-lg">Your wishlist is empty!</p>
            </div>
        );

    // ✅ Move product from wishlist → cart
    const moveToCart = (item) => {
        addToCart(item);
        removeFromWishlist(item.id || item._id);
        toast.success(`${item.name} moved to cart!`, { theme: "colored" });
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-center text-pink-600 mb-8">
                ❤️ My Wishlist
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                    <div
                        key={item.id || item._id}
                        className="border rounded-2xl shadow-md hover:shadow-lg transition p-4 bg-white"
                    >
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-52 object-cover rounded-xl mb-3"
                        />
                        <h2 className="font-semibold text-lg text-gray-800">{item.name}</h2>
                        <p className="text-pink-600 font-medium mb-4">
                            ₹{Number(item.offerPrice).toFixed(2)}
                        </p>

                        <div className="flex justify-between">
                            <button
                                onClick={() => moveToCart(item)}
                                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-500 transition"
                            >
                                Move to Cart
                            </button>

                            <button
                                onClick={() =>
                                    removeFromWishlist(item.id || item._id, item.name)
                                }
                                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-500 transition"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-8">
                <button
                    onClick={clearWishlist}
                    className="bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-500 transition"
                >
                    Clear Wishlist
                </button>
            </div>
        </div>
    );
}

export default WishlistPage;
