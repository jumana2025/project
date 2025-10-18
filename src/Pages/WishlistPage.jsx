import { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";

function WishlistPage() {
    const { wishlist, removeFromWishlist, clearWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext); // ✅ Cart context

    if (!wishlist.length) return <p className="text-center mt-10">Wishlist is empty</p>;

    // ✅ Move item from wishlist to cart
    const moveToCart = (item) => {
        addToCart(item);           // Add item to cart
        removeFromWishlist(item.id); // Remove from wishlist
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>

            {wishlist.map((item) => (
                <div key={item.id} className="flex justify-between items-center mb-4 border-b pb-2">
                    <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-gray-600">₹{item.offerPrice}</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500"
                        >
                            Remove
                        </button>

                        <button
                            onClick={() => moveToCart(item)}
                            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-500"
                        >
                            Move to Cart
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={clearWishlist}
                className="mt-4 bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-500"
            >
                Clear Wishlist
            </button>
        </div>
    );
}

export default WishlistPage;
