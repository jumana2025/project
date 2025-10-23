import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [userId, setUserId] = useState(null);

    // Load user ID from localStorage and wishlist
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUserId(storedUser.id);
            const savedWishlist = localStorage.getItem(`wishlist_${storedUser.id}`);
            setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
        }
    }, []);

    // Save wishlist whenever it changes
    useEffect(() => {
        if (userId !== null) {
            localStorage.setItem(`wishlist_${userId}`, JSON.stringify(wishlist));
        }
    }, [wishlist, userId]);

    const addToWishlist = (product) => {
        if (!userId) {
            toast.warning("Please login to add products to your wishlist");
            return;
        }

        setWishlist((prev) => {
            if (prev.find((item) => item.id === product.id)) return prev;
            return [...prev, product];
        });
    };

    const removeFromWishlist = (id) => {
        setWishlist((prev) => prev.filter((item) => item.id !== id));
    };

    const clearWishlist = () => setWishlist([]);

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                addToWishlist,
                removeFromWishlist,
                clearWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};
